import express from 'express';
import { getWeeklyActivity } from '../controllers/activityController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/weekly', getWeeklyActivity);

export default router;
