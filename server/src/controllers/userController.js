import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const streamUploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) resolve(result); else reject(error);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

const userPayload = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  username: u.username,
  contributionScore: u.contributionScore,
  badges: u.badges,
  verificationStatus: u.verificationStatus,
  aiCallsToday: u.aiCallsToday,
  tokens: u.tokens,
  bio: u.bio,
  skills: u.skills,
  company: u.company,
  collegeId: u.collegeId, // Populated object or ID
  college: u.college,
  currentRole: u.currentRole,
  experience: u.experience,
  projects: u.projects,
  socialLinks: u.socialLinks,
  batch: u.batch,
  branch: u.branch,
  year: u.year,
  careerGoal: u.careerGoal,
  profilePicture: u.profilePicture,
  resume: u.resume,
});

/** GET /api/users/profile */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('collegeId', 'name location');
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json(userPayload(user));
  } catch (error) { next(error); }
};

/** PUT /api/users/profile */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    const scalar = ['name', 'bio', 'company', 'college', 'currentRole', 'batch', 'branch', 'year', 'careerGoal'];
    scalar.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });

    if (req.body.skills) {
      user.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : req.body.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    ['experience', 'projects', 'socialLinks'].forEach((f) => {
      if (req.body[f]) {
        try { user[f] = typeof req.body[f] === 'string' ? JSON.parse(req.body[f]) : req.body[f]; }
        catch (e) { console.error(`${f} parse error`, e); }
      }
    });

    if (req.file) {
      const isImage = req.file.mimetype.startsWith('image/');
      if (isImage) {
        const result = await streamUploadToCloudinary(req.file.buffer, {
          resource_type: 'image',
          folder: 'campus-nexus/avatars',
          transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }, { quality: 'auto', fetch_format: 'auto' }],
        });
        user.profilePicture = result.secure_url;
      } else {
        const result = await streamUploadToCloudinary(req.file.buffer, { resource_type: 'auto', folder: 'campus-nexus/resumes' });
        user.resume = result.secure_url;
      }
    }

    const updated = await user.save();
    res.json(userPayload(updated));
  } catch (error) { next(error); }
};

/** GET /api/users — college-scoped directory */
export const getUsers = async (req, res, next) => {
  try {
    const { skills, company, role, global: isGlobal, collegeId } = req.query;
    const query = {};

    // Don't filter by college for alumni role (allow cross-college networking)
    if (isGlobal !== 'true' && role !== 'alumni') {
      const scopeId = collegeId || req.user.collegeId;
      if (scopeId) query.collegeId = scopeId;
    }
    if (role) query.role = role;
    if (company) query.company = { $regex: company, $options: 'i' };
    if (skills) {
      const arr = skills.split(',').map((s) => new RegExp(s.trim(), 'i'));
      query.skills = { $in: arr };
    }

    if (role === 'top_mentors') {
      query.role = 'alumni';
      // Sort by contributionScore or studentsHelped
      const users = await User.find(query).select('-password').populate('collegeId', 'name location').sort({ contributionScore: -1 }).limit(10);
      return res.json(users);
    }

    const users = await User.find(query).select('-password').populate('collegeId', 'name location').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { next(error); }
};

/** GET /api/users/all — admin panel */
export const getAllUsers = async (req, res, next) => {
  try {
    const { _id: userId, role: userRole, collegeId: userCollegeId } = req.user;
    const query = { _id: { $ne: userId } };
    
    if (userRole === 'collegeAdmin') {
      query.collegeId = userCollegeId;
      query.role = { $in: ['student', 'alumni'] };
    }

    const users = await User.find(query).select('-password').populate('collegeId', 'name').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { next(error); }
};

/**
 * @desc    Approve or reject an alumni (collegeAdmin/superAdmin)
 * @route   PUT /api/users/:id/approve
 * @body    { approved: true | false }
 */
export const approveAlumni = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found.'); }
    if (user.role !== 'alumni') { res.status(400); throw new Error('User is not an alumni.'); }

    // collegeAdmin can only approve alumni from their own college
    if (req.user.role === 'collegeAdmin' && user.collegeId?.toString() !== req.user.collegeId?.toString()) {
      res.status(403); throw new Error('You can only manage alumni from your college.');
    }

    user.isApproved = !!approved;
    await user.save();

    res.json({
      message: `Alumni ${approved ? 'approved' : 'rejected'} successfully.`,
      user: { _id: user._id, name: user.name, email: user.email, isApproved: user.isApproved },
    });
  } catch (error) { next(error); }
};

