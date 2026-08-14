import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobListing() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  
  // Multi-select filters
  const [selectedExp, setSelectedExp] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSettings, setSelectedSettings] = useState([]);

  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('recent');
  
  // Saved status state
  const [savedJobIds, setSavedJobIds] = useState([]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = { page, sort };
      if (search) params.search = search;
      if (location) params.location = location;
      if (minSalary) params.minSalary = minSalary;
      
      if (selectedExp.length > 0) params.experienceLevel = selectedExp.join(',');
      if (selectedTypes.length > 0) params.jobType = selectedTypes.join(',');
      if (selectedSettings.length > 0) params.workSetting = selectedSettings.join(',');

      const res = await api.get('/jobs', { params });
      setJobs(res.data.jobs || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedStatus = async () => {
    if (!user || user.role !== 'employee') return;
    try {
      const res = await api.get('/jobs/saved');
      setSavedJobIds(res.data.map(item => item.job?._id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, sort]);

  useEffect(() => {
    fetchSavedStatus();
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleToggleExp = (val) => {
    setPage(1);
    setSelectedExp(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleToggleType = (val) => {
    setPage(1);
    setSelectedTypes(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleToggleSetting = (val) => {
    setPage(1);
    setSelectedSettings(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  // Re-run search automatically when filters change
  useEffect(() => {
    setPage(1);
    fetchJobs();
  }, [selectedExp, selectedTypes, selectedSettings]);

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setMinSalary('');
    setSelectedExp([]);
    setSelectedTypes([]);
    setSelectedSettings([]);
    setSort('recent');
    setPage(1);
  };

  const handleSaveToggle = async (jobId) => {
    if (!user) {
      alert('Please log in to save jobs.');
      return;
    }
    const isAlreadySaved = savedJobIds.includes(jobId);
    try {
      if (isAlreadySaved) {
        await api.delete(`/jobs/${jobId}/unsave`);
        setSavedJobIds(prev => prev.filter(id => id !== jobId));
      } else {
        await api.post(`/jobs/${jobId}/save`);
        setSavedJobIds(prev => [...prev, jobId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Search Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-white">Find Your Next Challenge</h1>
        <p className="text-xs text-slate-400 mt-1">Search thousands of open roles with verified companies globally.</p>

        <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto mt-6 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl relative z-10">
          <div className="flex-1 flex items-center gap-2 px-3">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, keywords, or skills..."
              className="w-full bg-transparent text-xs text-slate-205 focus:outline-none placeholder-slate-500 py-2"
            />
          </div>
          <div className="w-full md:w-64 flex items-center gap-2 px-3 border-t md:border-t-0 md:border-l border-slate-800">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Remote..."
              className="w-full bg-transparent text-xs text-slate-205 focus:outline-none placeholder-slate-500 py-2"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-cnear-500/20"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Filters</span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] text-cnear-450 hover:text-cnear-450 font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* Salary Slider */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-slate-350 uppercase mb-2">Min Salary (Annual)</label>
              <input
                type="range"
                min="0"
                max="250000"
                step="10000"
                value={minSalary || 0}
                onChange={(e) => setMinSalary(e.target.value === '0' ? '' : e.target.value)}
                className="w-full accent-cnear-500 h-1 bg-slate-800 rounded"
              />
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                {minSalary ? `$${Number(minSalary).toLocaleString()}+` : 'Any Salary'}
              </span>
            </div>

            {/* Experience Levels */}
            <div className="mb-6">
              <span className="block text-[11px] font-bold text-slate-350 uppercase mb-3">Experience Level</span>
              <div className="flex flex-col gap-2">
                {['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Executive'].map((level) => (
                  <label key={level} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedExp.includes(level)}
                      onChange={() => handleToggleExp(level)}
                      className="w-4 h-4 rounded text-cnear-500 bg-slate-900 border-slate-800"
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Job Setting */}
            <div className="mb-6">
              <span className="block text-[11px] font-bold text-slate-350 uppercase mb-3">Work Setting</span>
              <div className="flex flex-col gap-2">
                {['On-site', 'Hybrid', 'Remote'].map((setting) => (
                  <label key={setting} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedSettings.includes(setting)}
                      onChange={() => handleToggleSetting(setting)}
                      className="w-4 h-4 rounded text-cnear-500 bg-slate-900 border-slate-800"
                    />
                    <span>{setting}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Job Types */}
            <div>
              <span className="block text-[11px] font-bold text-slate-350 uppercase mb-3">Job Type</span>
              <div className="flex flex-col gap-2">
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleToggleType(type)}
                      className="w-4 h-4 rounded text-cnear-500 bg-slate-900 border-slate-800"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* JOBS GRID */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-cnear-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs text-slate-500 mb-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                <span>Showing {jobs.length} open position{jobs.length === 1 ? '' : 's'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Sort By</span>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="salary_desc">Salary (High to Low)</option>
                    <option value="salary_asc">Salary (Low to High)</option>
                    <option value="experience_asc">Experience (Low to High)</option>
                    <option value="experience_desc">Experience (High to Low)</option>
                  </select>
                </div>
              </div>

              {jobs.length === 0 ? (
                <div className="glass p-12 text-center rounded-3xl">
                  <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-bold text-slate-300">No jobs found matching filters</p>
                  <button onClick={clearFilters} className="mt-4 text-xs font-semibold text-cnear-450 hover:underline">Clear all search filters</button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {jobs.map((job) => {
                      const isJobSaved = savedJobIds.includes(job._id);
                      return (
                        <div
                          key={job._id}
                          className="p-5 rounded-3xl glass hover:border-cnear-500/35 hover:bg-slate-800/10 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                        >
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <Link to={`/jobs/${job._id}`} className="font-extrabold text-sm text-slate-205 hover:text-cnear-400 transition-colors">
                                {job.title}
                              </Link>
                              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9.5px] font-bold text-slate-400 rounded-md">
                                {job.workSetting}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mb-2">{job.company?.name} • {job.location}</p>
                            
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {job.skills && job.skills.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-950 text-slate-500 text-[10px] rounded-md font-mono">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-850 gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-200">{job.salaryDisplay || 'Competitive'}</p>
                              <span className="text-[10px] text-slate-500 block mt-0.5">{job.jobType} • {job.experienceLevel}</span>
                            </div>
                            <div className="flex gap-2">
                              {user?.role === 'employee' && (
                                <button
                                  onClick={() => handleSaveToggle(job._id)}
                                  className={`px-3 py-2 rounded-xl border transition-all text-xs font-semibold ${
                                    isJobSaved
                                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-400'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {isJobSaved ? '✓ Saved' : 'Save Job'}
                                </button>
                              )}
                              <Link
                                to={`/jobs/${job._id}`}
                                className="px-4 py-2 bg-cnear-900 border border-cnear-750 text-cnear-450 hover:bg-cnear-950 text-xs font-bold rounded-xl transition-all"
                              >
                                View Job
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-slate-850/60">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 border border-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent text-[11px] text-slate-350 font-semibold rounded-lg transition-colors"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 text-[11px] font-bold rounded-lg transition-all ${
                            page === p
                              ? 'bg-cnear-600 text-white'
                              : 'border border-slate-800 text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 border border-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent text-[11px] text-slate-350 font-semibold rounded-lg transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
