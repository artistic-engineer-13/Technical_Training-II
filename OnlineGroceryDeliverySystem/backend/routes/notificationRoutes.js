import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all routes under /api/notifications

router.route('/')
  .get(getNotifications);

router.route('/read-all')
  .put(markAllNotificationsRead);

router.route('/:id/read')
  .put(markNotificationRead);

export default router;
