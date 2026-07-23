import Category from '../models/Category.js';
import ErrorResponse from '../utils/ErrorHandler.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

// @desc      Get all categories
// @route     GET /api/categories
// @access    Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Create new category
// @route     POST /api/admin/categories
// @access    Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return next(new ErrorResponse('Category with this name already exists', 400));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a category image', 400));
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.path, 'categories');

    const category = await Category.create({
      name,
      description,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Update category
// @route     PUT /api/admin/categories/:id
// @access    Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }

    const { name, description } = req.body;

    // Check if name is being changed and is already taken
    if (name && name !== category.name) {
      const nameExists = await Category.findOne({ name });
      if (nameExists) {
        return next(new ErrorResponse('Category name already in use', 400));
      }
      category.name = name;
    }

    if (description) {
      category.description = description;
    }

    // Handle new image upload
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.path, 'categories');
      category.image = imageUrl;
    }

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Delete category
// @route     DELETE /api/admin/categories/:id
// @access    Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
