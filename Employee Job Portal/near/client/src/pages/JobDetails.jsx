import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeType, setResumeType] = useState('generated'); // generated, uploaded
  const [resumeTemplate, setResumeTemplate] = useState('classic'); // classic, modern, creative
  const [submittingApp, setSubmittingApp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);

      if (user) {
        // Fetch saved status
        const savedRes = await api.get('/jobs/saved');
        setIsSaved(savedRes.data.some(s => s.job?._id === id));

        // Fetch application status
        const appRes = await api.get('/applications/my-applications');
        setHasApplied(appRes.data.some(a => a.job?._id === id));

        // Fetch employee profile details for completion checks
        if (user.role === 'employee') {
          const profRes = await api.get('/profile');
          setProfile(profRes.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await api.delete(`/jobs/${id}/unsave`);
        setIsSaved(false);
      } else {
        await api.post(`/jobs/${id}/save`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling saved status:', err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmittingApp(true);

    try {
      await api.post(`/applications/apply/${id}`, {
        coverLetter,
        resumeType,
        resumeTemplate,
      });
      setHasApplied(true);
      setShowApplyModal(false);
      alert('Application submitted successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApp(false);
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

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Job listing not found</h2>
        <Link to="/jobs" className="mt-4 inline-block text-xs font-semibold text-cnear-400 hover:underline">Back to job boards</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-6">
        <Link to="/jobs" className="text-xs text-slate-450 hover:text-slate-200 transition-colors flex items-center gap-1">
          ← Back to Job Search
        </Link>
      </div>

      {/* Main details card */}
      <div className="glass p-6 md:p-8 rounded-3xl relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{job.title}</h1>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-lg">
                {job.workSetting}
              </span>
            </div>
            <p className="text-xs text-slate-350 mt-1 font-semibold">
              {job.company?.name} • {job.location} • <span className="text-slate-500 font-normal">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToggle}
              className={`p-2.5 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isSaved ? 'Unsave Job' : 'Save Job'}
            >
              <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            {user?.role === 'recruiter' || user?.role === 'admin' ? (
              <span className="text-xs text-slate-500 italic">Recruiter Mode</span>
            ) : hasApplied ? (
              <span className="px-5 py-2.5 bg-slate-800 text-slate-450 border border-slate-700/40 text-xs font-bold rounded-xl cursor-default">
                ✓ Already Applied
              </span>
            ) : (
              <button
                onClick={() => {
                  if (!user) navigate('/login');
                  else setShowApplyModal(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cnear-500/25 glow-btn"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Quick parameters grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 block mb-1">Salary Range</span>
            <span className="font-bold text-slate-200">{job.salaryDisplay || 'Competitive'}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Job Type</span>
            <span className="font-bold text-slate-200">{job.jobType}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Experience Level</span>
            <span className="font-bold text-slate-200">{job.experienceLevel}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Minimum Experience</span>
            <span className="font-bold text-slate-200">{job.minExperience} year{job.minExperience === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Job Description details */}
        <div className="py-6 flex flex-col gap-6 text-xs text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Job Description</h3>
            <p className="whitespace-pre-line text-slate-350">{job.description}</p>
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Key Responsibilities</h3>
              <ul className="list-disc list-inside flex flex-col gap-1.5 text-slate-350 pl-2">
                {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Requirements</h3>
              <ul className="list-disc list-inside flex flex-col gap-1.5 text-slate-350 pl-2">
                {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Skills Requested</h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10.5px] rounded-lg text-slate-400 font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Benefits & Perks</h3>
              <ul className="list-disc list-inside flex flex-col gap-1.5 text-slate-350 pl-2">
                {job.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* APPLICATIONS MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-1">Apply for {job.title}</h2>
            <p className="text-[10px] text-slate-400 mb-6">Review details and attach your MERN compiled resume.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Check Profile completeness */}
            {profile && profile.profileCompletion < 100 ? (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-xs text-amber-300 mb-6 leading-relaxed">
                <p className="font-bold mb-1">⚠️ Profile Incomplete ({profile.profileCompletion}%)</p>
                Complete your profile to 100% to unlock your resume and apply. You are currently missing some key credentials.
                <div className="mt-4 flex justify-end">
                  <Link
                    to="/employee/profile"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-[10.5px] transition-colors"
                  >
                    Complete Profile
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="flex flex-col gap-4 text-xs">
                {/* Resume Selector options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5">Resume Type</label>
                    <select
                      value={resumeType}
                      onChange={(e) => setResumeType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                    >
                      <option value="generated">MERN Generated Resume</option>
                      <option value="uploaded">Uploaded PDF Resume</option>
                    </select>
                  </div>
                  {resumeType === 'generated' && (
                    <div>
                      <label className="block text-slate-400 mb-1.5">Resume Design Template</label>
                      <select
                        value={resumeTemplate}
                        onChange={(e) => setResumeTemplate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                      >
                        <option value="classic">Classic / ATS-Friendly</option>
                        <option value="modern">Modern Column Layout</option>
                        <option value="creative">Creative Accent Header</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5">Cover Letter</label>
                  <textarea
                    rows="6"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe why you are a great fit for this position..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 leading-normal"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-950 text-slate-450 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="px-5 py-2 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-cnear-500/25"
                  >
                    {submittingApp ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
