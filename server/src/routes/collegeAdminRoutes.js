import express from 'express';
import {
  getCollegeStats,
  getTopAlumni,
  getActiveStudents,
  getReports,
  updateReportStatus,
  getCampaigns,
  createCampaign,
  createReport,
  getNotices,
  createNotice,
  deleteNotice,
  getDonations,
  getPendingVerifications,
  handleVerification
} from '../controllers/collegeAdminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Publicly accessible report creation
router.post('/reports', protect, createReport);
router.get('/campaigns', protect, getCampaigns);

// Admin-only routes
router.use(protect, authorize('collegeAdmin'));

router.get('/stats', getCollegeStats);
router.get('/top-alumni', getTopAlumni);
router.get('/active-students', getActiveStudents);

router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);

router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.delete('/notices/:id', deleteNotice);

router.post('/campaigns', createCampaign);

router.get('/donations', getDonations);

// Verification Management
router.get('/verifications/pending', getPendingVerifications);
router.put('/verifications/:userId', handleVerification);

export default router;
