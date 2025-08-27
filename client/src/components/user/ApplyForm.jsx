import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GlobalState } from '../../Globalstate';
import axios from '../../utils/AxiosInstance';

const ApplyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useContext(GlobalState);
  const [jobs] = state.JobAPI.jobs;
  const [loading] = state.JobAPI.loading;
  const { getJobs } = state.JobAPI;
  
  const [job, setJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    resume: '',
    coverLetter: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      getJobs();
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(jobs) && jobs.length > 0 && id) {
      const foundJob = jobs.find(job => job._id === id || job.id === id);
      setJob(foundJob || null);
    }
  }, [jobs, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    if (!formData.resume.trim()) {
      newErrors.resume = 'Resume link is required';
    } else if (!formData.resume.startsWith('http')) {
      newErrors.resume = 'Resume must be a valid URL';
    }
    
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const applicationData = {
        applicantName: formData.applicantName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        resume: formData.resume.trim(),
        coverLetter: formData.coverLetter.trim()
      };
      
      console.log('Submitting application:', applicationData);
      
      const response = await axios.post(`/api/jobs/${id}/apply`, applicationData);
      
      console.log('Application submitted successfully:', response.data);
      setSubmitMessage(`✅ ${response.data.message}`);
      
      // Clear form on success
      setFormData({
        applicantName: '',
        email: '',
        phone: '',
        resume: '',
        coverLetter: ''
      });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Handle specific error types
      if (error.response?.status === 429) {
        setSubmitMessage('❌ Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status === 404) {
        setSubmitMessage('❌ Job not found. This position may have been removed.');
      } else if (error.response?.status === 400) {
        setSubmitMessage(`❌ ${error.response.data.message || 'Please check your form data.'}`);
      } else if (error.response?.status === 500) {
        setSubmitMessage('❌ Server error. Please try again later.');
      } else {
        setSubmitMessage('❌ Error submitting application. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-6">The job you're trying to apply for doesn't exist.</p>
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to={`/job/${id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          ← Back to Job Details
        </Link>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Apply for Position</h1>
          <h2 className="text-xl text-blue-600 mb-2">{job.title || 'Job Title'}</h2>
          <p className="text-gray-600">{job.company || 'Company'} • {job.location || 'Location'}</p>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6">Application Details</h3>
        
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-md ${
            submitMessage.includes('❌') 
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="applicantName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="applicantName"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.applicantName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.applicantName && (
              <p className="mt-1 text-sm text-red-600">{errors.applicantName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+919876543210"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Resume */}
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
              Resume Link *
            </label>
            <input
              type="url"
              id="resume"
              name="resume"
              value={formData.resume}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.resume ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://drive.google.com/file/d/your-resume"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload your resume to Google Drive, Dropbox, or similar and paste the link here
            </p>
            {errors.resume && (
              <p className="mt-1 text-sm text-red-600">{errors.resume}</p>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter *
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.coverLetter ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Write a brief cover letter explaining why you're interested in this position..."
            />
            {errors.coverLetter && (
              <p className="mt-1 text-sm text-red-600">{errors.coverLetter}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
            
            <Link
              to={`/job/${id}`}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyForm;
