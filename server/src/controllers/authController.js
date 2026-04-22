import User from "../models/User.js";
import CollegeRequest from "../models/CollegeRequest.js";
import { sendCollegeRequestAlert, sendPasswordResetEmail } from "../utils/emailService.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate JWT — embed id, role, and collegeId for middleware use
const generateToken = (id, role, collegeId) => {
  return jwt.sign(
    { id, role, collegeId: collegeId ?? null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "30d" },
  );
};

// Helper: build consistent user payload for responses
const buildUserPayload = (user, token) => {
  // SuperAdmin is the platform owner — do not expose subscription details
  const isPlatformOwner = user.role === "superAdmin";
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId ?? null,
    planName: isPlatformOwner ? "none" : user.planName,
    planStatus: isPlatformOwner ? "none" : user.planStatus,
    paymentStatus: isPlatformOwner ? "none" : user.paymentStatus,
    expiryDate: isPlatformOwner ? null : user.expiryDate,
    tokens: user.tokens,
    profilePicture: user.profilePicture,
    token,
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      collegeId,
      pendingCollege,
      pendingCollegeAddress,
      pendingCollegeWebsite,
      batch,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("An account with this email already exists.");
    }

    const allowedSelfRoles = ["student", "alumni"];
    const finalRole = allowedSelfRoles.includes(role) ? role : "student";

    const isOther = collegeId === 'other' || !collegeId;
    const userData = {
      name,
      email,
      password,
      role: finalRole,
      collegeId: isOther ? null : collegeId,
      pendingCollege: isOther ? pendingCollege || "" : "",
    };

    // Set batch for alumni
    if (finalRole === "alumni" && batch) {
      userData.batch = parseInt(batch);
    }

    const user = await User.create(userData);

    if (user) {
      // If user provided a pending college, create a formal request for Super Admin
      if (pendingCollege) {
        await CollegeRequest.create({
          collegeName: pendingCollege,
          address: pendingCollegeAddress || "",
          website: pendingCollegeWebsite || "",
          requester: user._id,
        });
        // Send email alert to Super Admin
        await sendCollegeRequestAlert({
          collegeName: pendingCollege,
          requesterEmail: email,
        });
      }

      const token = generateToken(user._id, user.role, user.collegeId);
      res.status(201).json(buildUserPayload(user, token));
    } else {
      res.status(400);
      throw new Error("Invalid user data received.");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 LOGIN DEBUG:");
    console.log("  Email:", email);
    console.log("  Password entered:", password);

    const user = await User.findOne({ email }).select("+password");

    console.log("  User found:", user ? "YES" : "NO");
    if (user) {
      console.log("  User ID:", user._id);
      console.log("  Password field exists:", user.password ? "YES" : "NO");
      console.log(
        "  Password length:",
        user.password ? user.password.length : "N/A",
      );
    }

    if (user) {
      const isMatch = await user.matchPassword(password);
      console.log("  Password match result:", isMatch);
    }

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role, user.collegeId);
      res.json(buildUserPayload(user, token));
    } else {
      res.status(401);
      throw new Error("Invalid email or password.");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password - request reset link
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404);
      throw new Error('There is no user with that email');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const frontendUrl = (process.env.FRONTEND_URL || "https://campus-nexus-ten.vercel.app").replace(/\/$/, "");
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({
        userEmail: user.email,
        resetUrl,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500);
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};
