import express from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getDeliveryPartnersList,
} from '../controllers/adminController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin')); // Protect all routes in this file to Admins only

router.route('/dashboard')
  .get(getDashboardStats);

router.route('/reports')
  .get(getSalesReport);

router.route('/delivery-partners')
  .get(getDeliveryPartnersList);

export default router;
