import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
    },
    type: {
      type: String,
      enum: ['Webinar', 'Event', 'Announcement', 'Job Alert'],
      default: 'Announcement',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorRole: {
      type: String,
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    externalLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
