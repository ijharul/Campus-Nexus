import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Please specify the company'],
    },
    role: {
      type: String,
      required: [true, 'Please specify the role you are applying for'],
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract'],
      default: 'full-time',
    },
    resume: {
      type: String, // Expected to be Cloudinary URL
      required: [true, 'Please provide a link to your resume'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'referred', 'interview', 'selected'],
      default: 'pending',
    },
    history: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    message: {
      type: String,
      maxlength: 1500,
    },
  },
  {
    timestamps: true,
  }
);

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
