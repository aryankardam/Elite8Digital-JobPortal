import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import { GlobalState } from "../../Globalstate";

const JobCard = ({ job }) => {
  const state = useContext(GlobalState);
  const [jobs] = state.JobAPI.jobs;
  const [loading] = state.JobAPI.loading;

  // If no job prop is passed, we can't render anything meaningful
  if (!job) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      {/* Job Title */}
      <h3 className="text-xl font-semibold mb-2 text-gray-800">
        {job.title || job.jobTitle || "Job Title Not Available"}
      </h3>

      {/* Company */}
      <div className="flex items-center mb-2">
        <span className="text-sm font-medium text-gray-500 mr-2">Company:</span>
        <span className="text-gray-700">{job.company || "Not specified"}</span>
      </div>

      {/* Location */}
      <div className="flex items-center mb-2">
        <span className="text-sm font-medium text-gray-500 mr-2">Location:</span>
        <span className="text-gray-700">{job.location || "Not specified"}</span>
      </div>

      {/* Job Type */}
      <div className="flex items-center mb-2">
        <span className="text-sm font-medium text-gray-500 mr-2">Type:</span>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {job.jobType || job.type || "Full-time"}
        </span>
      </div>

      {/* Salary */}
      {job.salary && (
        <div className="flex items-center mb-3">
          <span className="text-sm font-medium text-gray-500 mr-2">Salary:</span>
          <span className="text-green-600 font-medium">{job.salary}</span>
        </div>
      )}

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {job.description || job.jobDescription || "No description available"}
      </p>

      {/* Requirements */}
      {job.requirements && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-500">Requirements:</span>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {Array.isArray(job.requirements)
              ? job.requirements.join(", ")
              : job.requirements}
          </p>
        </div>
      )}

      {/* Posted Date */}
      {job.createdAt && (
        <div className="text-xs text-gray-400 mb-4">
          Posted: {new Date(job.createdAt).toLocaleDateString()}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Link
          to={`/job/${job._id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View Details
        </Link>

        <Link
          to={`/apply/${job._id}`}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Apply Now
        </Link>
      </div>

      {/* Debug info - remove after testing */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
          <strong>Debug:</strong> Total jobs in state:{" "}
          {Array.isArray(jobs) ? jobs.length : "Not array"}
          <br />
          <strong>Loading:</strong> {loading.toString()}
          <br />
          <strong>Job ID:</strong> {job._id || job.id || "No ID"}
        </div>
      )}
    </div>
  );
};

export default JobCard;
