import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ErrorResponse from '../utils/ErrorHandler.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

// @desc      Get all products with pagination, search, category & pricing filters
// @route     GET /api/products
// @access    Public
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, priceMin, priceMax, isVeg, sort, page, limit } = req.query;

    const query = { isActive: true };

    // Filter by category slug or ObjectId
    if (category) {
      // Find category first
      const catObj = await Category.findOne({ $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { slug: category }] });
      if (catObj) {
        query.category = catObj._id;
      } else {
        // Return empty if category doesn't exist
        return res.status(200).json({ success: true, count: 0, pagination: {}, data: [] });
      }
    }

    // Filter by vegetarian/non-vegetarian
    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }

    // Filter by price range
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // Text search matching query
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination setup
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    const total = await Product.countDocuments(query);

    // Build query execution sequence
    let dbQuery = Product.find(query).populate('category', 'name slug');

    // Sorting options
    if (sort) {
      if (sort === 'priceAsc') dbQuery = dbQuery.sort({ price: 1 });
      else if (sort === 'priceDesc') dbQuery = dbQuery.sort({ price: -1 });
      else if (sort === 'rating') dbQuery = dbQuery.sort({ ratingsAverage: -1 });
      else if (sort === 'newest') dbQuery = dbQuery.sort({ createdAt: -1 });
      else if (search) {
        // If searching without explicit sort, sort by text relevance score
        dbQuery = dbQuery.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
      }
    } else {
      dbQuery = dbQuery.sort({ createdAt: -1 }); // Default to newest
    }

    // Execute pagination
    dbQuery = dbQuery.skip(startIndex).limit(limitNum);
    const products = await dbQuery;

    // Pagination progress indicators
    const pagination = {};
    if (startIndex + limitNum < total) {
      pagination.next = { page: pageNum + 1, limit: limitNum };
    }
    if (startIndex > 0) {
      pagination.prev = { page: pageNum - 1, limit: limitNum };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      totalCount: total,
      pagination,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Get single product details
// @route     GET /api/products/:id
// @access    Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product || !product.isActive) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Get related products from same category
// @route     GET /api/products/related/:categoryId
// @access    Public
export const getRelatedProducts = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const currentProductId = req.query.currentId;

    const filter = { category: categoryId, isActive: true };
    if (currentProductId) {
      filter._id = { $ne: currentProductId };
    }

    const related = await Product.find(filter).limit(4).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Create new product (Admin only)
// @route     POST /api/admin/products
// @access    Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, stock, unit, category, isVeg, brand } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(new ErrorResponse('Invalid category assigned', 400));
    }

    // Verify images upload
    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse('Please upload at least one product image', 400));
    }

    // Upload files to Cloudinary concurrently
    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.path, 'products'));
    const imageUrls = await Promise.all(uploadPromises);

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice: discountPrice || 0,
      stock,
      unit,
      category,
      isVeg: isVeg !== 'false', // String parsing for multipart form-data
      brand,
      images: imageUrls,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Update product (Admin only)
// @route     PUT /api/admin/products/:id
// @access    Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    const updates = { ...req.body };

    // Check category if it is updated
    if (updates.category) {
      const categoryExists = await Category.findById(updates.category);
      if (!categoryExists) {
        return next(new ErrorResponse('Invalid category assigned', 400));
      }
    }

    // Handle string to boolean parses for form data updates
    if (updates.isVeg !== undefined) {
      updates.isVeg = updates.isVeg !== 'false';
    }

    // Handle new image uploads (if provided)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.path, 'products'));
      const newImageUrls = await Promise.all(uploadPromises);
      
      // If the client instructs to overwrite, replace; otherwise, append
      if (req.body.replaceImages === 'true') {
        updates.images = newImageUrls;
      } else {
        updates.images = [...product.images, ...newImageUrls];
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Delete product (Admin only)
// @route     DELETE /api/admin/products/:id
// @access    Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    // Soft delete product by setting isActive to false
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product soft deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
