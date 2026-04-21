import express from 'express';
import {
  createDrive,
  getDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  applyToDrive,
  updateStudentStatus
} from '../controllers/driveController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Shared Routes
router.get('/', getDrives);
router.get('/:id', getDriveById);

// Admin Routes
router.post('/', authorize('collegeAdmin', 'superAdmin'), createDrive);
router.put('/:id', authorize('collegeAdmin', 'superAdmin'), updateDrive);
router.delete('/:id', authorize('collegeAdmin', 'superAdmin'), deleteDrive);
router.put('/:id/status', authorize('collegeAdmin', 'superAdmin'), updateStudentStatus);

// Student Routes
router.post('/:id/apply', authorize('student'), applyToDrive);

export default router;
