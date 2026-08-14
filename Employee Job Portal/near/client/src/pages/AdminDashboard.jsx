import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // users, jobs, applications, stats

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);

      const jobsRes = await api.get('/admin/jobs');
      setJobs(jobsRes.data);

      const appsRes = await api.get('/admin/applications');
      setApplications(appsRes.data);
    } catch (err) {
      console.error('Error fetching admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      alert(res.data.message);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update suspension status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? All profile details, jobs, or applications will also be lost.')) {
      return;
    }
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      alert(res.data.message);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) {
      return;
    }
    try {
      await api.delete(`/jobs/${jobId}`);
      alert('Job listing deleted successfully.');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete job.');
    }
  };

  if (loading || !stats) {
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
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Admin Control Console</h1>
        <p className="text-xs text-slate-400 mt-1">Platform-wide statistics, moderation actions, and databases administration.</p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-xs">
        <div className="glass p-5 rounded-2xl">
          <span className="text-slate-500 font-medium block">Registered Users</span>
          <p className="text-2xl font-extrabold text-white mt-2">{stats.users?.total}</p>
          <div className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
            <span>Seeks: {stats.users?.employees}</span>
            <span>Hires: {stats.users?.recruiters}</span>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-slate-500 font-medium block">Job Opportunities</span>
          <p className="text-2xl font-extrabold text-cnear-450 mt-2">{stats.jobs?.total}</p>
          <div className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
            <span>Active: {stats.jobs?.active}</span>
            <span>Closed: {stats.jobs?.closed}</span>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-slate-500 font-medium block">Applications Sent</span>
          <p className="text-2xl font-extrabold text-teal-400 mt-2">{stats.applications?.total}</p>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-slate-500 font-medium block">System Operations</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">Active</p>
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex border-b border-slate-800 gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-cnear-500 text-white font-bold' : 'border-transparent text-slate-450 hover:text-slate-355'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'jobs' ? 'border-cnear-500 text-white font-bold' : 'border-transparent text-slate-450 hover:text-slate-355'
          }`}
        >
          Job Vacancies ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'applications' ? 'border-cnear-500 text-white font-bold' : 'border-transparent text-slate-450 hover:text-slate-355'
          }`}
        >
          Applications ({applications.length})
        </button>
      </div>

      <div className="glass p-6 rounded-3xl text-xs">
        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">User Details</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Registration</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300">
                {users.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-slate-900/10">
                    <td className="py-3.5 pr-4 font-bold text-slate-200">{userItem.name}</td>
                    <td className="py-3.5 pr-4 font-mono">{userItem.email}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded capitalize border ${
                        userItem.role === 'admin' ? 'bg-indigo-950/30 border-indigo-500/20 text-indigo-400' :
                        userItem.role === 'recruiter' ? 'bg-teal-950/30 border-teal-500/20 text-teal-400' :
                        'bg-slate-900 border-slate-850 text-slate-400'
                      }`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-500">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                        userItem.status === 'suspended'
                          ? 'bg-red-950/30 border-red-500/20 text-red-400'
                          : 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {userItem.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleSuspend(userItem._id)}
                        disabled={userItem.role === 'admin'}
                        className={`px-2.5 py-1.5 border text-[10px] rounded-lg transition-colors ${
                          userItem.status === 'suspended'
                            ? 'border-emerald-900/40 text-emerald-450 hover:bg-emerald-950/20'
                            : 'border-amber-900/40 text-amber-500 hover:bg-amber-950/20'
                        } disabled:opacity-30`}
                      >
                        {userItem.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem._id)}
                        disabled={userItem.role === 'admin'}
                        className="px-2.5 py-1.5 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 text-[10px] rounded-lg transition-colors disabled:opacity-30"
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

        {/* TAB 2: JOBS */}
        {activeTab === 'jobs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Listing Title</th>
                  <th className="pb-3 pr-4">Company Name</th>
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3 pr-4">Created Date</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300">
                {jobs.map((jobItem) => (
                  <tr key={jobItem._id} className="hover:bg-slate-900/10">
                    <td className="py-3.5 pr-4 font-bold text-slate-200">{jobItem.title}</td>
                    <td className="py-3.5 pr-4">{jobItem.company?.name || 'Recruiter Company'}</td>
                    <td className="py-3.5 pr-4">{jobItem.location}</td>
                    <td className="py-3.5 pr-4 text-slate-500">{new Date(jobItem.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                        jobItem.status === 'active'
                          ? 'bg-teal-950/20 border-teal-500/30 text-teal-400'
                          : 'bg-slate-900 border-slate-800 text-slate-550'
                      }`}>
                        {jobItem.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteJob(jobItem._id)}
                        className="px-2.5 py-1.5 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 text-[10px] rounded-lg transition-colors"
                      >
                        Delete Job
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Position Title</th>
                  <th className="pb-3 pr-4">Applicant</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Applied Date</th>
                  <th className="pb-3 pr-4">Pipeline Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-900/10">
                    <td className="py-3.5 pr-4 font-bold text-slate-205">{app.job?.title}</td>
                    <td className="py-3.5 pr-4">{app.employee?.name}</td>
                    <td className="py-3.5 pr-4 font-mono">{app.employee?.email}</td>
                    <td className="py-3.5 pr-4 text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                        app.status === 'Selected' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                        app.status === 'Rejected' ? 'bg-red-950/40 border-red-500/30 text-red-400' :
                        app.status === 'Interview' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                        'bg-slate-900 border-slate-850 text-slate-405'
                      }`}>
                        {app.status}
                      </span>
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
