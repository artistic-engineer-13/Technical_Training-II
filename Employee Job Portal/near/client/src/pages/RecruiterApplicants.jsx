import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function RecruiterApplicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null); // active candidate details modal

  // Status Change Forms
  const [statusMap, setStatusMap] = useState({}); // { appId: status }
  const [commentMap, setCommentMap] = useState({}); // { appId: comment }
  const [updatingAppId, setUpdatingAppId] = useState(null);

  const fetchApplicantsData = async () => {
    try {
      setLoading(true);
      const jobRes = await api.get(`/jobs/${jobId}`);
      setJob(jobRes.data);

      const appsRes = await api.get(`/applications/job/${jobId}`);
      setApplicants(appsRes.data);

      // Pre-fill form maps
      const statuses = {};
      const comments = {};
      appsRes.data.forEach((app) => {
        statuses[app._id] = app.status;
        comments[app._id] = '';
      });
      setStatusMap(statuses);
      setCommentMap(comments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantsData();
  }, [jobId]);

  const handleUpdateStatus = async (appId) => {
    setUpdatingAppId(appId);
    try {
      await api.put(`/applications/${appId}/status`, {
        status: statusMap[appId],
        comment: commentMap[appId] || undefined
      });
      alert('Candidate status updated successfully!');
      fetchApplicantsData();
    } catch (err) {
      console.error(err);
      alert('Failed to update applicant status.');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleDownloadResume = async (employeeId, type, template, format) => {
    try {
      let downloadUrl = '';
      if (type === 'uploaded') {
        // If candidate applied with their uploaded resume, redirect to it
        const candidateProfile = applicants.find(a => a.employee._id === employeeId)?.employeeProfile;
        if (candidateProfile?.resumeUrl) {
          window.open(`http://localhost:5000${candidateProfile.resumeUrl}`, '_blank');
          return;
        } else {
          alert('No uploaded resume found.');
          return;
        }
      } else {
        // If generated resume, compile it on backend
        downloadUrl = `/resume/download/employee/${employeeId}/${template}/${format}`;
      }

      const res = await api.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `candidate_${employeeId}_resume.${format}`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      alert('Error fetching resume file from server.');
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
      <div className="mb-6 flex justify-between items-center">
        <Link to="/recruiter/dashboard" className="text-xs text-slate-450 hover:text-slate-200 transition-colors">
          ← Back to Dashboard
        </Link>
        <span className="text-xs text-slate-500">Job: {job?.title}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Review Applicants</h1>
        <p className="text-xs text-slate-400 mt-1">Manage pipeline for {job?.title} • {applicants.length} total applicant{applicants.length === 1 ? '' : 's'}</p>
      </div>

      {applicants.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl">
          <svg className="w-12 h-12 text-slate-650 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-sm font-bold text-slate-350">No applicants yet</p>
          <p className="text-xs text-slate-500 mt-1">We will notify you immediately once a candidate submits their details.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {applicants.map((app) => (
            <div key={app._id} className="glass p-6 rounded-3xl flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center text-xs text-slate-350">
              {/* Candidate Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-extrabold text-sm text-slate-200">{app.employee?.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9px] text-slate-500 rounded font-semibold">
                    {app.resumeType === 'uploaded' ? 'Uploaded PDF' : 'MERN Compiled'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-1">{app.employeeProfile?.personalInfo?.title || 'Professional Title'}</p>
                <p className="text-[10px] text-slate-500">{app.employee?.email} • {app.employeeProfile?.personalInfo?.phone || 'No phone'} • {app.employeeProfile?.personalInfo?.location || 'No location'}</p>
                
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {app.employeeProfile?.skills?.slice(0, 5).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-950 text-slate-500 text-[10px] rounded-md font-mono">
                      {skill}
                    </span>
                  ))}
                  {app.employeeProfile?.skills?.length > 5 && (
                    <span className="text-[10px] text-slate-500 mt-0.5">+{app.employeeProfile.skills.length - 5} more</span>
                  )}
                </div>
              </div>

              {/* Cover letter summary */}
              <div className="w-full lg:w-64">
                <span className="font-bold text-[10px] text-slate-550 block mb-1 uppercase">Cover Letter Snippet</span>
                <p className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl leading-relaxed text-slate-400 text-[10.5px] line-clamp-3">
                  {app.coverLetter || 'No cover letter provided.'}
                </p>
              </div>

              {/* Status Update Form */}
              <div className="flex flex-col gap-2 w-full lg:w-56 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Status</label>
                  <select
                    value={statusMap[app._id]}
                    onChange={(e) => setStatusMap({ ...statusMap, [app._id]: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={commentMap[app._id]}
                    onChange={(e) => setCommentMap({ ...commentMap, [app._id]: e.target.value })}
                    placeholder="Leave a comment..."
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200"
                  />
                </div>
                <button
                  onClick={() => handleUpdateStatus(app._id)}
                  disabled={updatingAppId === app._id}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-lg text-[10px] transition-colors"
                >
                  {updatingAppId === app._id ? 'Updating...' : 'Update Status'}
                </button>
              </div>

              {/* View / Download Actions */}
              <div className="flex flex-row lg:flex-col gap-2.5 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
                <button
                  onClick={() => setSelectedApplicant(app.employeeProfile)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg font-semibold flex-1 text-center"
                >
                  View Profile
                </button>
                <div className="flex gap-1.5 flex-1">
                  <button
                    onClick={() => handleDownloadResume(app.employee._id, app.resumeType, app.resumeTemplate, 'pdf')}
                    className="px-2.5 py-2 bg-cnear-900/40 border border-cnear-800/30 text-cnear-450 hover:text-cnear-350 rounded-lg font-bold flex-1 text-center"
                    title="Download PDF resume"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleDownloadResume(app.employee._id, app.resumeType, app.resumeTemplate, 'docx')}
                    className="px-2.5 py-2 bg-cnear-900/40 border border-cnear-800/30 text-cnear-450 hover:text-cnear-350 rounded-lg font-bold flex-1 text-center"
                    title="Download Word docx resume"
                  >
                    Word
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CANDIDATE PROFILE MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedApplicant(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white font-bold"
            >
              Close
            </button>
            <h2 className="text-base font-extrabold text-white border-b border-slate-800 pb-2 mb-4">
              {selectedApplicant.personalInfo?.name || 'Applicant Profile'}
            </h2>
            <div className="flex flex-col gap-6 text-xs text-slate-300">
              <div>
                <span className="font-bold text-slate-400 block mb-1">Headline / Bio:</span>
                <p className="text-slate-350 italic">{selectedApplicant.personalInfo?.title || 'No Headline'}</p>
                <p className="mt-2 text-slate-350 whitespace-pre-wrap">{selectedApplicant.summary || selectedApplicant.personalInfo?.bio}</p>
              </div>

              {selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 block mb-1">Skills:</span>
                  <p className="text-slate-350">{selectedApplicant.skills.join(', ')}</p>
                </div>
              )}

              {selectedApplicant.experience && selectedApplicant.experience.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 block mb-2">Work Experience:</span>
                  <div className="flex flex-col gap-3">
                    {selectedApplicant.experience.map((exp, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                        <p className="font-bold text-slate-200">{exp.title} <span className="font-medium text-slate-500">at {exp.company}</span></p>
                        <p className="text-[10px] text-slate-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                        {exp.description && <p className="mt-1 text-slate-400">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplicant.education && selectedApplicant.education.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 block mb-2">Education:</span>
                  <div className="flex flex-col gap-3">
                    {selectedApplicant.education.map((edu, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                        <p className="font-bold text-slate-200">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-[10px] text-slate-550">{edu.school} ({edu.startDate} - {edu.endDate})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
