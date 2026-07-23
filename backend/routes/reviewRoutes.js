import express from 'express';
import {
  getProductReviews,
  createReview,
  deleteReview,
} from '../controllers/reviewController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route: Fetch product reviews
router.get('/:productId', getProductReviews);

// Protected routes (Login required)
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

export default router;
