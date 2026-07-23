import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all routes under /api/cart

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .delete(removeFromCart);

export default router;
