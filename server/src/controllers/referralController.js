import Referral from '../models/Referral.js';
import User from '../models/User.js';
import { createNotify } from '../utils/notification.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import ActivityLog from '../models/ActivityLog.js';

const streamUploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) resolve(result); else reject(error);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

/**
 * @desc    Send a new referral request
 * @route   POST /api/referrals/request
 * @access  Private (Student only)
 */
export const sendReferralRequest = async (req, res, next) => {
  try {
    const { alumniId, company, role, jobType, resume, message } = req.body;
    const studentId = req.user._id;

    // Validate the target alumni actually exists & has valid role mappings
    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      res.status(400);
      throw new Error('Target valid alumni was not found.');
    }

    // Prevent identical contextual duplication
    // (a student asking the SAME alumni for a referral to the SAME company and SAME role)
    const duplicateRequest = await Referral.findOne({
      student: studentId,
      alumni: alumniId,
      company: { $regex: new RegExp(`^${company}$`, 'i') },
      role: { $regex: new RegExp(`^${role}$`, 'i') },
    });

    if (duplicateRequest) {
      res.status(400);
      throw new Error(`A referral request for this exact position already exists with status: ${duplicateRequest.status}`);
    }

    let resumeUrl = resume || '';
    
    // Handle File Upload if present
    if (req.file) {
      const result = await streamUploadToCloudinary(req.file.buffer, { 
        resource_type: 'auto', 
        folder: 'campus-nexus/referrals' 
      });
      resumeUrl = result.secure_url;
    }

    if (!resumeUrl) {
      res.status(400);
      throw new Error('Please provide a resume PDF or link.');
    }

    // Provision the new Referral execution state
    const referral = await Referral.create({
      student: studentId,
      alumni: alumniId,
      company,
      role,
      jobType: jobType || 'full-time',
      resume: resumeUrl,
      message,
      history: [{ status: 'pending', timestamp: new Date() }]
    });

    // Reward Student for applying (Minor points)
    await User.findByIdAndUpdate(studentId, { $inc: { contributionScore: 5 } });

    // Notify Alumni
    await createNotify({
      recipient: alumniId,
      sender: studentId,
      type: 'referral',
      message: `${req.user.name} requested a referral for ${company}.`,
      link: '/referrals'
    });

    // Log Activity
    ActivityLog.create({
      user: studentId,
      action: 'referral_request',
      details: { alumniId, company, role },
      collegeId: req.user.collegeId || null,
    }).catch(() => {});

    res.status(201).json(referral);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in Student's active referral requests
 * @route   GET /api/referrals/my-requests
 * @access  Private (Student only)
 */
export const getStudentRequests = async (req, res, next) => {
  try {
    const requests = await Referral.find({ student: req.user._id })
      .populate('alumni', 'name profilePicture company role'); // Provide alumni context
      
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in Alumni's incoming referral requests
 * @route   GET /api/referrals/incoming
 * @access  Private (Alumni only)
 */
export const getAlumniRequests = async (req, res, next) => {
  try {
    const requests = await Referral.find({ alumni: req.user._id })
      .populate('student', 'name profilePicture bio batch skills resume'); // Provide deep context for student
      
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Referral Status (Accept / Reject / Interview / Selected)
 * @route   PUT /api/referrals/:id
 * @access  Private (Alumni only)
 */
export const updateReferralStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const referral = await Referral.findById(req.params.id);

    // Validate referral existence
    if (!referral) {
      res.status(404);
      throw new Error('Referral request not found');
    }

    // Validate identity binding ensures security against hijacking status arrays
    if (referral.alumni.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access or modify this specific referral request');
    }

    const permittedStatuses = ['accepted', 'rejected', 'referred', 'interview', 'selected'];
    
    if (permittedStatuses.includes(status)) {
      referral.status = status;
      referral.history.push({ status, timestamp: new Date() });
      const updatedReferral = await referral.save();

      // Gamification Logic: Award points to Alumni
      let points = 0;
      if (status === 'referred') points = 20;
      if (status === 'interview') points = 30;
      if (status === 'selected') points = 100;

      if (points > 0) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: points } });
      }

      // --- ALUMNI IMPACT LOGIC ---
      const alumni = await User.findById(req.user._id);
      if (status === 'referred') {
        alumni.impactStats.referralsGiven += 1;
        if (alumni.impactStats.referralsGiven >= 5 && !alumni.badges.includes('Referral Expert')) {
          alumni.badges.push('Referral Expert');
        }
      }
      if (status === 'selected') {
        alumni.impactStats.successfulPlacements += 1;
        if (alumni.impactStats.successfulPlacements >= 3 && !alumni.badges.includes('Community Leader')) {
          alumni.badges.push('Community Leader');
        }
      }
      await alumni.save();

      // Notify Student
      await createNotify({
        recipient: referral.student,
        sender: req.user._id,
        type: `request_${status}`,
        message: `Your referral request for ${referral.company} was moved to ${status} by ${req.user.name}.`,
        link: '/referrals'
      });

      // Log Activity
      ActivityLog.create({
        user: req.user._id,
        action: 'referral_update',
        details: { referralId: referral._id, status, company: referral.company },
        collegeId: req.user.collegeId || null,
      }).catch(() => {});

      res.json(updatedReferral);
    } else {
      res.status(400);
      throw new Error(`Invalid status update. Permitted: ${permittedStatuses.join(', ')}`);
    }
  } catch (error) {
    next(error);
  }
};
