import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Static method to get avg rating and update product
ReviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { productId: productId },
    },
    {
      $group: {
        _id: '$productId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        ratingsAverage: obj[0].avgRating,
        ratingsQuantity: obj[0].nRating,
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        ratingsAverage: 0,
        ratingsQuantity: 0,
      });
    }
  } catch (err) {
    console.error(`Error in calculating average ratings: ${err.message}`);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.productId);
});

// Call getAverageRating after delete/remove
ReviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.productId);
});

export default mongoose.model('Review', ReviewSchema);
