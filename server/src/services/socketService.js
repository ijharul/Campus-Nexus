import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { createNotify } from '../utils/notification.js';
import ActivityLog from '../models/ActivityLog.js';

let io;
const userSocketMap = new Map(); // userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) return next(new Error('Authentication error: User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    userSocketMap.set(userId, socket.id);
    socket.join(userId); // Join personal room for notifications

    // Update online status in DB
    await User.findByIdAndUpdate(userId, { isOnline: true });
    
    // Broadcast online status
    io.emit('onlineStatus', { userId, status: true });

    console.log(`📡 User Connected: ${socket.user.name} (${socket.id})`);

    // Join default rooms based on college and role
    if (socket.user.collegeId) {
      const collegeId = socket.user.collegeId.toString();
      const generalRoom = `${collegeId}_general`;
      const alumniRoom = `${collegeId}_alumni`;

      socket.join(generalRoom);
      if (socket.user.role === 'alumni') {
        socket.join(alumniRoom);
      }
    }

    // Custom Join Room (for 1-to-1 or custom groups)
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`🏠 User ${socket.user.name} joined room: ${roomId}`);
    });

    // Send Message
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, groupId, content } = data;

        const newMessage = await Message.create({
          sender: userId,
          receiver: receiverId || null,
          groupId: groupId || null,
          content,
        });

        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name profilePicture');

        if (groupId) {
          // Broadcast to group
          io.to(groupId).emit('receiveMessage', populatedMessage);
        } else if (receiverId) {
          // Send to specific user
          const receiverSocketId = userSocketMap.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
          }
          // Also send back to sender for sync
          socket.emit('receiveMessage', populatedMessage);

          // Create persistent notification for 1-to-1 message
          await createNotify({
            recipient: receiverId,
            sender: userId,
            type: 'message',
            message: `New message from ${socket.user.name}`,
            link: '/chat'
          });
        }

        // Log chat activity (non-blocking)
        ActivityLog.create({
          user: userId,
          action: 'chat_message',
          details: { groupId: groupId || null, receiverId: receiverId || null },
          collegeId: socket.user.collegeId || null,
        }).catch(() => {});
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    // --- CALL SIGNALING ---
    socket.on('callInitiated', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incomingCall', { 
          caller: { id: userId, name: socket.user.name, avatar: socket.user.profilePicture } 
        });
      }
    });

    socket.on('callAccepted', (data) => {
      const { callerId } = data;
      const callerSocketId = userSocketMap.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('callAccepted', { receiverId: userId });
      }
    });

    socket.on('callRejected', (data) => {
      const { callerId } = data;
      const callerSocketId = userSocketMap.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('callRejected', { receiverId: userId });
      }
    });
    // ----------------------

    socket.on('disconnect', async () => {
      userSocketMap.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('onlineStatus', { userId, status: false });
      console.log(`🔌 User Disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
