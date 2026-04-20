import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
/**
 * @desc    Create Razorpay Order for Donation
 * @route   POST /api/donations/create-order
 */
export const createDonationOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400); throw new Error('Invalid donation amount');
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });

    const options = {
      amount: Math.round(amount * 100), // Strict Integer paise
      currency: "INR",
      receipt: `don_${req.user._id.toString().slice(-6)}_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    if (!order) {
      res.status(500); throw new Error("Razorpay instance failed to instantiate abstract payload");
    }

    res.json(order);
  } catch (error) { next(error); }
};

/**
 * @desc    Verify payment signature and execute donation state
 * @route   POST /api/donations/verify
 */
export const verifyDonation = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, message, campaignId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    if (!isAuthentic) {
      res.status(400); throw new Error("Invalid cryptographic signature executing Razorpay pipeline");
    }

    const donorId = req.user._id;
    const collegeId = req.user.collegeId;

    const donation = await Donation.create({
      donorId,
      collegeId,
      amount,
      message,
      campaignId
    });

    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { raisedAmount: amount }
      });
    }

    res.status(201).json({ success: true, donation });
  } catch (error) { next(error); }
};

/**
 * @desc    Get alumni's own donations
 * @route   GET /api/donations/my
 */
export const getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) { next(error); }
};
