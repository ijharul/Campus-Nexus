import mongoose from 'mongoose';

const chatRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      default: 'Hello, I would like to connect and chat with you!',
    },
    callEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ChatRequest = mongoose.model('ChatRequest', chatRequestSchema);
export default ChatRequest;
