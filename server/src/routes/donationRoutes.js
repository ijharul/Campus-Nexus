import express from 'express';
import { createDonationOrder, verifyDonation, getMyDonations } from '../controllers/donationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createDonationOrder);
router.post('/verify', verifyDonation);
router.get('/my', getMyDonations);

export default router;
