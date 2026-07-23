import Razorpay from 'razorpay';
import Stripe from 'stripe';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import ErrorResponse from '../utils/ErrorHandler.js';

// Initialize Stripe SDK instance
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key', {
  apiVersion: '2023-10-16',
});

// Initialize Razorpay SDK instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_key_secret',
});

// ================= RAZORPAY INTEGRATION =================

// @desc      Generate a Razorpay Order ID for client transaction execution
// @route     POST /api/payments/razorpay/order
// @access    Private
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body; // DB Order ObjectId

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to pay for this order', 401));
    }

    // Razorpay amount is in paise (multiply by 100)
    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        razorpayOrderId: razorpayOrder.id,
        orderId: order._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Verify Razorpay Payment Signature and capture payment
// @route     POST /api/payments/razorpay/verify
// @access    Private
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Recreate HMAC signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_key_secret';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== razorpaySignature) {
      // Payment verification failed
      order.paymentStatus = 'Failed';
      await order.save();
      return next(new ErrorResponse('Payment verification failed. Invalid signature.', 400));
    }

    // Save Payment Log
    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user.id,
      gateway: 'Razorpay',
      transactionId: razorpayPaymentId,
      gatewayOrderId: razorpayOrderId,
      gatewaySignature: razorpaySignature,
      amount: order.totalAmount,
      status: 'Captured',
    });

    // Update Order details
    order.paymentStatus = 'Completed';
    order.paymentId = payment._id;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment captured and verified successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ================= STRIPE INTEGRATION =================

// @desc      Create Stripe Checkout Session
// @route     POST /api/payments/stripe/checkout
// @access    Private
export const createStripeCheckout = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to pay for this order', 401));
    }

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery charges and taxes as line items if applicable
    if (order.deliveryCharges > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Delivery Charges',
          },
          unit_amount: Math.round(order.deliveryCharges * 100),
        },
        quantity: 1,
      });
    }

    if (order.taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'GST (5%)',
          },
          unit_amount: Math.round(order.taxAmount * 100),
        },
        quantity: 1,
      });
    }

    // Apply discount as negative item if applicable (since Stripe Checkout supports coupon discounts directly, or negative line item)
    if (order.discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Promo Coupon Discount',
          },
          unit_amount: -Math.round(order.discountAmount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success?orderId=${order._id}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-failed?orderId=${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        sessionUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================= STRIPE WEBHOOK =================

// @desc      Capture payment from Stripe webhook
// @route     POST /api/payments/webhook
// @access    Public
export const stripeWebhook = async (req, res, next) => {
  let event;

  try {
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (endpointSecret) {
      // Validate signature
      event = stripeInstance.webhooks.constructEvent(req.body, signature, endpointSecret);
    } else {
      // Direct parse in dev mode if signature verification is bypassed
      event = req.body;
    }
  } catch (err) {
    console.error(`Stripe Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const orderId = session.metadata.orderId;
      const userId = session.metadata.userId;

      const order = await Order.findById(orderId);

      if (order) {
        // Log transaction
        const payment = await Payment.create({
          orderId: order._id,
          userId: userId,
          gateway: 'Stripe',
          transactionId: session.payment_intent || session.id,
          amount: order.totalAmount,
          status: 'Captured',
        });

        // Complete order details
        order.paymentStatus = 'Completed';
        order.paymentId = payment._id;
        await order.save();
        
        console.log(`Payment captured via Stripe Webhook for Order: ${orderId}`);
      }
    } catch (error) {
      console.error(`Webhook processing database error: ${error.message}`);
    }
  }

  res.json({ received: true });
};
