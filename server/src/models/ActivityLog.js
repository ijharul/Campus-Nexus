import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'referral_request',
        'referral_update',
        'mentorship_request',
        'mentorship_update',
        'chat_message',
        'badge_earned',
        'ai_usage',
        'post_engagement',
        'application',          // job application via referral
      ],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: false,   // optional — cross-college actions may lack a college context
      default: null,
    }
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
