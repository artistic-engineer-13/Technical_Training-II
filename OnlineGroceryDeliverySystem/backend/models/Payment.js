import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gateway: {
      type: String,
      enum: ['Razorpay', 'Stripe', 'COD'],
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values for COD payments
    },
    gatewayOrderId: {
      type: String, // Razorpay order id reference
    },
    gatewaySignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['Pending', 'Captured', 'Failed', 'Refunded'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', PaymentSchema);
