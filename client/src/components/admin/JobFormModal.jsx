import React, { useState, useContext, useEffect } from 'react';
import { GlobalState } from '../../Globalstate';

export default function JobFormModal({ job, onClose, onSuccess }) {
  const state = useContext(GlobalState);
  const { createJob, updateJob } = state.JobAPI;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    skills: '',
    experience: ''
  });

  const isEdit = !!job;

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        jobType: job.jobType || 'Full-time',
        salary: job.salary || '',
        description: job.description || '',
        requirements: Array.isArray(job.requirements) 
          ? job.requirements.join('\n') 
          : job.requirements || '',
        skills: Array.isArray(job.skills) 
          ? job.skills.join(', ') 
          : job.skills || '',
        experience: job.experience || ''
      });
    }
  }, [job]);

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
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements 
          ? formData.requirements.split('\n').map(req => req.trim()).filter(req => req)
          : [],
        skills: formData.skills 
          ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
          : []
      };

      let result;
      if (isEdit) {
        result = await updateJob(job._id, jobData);
      } else {
        result = await createJob(jobData);
      }

      if (result.success) {
        onSuccess(`✅ Job ${isEdit ? 'updated' : 'created'} successfully!`);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-8 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b">
          <h3 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Job' : 'Create New Job'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g. Frontend Developer"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.company ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g. Tech Corp"
              />
              {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g. New York, NY"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. $80,000 - $100,000"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Required
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 2-3 years"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the job responsibilities and what you're looking for..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter each requirement on a new line..."
            />
            <p className="mt-1 text-sm text-gray-500">Enter each requirement on a new line</p>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. React, JavaScript, Node.js (comma separated)"
            />
            <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}