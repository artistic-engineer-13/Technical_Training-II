import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Profile
      const profRes = await api.get('/profile');
      setProfile(profRes.data);

      // Check if user is onboarded
      if (!profRes.data.isOnboarded) {
        navigate('/employee/onboarding');
        return;
      }

      // Fetch Recent Applications
      const appRes = await api.get('/applications/my-applications');
      setApplications(appRes.data.slice(0, 5));

      // Fetch Saved Jobs
      const savedRes = await api.get('/jobs/saved');
      setSavedJobs(savedRes.data.slice(0, 5));

      // Fetch Jobs for recommendations
      const jobsRes = await api.get('/jobs');
      // Simple recommendation: filter jobs matching any skills of the employee
      const userSkills = (profRes.data.skills || []).map(s => s.toLowerCase());
      
      const jobsList = jobsRes.data.jobs || [];
      const filtered = jobsList.filter(job => {
        if (userSkills.length === 0) return true; // fallback to showing recent
        return (job.skills || []).some(skill => userSkills.includes(skill.toLowerCase()));
      });

      setRecommendedJobs(filtered.slice(0, 4));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    refreshUser();
  }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-cnear-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const completion = profile.completionDetails?.percentage ?? profile.profileCompletion ?? 0;
  const missingSections = profile.completionDetails?.missingSections || [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Employee Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Hello, {user?.name}. Manage your profile strength and track job application results.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PROFILE COMPLETION PANEL */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 rounded-3xl glass-premium">
            <h2 className="text-sm font-bold text-slate-200 mb-4">Profile Completion</h2>
            
            {/* Progress circle/bar */}
            <div className="relative pt-1 mb-4">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full bg-cnear-900/50 text-cnear-400 border border-cnear-700/20">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">
                    {completion}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2.5 text-xs flex rounded bg-slate-800">
                <div
                  style={{ width: `${completion}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cnear-500 to-teal-400 transition-all duration-500"
                />
              </div>
            </div>

            {completion < 100 ? (
              <div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Complete remaining sections to unlock your PDF/Word resume generator.
                </p>
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-500 block mb-2 uppercase">Complete these sections:</span>
                  <ul className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                    {missingSections.map((item, idx) => (
                      <li key={idx} className="text-[10.5px] text-slate-450 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/employee/profile"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs transition-colors block text-center"
                >
                  Complete Profile
                </Link>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-emerald-400 font-bold mb-3 flex items-center justify-center gap-1.5">
                  <span>🎉</span> Your profile is 100% complete
                </p>
                <Link
                  to="/employee/resume"
                  className="w-full py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs transition-all block text-center glow-btn"
                >
                  Create My Resume
                </Link>
              </div>
            )}
          </div>

          {/* SAVED JOBS LIST */}
          <div className="p-6 rounded-3xl glass">
            <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
              <span>Saved Jobs</span>
              <span className="text-[10px] text-slate-500">{savedJobs.length} items</span>
            </h2>
            <div className="flex flex-col gap-3">
              {savedJobs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No bookmarked jobs.</p>
              ) : (
                savedJobs.map((item) => (
                  <div key={item._id} className="p-3 bg-slate-900/30 rounded-2xl border border-slate-850 flex justify-between items-center hover:border-slate-700/60 transition-all">
                    <div>
                      <Link to={`/jobs/${item.job?._id}`} className="font-semibold text-xs text-slate-200 hover:text-cnear-400 transition-colors">
                        {item.job?.title}
                      </Link>
                      <p className="text-[10px] text-slate-500">{item.job?.company?.name} • {item.job?.location}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RECOMMENDED & APPLICATIONS PANEL */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* RECENT APPLICATIONS */}
          <div className="p-6 rounded-3xl glass">
            <h2 className="text-sm font-bold text-slate-200 mb-4">Recent Applications</h2>
            <div className="flex flex-col gap-3">
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500">You haven't submitted any job applications yet.</p>
                  <Link to="/jobs" className="mt-3 inline-block px-4 py-2 bg-cnear-900/30 border border-cnear-800 text-xs text-cnear-400 font-semibold rounded-lg hover:bg-cnear-900/60 transition-colors">
                    Find Vacancies
                  </Link>
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app._id} className="p-4 bg-slate-900/30 rounded-2xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-850 transition-colors">
                    <div>
                      <span className="font-bold text-xs text-slate-250">{app.job?.title}</span>
                      <p className="text-[10px] text-slate-500">{app.job?.company?.name} • Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                        app.status === 'Selected' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                        app.status === 'Rejected' ? 'bg-red-950/40 border-red-500/30 text-red-400' :
                        app.status === 'Interview' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                        'bg-slate-900 border-slate-850 text-slate-400'
                      }`}>
                        {app.status}
                      </span>
                      <Link to="/employee/applications" className="text-[11px] font-semibold text-cnear-400 hover:text-cnear-300">
                        Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECOMMENDED JOBS */}
          <div className="p-6 rounded-3xl glass">
            <h2 className="text-sm font-bold text-slate-200 mb-4">Recommended Jobs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedJobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 col-span-2 text-center">No recommendations yet. Complete your skills list to sync recommendations.</p>
              ) : (
                recommendedJobs.map((job) => (
                  <div key={job._id} className="p-4 bg-slate-900/30 rounded-2xl border border-slate-850 flex flex-col justify-between hover:border-cnear-500/20 hover:bg-slate-800/10 transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link to={`/jobs/${job._id}`} className="font-bold text-xs text-slate-200 hover:text-cnear-400 transition-colors">
                          {job.title}
                        </Link>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700/50 rounded">
                          {job.workSetting}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{job.company?.name} • {job.location}</p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{job.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-350">{job.salaryDisplay || 'Competitive'}</span>
                      <Link to={`/jobs/${job._id}`} className="text-[10.5px] font-bold text-cnear-400 hover:text-cnear-300">
                        View Job
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
