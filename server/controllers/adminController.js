const Job = require('../models/Job');
const Application = require('../models/Application');
const { validationResult } = require('express-validator');

// @desc    Get all jobs (including inactive) - Admin only
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAllJobs = async (req, res) => {
  try {
    const {
      search,
      status,
      type,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    let query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Add filters
    if (status) query.status = status;
    if (type) query.type = type;

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
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
};

// @desc    Create new job - Admin only
// @route   POST /api/admin/jobs
// @access  Private (Admin)
const createJob = async (req, res) => {
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

    const job = await Job.create(req.body);

    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    io.emit('jobCreated', job);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job'
    });
  }
};

// @desc    Update job - Admin only
// @route   PUT /api/admin/jobs/:id
// @access  Private (Admin)
const updateJob = async (req, res) => {
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

    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );

    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    io.emit('jobUpdated', job);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });

  } catch (error) {
    console.error('Update job error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating job'
    });
  }
};

// @desc    Delete job - Admin only
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    io.emit('jobDeleted', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job and associated applications deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting job'
    });
  }
};

// @desc    Get all applications - Admin only
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getAllApplications = async (req, res) => {
  try {
    const {
      jobId,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'appliedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    let query = {};

    if (jobId) query.jobId = jobId;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { applicantName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with population, pagination and sorting
    const applications = await Application.find(query)
      .populate('jobId', 'title company location type salary')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Get total count for pagination
    const totalApplications = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      totalApplications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalApplications / limit),
      data: applications
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

// @desc    Get applications for specific job - Admin only
// @route   GET /api/admin/jobs/:id/applications
// @access  Private (Admin)
const getJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Verify job exists
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Build query
    let query = { jobId: req.params.id };
    if (status) query.status = status;

    // Get applications
    const applications = await Application.find(query)
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const totalApplications = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      totalApplications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalApplications / limit),
      job: {
        id: job._id,
        title: job.title,
        company: job.company
      },
      data: applications
    });

  } catch (error) {
    console.error('Get job applications error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

// @desc    Update application status - Admin only
// @route   PUT /api/admin/applications/:id
// @access  Private (Admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('jobId', 'title company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Update application status error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating application status'
    });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Job statistics
    const jobStats = await Job.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          totalApplications: { $sum: '$applicationCount' }
        }
      }
    ]);

    // Application statistics by status
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = await Application.countDocuments({
      appliedAt: { $gte: thirtyDaysAgo }
    });

    // Job types distribution
    const jobTypeStats = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top companies by job count
    const topCompanies = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$company',
          jobCount: { $sum: 1 },
          applicationCount: { $sum: '$applicationCount' }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: jobStats[0] || {
          totalJobs: 0,
          activeJobs: 0,
          inactiveJobs: 0,
          totalApplications: 0
        },
        applicationsByStatus: applicationStats,
        recentApplications,
        jobTypes: jobTypeStats,
        topCompanies
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

module.exports = {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  getAllApplications,
  getJobApplications,
  updateApplicationStatus,
  getDashboardStats
};