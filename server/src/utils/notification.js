import Notification from '../models/Notification.js';
import { getIO } from '../services/socketService.js';

/**
 * @desc    Create a notification and emit real-time event
 * @param   {Object} data - { recipient, sender, type, message, link }
 */
export const createNotify = async (data) => {
  try {
    const notification = await Notification.create(data);
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name profilePicture');

    const io = getIO();
    // Emit specifically to the recipient's personal room for privacy and performance
    io.to(data.recipient.toString()).emit(`notification_${data.recipient}`, populated);
    
    return populated;
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
};
