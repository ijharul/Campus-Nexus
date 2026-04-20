import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';

/**
 * @desc    Create a regular order (Student only)
 * @route   POST /api/payment/create-order
 * @access  Private/student
 */
export const createOrder = async (req, res, next) => {
  try {
    // Strict Logic: Only students can have plans
    if (req.user.role !== 'student') {
      res.status(403);
      throw new Error('Only students are eligible to purchase premium association plans.');
    }

    const { planId } = req.body;

    let amount = 0;
    if (planId === 'Monthly') amount = 199 * 100; // Razorpay tracks INR in paise securely
    else if (planId === 'Yearly') amount = 1499 * 100;
    else {
      res.status(400);
      throw new Error("Invalid Plan specific targeting");
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });

    const options = {
      amount: amount, 
      currency: "INR",
      receipt: `rcpt_${req.user._id}`,
    };

    const order = await instance.orders.create(options);
    
    if (!order) {
       res.status(500);
       throw new Error("Razorpay instance failed to instantiate abstract payload");
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    // Construct natively verified hash bypassing spoof attempts
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const user = await User.findById(req.user._id);

      const now = new Date();
      const expiry = new Date();

      if (planId === 'Monthly') {
         user.planName = 'Monthly';
         user.tokens += 300;
         expiry.setMonth(now.getMonth() + 1);
      } else if (planId === 'Yearly') {
         user.planName = 'Yearly';
         user.tokens += 1000;
         expiry.setFullYear(now.getFullYear() + 1);
      }
      
      user.planStatus = 'active';
      user.paymentStatus = 'paid';
      user.expiryDate = expiry;
      
      await user.save();
      
      res.json({
        success: true,
        message: "Financial pipeline verified successfully. Native Tokens incremented.",
        plan: user.plan,
        tokens: user.tokens
      });

    } else {
      res.status(400);
      throw new Error("Invalid cryptographic signature executing Razorpay pipeline");
    }
  } catch (error) {
    next(error);
  }
};
