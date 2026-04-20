import express from 'express';
import { getPlatformAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('superAdmin'), getPlatformAnalytics);

export default router;
