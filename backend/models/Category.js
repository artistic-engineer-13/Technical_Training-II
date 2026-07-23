import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, 'Please add a category image'],
    },
    icon: {
      type: String,
      default: 'RiShoppingBagLine',
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to slugify name
CategorySchema.pre('save', function () {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
});

export default mongoose.model('Category', CategorySchema);
