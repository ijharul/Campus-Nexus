import express from "express";
import {
  sendReferralRequest,
  getStudentRequests,
  getAlumniRequests,
  updateReferralStatus,
} from "../controllers/referralController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Extrapolated global JWT runtime protection
router.use(protect);

// Student Endpoint Mappings
router.post("/request", authorize("student"), upload.single('resume'), sendReferralRequest);
router.get("/my-requests", authorize("student"), getStudentRequests);

// Alumni Endpoint Mappings
router.get("/incoming", authorize("alumni", "collegeAdmin"), getAlumniRequests);
router.put("/:id", authorize("alumni", "collegeAdmin"), updateReferralStatus);

export default router;
