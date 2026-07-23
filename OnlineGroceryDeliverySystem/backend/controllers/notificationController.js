import Notification from '../models/Notification.js';
import ErrorResponse from '../utils/ErrorHandler.js';

// @desc      Get all notifications for logged-in user
// @route     GET /api/notifications
// @access    Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Cap at latest 50 notifications

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Mark a single notification as read
// @route     PUT /api/notifications/:id/read
// @access    Private
export const markNotificationRead = async (req, res, next) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
    }

    // Verify ownership
    if (notification.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this notification', 401));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Mark all user notifications as read
// @route     PUT /api/notifications/read-all
// @access    Private
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
