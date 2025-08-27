import { useContext, useEffect } from 'react';
import { GlobalState } from '../../Globalstate';
import JobCard from './JobCard';

export default function JobList() {
  const state = useContext(GlobalState);
  const [jobs] = state.JobAPI.jobs;
  const [loading] = state.JobAPI.loading;
  const { getJobs } = state.JobAPI;

  useEffect(() => {
    getJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading jobs...</div>
      </div>
    );
  }

  const jobsArray = Array.isArray(jobs) ? jobs : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Available Jobs</h1>

      <div className="text-center mb-6">
        <span className="text-gray-600">
          {jobsArray.length > 0
            ? `${jobsArray.length} job${jobsArray.length > 1 ? 's' : ''} found`
            : 'No jobs available'}
        </span>
      </div>

      {jobsArray.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-xl mb-2">No jobs available at the moment.</p>
          <p className="text-gray-500">Check back later for new opportunities!</p>
          <button
            onClick={getJobs}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobsArray.map((job) => (
            <JobCard key={job._id || job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
