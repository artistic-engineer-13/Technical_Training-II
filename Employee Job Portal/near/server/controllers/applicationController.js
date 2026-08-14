import Application from '../models/application.js';
import Job from '../models/job.js';
import EmployeeProfile from '../models/employeeProfile.js';
import Notification from '../models/notification.js';

// @desc    Apply to a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Employee)
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resumeType, resumeTemplate } = req.body;

    const job = await Job.findById(jobId).populate('company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status === 'closed') {
      return res.status(400).json({ message: 'This job posting has been closed' });
    }

    // Verify profile is 100% complete
    const profile = await EmployeeProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({ message: 'Please set up your profile first.' });
    }

    if (profile.profileCompletion < 100) {
      return res.status(400).json({
        message: `Your profile is only ${profile.profileCompletion}% complete. Complete it to 100% to unlock applications.`,
      });
    }

    // Duplicate check
    const alreadyApplied = await Application.findOne({
      job: jobId,
      employee: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create Application
    const application = await Application.create({
      job: jobId,
      employee: req.user._id,
      coverLetter: coverLetter || '',
      resumeType: resumeType || 'generated',
      resumeTemplate: resumeTemplate || 'classic',
      statusTimeline: [
        {
          status: 'Applied',
          comment: 'Application submitted successfully.',
        },
      ],
    });

    // Notify Recruiter
    await Notification.create({
      recipient: job.recruiter,
      sender: req.user._id,
      title: 'New Applicant',
      message: `${req.user.name} applied for "${job.title}".`,
      link: `/recruiter/jobs/${jobId}/applicants`,
    });

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing job application' });
  }
};

// @desc    Get employee's job applications
// @route   GET /api/applications/my-applications
// @access  Private (Employee)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ employee: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'company' },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching your applications' });
  }
};

// @desc    Get applicants for a job posting
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter)
export const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure logged-in recruiter owns the job
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view applicant list' });
    }

    const applicants = await Application.find({ job: jobId })
      .populate('employee')
      .sort({ createdAt: -1 });

    // Inject profile info for ease of display on frontend
    const resolvedApplicants = await Promise.all(
      applicants.map(async (app) => {
        const profile = await EmployeeProfile.findOne({ user: app.employee._id });
        return {
          ...app.toObject(),
          employeeProfile: profile,
        };
      })
    );

    res.json(resolvedApplicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching applicants' });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application record not found' });
    }

    // Verify recruiter owns job posting
    const job = application.job;
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update applicant status' });
    }

    // Update status and append timeline history
    application.status = status;
    application.statusTimeline.push({
      status,
      comment: comment || `Status updated to ${status}.`,
    });

    await application.save();

    // Notify employee of status update
    await Notification.create({
      recipient: application.employee,
      sender: req.user._id,
      title: 'Application Status Update',
      message: `Your application for "${job.title}" has been updated to "${status}".`,
      link: '/employee/applications',
    });

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating application status' });
  }
};

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const readNotifications = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating notification status' });
  }
};
