import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
  },
  role: {
    type: String,
    required: [true, 'Please add a job role'],
  },
  description: {
    type: String,
    default: '',
  },
  eligibility: {
    minCGPA: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    branches: {
      type: [String],
      default: [],
    },
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
  },
  studentsAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  applications: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['applied', 'shortlisted', 'rejected', 'selected'],
        default: 'applied',
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);
export default PlacementDrive;
