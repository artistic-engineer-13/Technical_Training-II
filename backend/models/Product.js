import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Please add a unit size/weight (e.g., 1kg, 500ml, 1 pc)'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    images: {
      type: [String],
      required: [true, 'Please add at least one product image'],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    mrp: {
      type: Number,
    },
    weight: {
      type: String,
    },
    deliveryTime: {
      type: String,
      default: '10 mins',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search functionality
ProductSchema.index(
  { name: 'text', description: 'text', brand: 'text' },
  { weights: { name: 10, brand: 5, description: 1 } }
);

// Pre-save slugification of product name
ProductSchema.pre('save', function () {
  if (this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  if (!this.mrp) {
    this.mrp = this.price;
  }
});

export default mongoose.model('Product', ProductSchema);
