import express from "express";
import {
  sendMentorshipRequest,
  getStudentRequests,
  getMentorRequests,
  updateMentorshipStatus,
  getRecommendedMentors,
} from "../controllers/mentorshipController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only fully instantiated users should access any of these points
router.use(protect);

// Student mappings
router.post("/request", authorize("student"), sendMentorshipRequest);
router.get("/my-requests", authorize("student"), getStudentRequests);
router.get("/recommended", authorize("student"), getRecommendedMentors);

// Alumni mappings
router.get(
  "/mentor-requests",
  authorize("alumni", "collegeAdmin"),
  getMentorRequests,
);
router.put("/:id", authorize("alumni", "collegeAdmin"), updateMentorshipStatus);

export default router;
