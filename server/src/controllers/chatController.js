import ChatRequest from '../models/ChatRequest.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Mentorship from '../models/Mentorship.js';
import { createNotify } from '../utils/notification.js';
import { getIO } from '../services/socketService.js';

/**
 * @desc    Send a chat request (Student -> Alumni)
 * @route   POST /api/chat/request
 */
export const sendChatRequest = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Check if request already exists
    const existing = await ChatRequest.findOne({ sender: senderId, receiver: receiverId });
    if (existing) {
      res.status(400);
      throw new Error('A chat request already exists between you and this alumni');
    }

    const request = await ChatRequest.create({
      sender: senderId,
      receiver: receiverId,
      message
    });

    // Notify Alumni
    await createNotify({
      recipient: receiverId,
      sender: senderId,
      type: 'message',
      message: `${req.user.name} sent you a chat request.`,
      link: '/chat'
    });

    res.status(201).json(request);
  } catch (error) { next(error); }
};

/**
 * @desc    Update chat request status (Accept/Reject)
 * @route   PUT /api/chat/request/:id
 */
export const updateChatRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    const request = await ChatRequest.findById(requestId);
    if (!request) {
      res.status(404);
      throw new Error('Chat request not found');
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this request');
    }

    request.status = status;
    await request.save();

    // Notify Student
    await createNotify({
      recipient: request.sender,
      sender: req.user._id,
      type: `request_${status}`,
      message: `Your chat request was ${status} by ${req.user.name}.`,
      link: '/chat'
    });

    res.json(request);
  } catch (error) { next(error); }
};

/**
 * @desc    Get all chat requests for the user
 * @route   GET /api/chat/requests
 */
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await ChatRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
    .populate('sender', 'name profilePicture role')
    .populate('receiver', 'name profilePicture role')
    .sort('-createdAt');

    res.json(requests);
  } catch (error) { next(error); }
};

/**
 * @desc    Get message history for 1-to-1 or group
 * @route   GET /api/chat/messages
 */
export const getMessageHistory = async (req, res, next) => {
  try {
    const { receiverId, groupId } = req.query;
    const userId = req.user._id;

    let query = {};
    if (groupId) {
      query = { groupId };
    } else if (receiverId) {
      query = {
        $or: [
          { sender: userId, receiver: receiverId },
          { sender: receiverId, receiver: userId }
        ]
      };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name profilePicture')
      .sort('createdAt');

    res.json(messages);
  } catch (error) { next(error); }
};

import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const streamUploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) resolve(result); else reject(error);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

/**
 * @desc    Upload multimedia for chat
 * @route   POST /api/chat/media
 */
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file attached.');
    const isImage = req.file.mimetype.startsWith('image/');
    
    // Target parameters
    const { receiverId, groupId } = req.body;
    
    const result = await streamUploadToCloudinary(req.file.buffer, {
      resource_type: isImage ? 'image' : 'auto',
      folder: 'campus-nexus/chat',
    });

    const msg = await Message.create({
      sender: req.user._id,
      receiver: receiverId || null,
      groupId: groupId || null,
      content: req.file.originalname, 
      mediaUrl: result.secure_url,
      mediaType: isImage ? 'image' : 'document'
    });

    const populatedMsg = await Message.findById(msg._id).populate('sender', 'name profilePicture');
    res.json(populatedMsg);
  } catch (error) { next(error); }
};

/**
 * @desc    Edit a message
 * @route   PUT /api/chat/message/:id
 */
export const editMessage = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) { res.status(404); throw new Error('Message not found'); }
    if (msg.sender.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized to edit');
    }

    msg.content = req.body.content;
    msg.isEdited = true;
    await msg.save();
    
    const populated = await Message.findById(msg._id).populate('sender', 'name profilePicture');
    
    const io = getIO();
    if (msg.groupId) io.to(msg.groupId).emit('messageEdited', populated);
    else io.emit('messageEdited', populated); // To keep it simple for 1-to-1, we broadcast globally and client filters

    res.json(populated);
  } catch (error) { next(error); }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/chat/message/:id
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) { res.status(404); throw new Error('Message not found'); }
    if (msg.sender.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized to delete');
    }

    msg.isDeleted = true;
    msg.content = 'This message was deleted.';
    msg.mediaUrl = null;
    msg.mediaType = 'none';
    await msg.save();
    
    const io = getIO();
    if (msg.groupId) io.to(msg.groupId).emit('messageDeleted', { id: msg._id, groupId: msg.groupId });
    else io.emit('messageDeleted', { id: msg._id, receiverId: msg.receiver });

    res.json({ id: msg._id, isDeleted: true });
  } catch (error) { next(error); }
};

/**
 * @desc    Toggle Call functionality for a ChatRequest or Mentorship link (Alumni only)
 * @route   PUT /api/chat/request/:id/call
 */
export const toggleCall = async (req, res, next) => {
  try {
    const { callEnabled } = req.body;
    let link = await ChatRequest.findById(req.params.id);
    
    // If not a ChatRequest, it might be a Mentorship ID (Since we have both routes handling 1x1)
    if (!link) {
         link = await Mentorship.findById(req.params.id);
    }
    if (!link) { res.status(404); throw new Error('Connection link not found'); }

    link.callEnabled = callEnabled !== undefined ? callEnabled : !link.callEnabled;
    await link.save();
    
    res.json({ callEnabled: link.callEnabled });
  } catch (error) { next(error); }
};
