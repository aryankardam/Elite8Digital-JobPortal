import React from 'react'
import { useState, useEffect, useRef } from 'react'
import axios from './utils/AxiosInstance'

const JobAPI = () => {
  const [jobs, setJobs] = useState([]);
  const [callback, setCallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasInitialized = useRef(false);
  const lastFetchTime = useRef(0);
  const FETCH_COOLDOWN = 5000; // 5 seconds between requests

  console.log('JobAPI - Hook initialized with jobs:', jobs);

  // Fetch jobs from backend
  const getJobs = async (force = false) => {
    const now = Date.now();
    
    // Prevent rapid successive calls
    if (!force && (now - lastFetchTime.current) < FETCH_COOLDOWN) {
      console.log('JobAPI - Request blocked: Too soon since last request');
      return;
    }

    // Prevent multiple simultaneous calls
    if (loading && !force) {
      console.log('JobAPI - Request blocked: Already loading');
      return;
    }

    try {
      console.log('JobAPI - Starting API call...');
      setLoading(true);
      lastFetchTime.current = now;
      
      const res = await axios.get("/api/jobs");
      console.log('JobAPI - API Response:', res);
      console.log('JobAPI - Response data:', res.data);
      
      const jobsData = res.data.jobs || res.data.data || res.data;
      console.log('JobAPI - Extracted jobs data:', jobsData);
      
      setJobs(jobsData);
      setLoading(false);
      console.log('JobAPI - Jobs set, loading false');
    } catch (err) {
      console.error("JobAPI - Error fetching jobs:", err.message);
      setJobs([]);
      setLoading(false);
    }
  };

  // Create new job
  const createJob = async (jobData) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/jobs", jobData);
      setLoading(false);
      // Delayed refresh to avoid rate limits
      setTimeout(() => getJobs(true), 1000);
      return { success: true, data: res.data };
    } catch (err) {
      console.error("JobAPI - Error creating job:", err);
      setLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message 
      };
    }
  };

  // Update job
  const updateJob = async (id, jobData) => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/jobs/${id}`, jobData);
      setLoading(false);
      setTimeout(() => getJobs(true), 1000);
      return { success: true, data: res.data };
    } catch (err) {
      console.error("JobAPI - Error updating job:", err);
      setLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message 
      };
    }
  };

  // Delete job
  const deleteJob = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/jobs/${id}`);
      setLoading(false);
      setTimeout(() => getJobs(true), 1000);
      return { success: true };
    } catch (err) {
      console.error("JobAPI - Error deleting job:", err);
      setLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message 
      };
    }
  };

  // Load jobs whenever callback changes
  useEffect(() => {
    console.log('JobAPI - useEffect triggered with callback:', callback);
    getJobs();
  }, [callback]);

  // Only initialize once
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('JobAPI - First initialization');
      hasInitialized.current = true;
      // Delay initial call to prevent conflicts
      setTimeout(() => getJobs(true), 1000);
    }
  }, []); // Empty dependency - runs only once

  console.log('JobAPI - Returning state:', { jobs, loading });

  return {
    jobs: [jobs, setJobs],
    callback: [callback, setCallback],
    loading: [loading, setLoading],
    getJobs: () => getJobs(true),
    createJob,
    updateJob,
    deleteJob,
    refreshJobs: () => getJobs(true),
  };
}

export default JobAPI