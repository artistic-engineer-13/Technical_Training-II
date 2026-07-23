import Review from '../models/Review.js';
import Product from '../models/Product.js';
import ErrorResponse from '../utils/ErrorHandler.js';

// @desc      Get reviews for a product
// @route     GET /api/reviews/:productId
// @access    Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Add a review for a product
// @route     POST /api/reviews
// @access    Private
export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Check if user already reviewed this product (prevent duplicates)
    const existingReview = await Review.findOne({ userId: req.user.id, productId });
    if (existingReview) {
      return next(new ErrorResponse('You have already submitted a review for this product', 400));
    }

    const review = await Review.create({
      userId: req.user.id,
      productId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Delete a review
// @route     DELETE /api/reviews/:id
// @access    Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
    }

    // Authorization check: Only reviewer or Admin can delete
    if (review.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse('Not authorized to delete this review', 401));
    }

    const productId = review.productId;

    // Use deleteOne() to trigger the post('remove') hook
    await review.deleteOne();

    // Explicitly recalculate ratings for the product
    await Review.getAverageRating(productId);

    res.status(200).json({
      success: true,
      message: 'Review removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
