import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/authController.js';

import {
  validateRegister,
  validateLogin,
  validateAddress,
} from '../validators/schemas.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes (Requires login)
router.get('/logout', protect, logoutUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Address Management
router.route('/addresses')
  .get(protect, getAddresses)
  .post(protect, validateAddress, addAddress);

router.route('/addresses/:id')
  .put(protect, validateAddress, updateAddress)
  .delete(protect, deleteAddress);

export default router;
