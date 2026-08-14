import express from 'express';
import { getNotifications, readNotifications } from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read', protect, readNotifications);

export default router;
