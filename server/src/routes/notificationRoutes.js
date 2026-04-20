import express from 'express';
import { getMyNotifications, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.put('/read', markAllRead);

export default router;
