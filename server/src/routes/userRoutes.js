import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getAllUsers,
  approveAlumni,
  getUserById,
  toggleBlockUser,
  deleteUser,
  requestVerification,
  updateUsername,
  getPublicProfile,
  getPublicProfileById,
  rateMentor
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// ── Static / Admin routes FIRST ───────────────────────
router.get(
  "/all",
  protect,
  authorize("collegeAdmin", "superAdmin"),
  getAllUsers,
);

// Directory (college-scoped by default, ?global=true for all)
router.get("/", protect, getUsers);

// Public Portfolio Access
router.get("/u/:username", getPublicProfile);
router.get("/:id", getPublicProfileById);

// View user profile by ID (for directory/profile viewing)
router.get("/:id/profile", protect, getUserById);
router.post("/:id/rate", protect, rateMentor);

// Own profile — MUST be before /:id
router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("file"), updateUserProfile);

// Professional Identity & Verification
router.put("/username", protect, updateUsername);
router.post("/verify-request", protect, requestVerification);

// ── Dynamic :id routes LAST ──────────────────────────────────────────────────

// Admin: get single user (renamed for clarity if needed, but keeping pattern)
router.get(
  "/admin/:id",
  protect,
  authorize("collegeAdmin", "superAdmin"),
  getUserById,
);

// Approve / reject alumni
router.put(
  "/:id/approve",
  protect,
  authorize("collegeAdmin", "superAdmin"),
  approveAlumni,
);

// Moderation (superAdmin and collegeAdmin)
router.put(
  "/:id/block",
  protect,
  authorize("superAdmin", "collegeAdmin"),
  toggleBlockUser,
);
router.delete(
  "/:id",
  protect,
  authorize("superAdmin", "collegeAdmin"),
  deleteUser,
);

export default router;
