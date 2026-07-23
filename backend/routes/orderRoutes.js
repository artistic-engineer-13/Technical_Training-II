import express from 'express';
import {
  placeOrder,
  getOrders,
  getOrder,
  cancelOrder,
  assignDeliveryPartner,
  downloadInvoice,
} from '../controllers/orderController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateOrder } from '../validators/schemas.js';

const router = express.Router();

router.use(protect); // All order routes require JWT authentication

router.route('/')
  .post(validateOrder, placeOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrder);

router.route('/:id/invoice')
  .get(downloadInvoice);

router.route('/:id/cancel')
  .put(cancelOrder);

// Admin-only route: Assign partner
router.route('/:id/assign-partner')
  .put(authorize('Admin'), assignDeliveryPartner);

export default router;
