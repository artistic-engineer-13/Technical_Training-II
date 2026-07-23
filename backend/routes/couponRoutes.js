import express from 'express';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCouponCode,
} from '../controllers/couponController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All coupon endpoints require JWT auth

router.route('/')
  .get(getCoupons)
  .post(authorize('Admin'), createCoupon);

router.route('/validate')
  .post(validateCouponCode);

router.route('/:id')
  .delete(authorize('Admin'), deleteCoupon);

export default router;
