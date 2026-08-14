import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function RecruiterCompany() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [employeesCount, setEmployeesCount] = useState('');

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile/recruiter/company');
      const data = res.data;

      setName(data.name || '');
      setLogo(data.logo || '');
      setWebsite(data.website || '');
      setDescription(data.description || '');
      setLocation(data.location || '');
      setIndustry(data.industry || '');
      setEmployeesCount(data.employeesCount || '');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = { name, logo, website, description, location, industry, employeesCount };

    try {
      await api.put('/profile/recruiter/company', payload);
      setSuccessMsg('Company details updated successfully!');
      setTimeout(() => navigate('/recruiter/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save company details. Try again.');
    } finally {
      setSaving(false);
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
        <h1 className="text-xl font-extrabold text-white mb-1">Company Profile</h1>
        <p className="text-xs text-slate-400 mb-8">Establish your brand credibility by completing your corporate details.</p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-xs text-slate-350">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5">Industry Segment</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology / FinTech"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Staff Counts</label>
              <input
                type="text"
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value)}
                placeholder="e.g. 50-100 employees"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5">Headquarters Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chicago, IL"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">Company Logo Link</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://logo-provider.com/logo.png"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">Description / About</label>
            <textarea
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell applicants about your company culture, vision, values, and benefits..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-normal"
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
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-cnear-500/25"
            >
              {saving ? 'Saving...' : 'Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
