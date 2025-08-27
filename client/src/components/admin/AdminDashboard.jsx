import React, { useState, useContext, useEffect } from 'react';
import { GlobalState } from '../../Globalstate';
import JobFormModal from './JobFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function AdminDashboard() {
  const state = useContext(GlobalState);
  const [jobs] = state.JobAPI.jobs;
  const [loading] = state.JobAPI.loading;
  const { getJobs, deleteJob } = state.JobAPI;

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getJobs();
  }, []);

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (jobToDelete) {
      const result = await deleteJob(jobToDelete._id);
      if (result.success) {
        setMessage('✅ Job deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ Error deleting job: ${result.error}`);
        setTimeout(() => setMessage(''), 5000);
      }
    }
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const handleFormSuccess = (message) => {
    setMessage(message);
    setShowJobForm(false);
    setEditingJob(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const jobsArray = Array.isArray(jobs) ? jobs : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Manage job postings</p>
            </div>
            <button
              onClick={handleCreateJob}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              + Create New Job
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('❌') 
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobsArray.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobsArray.filter(job => job.status !== 'closed').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">🏢</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Companies
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {new Set(jobsArray.map(job => job.company)).size}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              All Job Postings
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your job postings below
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="text-lg text-gray-600">Loading jobs...</div>
            </div>
          ) : jobsArray.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first job posting.</p>
              <button
                onClick={handleCreateJob}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Job
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobsArray.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {job.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {job.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.company}</div>
                        <div className="text-sm text-gray-500">{job.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {job.jobType || 'Full-time'}
                        </span>
                        <div className="text-sm text-gray-900 mt-1">
                          {job.salary || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(job)}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobFormModal
          job={editingJob}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          job={jobToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setJobToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
