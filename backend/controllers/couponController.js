import Coupon from '../models/Coupon.js';
import ErrorResponse from '../utils/ErrorHandler.js';

// @desc      Get all coupons
// @route     GET /api/coupons
// @access    Private
export const getCoupons = async (req, res, next) => {
  try {
    let query = {};
    // Customers can only see active, non-expired coupons
    if (req.user.role !== 'Admin') {
      query = {
        isActive: true,
        expiryDate: { $gt: new Date() },
      };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Create a coupon
// @route     POST /api/coupons
// @access    Private/Admin
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, expiryDate, usageLimit } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return next(new ErrorResponse('Coupon with this code already exists', 400));
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
    });

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Delete a coupon
// @route     DELETE /api/coupons/:id
// @access    Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Validate a coupon code
// @route     POST /api/coupons/validate
// @access    Private
export const validateCouponCode = async (req, res, next) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code) {
      return next(new ErrorResponse('Please provide a coupon code', 400));
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return next(new ErrorResponse('Coupon not found', 404));
    }

    if (!coupon.isValid(totalAmount)) {
      return next(new ErrorResponse('Coupon is expired, inactive, or terms are not met (e.g. minimum cart value)', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid and applied',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minOrderValue: coupon.minOrderValue,
      },
    });
  } catch (error) {
    next(error);
  }
};
