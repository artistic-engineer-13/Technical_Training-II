import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function RecruiterJobForm() {
  const { id } = useParams(); // populated if editing
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salaryDisplay, setSalaryDisplay] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [minExperience, setMinExperience] = useState('0');
  const [jobType, setJobType] = useState('Full-time');
  const [workSetting, setWorkSetting] = useState('On-site');
  const [skillsText, setSkillsText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${id}`);
      const data = res.data;

      setTitle(data.title || '');
      setDescription(data.description || '');
      setLocation(data.location || '');
      setSalaryDisplay(data.salaryDisplay || '');
      setMinSalary(data.minSalary || '');
      setMaxSalary(data.maxSalary || '');
      setExperienceLevel(data.experienceLevel || 'Entry Level');
      setMinExperience(data.minExperience || '0');
      setJobType(data.jobType || 'Full-time');
      setWorkSetting(data.workSetting || 'On-site');
      
      setSkillsText(data.skills?.join(', ') || '');
      setRequirementsText(data.requirements?.join('\n') || '');
      setResponsibilitiesText(data.responsibilities?.join('\n') || '');
      setBenefitsText(data.benefits?.join(', ') || '');
      
      if (data.deadline) {
        setDeadline(new Date(data.deadline).toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load job details for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const formattedSkills = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const formattedRequirements = requirementsText.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    const formattedResponsibilities = responsibilitiesText.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    const formattedBenefits = benefitsText.split(',').map(b => b.trim()).filter(b => b.length > 0);

    const payload = {
      title,
      description,
      location,
      salaryDisplay,
      minSalary: minSalary ? Number(minSalary) : 0,
      maxSalary: maxSalary ? Number(maxSalary) : 0,
      experienceLevel,
      minExperience: minExperience ? Number(minExperience) : 0,
      jobType,
      workSetting,
      skills: formattedSkills,
      requirements: formattedRequirements,
      responsibilities: formattedResponsibilities,
      benefits: formattedBenefits,
      deadline: deadline || null,
    };

    try {
      if (isEditMode) {
        await api.put(`/jobs/${id}`, payload);
        alert('Job listing updated successfully!');
      } else {
        await api.post('/jobs', payload);
        alert('Job listing posted successfully!');
      }
      navigate('/recruiter/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error processing job form details.');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-6">
        <Link to="/recruiter/dashboard" className="text-xs text-slate-450 hover:text-slate-200 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="glass p-6 md:p-8 rounded-3xl">
        <h1 className="text-xl font-extrabold text-white mb-1">
          {isEditMode ? 'Edit Job Posting' : 'Post a New Job Opportunity'}
        </h1>
        <p className="text-xs text-slate-400 mb-8">Specify requirements and parameters to match top candidate profiles.</p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-xs text-slate-350">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, TX / Remote"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">Job Description</label>
            <textarea
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the overall scope, division, and team goals..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-normal"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Work Setting</label>
              <select
                value={workSetting}
                onChange={(e) => setWorkSetting(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead/Executive">Lead/Executive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1.5">Salary Display Text</label>
              <input
                type="text"
                value={salaryDisplay}
                onChange={(e) => setSalaryDisplay(e.target.value)}
                placeholder="e.g. $110,000 - $130,000"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Min Salary (Numeric)</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="100000"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Max Salary (Numeric)</label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="130000"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5">Min Experience (Years)</label>
              <input
                type="number"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                placeholder="3"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Application Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">Required Skills (separated by commas)</label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React, Javascript, Node, REST APIs"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">Job Requirements (one per line)</label>
            <textarea
              rows="4"
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="Degree in Computer Science or equivalent
3+ years of professional development
Experience with cloud deployments"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-normal"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">Key Responsibilities (one per line)</label>
            <textarea
              rows="4"
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              placeholder="Develop premium web app components
Participate in pull request reviews
Optimize database queries"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-normal"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">Benefits & Perks (separated by commas)</label>
            <input
              type="text"
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              placeholder="Medical Insurance, 401(k) Match, Unlimited PTO, Remote Stipend"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t border-slate-800 pt-6">
            <Link
              to="/recruiter/dashboard"
              className="px-5 py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-450 hover:text-white rounded-xl font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-cnear-500/25"
            >
              {submitting ? 'Submitting...' : (isEditMode ? 'Update Posting' : 'Post Listing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
