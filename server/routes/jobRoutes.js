const express = require('express');
const { body } = require('express-validator');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobStats
} = require('../controllers/jobController');
const { rateLimiter } = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to all job routes
router.use(rateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// @route   GET /api/jobs
// @desc    Get all active jobs with search and filter
// @access  Public
router.get('/', getJobs);

// @route   GET /api/jobs/stats
// @desc    Get job statistics
// @access  Public
router.get('/stats', getJobStats);

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', getJobById);

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Public
router.post('/', createJob);

// @route   PUT /api/jobs/:id
// @desc    Update an existing job
// @access  Public
router.put('/:id', updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Public
router.delete('/:id', deleteJob);

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a specific job
// @access  Public
router.post('/:id/apply', [
  // Apply stricter rate limiting for applications
  rateLimiter(60 * 60 * 1000, 5), // 5 applications per hour
  
  // Validation middleware
  body('applicantName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('resume')
    .trim()
    .isURL()
    .withMessage('Please provide a valid URL for your resume'),
  
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Cover letter cannot exceed 1000 characters')
], applyToJob);

module.exports = router;