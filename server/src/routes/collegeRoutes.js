import express from 'express';
import {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
  assignCollegeAdmin,
  createCollegeAdmin,
  getCollegeStats,
} from '../controllers/collegeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getColleges);
router.post('/', protect, authorize('superAdmin'), createCollege);
router.get('/:id', protect, getCollegeById);
router.put('/:id', protect, authorize('superAdmin'), updateCollege);
router.delete('/:id', protect, authorize('superAdmin'), deleteCollege);
router.put('/:id/assign-admin', protect, authorize('superAdmin'), assignCollegeAdmin);
router.post('/:id/create-admin', protect, authorize('superAdmin'), createCollegeAdmin);
router.get('/:id/stats', protect, authorize('collegeAdmin', 'superAdmin'), getCollegeStats);

export default router;
