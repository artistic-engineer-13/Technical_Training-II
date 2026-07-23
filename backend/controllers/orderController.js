import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import ErrorResponse from '../utils/ErrorHandler.js';
import { generateInvoicePDF } from '../services/pdfService.js';

// Helper to generate a unique human-readable Order ID
const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
};

// Helper to generate a 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc      Place a new order
// @route     POST /api/orders
// @access    Private
export const placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    let subtotal = 0;
    const orderItems = [];

    // Validate items, check stock, and calculate subtotal using DB prices
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return next(new ErrorResponse(`Product ${item.productId} is not available`, 404));
      }

      if (product.stock < item.quantity) {
        return next(new ErrorResponse(`Insufficient stock for product ${product.name}. Only ${product.stock} left.`, 400));
      }

      const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemSubtotal,
      });
    }

    // Process coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon || !coupon.isValid(subtotal)) {
        return next(new ErrorResponse('Invalid, expired, or inapplicable coupon code', 400));
      }

      if (coupon.discountType === 'Percentage') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      // Update coupon usage
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Delivery charge calculation (Free for orders above 500, else flat 40 rupees)
    const deliveryCharges = subtotal - discountAmount > 500 ? 0 : 40;

    // GST/Tax calculation (Flat 5% on discounted subtotal)
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = Math.round(taxableAmount * 0.05 * 100) / 100;

    // Grand total
    const totalAmount = taxableAmount + deliveryCharges + taxAmount;

    // Deduct inventory stock for ordered items
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Generate unique order ID and 6-digit OTP
    const orderId = generateOrderId();
    const deliveryOTP = generateOTP();

    const order = new Order({
      orderId,
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending', // online stays pending until webhook/verification
      subtotal,
      discountAmount,
      deliveryCharges,
      taxAmount,
      totalAmount,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      deliveryOTP,
    });

    await order.save();

    // Clear customer cart
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], totalQuantity: 0, subtotal: 0 });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Get logged-in customer's order history, or all orders for Admin, or assigned orders for DeliveryPartner
// @route     GET /api/orders
// @access    Private
export const getOrders = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'Customer') {
      query.userId = req.user.id;
    } else if (req.user.role === 'DeliveryPartner') {
      query.deliveryPartnerId = req.user.id;
    }
    // Admin gets all orders (query remains empty)

    const orders = await Order.find(query).sort({ createdAt: -1 }).populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Get single order details (with invoice)
// @route     GET /api/orders/:id
// @access    Private
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('deliveryPartnerId', 'name phone');

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Security check: Verify ownership (unless Admin or assigned DeliveryPartner)
    const isOwner = order.userId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    const isAssignedPartner = order.deliveryPartnerId && order.deliveryPartnerId._id.toString() === req.user.id;

    if (!isOwner && !isAdmin && !isAssignedPartner) {
      return next(new ErrorResponse('Not authorized to view this order', 401));
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Cancel order (only if not already dispatched)
// @route     PUT /api/orders/:id/cancel
// @access    Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Ownership check
    if (order.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse('Not authorized to cancel this order', 401));
    }

    // Cancellation guard: Can only cancel before dispatch
    if (order.orderStatus !== 'Received' && order.orderStatus !== 'Processing') {
      return next(new ErrorResponse(`Cannot cancel order. Already ${order.orderStatus}.`, 400));
    }

    // Restore stock to catalog
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'Cancelled';
    order.timeline.cancelledAt = Date.now();
    
    // Set payment status as Refunded if it was online payment
    if (order.paymentStatus === 'Completed') {
      order.paymentStatus = 'Refunded';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Assign delivery partner to order (Admin only)
// @route     PUT /api/admin/orders/:id/assign-partner
// @access    Private/Admin
export const assignDeliveryPartner = async (req, res, next) => {
  try {
    const { deliveryPartnerId } = req.body; // User ID of delivery partner

    // Verify delivery partner exists and has correct role
    const partner = await User.findById(deliveryPartnerId);
    if (!partner || partner.role !== 'DeliveryPartner') {
      return next(new ErrorResponse('Invalid delivery partner assigned', 400));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered') {
      return next(new ErrorResponse(`Cannot assign partner to a ${order.orderStatus} order`, 400));
    }

    order.deliveryPartnerId = deliveryPartnerId;
    order.orderStatus = 'Processing';
    order.timeline.processingAt = Date.now();
    await order.save();

    // Lock active order on partner details collection
    await DeliveryPartner.findOneAndUpdate(
      { userId: deliveryPartnerId },
      { isAvailable: false, activeOrderId: order._id }
    );

    res.status(200).json({
      success: true,
      message: 'Delivery partner assigned successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Download invoice PDF for an order
// @route     GET /api/orders/:id/invoice
// @access    Private
export const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Verify ownership or admin privileges
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse('Not authorized to access this invoice', 401));
    }

    // Configure client browser header responses
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order.orderId}.pdf`
    );

    // Stream the generated document
    generateInvoicePDF(order, res);
  } catch (error) {
    next(error);
  }
};
