import express from 'express';
import {
  getNotices,
  createNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getNotices)
  .post(authorize('alumni', 'collegeAdmin', 'superAdmin'), createNotice);

router.delete('/:id', deleteNotice);

export default router;
