import express from 'express';
import {
  getAdminStats,
  getUsers,
  deleteUser,
  toggleSuspendUser,
  getAdminJobs,
  getAdminApplications
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enforce admin validation on all routes in this router
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/suspend', toggleSuspendUser);
router.get('/jobs', getAdminJobs);
router.get('/applications', getAdminApplications);

export default router;
