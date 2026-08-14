import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAndParseResume,
  getCompany,
  updateCompany
} from '../controllers/profileController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Employee Profile Routes
router.get('/', protect, authorize('employee', 'admin'), getProfile);
router.put('/', protect, authorize('employee', 'admin'), updateProfile);
router.post('/upload-resume', protect, authorize('employee', 'admin'), upload.single('resume'), uploadAndParseResume);

// Recruiter Profile (Company) Routes
router.get('/recruiter/company', protect, authorize('recruiter', 'admin'), getCompany);
router.put('/recruiter/company', protect, authorize('recruiter', 'admin'), updateCompany);

export default router;
