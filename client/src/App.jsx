import { Routes, Route } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import NavBar from './components/common/NavBar';
import JobList from './components/user/JobList';
import JobDetail from './components/user/JobDetail';
import ApplyForm from './components/user/ApplyForm';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard'; // Updated import
import { GlobalState } from './Globalstate';

function App() {
  const state = useContext(GlobalState);
  const [jobs] = state.JobAPI.jobs;
  const [loading] = state.JobAPI.loading;
  const { getJobs } = state.JobAPI;

  useEffect(() => {
    console.log('App - Testing /api/jobs endpoint...');
    getJobs();
  }, []);

  useEffect(() => {
    if (!loading) {
      console.log('App - Jobs loaded:', jobs);
      console.log('App - Number of jobs:', jobs.length);
    }
  }, [jobs, loading]);

  return (
    <>
      <NavBar />
      
      {/* Debug info - remove in production */}
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px' }}>
        <strong>API Test:</strong> {loading ? 'Loading jobs...' : `Found ${Array.isArray(jobs) ? jobs.length : 0} jobs`}
        {Array.isArray(jobs) && jobs.length > 0 && (
          <div>First job: {jobs[0].title || jobs[0].name || 'No title'}</div>
        )}
      </div>
      
      <Routes>
        <Route path="/" element={<JobList />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/apply/:id" element={<ApplyForm />} />

        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;