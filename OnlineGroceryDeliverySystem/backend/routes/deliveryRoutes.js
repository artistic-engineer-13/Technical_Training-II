import express from 'express';
import {
  getAssignedOrders,
  updateDeliveryStatus,
  verifyDeliveryOTP,
  updatePartnerLocation,
} from '../controllers/deliveryController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('DeliveryPartner')); // All endpoints in this file are restricted to DeliveryPartners

router.route('/orders')
  .get(getAssignedOrders);

router.route('/orders/:id/status')
  .put(updateDeliveryStatus);

router.route('/orders/:id/verify-otp')
  .post(verifyDeliveryOTP);

router.route('/location')
  .put(updatePartnerLocation);

export default router;
