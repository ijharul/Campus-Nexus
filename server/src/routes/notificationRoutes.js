import express from 'express';
import {
  getMyNotifications,
  markAllRead,
  markOneRead,
  deleteAllNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.put('/read', markAllRead);          // mark ALL read
router.put('/:id/read', markOneRead);      // mark ONE read
router.delete('/', deleteAllNotifications); // delete ALL

export default router;
