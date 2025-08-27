import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GlobalState } from '../../Globalstate';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useContext(GlobalState);
  const [jobs] = state.JobAPI.jobs;
  const [loading] = state.JobAPI.loading;
  const { getJobs } = state.JobAPI;
  
  const [job, setJob] = useState(null);

  useEffect(() => {
    // If jobs not loaded, fetch them
    if (!Array.isArray(jobs) || jobs.length === 0) {
      console.log('JobDetail - No jobs in state, fetching...');
      getJobs();
    }
  }, []);

  useEffect(() => {
    // Find the specific job when jobs are loaded
    if (Array.isArray(jobs) && jobs.length > 0 && id) {
      console.log('JobDetail - Looking for job with id:', id);
      console.log('JobDetail - Available jobs:', jobs);
      
      const foundJob = jobs.find(job => job._id === id || job.id === id);
      console.log('JobDetail - Found job:', foundJob);
      setJob(foundJob || null);
    }
  }, [jobs, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
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
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Jobs
        </button>
      </div>

      {/* Job Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {job.title || job.jobTitle || 'Job Title'}
            </h1>
            <h2 className="text-xl text-gray-600 mb-4">
              {job.company || 'Company Name'}
            </h2>
          </div>
          <div className="text-right">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
              {job.jobType || job.type || 'Full-time'}
            </span>
            {job.salary && (
              <div className="text-green-600 font-bold text-lg">
                {job.salary}
              </div>
            )}
          </div>
        </div>

        {/* Job Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-medium text-gray-500">Location:</span>
            <p className="text-gray-800">{job.location || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Experience:</span>
            <p className="text-gray-800">{job.experience || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Posted:</span>
            <p className="text-gray-800">
              {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>

        {/* Apply Button */}
        <div className="text-center">
          <Link 
            to={`/apply/${job._id || job.id}`}
            className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors text-lg font-medium"
          >
            Apply for this Job
          </Link>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h3 className="text-2xl font-bold mb-4">Job Description</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {job.description || job.jobDescription || 'No description available.'}
          </p>
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold mb-4">Requirements</h3>
          <div className="text-gray-700">
            {Array.isArray(job.requirements) ? (
              <ul className="list-disc list-inside space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            ) : (
              <p className="whitespace-pre-line">{job.requirements}</p>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      {job.skills && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold mb-4">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(job.skills) ? (
              job.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {job.skills}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <strong>Debug Info:</strong>
        <br />
        Job ID from URL: {id}
        <br />
        Jobs in state: {Array.isArray(jobs) ? jobs.length : 'Not array'}
        <br />
        Current job found: {job ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

export default JobDetail;
