import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import EmployeeProfile from '../models/employeeProfile.js';
import { generateDocxResume } from '../services/docxGenerator.js';
import { generatePdfResume } from '../services/pdfGenerator.js';

const router = express.Router();

// Helper to check profile completion
const verifyCompletion = (profile) => {
  return profile && profile.profileCompletion >= 100;
};

// @desc    Download own resume as PDF or DOCX
// @route   GET /api/resume/download/:templateId/:format
// @access  Private (Employee)
router.get('/download/:templateId/:format', protect, authorize('employee'), async (req, res) => {
  const { templateId, format } = req.params;

  try {
    const profile = await EmployeeProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please onboarding first.' });
    }

    if (!verifyCompletion(profile)) {
      return res.status(400).json({
        message: `Profile is only ${profile.profileCompletion}%. Complete it to 100% to generate your resume.`,
      });
    }

    if (format === 'docx') {
      const buffer = await generateDocxResume(profile, templateId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=cnear_resume_${templateId}.docx`);
      return res.send(buffer);
    } else if (format === 'pdf') {
      const buffer = await generatePdfResume(profile, templateId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=cnear_resume_${templateId}.pdf`);
      return res.send(buffer);
    } else {
      return res.status(400).json({ message: 'Invalid format. Use pdf or docx' });
    }
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ message: `Error generating document: ${error.message}` });
  }
});

// @desc    Download applicant resume as PDF or DOCX (For Recruiters and Admins)
// @route   GET /api/resume/download/employee/:employeeId/:templateId/:format
// @access  Private (Recruiter/Admin)
router.get('/download/employee/:employeeId/:templateId/:format', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const { employeeId, templateId, format } = req.params;

  try {
    const profile = await EmployeeProfile.findOne({ user: employeeId });

    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    if (format === 'docx') {
      const buffer = await generateDocxResume(profile, templateId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=candidate_${employeeId}_resume_${templateId}.docx`);
      return res.send(buffer);
    } else if (format === 'pdf') {
      const buffer = await generatePdfResume(profile, templateId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=candidate_${employeeId}_resume_${templateId}.pdf`);
      return res.send(buffer);
    } else {
      return res.status(400).json({ message: 'Invalid format. Use pdf or docx' });
    }
  } catch (error) {
    console.error('Error generating candidate document:', error);
    res.status(500).json({ message: `Error generating candidate document: ${error.message}` });
  }
});

export default router;
