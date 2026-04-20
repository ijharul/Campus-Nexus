import express from 'express';
import { getCollegeRequests, approveCollegeRequest, rejectCollegeRequest } from '../controllers/superAdminController.js';
import { protect, superAdminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(superAdminOnly);

router.get('/requests', getCollegeRequests);
router.put('/requests/:id/approve', approveCollegeRequest);
router.put('/requests/:id/reject', rejectCollegeRequest);

export default router;
