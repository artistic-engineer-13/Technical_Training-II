import Job from '../models/job.js';
import Company from '../models/company.js';
import SavedJob from '../models/savedJob.js';

// @desc    Get all jobs with search and filter parameters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const {
      search,
      minSalary,
      experienceLevel,
      jobType,
      workSetting,
      location,
      page = 1,
      limit = 6,
      sort = 'recent'
    } = req.query;

    const query = { status: 'active' };

    // Text search or keywords matching
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Salary filter (greater than or equal to minSalary)
    if (minSalary) {
      query.maxSalary = { $gte: Number(minSalary) };
    }

    // Experience Level filter
    if (experienceLevel) {
      const levels = experienceLevel.split(',');
      query.experienceLevel = { $in: levels };
    }

    // Job Type filter (Full-time, Part-time, etc.)
    if (jobType) {
      const types = jobType.split(',');
      query.jobType = { $in: types };
    }

    // Work Setting filter (Remote, Hybrid, etc.)
    if (workSetting) {
      const settings = workSetting.split(',');
      query.workSetting = { $in: settings };
    }

    // Sort order definition
    let sortObj = { createdAt: -1 };
    if (sort === 'salary_desc') {
      sortObj = { maxSalary: -1 };
    } else if (sort === 'salary_asc') {
      sortObj = { minSalary: 1 };
    } else if (sort === 'experience_asc') {
      sortObj = { minExperience: 1 };
    } else if (sort === 'experience_desc') {
      sortObj = { minExperience: -1 };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company')
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
      jobs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving jobs' });
  }
};

// @desc    Get job details by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving job details' });
  }
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      responsibilities,
      requirements,
      skills,
      salaryDisplay,
      minSalary,
      maxSalary,
      experienceLevel,
      minExperience,
      jobType,
      workSetting,
      location,
      benefits,
      deadline,
    } = req.body;

    const company = await Company.findOne({ recruiter: req.user._id });
    if (!company) {
      return res.status(400).json({
        message: 'Recruiter company profile is missing. Please create a company profile first.',
      });
    }

    const job = await Job.create({
      recruiter: req.user._id,
      company: company._id,
      title,
      description,
      responsibilities: responsibilities || [],
      requirements: requirements || [],
      skills: skills || [],
      salaryDisplay,
      minSalary: minSalary ? Number(minSalary) : 0,
      maxSalary: maxSalary ? Number(maxSalary) : 0,
      experienceLevel,
      minExperience: minExperience ? Number(minExperience) : 0,
      jobType,
      workSetting,
      location,
      benefits: benefits || [],
      deadline: deadline ? new Date(deadline) : null,
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating job posting' });
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter)
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorize: Only the creator of the job or admin can update
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('company');

    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating job posting' });
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorize: Only the recruiter who created it or admin can delete
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting job posting' });
  }
};

// @desc    Save a job
// @route   POST /api/jobs/:id/save
// @access  Private (Employee)
export const saveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const savedExists = await SavedJob.findOne({
      employee: req.user._id,
      job: jobId,
    });

    if (savedExists) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    await SavedJob.create({
      employee: req.user._id,
      job: jobId,
    });

    res.status(201).json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saving job' });
  }
};

// @desc    Unsave a job
// @route   DELETE /api/jobs/:id/unsave
// @access  Private (Employee)
export const unsaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const savedJob = await SavedJob.findOne({
      employee: req.user._id,
      job: jobId,
    });

    if (!savedJob) {
      return res.status(404).json({ message: 'Saved job record not found' });
    }

    await SavedJob.findByIdAndDelete(savedJob._id);
    res.json({ message: 'Job removed from saved list' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error unsaving job' });
  }
};

// @desc    Get all saved jobs for employee
// @route   GET /api/jobs/saved
// @access  Private (Employee)
export const getSavedJobs = async (req, res) => {
  try {
    const saved = await SavedJob.find({ employee: req.user._id }).populate({
      path: 'job',
      populate: { path: 'company' },
    });

    // Filter out potential deleted jobs
    const validSaved = saved.filter(item => item.job !== null);

    res.json(validSaved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching saved jobs' });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
      .populate('company')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving recruiter jobs' });
  }
};
