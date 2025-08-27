const express = require('express');
const { body } = require('express-validator');
const {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  getAllApplications,
  getJobApplications,
  updateApplicationStatus,
  getDashboardStats
} = require('../controllers/adminController');
const { adminAuth, rateLimiter } = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to all admin routes
router.use(rateLimiter(15 * 60 * 1000, 200)); // 200 requests per 15 minutes

// Note: For production, uncomment the line below to require authentication
// router.use(adminAuth);

// Job validation middleware
const jobValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters'),
  
  body('company')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Company name must be between 2 and 50 characters'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('type')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
    .withMessage('Job type must be Full-time, Part-time, Contract, or Internship'),
  
  body('salary')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Salary information is required and cannot exceed 50 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Job description must be between 10 and 2000 characters'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('requirements.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each requirement cannot exceed 200 characters'),
  
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  
  body('benefits.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each benefit cannot exceed 200 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'closed'])
    .withMessage('Status must be active, inactive, or closed')
];

// Dashboard and Statistics Routes
// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', getDashboardStats);

// Job Management Routes
// @route   GET /api/admin/jobs
// @desc    Get all jobs (including inactive) with filters
// @access  Private (Admin)
router.get('/jobs', getAllJobs);

// @route   POST /api/admin/jobs
// @desc    Create a new job posting
// @access  Private (Admin)
router.post('/jobs', jobValidation, createJob);

// @route   PUT /api/admin/jobs/:id
// @desc    Update an existing job posting
// @access  Private (Admin)
router.put('/jobs/:id', jobValidation, updateJob);

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete a job posting and its applications
// @access  Private (Admin)
router.delete('/jobs/:id', deleteJob);

// Application Management Routes
// @route   GET /api/admin/applications
// @desc    Get all applications with filters
// @access  Private (Admin)
router.get('/applications', getAllApplications);

// @route   GET /api/admin/jobs/:id/applications
// @desc    Get applications for a specific job
// @access  Private (Admin)
router.get('/jobs/:id/applications', getJobApplications);

// @route   PUT /api/admin/applications/:id
// @desc    Update application status
// @access  Private (Admin)
router.put('/applications/:id', [
  body('status')
    .isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'])
    .withMessage('Status must be pending, reviewed, shortlisted, rejected, or hired')
], updateApplicationStatus);

module.exports = router;