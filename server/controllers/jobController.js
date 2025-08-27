const Job = require('../models/Job');
const Application = require('../models/Application');
const { validationResult } = require('express-validator');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const {
      search,
      type,
      location,
      company,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    let query = { status: 'active' };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add filters
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (company) query.company = { $regex: company, $options: 'i' };

    // Execute query with pagination and sorting
    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalJobs / limit),
      data: jobs
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).select('-__v');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only return active jobs to public
    if (job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not available'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get job error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching job'
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Public
const applyForJob = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Job is not accepting applications'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId: req.params.id,
      email: req.body.email
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await Application.create({
      jobId: req.params.id,
      ...req.body
    });

    // Update job application count
    await Job.findByIdAndUpdate(req.params.id, {
      $inc: { applicationCount: 1 }
    });

    // Populate job details for response
    await application.populate('jobId', 'title company');

    // Emit socket event for real-time updates (admin notification)
    const io = req.app.get('socketio');
    io.emit('newApplication', {
      application,
      jobTitle: job.title,
      company: job.company
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });

  } catch (error) {
    console.error('Apply for job error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Public
const getJobStats = async (req, res) => {
  try {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalApplications: { $sum: '$applicationCount' }
        }
      }
    ]);

    const typeStats = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || { totalJobs: 0, activeJobs: 0, totalApplications: 0 },
        jobTypes: typeStats
      }
    });

  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Error in getJobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error in getJobById:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create job
const createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error in createJob:', error);
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error in updateJob:', error);
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteJob:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Apply to job - NEW FUNCTION
const applyToJob = async (req, res) => {
  try {
    console.log('Apply to job - Job ID:', req.params.id);
    console.log('Apply to job - Request body:', req.body);

    const { applicantName, email, phone, resume, coverLetter } = req.body;
    const jobId = req.params.id;

    // Validate required fields
    if (!applicantName || !email || !phone || !resume || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId: jobId,
      email: email
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create new application
    const applicationData = {
      jobId: jobId,
      jobTitle: job.title,
      company: job.company,
      applicantName: applicantName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      resume: resume.trim(),
      coverLetter: coverLetter.trim(),
      status: 'pending'
    };

    console.log('Creating application with data:', applicationData);

    const application = await Application.create(applicationData);

    console.log('Application created successfully:', application);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        jobTitle: job.title,
        company: job.company,
        status: application.status,
        appliedAt: application.createdAt
      }
    });

  } catch (error) {
    console.error('Error in applyToJob:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getJobs,
  getJob,
  applyForJob,
  getJobStats,
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob
};
