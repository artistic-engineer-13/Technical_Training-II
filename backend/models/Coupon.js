import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['Percentage', 'FixedAmount'],
      required: [true, 'Please add a discount type'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Please add a discount value'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add an expiry date'],
    },
    usageLimit: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate if coupon is active and usable
CouponSchema.methods.isValid = function (orderAmount) {
  const isExpired = new Date() > this.expiryDate;
  const isLimitReached = this.usedCount >= this.usageLimit;
  const isBelowMinVal = orderAmount < this.minOrderValue;

  return this.isActive && !isExpired && !isLimitReached && !isBelowMinVal;
};

export default mongoose.model('Coupon', CouponSchema);
