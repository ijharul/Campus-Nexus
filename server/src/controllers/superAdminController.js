import CollegeRequest from '../models/CollegeRequest.js';
import College from '../models/College.js';
import User from '../models/User.js';
import { sendApprovalNotification } from '../utils/emailService.js';
import { createNotify } from '../utils/notification.js';

/**
 * @desc    Get all pending college requests
 * @route   GET /api/super/requests
 * @access  Private (Super Admin)
 */
export const getCollegeRequests = async (req, res, next) => {
  try {
    const requests = await CollegeRequest.find()
      .populate('requester', 'name email')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) { next(error); }
};

/**
 * @desc    Approve a college request
 * @route   PUT /api/super/requests/:id/approve
 * @access  Private (Super Admin)
 */
export const approveCollegeRequest = async (req, res, next) => {
  try {
    const request = await CollegeRequest.findById(req.params.id).populate('requester');
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      res.status(400);
      throw new Error(`Request is already ${request.status}`);
    }

    // 1. Create the College (Initially without adminId for technical staging)
    const college = await College.create({
      name: request.collegeName,
      location: request.location || request.address || "",
      address: request.address || "",
      website: request.website || "",
      domain: request.domain,
      createdBy: req.user._id
    });

    // 2. Assign the Requester to the newly created College (Do NOT make them an admin)
    await User.findByIdAndUpdate(request.requester, {
      collegeId: college._id,
      pendingCollege: '',
    });

    // Note: The college admin will be created separately using the SuperAdminDashboard
    await college.save();

    // 3. Update Request status
    request.status = 'approved';
    await request.save();

    // Send email notification to User
    await sendApprovalNotification({
      userEmail: request.requester.email,
      collegeName: request.collegeName
    });

    // Real-time Notification
    await createNotify({
      recipient: request.requester._id,
      sender: req.user._id,
      type: 'request_accepted',
      message: `Congratulations! ${request.collegeName} has been onboarded and you are now a member.`,
      link: '/profile'
    });

    res.json({ message: 'College approved and created successfully', college });
  } catch (error) { next(error); }
};

/**
 * @desc    Reject a college request
 * @route   PUT /api/super/requests/:id/reject
 * @access  Private (Super Admin)
 */
export const rejectCollegeRequest = async (req, res, next) => {
  try {
    const request = await CollegeRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    request.status = 'rejected';
    request.adminNotes = req.body.reason || 'Not eligible';
    await request.save();

    // Real-time Notification
    await createNotify({
      recipient: request.requester,
      sender: req.user._id,
      type: 'request_rejected',
      message: `Your request to onboard ${request.collegeName} was declined.`,
      link: '/profile'
    });

    res.json({ message: 'Request rejected' });
  } catch (error) { next(error); }
};
