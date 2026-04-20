import express from 'express';
import { getStudentStats, getSuggestedAlumni } from '../controllers/studentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('student'));

router.get('/stats', getStudentStats);
router.get('/suggested-alumni', getSuggestedAlumni);

export default router;
