import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ErrorResponse from '../utils/ErrorHandler.js';

// @desc      Get logged-in user's cart
// @route     GET /api/cart
// @access    Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId', 'name price discountPrice images stock unit isVeg');

    if (!cart) {
      // Create empty cart if it doesn't exist yet
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Add or update item quantity in cart
// @route     POST /api/cart
// @access    Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new ErrorResponse('Product not found or unavailable', 404));
    }

    if (product.stock < quantity) {
      return next(new ErrorResponse(`Insufficient stock. Only ${product.stock} items left.`, 400));
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Determine the correct unit price (checks for active discount)
    const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Item exists, update quantity and update price snapshot
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = itemPrice;
    } else {
      // Item doesn't exist, push to cart
      cart.items.push({
        productId,
        quantity,
        price: itemPrice,
      });
    }

    await cart.save();
    
    // Populate product details for response return
    await cart.populate('items.productId', 'name price discountPrice images stock unit isVeg');

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Remove item from cart
// @route     DELETE /api/cart/:productId
// @access    Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    // Filter item out
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    await cart.save();
    await cart.populate('items.productId', 'name price discountPrice images stock unit isVeg');

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Clear cart
// @route     DELETE /api/cart
// @access    Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
