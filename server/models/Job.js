const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
    maxlength: [50, 'Company name cannot be more than 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify job type'],
    enum: {
      values: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      message: 'Please select a valid job type'
    },
    default: 'Full-time'
  },
  salary: {
    type: String,
    required: [true, 'Please add salary information'],
    trim: true,
    maxlength: [50, 'Salary cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a job description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each requirement cannot be more than 200 characters']
  }],
  benefits: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each benefit cannot be more than 200 characters']
  }],
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'closed'],
      message: 'Please select a valid status'
    },
    default: 'active'
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
jobSchema.index({ title: 'text', company: 'text', location: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

// Middleware to update the updatedAt field
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);