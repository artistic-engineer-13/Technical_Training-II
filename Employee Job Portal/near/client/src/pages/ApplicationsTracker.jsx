import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ApplicationsTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/my-applications');
      setApplications(res.data);
      if (res.data.length > 0) {
        setSelectedApp(res.data[0]); // default to first application
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

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
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Application Pipeline</h1>
        <p className="text-xs text-slate-400 mt-1">Track the exact status of your applications using live recruiter audit updates.</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl">
          <svg className="w-12 h-12 text-slate-650 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm font-bold text-slate-300">No applications found</p>
          <p className="text-xs text-slate-500 mt-1">Apply for active jobs on the job board to list them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* APPLICATIONS LIST */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Submissions:</span>
            {applications.map((app) => (
              <button
                key={app._id}
                onClick={() => setSelectedApp(app)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedApp?._id === app._id
                    ? 'border-cnear-500 bg-cnear-950/20 text-white'
                    : 'border-slate-800 bg-slate-900/10 text-slate-450 hover:border-slate-700/60'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-xs font-bold truncate pr-2">{app.job?.title}</p>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                    app.status === 'Selected' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                    app.status === 'Rejected' ? 'bg-red-950/40 border-red-500/30 text-red-400' :
                    app.status === 'Interview' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                    'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 mt-1">{app.job?.company?.name} • {app.job?.location}</p>
                <p className="text-[9px] text-slate-500 mt-2">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>

          {/* ACTIVE STATUS TIMELINE DETAIL PANEL */}
          <div className="lg:col-span-2">
            {selectedApp && (
              <div className="glass p-6 md:p-8 rounded-3xl">
                <div className="pb-4 border-b border-slate-800 mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-extrabold text-white">{selectedApp.job?.title}</h2>
                    <p className="text-xs text-slate-450 mt-0.5">{selectedApp.job?.company?.name} • {selectedApp.job?.location}</p>
                  </div>
                  <Link
                    to={`/jobs/${selectedApp.job?._id}`}
                    className="text-xs font-bold text-cnear-450 hover:text-cnear-350"
                  >
                    View Original Post
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Timeline */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Application History</h3>
                    <div className="relative border-l border-slate-800 pl-4 ml-2 flex flex-col gap-6 text-xs text-slate-400">
                      {selectedApp.statusTimeline?.map((t, idx) => (
                        <div key={idx} className="relative">
                          {/* Dot accent */}
                          <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                            idx === selectedApp.statusTimeline.length - 1
                              ? 'bg-cnear-500 border-cnear-300 animate-ping'
                              : 'bg-slate-900 border-slate-750'
                          }`} />
                          
                          {/* Alternate static dot to replace ping helper */}
                          <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                            idx === selectedApp.statusTimeline.length - 1
                              ? 'bg-cnear-500 border-cnear-300'
                              : 'bg-slate-900 border-slate-750'
                          }`} />

                          <div className="flex justify-between items-center font-bold text-slate-200 mb-0.5">
                            <span>{t.status}</span>
                            <span className="text-[9px] text-slate-500 font-normal">{new Date(t.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-450 leading-relaxed">{t.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submission details */}
                  <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl flex flex-col gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Resume Type Used:</span>
                      <span className="font-bold text-slate-200 capitalize">{selectedApp.resumeType} Resume</span>
                    </div>
                    {selectedApp.resumeType === 'generated' && (
                      <div>
                        <span className="text-slate-500 block mb-1">Resume Layout Template:</span>
                        <span className="font-bold text-slate-200 capitalize">{selectedApp.resumeTemplate} Template</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500 block mb-1.5">Submitted Cover Letter:</span>
                      <p className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed text-slate-350 text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {selectedApp.coverLetter || 'No cover letter provided.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
