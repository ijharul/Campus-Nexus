import User from "../models/User.js";
import CollegeRequest from "../models/CollegeRequest.js";
import { sendCollegeRequestAlert } from "../utils/emailService.js";
import jwt from "jsonwebtoken";

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

    const userData = {
      name,
      email,
      password,
      role: finalRole,
      collegeId: collegeId || null,
      pendingCollege: collegeId ? "" : pendingCollege || "",
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
