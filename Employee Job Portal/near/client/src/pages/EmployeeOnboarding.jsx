import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeOnboarding() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('choice'); // choice, upload, review
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Draft profile information returned from backend parser
  const [draftProfile, setDraftProfile] = useState(null);

  // Flow 1: Fill Manually
  const handleManualOnboarding = async () => {
    setLoading(true);
    try {
      // Mark as onboarded with empty profile fields (user edits later)
      await api.put('/profile', { isOnboarded: true });
      await refreshUser();
      navigate('/employee/profile');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to initialize profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Flow 2: Resume PDF Upload
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setErrorMsg('');
    } else {
      setErrorMsg('Please select a valid PDF file.');
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a PDF file first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/profile/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDraftProfile(res.data.data);
      setStep('review');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to upload and parse resume. Please fill profile manually.');
    } finally {
      setLoading(false);
    }
  };

  // Review Draft Form Changes
  const handlePersonalInfoChange = (field, val) => {
    setDraftProfile(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: val }
    }));
  };

  const handleSocialsChange = (field, val) => {
    setDraftProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: val }
    }));
  };

  const handleSkillsChange = (val) => {
    setDraftProfile(prev => ({
      ...prev,
      skills: val.split(',').map(s => s.trim())
    }));
  };

  const handleEducationChange = (index, field, val) => {
    setDraftProfile(prev => {
      const updatedEdu = [...(prev.education || [])];
      updatedEdu[index] = { ...updatedEdu[index], [field]: val };
      return { ...prev, education: updatedEdu };
    });
  };

  const handleExperienceChange = (index, field, val) => {
    setDraftProfile(prev => {
      const updatedExp = [...(prev.experience || [])];
      updatedExp[index] = { ...updatedExp[index], [field]: val };
      return { ...prev, experience: updatedExp };
    });
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // Send draft data to PUT /profile and mark as onboarded
      await api.put('/profile', {
        ...draftProfile,
        isOnboarded: true
      });
      await refreshUser();
      navigate('/employee/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save profile details. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] px-4 py-12 max-w-4xl mx-auto flex flex-col justify-center">
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-2xl flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: CHOICE SCREEN */}
      {step === 'choice' && (
        <div className="text-center relative">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            How would you like to create your Cnear profile?
          </h1>
          <p className="text-sm text-slate-400 mb-10 max-w-md mx-auto">
            Choose an onboarding path to get started. You can edit all details at any time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Form Card */}
            <div className="p-8 rounded-3xl glass hover:border-cnear-500/40 hover:bg-slate-800/20 text-center flex flex-col justify-between items-center transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-cnear-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Fill Profile Manually</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Set up your portfolio sections step-by-step. Best if you don't have a structured resume PDF ready.
                </p>
              </div>
              <button
                onClick={handleManualOnboarding}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Fill Profile Manually
              </button>
            </div>

            {/* Resume Parser Card */}
            <div className="p-8 rounded-3xl glass hover:border-cnear-500/40 hover:bg-slate-800/20 text-center flex flex-col justify-between items-center transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-cnear-950/60 border border-cnear-900 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-cnear-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Upload Existing Resume</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Upload a PDF resume. Cnear parses information (education, skills, jobs) to pre-fill your profile in seconds.
                </p>
              </div>
              <button
                onClick={() => setStep('upload')}
                className="px-5 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cnear-500/25 transition-all glow-btn"
              >
                Upload Existing Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: UPLOAD RESUME */}
      {step === 'upload' && (
        <div className="glass p-8 rounded-3xl max-w-md mx-auto w-full text-center">
          <h2 className="text-xl font-bold text-white mb-2">Upload Resume PDF</h2>
          <p className="text-xs text-slate-400 mb-6">Attach your resume file (under 5MB) to extract details.</p>

          <form onSubmit={handleUploadResume} className="flex flex-col gap-6">
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 hover:border-cnear-500/50 transition-colors bg-slate-900/10 cursor-pointer relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <svg className="w-10 h-10 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs text-slate-300 font-semibold block">
                {file ? file.name : 'Select or drop resume PDF'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Only .pdf files are accepted</span>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-5 py-2 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5"
              >
                {loading ? 'Parsing PDF...' : 'Extract Resume'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: REVIEW EXTRACTED DETAILS */}
      {step === 'review' && draftProfile && (
        <div className="glass p-8 rounded-3xl w-full">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Review & Edit Resume Draft</h2>
              <p className="text-xs text-slate-400 mt-0.5">Please review the parsed details before final confirmation.</p>
            </div>
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              {loading ? 'Saving details...' : 'Confirm & Save Profile'}
            </button>
          </div>

          <div className="flex flex-col gap-6 text-xs">
            {/* Personal Details */}
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <h3 className="text-sm font-bold text-cnear-400 mb-3 border-b border-slate-800 pb-1">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={draftProfile.personalInfo.name || ''}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200"
                    placeholder="Missing - enter name"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={draftProfile.personalInfo.email || ''}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={draftProfile.personalInfo.phone || ''}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200"
                    placeholder="Missing - enter phone"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Current Location</label>
                  <input
                    type="text"
                    value={draftProfile.personalInfo.location || ''}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200"
                    placeholder="Missing - enter location (e.g. San Francisco, CA)"
                  />
                </div>
              </div>
            </div>

            {/* Socials & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Links */}
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-cnear-400 mb-3 border-b border-slate-800 pb-1">Social Links</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={draftProfile.socialLinks.linkedin || ''}
                      onChange={(e) => handleSocialsChange('linkedin', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">GitHub Profile</label>
                    <input
                      type="text"
                      value={draftProfile.socialLinks.github || ''}
                      onChange={(e) => handleSocialsChange('github', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200"
                      placeholder="github.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-cnear-400 mb-3 border-b border-slate-800 pb-1">Skills (comma-separated)</h3>
                <textarea
                  rows="5"
                  value={draftProfile.skills?.join(', ') || ''}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 font-mono text-[10px]"
                  placeholder="React, Node.js, Express, MongoDB..."
                />
              </div>
            </div>

            {/* Education History */}
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <h3 className="text-sm font-bold text-cnear-400 mb-3 border-b border-slate-800 pb-1">Education History</h3>
              <div className="flex flex-col gap-4">
                {(draftProfile.education || []).map((edu, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.school || ''}
                        onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy || ''}
                        onChange={(e) => handleEducationChange(idx, 'fieldOfStudy', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.startDate || ''}
                          onChange={(e) => handleEducationChange(idx, 'startDate', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">End Year</label>
                        <input
                          type="text"
                          value={edu.endDate || ''}
                          onChange={(e) => handleEducationChange(idx, 'endDate', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!draftProfile.education || draftProfile.education.length === 0) && (
                  <span className="text-slate-500 italic text-[11px]">No education details detected.</span>
                )}
              </div>
            </div>

            {/* Experience History */}
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-1">
                <h3 className="text-sm font-bold text-cnear-400">Work Experience</h3>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={draftProfile.isFresher === true}
                    onChange={(e) => setDraftProfile(prev => ({ ...prev, isFresher: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded text-cnear-500 bg-slate-900 border-slate-800"
                  />
                  <span>Fresher / No Experience</span>
                </label>
              </div>
              
              {!draftProfile.isFresher && (
                <div className="flex flex-col gap-4">
                  {(draftProfile.experience || []).map((exp, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title || ''}
                          onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate || ''}
                            onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">End Date</label>
                          <input
                            type="text"
                            value={exp.endDate || ''}
                            onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!draftProfile.experience || draftProfile.experience.length === 0) && (
                    <span className="text-slate-505 italic text-[11px]">No work experience detected. Mark "Fresher" if you are starting.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 rounded-lg transition-colors"
            >
              Re-upload PDF
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-cnear-500/25"
            >
              Confirm & Save Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
