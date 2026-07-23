import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add an address label (e.g., Home, Work)'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a contact phone number'],
      trim: true,
    },
    streetAddress: {
      type: String,
      required: [true, 'Please add a street address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please add a state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please add a pincode'],
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// If user marks an address as default, unset other default addresses for that user
AddressSchema.pre('save', async function () {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});

export default mongoose.model('Address', AddressSchema);