/**
 * @desc    Get a single user by ID (admin use)
 * @route   GET /api/users/:id
 * @access  Private/collegeAdmin or superAdmin
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('collegeId', 'name');
    if (!user) { res.status(404); throw new Error('User not found.'); }
    res.json(user);
  } catch (error) { next(error); }
};

/**
 * @desc    Toggle block status of a user (superAdmin only)
 * @route   PUT /api/users/:id/block
 * @access  Private/superAdmin
 */
export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found.'); }
    if (user.role === 'superAdmin') { res.status(400); throw new Error('Cannot block a Super Admin.'); }

    // collegeAdmin scope check
    if (req.user.role === 'collegeAdmin' && user.collegeId?.toString() !== req.user.collegeId?.toString()) {
      res.status(403); throw new Error('You can only manage users from your own college.');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      isBlocked: user.isBlocked,
    });
  } catch (error) { next(error); }
};

/**
 * @desc    Permanently delete a user (superAdmin only)
 * @route   DELETE /api/users/:id
 * @access  Private/superAdmin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found.'); }
    if (user.role === 'superAdmin') { res.status(400); throw new Error('Cannot delete a Super Admin.'); }

    // collegeAdmin scope check
    if (req.user.role === 'collegeAdmin' && user.collegeId?.toString() !== req.user.collegeId?.toString()) {
      res.status(403); throw new Error('You can only manage users from your own college.');
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed from platform successfully.' });
  } catch (error) { next(error); }
};

/**
 * @desc    Request institutional verification
 * @route   POST /api/users/verify-request
 */
export const requestVerification = async (req, res, next) => {
  try {
    const { graduationYear } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.collegeId && !user.pendingCollege) {
      res.status(400); throw new Error('Please specify your institution name in profile first.');
    }

    user.verificationStatus = 'pending';
    user.verificationDetails = { 
       graduationYear,
       college: user.collegeId ? 'institutional' : (user.pendingCollege || user.college)
    };
    
    await user.save();
    res.json({ message: 'Verification request submitted. Platform administrators will review your institution.', status: 'pending' });
  } catch (error) { next(error); }
};

/**
 * @desc    Claim or update unique username
 * @route   PUT /api/users/username
 */
export const updateUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user._id);

    // Validation: simple alphanumeric + underscore
    const regex = /^[a-z0-9_]{3,20}$/;
    if (!regex.test(username.toLowerCase())) {
       res.status(400); 
       throw new Error('Username must be 3-20 characters, lowercase, and contain only letters, numbers, or underscores.');
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing && existing._id.toString() !== user._id.toString()) {
       res.status(400); throw new Error('Username already claimed by another professional.');
    }

    user.username = username.toLowerCase();
    await user.save();
    res.json({ message: 'Elite handle claimed successfully.', username: user.username });
  } catch (error) { next(error); }
};

/**
 * @desc    Get user profile by username (Public Portfolio)
 * @route   GET /api/users/u/:username
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username, isPublic: true })
      .select('-password -aiCallsToday -tokens -isBlocked')
      .populate('collegeId', 'name location');
    
    if (!user) { res.status(404); throw new Error('Public profile not found or set to private.'); }
    res.json(user);
  } catch (error) { next(error); }
};
/**
 * @desc    Get user profile by ID (Public Portfolio)
 * @route   GET /api/users/:id
 */
export const getPublicProfileById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -aiCallsToday -tokens -isBlocked')
      .populate('collegeId', 'name location');
    
    if (!user) { res.status(404); throw new Error('Public profile not found.'); }
    res.json(user);
  } catch (error) { next(error); }
};
/**
 * @desc    Rate an alumni mentor and provide a testimonial
 * @route   POST /api/users/:id/rate
 */
export const rateMentor = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    const alumni = await User.findById(req.params.id);
    
    if (!alumni || alumni.role !== 'alumni') {
      res.status(404); throw new Error('Alumni mentor not found.');
    }

    // Add to ratings
    alumni.ratings.push({
      studentId: req.user._id,
      rating,
      feedback
    });

    // If high rating, also add to testimonials
    if (rating >= 4 && feedback) {
      alumni.testimonials.push({
        studentId: req.user._id,
        text: feedback
      });
    }

    await alumni.save();
    res.json({ message: 'Success stories shared! Thank you for the feedback.' });
  } catch (error) { next(error); }
};
