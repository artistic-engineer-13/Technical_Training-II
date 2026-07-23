import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [OrderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Razorpay', 'Stripe'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['Received', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Received',
      index: true,
    },
    couponCode: {
      type: String,
      uppercase: true,
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    deliveryOTP: {
      type: String,
    },
    timeline: {
      receivedAt: {
        type: Date,
        default: Date.now,
      },
      processingAt: Date,
      dispatchedAt: Date,
      outForDeliveryAt: Date,
      deliveredAt: Date,
      cancelledAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-update hooks or methods if needed can be added here
export default mongoose.model('Order', OrderSchema);
