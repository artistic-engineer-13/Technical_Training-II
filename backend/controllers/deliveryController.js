import Order from '../models/Order.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import ErrorResponse from '../utils/ErrorHandler.js';

// @desc      Get assigned orders for logged-in delivery partner
// @route     GET /api/delivery/orders
// @access    Private/DeliveryPartner
export const getAssignedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      deliveryPartnerId: req.user.id,
      orderStatus: { $in: ['Processing', 'Dispatched', 'Out for Delivery'] },
    }).populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Update delivery transition status (Dispatched / Out for Delivery)
// @route     PUT /api/delivery/orders/:id/status
// @access    Private/DeliveryPartner
export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Dispatched' or 'Out for Delivery'

    if (!['Dispatched', 'Out for Delivery'].includes(status)) {
      return next(new ErrorResponse('Invalid status transition. For "Delivered", use the OTP verification endpoint.', 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Verify assignment
    if (order.deliveryPartnerId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this delivery', 401));
    }

    order.orderStatus = status;
    
    if (status === 'Dispatched') {
      order.timeline.dispatchedAt = Date.now();
    } else if (status === 'Out for Delivery') {
      order.timeline.outForDeliveryAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Verify Customer OTP and mark order as Delivered
// @route     POST /api/delivery/orders/:id/verify-otp
// @access    Private/DeliveryPartner
export const verifyDeliveryOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return next(new ErrorResponse('Please provide the verification OTP', 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Verify assignment
    if (order.deliveryPartnerId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to complete this delivery', 401));
    }

    // Verify OTP
    if (order.deliveryOTP !== otp) {
      return next(new ErrorResponse('Invalid verification OTP. Delivery completion failed.', 400));
    }

    order.orderStatus = 'Delivered';
    order.timeline.deliveredAt = Date.now();
    
    // If it was Cash On Delivery, capture payment on delivery completion
    if (order.paymentMethod === 'COD') {
      order.paymentStatus = 'Completed';
    }

    await order.save();

    // Release delivery partner state back to available
    await DeliveryPartner.findOneAndUpdate(
      { userId: req.user.id },
      { isAvailable: true, activeOrderId: null }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified! Order successfully marked as Delivered.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Update delivery partner live GPS location coordinates
// @route     PUT /api/delivery/location
// @access    Private/DeliveryPartner
export const updatePartnerLocation = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.body;

    if (longitude === undefined || latitude === undefined) {
      return next(new ErrorResponse('Please provide both longitude and latitude coordinates', 400));
    }

    // Update partner coordinates in DeliveryPartner profile
    const partner = await DeliveryPartner.findOneAndUpdate(
      { userId: req.user.id },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
      },
      { new: true }
    );

    if (!partner) {
      return next(new ErrorResponse('Delivery partner profile not initialized', 404));
    }

    res.status(200).json({
      success: true,
      message: 'GPS location coordinates updated successfully',
      data: {
        longitude,
        latitude,
      },
    });
  } catch (error) {
    next(error);
  }
};
