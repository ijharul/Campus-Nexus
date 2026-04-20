import User from "../models/User.js";
import Mentorship from "../models/Mentorship.js";
import Referral from "../models/Referral.js";
import ChatRequest from "../models/ChatRequest.js";

/**
 * @desc    Get student engagement stats
 * @route   GET /api/student/stats
 */
export const getStudentStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // 1. Mentorships (Count unique mentors where status is accepted)
    const mentorsCount = await Mentorship.countDocuments({
      student: studentId,
      status: "accepted",
    });

    // 2. Referrals (Count sent referrals)
    const referralsCount = await Referral.countDocuments({
      student: studentId,
    });

    // 3. Active Conversations (Count accepted chat requests)
    const chatsCount = await ChatRequest.countDocuments({
      $or: [{ sender: studentId }, { receiver: studentId }],
      status: "accepted",
    });

    // 4. Profile Completion %
    const user = await User.findById(studentId);
    let completion = 0;
    if (user.name) completion += 5;
    if (user.bio) completion += 10;
    if (user.skills?.length > 0) completion += 15;
    if (user.profilePicture) completion += 10;
    if (user.resume) completion += 20;
    if (user.experience?.length > 0) completion += 15;
    if (user.projects?.length > 0) completion += 15;
    if (user.branch) completion += 5;
    if (user.year) completion += 5;

    res.json({
      mentors: mentorsCount,
      referrals: referralsCount,
      chats: chatsCount,
      profileCompletion: completion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get suggested alumni based on skill match
 * @route   GET /api/student/suggested-alumni
 */
export const getSuggestedAlumni = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student || !student.skills || student.skills.length === 0) {
      // Return top alumni from the same college
      const alumni = await User.find({
        collegeId: req.user.collegeId,
        role: "alumni",
      })
        .limit(6)
        .select("name profilePicture company currentRole skills");
      return res.json(alumni);
    }

    // Find alumni in the same college with matching skills
    const alumni = await User.find({
      collegeId: req.user.collegeId,
      role: "alumni",
      skills: { $in: student.skills },
    })
      .limit(8)
      .select("name profilePicture company currentRole skills bio");

    res.json(alumni);
  } catch (error) {
    next(error);
  }
};
