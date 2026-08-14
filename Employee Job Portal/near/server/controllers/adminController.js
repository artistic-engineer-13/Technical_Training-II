import User from '../models/user.js';
import Job from '../models/job.js';
import Application from '../models/application.js';
import EmployeeProfile from '../models/employeeProfile.js';
import Company from '../models/company.js';

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const employeeCount = await User.countDocuments({ role: 'employee' });
    const recruiterCount = await User.countDocuments({ role: 'recruiter' });
    
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalJobs = await Job.countDocuments();
    
    const totalApplications = await Application.countDocuments();
    
    const recentApplications = await Application.find()
      .populate('employee', 'name email')
      .populate({
        path: 'job',
        select: 'title',
        populate: { path: 'company', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: {
        total: totalUsers,
        employees: employeeCount,
        recruiters: recruiterCount
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        closed: totalJobs - activeJobs
      },
      applications: {
        total: totalApplications
      },
      recentApplications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving admin statistics' });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @desc    Suspend/delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete/suspend admin account' });
    }

    // Delete profile data associated with user
    if (user.role === 'employee') {
      await EmployeeProfile.deleteOne({ user: user._id });
      await Application.deleteMany({ employee: user._id });
    } else if (user.role === 'recruiter') {
      const company = await Company.findOne({ recruiter: user._id });
      if (company) {
        await Job.deleteMany({ company: company._id });
        await Company.deleteOne({ _id: company._id });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: `User ${user.name} and associated profiles/jobs deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// @desc    Suspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
export const toggleSuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend admin account' });
    }

    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    await user.save();

    res.json({ message: `User status changed to ${user.status}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private (Admin)
export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('company').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving jobs list' });
  }
};

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private (Admin)
export const getAdminApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('employee', 'name email')
      .populate({
        path: 'job',
        populate: { path: 'company' }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving applications list' });
  }
};
