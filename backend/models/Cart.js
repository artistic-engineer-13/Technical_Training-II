import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
    totalQuantity: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save schema hook to calculate quantities and totals
CartSchema.pre('save', function () {
  this.totalQuantity = this.items.reduce((total, item) => total + item.quantity, 0);
  this.subtotal = this.items.reduce((total, item) => total + item.quantity * item.price, 0);
});

export default mongoose.model('Cart', CartSchema);
