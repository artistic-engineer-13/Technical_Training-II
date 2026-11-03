import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeCheckout,
} from '../controllers/paymentController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Razorpay routes
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Stripe routes
router.post('/stripe/checkout', protect, createStripeCheckout);

export default router;
