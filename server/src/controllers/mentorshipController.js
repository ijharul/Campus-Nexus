import Mentorship from "../models/Mentorship.js";
import User from "../models/User.js";
import { createNotify } from "../utils/notification.js";
import ActivityLog from "../models/ActivityLog.js";

/**
 * @desc    Send a new mentorship request
 * @route   POST /api/mentorship/request
 * @access  Private (Student only)
 */
export const sendMentorshipRequest = async (req, res, next) => {
  try {
    const { mentorId, message } = req.body;
    const studentId = req.user._id;

    // Validate mentor exists and acts as an alumni
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== "alumni") {
      res.status(400);
      throw new Error("Target valid mentor (alumni) was not found.");
    }

    // Check if there is already an active or pending request mapping between them
    const existingRequest = await Mentorship.findOne({
      student: studentId,
      mentor: mentorId,
    });

    if (existingRequest) {
      res.status(400);
      throw new Error(
        `A mentorship request to this alumni already exists with status: ${existingRequest.status}`,
      );
    }

    // Save the new connection Request
    const request = await Mentorship.create({
      student: studentId,
      mentor: mentorId,
      message,
    });

    // Notify Mentor
    await createNotify({
      recipient: mentorId,
      sender: studentId,
      type: "mentorship",
      message: `${req.user.name} sent you a mentorship request.`,
      link: "/mentorship",
    });

    // Log Activity
    ActivityLog.create({
      user: studentId,
      action: 'mentorship_request',
      details: { mentorId },
      collegeId: req.user.collegeId || null,
    }).catch(() => {});

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in Student's outgoing requests
 * @route   GET /api/mentorship/my-requests
 * @access  Private (Student only)
 */
export const getStudentRequests = async (req, res, next) => {
  try {
    // Populate the mentor details to display gracefully to the student
    const requests = await Mentorship.find({ student: req.user._id }).populate(
      "mentor",
      "name profilePicture company skills",
    );

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in Mentor's incoming requests
 * @route   GET /api/mentorship/mentor-requests
 * @access  Private (Alumni only)
 */
export const getMentorRequests = async (req, res, next) => {
  try {
    // Populate the student details so the Alumni knows who requested them
    const requests = await Mentorship.find({ mentor: req.user._id }).populate(
      "student",
      "name profilePicture bio batch skills",
    );

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommended mentors based on skill matching
 * @route   GET /api/mentorship/recommended
 * @access  Private (Student only)
 */
export const getRecommendedMentors = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    
    // Fetch existing requests to exclude connected alumni
    const existingRequests = await Mentorship.find({ student: req.user._id });
    const excludedIds = [...existingRequests.map(req => req.mentor), req.user._id];

    if (!student || !student.skills || student.skills.length === 0) {
      // Return top alumni from the same college
      const mentors = await User.find({
        collegeId: req.user.collegeId,
        role: "alumni",
        _id: { $nin: excludedIds }, 
      })
        .limit(6)
        .select(
          "name profilePicture company currentRole skills bio experience",
        );

      return res.json(mentors);
    }

    // Find alumni with matching skills, prioritizing exact matches
    const mentors = await User.find({
      collegeId: req.user.collegeId,
      role: "alumni",
      skills: { $in: student.skills },
      _id: { $nin: excludedIds }, 
    })
      .limit(8)
      .select("name profilePicture company currentRole skills bio experience");

    // If not enough mentors found, add some general alumni
    if (mentors.length < 4) {
      const additionalMentors = await User.find({
        collegeId: req.user.collegeId,
        role: "alumni",
        _id: { $nin: [...mentors.map((m) => m._id), ...excludedIds] },
      })
        .limit(4 - mentors.length)
        .select(
          "name profilePicture company currentRole skills bio experience",
        );

      mentors.push(...additionalMentors);
    }

    res.json(mentors);
  } catch (error) {
    next(error);
  }
};

export const updateMentorshipStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await Mentorship.findById(req.params.id);

    // Validate the mentorship doc exists
    if (!request) {
      res.status(404);
      throw new Error("Mentorship request not found");
    }

    // Security verify that the person changing the status is ACTUALLY the aimed mentor
    if (request.mentor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error(
        "Not authorized to access or modify this specific request",
      );
    }

    // Expecting either 'accepted', 'rejected', or 'completed'
    if (["accepted", "rejected", "completed"].includes(status)) {
      request.status = status;
      const updatedRequest = await request.save();

      // --- ALUMNI IMPACT LOGIC ---
      if (status === 'accepted') {
        const alumni = await User.findById(req.user._id);
        alumni.impactStats.studentsHelped += 1;
        
        // Auto-assign badge for milestones
        if (alumni.impactStats.studentsHelped >= 5 && !alumni.badges.includes('Top Mentor')) {
          alumni.badges.push('Top Mentor');
        }
        await alumni.save();
      }

      // Notify Student
      await createNotify({
        recipient: request.student,
        sender: req.user._id,
        type: `request_${status}`,
        message: `Your mentorship request was ${status} by ${req.user.name}.`,
        link: "/mentorship",
      });

      // Log Activity
      ActivityLog.create({
        user: req.user._id,
        action: 'mentorship_update',
        details: { requestId: request._id, status },
        collegeId: req.user.collegeId || null,
      }).catch(() => {});

      res.json(updatedRequest);
    } else {
      res.status(400);
      throw new Error(
        "Invalid status update. Permitted: accepted, rejected, completed.",
      );
    }
  } catch (error) {
    next(error);
  }
};
