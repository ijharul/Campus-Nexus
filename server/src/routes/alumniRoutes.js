import express from "express";
import {
  getAlumniStats,
  getSuggestedStudents,
} from "../controllers/alumniController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("alumni"));

router.get("/stats", getAlumniStats);
router.get("/suggested-students", getSuggestedStudents);

export default router;
