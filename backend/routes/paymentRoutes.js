import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeCheckout,
  stripeWebhook,
} from '../controllers/paymentController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Razorpay routes
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Stripe routes
router.post('/stripe/checkout', protect, createStripeCheckout);

// Webhook route (exposes raw body for stripe validation, bypasses normal protect middleware)
// Note: In server.js, we must use express.json() but exclude this path or parse it appropriately
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
