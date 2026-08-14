import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, closedJobs: 0, totalApplicants: 0 });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Recruiter Company
      const compRes = await api.get('/profile/recruiter/company');
      setCompany(compRes.data);

      // Fetch jobs posted by recruiter
      const jobsRes = await api.get('/jobs/my-jobs');
      setJobs(jobsRes.data);

      // Fetch applications counts per job
      let appCountTotal = 0;
      const jobsWithAppCount = await Promise.all(
        jobsRes.data.map(async (job) => {
          const appsRes = await api.get(`/applications/job/${job._id}`);
          appCountTotal += appsRes.data.length;
          return {
            ...job,
            applicantsCount: appsRes.data.length
          };
        })
      );
      setJobs(jobsWithAppCount);

      // Aggregate stats
      const total = jobsRes.data.length;
      const active = jobsRes.data.filter(j => j.status === 'active').length;
      setStats({
        totalJobs: total,
        activeJobs: active,
        closedJobs: total - active,
        totalApplicants: appCountTotal
      });
    } catch (err) {
      console.error('Error loading recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await api.put(`/jobs/${jobId}`, { status: nextStatus });
      fetchDashboardData();
      alert(`Job listing has been ${nextStatus === 'active' ? 're-opened' : 'closed'}.`);
    } catch (err) {
      console.error('Error toggling job status:', err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing? This will also remove any candidate applications associated with it.')) {
      return;
    }
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchDashboardData();
      alert('Job listing deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete job listing.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-cnear-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Recruiter Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Hello, {user?.name}. Manage listings for {company?.name || 'your company'}.</p>
        </div>
        <Link
          to="/recruiter/jobs/new"
          className="px-5 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cnear-500/25 glow-btn"
        >
          Post a Job
        </Link>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-xs">
        <div className="glass p-5 rounded-2xl">
          <span className="text-slate-500 font-medium block">Total Job Postings</span>
          <p className="text-2xl font-extrabold text-white mt-2">{stats.totalJobs}</p>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-slate-500 font-medium block">Active Listings</span>
          <p className="text-2xl font-extrabold text-teal-400 mt-2">{stats.activeJobs}</p>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-slate-500 font-medium block">Closed Listings</span>
          <p className="text-2xl font-extrabold text-slate-450 mt-2">{stats.closedJobs}</p>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-slate-500 font-medium block">Total Applications</span>
          <p className="text-2xl font-extrabold text-cnear-400 mt-2">{stats.totalApplicants}</p>
        </div>
      </div>

      {/* Job list table */}
      <div className="glass rounded-3xl overflow-hidden p-6">
        <h2 className="text-sm font-bold text-slate-200 mb-6">Manage Your Listings</h2>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-slate-650 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xs text-slate-500">You haven't posted any jobs yet.</p>
            <Link to="/recruiter/jobs/new" className="mt-3 inline-block px-4 py-2 bg-cnear-900/30 border border-cnear-850 text-xs text-cnear-450 font-semibold rounded-lg hover:bg-cnear-900/60 transition-colors">
              Post First Job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Job Title</th>
                  <th className="pb-3 pr-4">Setting / Location</th>
                  <th className="pb-3 pr-4">Applicants</th>
                  <th className="pb-3 pr-4">Created Date</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-900/10">
                    <td className="py-4 pr-4">
                      <span className="font-bold text-slate-200 block">{job.title}</span>
                      <span className="text-[10px] text-slate-500">{job.jobType} • {job.experienceLevel}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-slate-300 block">{job.workSetting}</span>
                      <span className="text-[10px] text-slate-500">{job.location}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <Link to={`/recruiter/jobs/${job._id}/applicants`} className="font-bold text-cnear-450 hover:underline">
                        {job.applicantsCount} candidate{job.applicantsCount === 1 ? '' : 's'}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 text-slate-450">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                        job.status === 'active'
                          ? 'bg-teal-950/20 border-teal-500/30 text-teal-400'
                          : 'bg-slate-900 border-slate-800 text-slate-550'
                      }`}>
                        {job.status === 'active' ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td className="py-4 text-right flex justify-end gap-2.5">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-950 border border-slate-800 text-slate-350 text-[10.5px] rounded-lg transition-colors"
                      >
                        Applicants
                      </Link>
                      <Link
                        to={`/recruiter/jobs/${job._id}/edit`}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-950 border border-slate-800 text-slate-350 text-[10.5px] rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(job._id, job.status)}
                        className={`px-2.5 py-1.5 border text-[10.5px] rounded-lg transition-colors ${
                          job.status === 'active'
                            ? 'border-slate-850 hover:bg-slate-900 text-amber-500'
                            : 'border-slate-850 hover:bg-slate-900 text-emerald-500'
                        }`}
                      >
                        {job.status === 'active' ? 'Close' : 'Reopen'}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="px-2.5 py-1.5 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-950/40 text-[10.5px] rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
