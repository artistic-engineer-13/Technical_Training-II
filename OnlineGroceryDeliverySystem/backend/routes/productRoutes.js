import express from 'express';
import {
  getProducts,
  getProduct,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../utils/fileUpload.js';
import { validateProduct } from '../validators/schemas.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/related/:categoryId', getRelatedProducts);

// Admin-only routes
router.post('/', protect, authorize('Admin'), upload.array('images', 5), validateProduct, createProduct);
router.put('/:id', protect, authorize('Admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('Admin'), deleteProduct);

export default router;
