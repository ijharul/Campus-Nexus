import User from '../models/User.js';
import College from '../models/College.js';
import Donation from '../models/Donation.js';
import Report from '../models/Report.js';
import Campaign from '../models/Campaign.js';
import Notice from '../models/Notice.js';
import { createNotify } from '../utils/notification.js';

/**
 * @desc    Get dashboard stats for a college
 * @route   GET /api/college-admin/stats
 */
export const getCollegeStats = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    if (!collegeId) {
      return res.json({ students: 0, alumni: 0, totalDonations: 0, reportsPending: 0, activeCampaignsCount: 0 });
    }

    const [
      students,
      alumni,
      totalDonations,
      reportsPending,
      activeCampaignsCount
    ] = await Promise.all([
      User.countDocuments({ collegeId, role: 'student' }),
      User.countDocuments({ collegeId, role: 'alumni' }),
      Donation.aggregate([
        { $match: { collegeId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Report.countDocuments({ collegeId, status: 'pending' }),
      Campaign.countDocuments({ collegeId, isActive: true })
    ]);

    res.json({
      students,
      alumni,
      totalDonations: totalDonations[0]?.total || 0,
      reportsPending,
      activeCampaignsCount
    });
  } catch (error) { next(error); }
};

/**
 * @desc    Get top alumni (based on experience/company presence)
 * @route   GET /api/college-admin/top-alumni
 */
export const getTopAlumni = async (req, res, next) => {
  try {
    if (!req.user.collegeId) return res.json([]);
    const alumni = await User.find({ 
      collegeId: req.user.collegeId, 
      role: 'alumni',
      $or: [
        { currentRole: { $exists: true, $ne: '' } },
        { company: { $exists: true, $ne: '' } }
      ]
    })
    .sort({ 'experience.length': -1 })
    .limit(10)
    .select('name email currentRole company profilePicture experience');

    res.json(alumni);
  } catch (error) { next(error); }
};

/**
 * @desc    Get active students (with internships/experience)
 * @route   GET /api/college-admin/active-students
 */
export const getActiveStudents = async (req, res, next) => {
  try {
    if (!req.user.collegeId) return res.json([]);
    const students = await User.find({ 
      collegeId: req.user.collegeId, 
      role: 'student',
      experience: { $exists: true, $not: { $size: 0 } }
    })
    .limit(10)
    .select('name email branch year profilePicture experience');
    
    res.json(students);
  } catch (error) { next(error); }
};

/**
 * @desc    Get all reports for the college
 * @route   GET /api/college-admin/reports
 */
export const getReports = async (req, res, next) => {
  try {
    if (!req.user.collegeId) return res.json([]);
    const reports = await Report.find({ collegeId: req.user.collegeId })
      .populate('reporterId', 'name email')
      .populate('targetId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) { next(error); }
};

/**
 * @desc    Update report status
 * @route   PUT /api/college-admin/reports/:id
 */
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNote, blockUser } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) { res.status(404); throw new Error('Report not found'); }
    if (report.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403); throw new Error('Unauthorized');
    }

    report.status = status || report.status;
    report.adminNote = adminNote || report.adminNote;
    await report.save();

    // If requested to block the user as part of resolution
    if (blockUser && status === 'resolved') {
      await User.findByIdAndUpdate(report.targetId, { isBlocked: true });
    }

    res.json(report);
  } catch (error) { next(error); }
};

/**
 * @desc    Manage Campaigns
 */
