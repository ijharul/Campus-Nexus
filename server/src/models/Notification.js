import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // sender is optional — system notifications have no sender
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    type: {
      type: String,
      enum: [
        'mentorship',
        'referral',
        'message',
        'request_accepted',
        'request_rejected',
        'request_referred',
        'request_interview',
        'request_selected',
        'request_completed',
        'donation',
        'system',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
