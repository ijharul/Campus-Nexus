import express from 'express';
import { registerUser, authUser } from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', authUser);

// -------------------------------------------------------------
// EXAMPLE OF A PROTECTED ROUTE (You can remove this later)
// Requires a valid JWT, and only 'Admin' or 'Alumni' can access
// -------------------------------------------------------------
router.get(
  '/me/protected',
  protect,
  authorize('Admin', 'Alumni'),
  (req, res) => {
    res.json({
      success: true,
      data: req.user,
      message: 'You possess the correct authorizations to view this route!',
    });
  }
);

export default router;