export const getCampaigns = async (req, res, next) => {
  try {
    if (!req.user.collegeId) return res.json([]);
    const campaigns = await Campaign.find({ collegeId: req.user.collegeId }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) { next(error); }
};

export const createCampaign = async (req, res, next) => {
  try {
    const { title, description, goalAmount, endDate } = req.body;
    const collegeId = req.user.collegeId;

    const campaign = await Campaign.create({
      title, description, goalAmount, endDate,
      collegeId
    });

    // Notify all alumni about the new campaign
    const alumni = await User.find({ collegeId, role: 'alumni' }).select('_id');
    const college = await College.findById(collegeId);

    const notifyPromises = alumni.map(a => createNotify({
      recipient: a._id,
      sender: req.user._id,
      type: 'donation',
      message: `New Giving Opportunity: "${title}". Support ${college?.name || 'your campus'} today!`,
      link: `/alumni/donations`
    }));

    await Promise.all(notifyPromises);

    res.status(201).json(campaign);
  } catch (error) { next(error); }
};

/**
 * @desc    Manage Notices
 */
export const getNotices = async (req, res, next) => {
  try {
    if (!req.user.collegeId) return res.json([]);
    const notices = await Notice.find({ collegeId: req.user.collegeId }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) { next(error); }
};

export const createNotice = async (req, res, next) => {
  try {
    const { title, content, type, externalLink } = req.body;
    const notice = await Notice.create({
      title, content, type, externalLink,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      collegeId: req.user.collegeId
    });
    res.status(201).json(notice);
  } catch (error) { next(error); }
};

export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) { res.status(404); throw new Error('Notice not found'); }
    if (notice.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403); throw new Error('Unauthorized');
    }
    await notice.deleteOne();
    res.json({ message: 'Notice removed successfully' });
  } catch (error) { next(error); }
};

/**
 * @desc    Public Report Creation (Any protected user)
 */
export const createReport = async (req, res, next) => {
  try {
    const { targetId, reason } = req.body;
    const targetUser = await User.findById(targetId);
    if (!targetUser) { res.status(404); throw new Error('Target user not found'); }

    const report = await Report.create({
      reporterId: req.user._id,
      targetId,
      reason,
      collegeId: targetUser.collegeId // Report goes to the target user's college admin
    });
    res.status(201).json(report);
  } catch (error) { next(error); }
};

/**
 * @desc    Get all donations for the college pipeline
 * @route   GET /api/college-admin/donations
 */
export const getDonations = async (req, res, next) => {
  try {
    if (!req.user.collegeId) return res.json([]);
    const donations = await Donation.find({ collegeId: req.user.collegeId })
      .populate('donorId', 'name email profilePicture')
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) { next(error); }
};

/**
 * @desc    Get all users pending verification within the college
 * @route   GET /api/college-admin/verifications/pending
 */
export const getPendingVerifications = async (req, res, next) => {
  try {
    const { collegeId } = req.user;
    const users = await User.find({ 
      collegeId, 
      verificationStatus: 'pending' 
    }).select('name email role branch year company currentRole verificationDetails createdAt');

    res.json(users);
  } catch (error) { next(error); }
};

/**
 * @desc    Approve/Reject Verification Request
 * @route   PUT /api/college-admin/verifications/:userId
 */
export const handleVerification = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const { userId } = req.params;

    if (!['verified', 'rejected'].includes(status)) {
       res.status(400); throw new Error('Invalid verification status selection.');
    }

    const user = await User.findById(userId);
    if (!user) { res.status(404); throw new Error('User not found.'); }

    if (user.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403); throw new Error('Unauthorized to verify users from other institutions.');
    }

    user.verificationStatus = status;
    
    if (status === 'verified') {
      const badgeType = user.role === 'alumni' ? 'Verified Alumni' : 'Verified Student';
      if (!user.badges.includes(badgeType)) {
        user.badges.push(badgeType);
      }
      user.contributionScore += 25; // Reward for getting verified
    }

    await user.save();

    // Notify User
    await createNotify({
      recipient: user._id,
      sender: req.user._id,
      type: `request_${status}`,
      message: `Institutional verification request: ${status.toUpperCase()}. ${adminNote || ''}`,
      link: '/profile'
    });

    res.json({ message: `User moved to ${status} state successfully.`, userId });
  } catch (error) { next(error); }
};
