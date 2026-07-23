import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0],
  },
});

const DeliveryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Please add a vehicle number'],
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['Bicycle', 'Bike', 'Scooter'],
      required: [true, 'Please select a vehicle type'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      type: PointSchema,
      index: '2dsphere', // Allows location-based proximity queries
    },
    activeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
