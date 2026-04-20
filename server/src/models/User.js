import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'alumni', 'collegeAdmin', 'superAdmin'],
      default: 'student',
    },
    // Multi-tenant: which college this user belongs to
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      default: null,
    },
    // Professional Identity & Sharing
    username: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true, // Allow existing users to not have one initially
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    // Gamification & Engagement
    contributionScore: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    // Institutional Verification
    verificationStatus: {
      type: String,
      enum: ['none', 'pending', 'verified', 'rejected'],
      default: 'none',
    },
    verificationDetails: {
      college: String,
      graduationYear: Number,
    },
    // Subscription & Plan Targeting (Mandatory for Students)
    planName: {
      type: String,
      enum: ['Free', 'Monthly', 'Yearly', 'none'],
      default: 'none',
    },
    planStatus: {
      type: String,
      enum: ['active', 'expired', 'none'],
      default: 'none',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'none'],
      default: 'none',
    },
    // AI Usage Control
    tokens: {
      type: Number,
      default: 50,
    },
    aiCallsToday: {
      type: Number,
      default: 0,
    },
    lastUsedAI: {
      type: Date,
      default: null,
    },
    // Common profile fields
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    profilePicture: { type: String, default: '' },
    resume: { type: String, default: '' },
    // For users whose college is not in the list
    pendingCollege: { type: String, default: '' },
    // Alumni approval by collegeAdmin (Legacy - transitioning to verificationStatus)
    isApproved: { type: Boolean, default: true },
    // Moderation
    isBlocked: { type: Boolean, default: false },
    // Experience + Projects (rich arrays)
    experience: [
      {
        role: String,
        company: String,
        duration: String,
        description: String,
      },
    ],
    projects: [
      {
        title: String,
        techStack: [String],
        description: String,
      },
    ],
    // Student-specific fields
    branch: { type: String, default: '' },
    year: { type: Number },
    careerGoal: { type: String, default: '' },
    // Alumni / shared fields
    company: { type: String, default: '' },
    currentRole: { type: String, default: '' },
    college: { type: String, default: '' },
    batch: { type: Number },
    // Presence
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
