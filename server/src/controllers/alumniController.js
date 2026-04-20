import User from '../models/User.js';
import Mentorship from '../models/Mentorship.js';
import Referral from '../models/Referral.js';

/**
 * @desc    Get alumni impact stats
 * @route   GET /api/alumni/stats
 */
export const getAlumniStats = async (req, res, next) => {
  try {
    const alumniId = req.user._id;

    const [mentorshipsGiven, referralsDone] = await Promise.all([
      Mentorship.countDocuments({ mentor: alumniId, status: 'completed' }),
      Referral.countDocuments({ alumni: alumniId, status: 'referred' })
    ]);

    res.json({
      mentorshipsGiven,
      referralsDone
    });
  } catch (error) { next(error); }
};

/**
 * @desc    Get suggested students based on skill match
 * @route   GET /api/alumni/suggested-students
 */
export const getSuggestedStudents = async (req, res, next) => {
  try {
    const alumni = await User.findById(req.user._id);
    if (!alumni || !alumni.skills || alumni.skills.length === 0) {
      // If no skills, just return recent students from the same college
      const students = await User.find({ 
        collegeId: req.user.collegeId, 
        role: 'student' 
      }).limit(6).select('name profilePicture skills branch year');
      return res.json(students);
    }

    // Find students in the same college with at least one matching skill
    const students = await User.find({
      collegeId: req.user.collegeId,
      role: 'student',
      skills: { $in: alumni.skills }
    })
    .limit(6)
    .select('name profilePicture skills branch year bio');

    res.json(students);
  } catch (error) { next(error); }
};
