import User from '../models/User.js';

/**
 * @desc    Get top alumni in the user's institution
 * @route   GET /api/gamification/leaderboard/alumni
 * @access  Private
 */
export const getAlumniLeaderboard = async (req, res, next) => {
  try {
    const { collegeId } = req.user;
    if (!collegeId) {
       return res.json([]);
    }

    const leaderboard = await User.find({ 
      collegeId, 
      role: 'alumni'
    })
      .sort({ contributionScore: -1 })
      .limit(10)
      .select('name profilePicture contributionScore badges currentRole company');

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top students in the user's institution
 * @route   GET /api/gamification/leaderboard/students
 * @access  Private
 */
export const getStudentLeaderboard = async (req, res, next) => {
  try {
    const { collegeId } = req.user;
    if (!collegeId) {
       return res.json([]);
    }

    const leaderboard = await User.find({ 
      collegeId, 
      role: 'student'
    })
      .sort({ contributionScore: -1 })
      .limit(10)
      .select('name profilePicture contributionScore badges branch year');

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's rank and stats
 * @route   GET /api/gamification/my-stats
 * @access  Private
 */
export const getMyStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('contributionScore badges verificationStatus aiCallsToday tokens');
    
    // Calculate rank within the college (only if collegeId exists)
    const rank = req.user.collegeId ? await User.countDocuments({
      collegeId: req.user.collegeId,
      role: req.user.role,
      contributionScore: { $gt: user.contributionScore }
    }) + 1 : 1;

    res.json({ ...user._doc, rank });
  } catch (error) {
    next(error);
  }
};
