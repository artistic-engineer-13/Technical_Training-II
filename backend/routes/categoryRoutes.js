import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../utils/fileUpload.js';
import { validateCategory } from '../validators/schemas.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Admin-only routes
router.post('/', protect, authorize('Admin'), upload.single('image'), validateCategory, createCategory);
router.put('/:id', protect, authorize('Admin'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorize('Admin'), deleteCategory);

export default router;
