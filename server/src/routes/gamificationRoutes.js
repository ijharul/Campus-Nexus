import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  getAlumniLeaderboard, 
  getStudentLeaderboard, 
  getMyStats 
} from '../controllers/gamificationController.js';

const router = express.Router();

router.use(protect);

router.get('/leaderboard/alumni', getAlumniLeaderboard);
router.get('/leaderboard/students', getStudentLeaderboard);
router.get('/my-stats', getMyStats);

export default router;
