import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all routes under /api/wishlist

router.route('/')
  .get(getWishlist);

router.route('/:productId')
  .post(toggleWishlist);

export default router;
