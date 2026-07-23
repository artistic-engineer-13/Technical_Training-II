import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import ErrorResponse from '../utils/ErrorHandler.js';

// @desc      Get current user's wishlist
// @route     GET /api/wishlist
// @access    Private
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('products', 'name price discountPrice images stock unit isVeg');

    if (!wishlist) {
      // Create empty wishlist if it doesn't exist yet
      wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Add/Remove product in wishlist (Toggle)
// @route     POST /api/wishlist/:productId
// @access    Private
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new ErrorResponse('Product not found', 404));
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [] });
    }

    const itemIndex = wishlist.products.findIndex((id) => id.toString() === productId);

    if (itemIndex > -1) {
      // Product already in wishlist, remove it
      wishlist.products.splice(itemIndex, 1);
    } else {
      // Product not in wishlist, add it
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate('products', 'name price discountPrice images stock unit isVeg');

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};
