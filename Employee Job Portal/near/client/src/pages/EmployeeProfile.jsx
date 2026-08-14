import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeProfile() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('personal'); // personal, education_experience, skills_projects, doc_pref

  // Form states matching sub-schemas
  const [personalInfo, setPersonalInfo] = useState({ name: '', email: '', phone: '', location: '', title: '', bio: '' });
  const [socialLinks, setSocialLinks] = useState({ linkedin: '', github: '', portfolio: '' });
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillsText, setSkillsText] = useState('');
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [isFresher, setIsFresher] = useState(false);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [achievementsText, setAchievementsText] = useState('');
  const [languages, setLanguages] = useState([]);
  const [languagesText, setLanguagesText] = useState('');
  const [jobPreferences, setJobPreferences] = useState({ desiredRoles: [], jobTypes: [], workSettings: [], preferredLocation: '', expectedSalary: '' });

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      const data = res.data;
      setProfile(data);

      if (data.personalInfo) setPersonalInfo(data.personalInfo);
      if (data.socialLinks) setSocialLinks(data.socialLinks);
      setSummary(data.summary || data.personalInfo?.bio || '');
      setSkills(data.skills || []);
      setSkillsText((data.skills || []).join(', '));
      setEducation(data.education || []);
      setExperience(data.experience || []);
      setIsFresher(data.isFresher || false);
      setProjects(data.projects || []);
      setCertifications(data.certifications || []);
      setAchievements(data.achievements || []);
      setAchievementsText((data.achievements || []).join(', '));
      setLanguages(data.languages || []);
      setLanguagesText((data.languages || []).join(', '));
      if (data.jobPreferences) {
        setJobPreferences({
          desiredRoles: data.jobPreferences.desiredRoles || [],
          jobTypes: data.jobPreferences.jobTypes || [],
          workSettings: data.jobPreferences.workSettings || [],
          preferredLocation: data.jobPreferences.preferredLocation || '',
          expectedSalary: data.jobPreferences.expectedSalary || ''
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formattedSkills = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const formattedAchievements = achievementsText.split(',').map(a => a.trim()).filter(a => a.length > 0);
    const formattedLanguages = languagesText.split(',').map(l => l.trim()).filter(l => l.length > 0);

    const payload = {
      personalInfo,
      socialLinks,
      summary,
      skills: formattedSkills,
      education,
      experience: isFresher ? [] : experience,
      projects,
      certifications,
      achievements: formattedAchievements,
      languages: formattedLanguages,
      jobPreferences,
      isFresher
    };

    try {
      const res = await api.put('/profile', payload);
      setProfile(res.data);
      setSuccessMsg('Profile updated successfully!');
      window.scrollTo(0, 0);
      await refreshUser();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error saving profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add sub-schemas handlers
  const addEdu = () => {
    setEducation([...education, { school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }]);
  };
  const updateEdu = (idx, field, val) => {
    setEducation(education.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };
  const removeEdu = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const addExp = () => {
    setExperience([...experience, { company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' }]);
  };
  const updateExp = (idx, field, val) => {
    setExperience(experience.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };
  const removeExp = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const addProj = () => {
    setProjects([...projects, { title: '', description: '', technologies: [], link: '' }]);
  };
  const updateProj = (idx, field, val) => {
    setProjects(projects.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };
  const updateProjTechs = (idx, val) => {
    const techs = val.split(',').map(t => t.trim()).filter(t => t.length > 0);
    setProjects(projects.map((item, i) => (i === idx ? { ...item, technologies: techs } : item)));
  };
  const removeProj = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const addCert = () => {
    setCertifications([...certifications, { name: '', issuingOrganization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' }]);
  };
  const updateCert = (idx, field, val) => {
    setCertifications(certifications.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };
  const removeCert = (idx) => {
    setCertifications(certifications.filter((_, i) => i !== idx));
  };

  const handleUploadFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') {
      setUploadFile(f);
      setErrorMsg('');
    } else {
      setErrorMsg('Only PDF resume files are supported.');
    }
  };

  const handleUploadResumeOnly = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('resume', uploadFile);

    try {
      const res = await api.post('/profile/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Save parsed details automatically
      const savedRes = await api.put('/profile', {
        ...res.data.data
      });
      setProfile(savedRes.data);
      setSuccessMsg('Resume parsed and profile updated successfully!');
      fetchProfile(); // reload fields
    } catch (err) {
      console.error(err);
      setErrorMsg('Resume upload failed.');
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Edit Profile Details</h1>
          <p className="text-xs text-slate-400 mt-1">Completion: {profile.profileCompletion}% • Review details to build your resume.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cnear-500/25 transition-all"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-2xl flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'personal' ? 'border-cnear-500 text-white font-bold' : 'border-transparent text-slate-450 hover:text-slate-350'
          }`}
        >
          Personal & Social
        </button>
        <button
          onClick={() => setActiveTab('education_experience')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'education_experience' ? 'border-cnear-500 text-white font-bold' : 'border-transparent text-slate-450 hover:text-slate-350'
          }`}
        >
          Education & Work
        </button>
        <button
          onClick={() => setActiveTab('skills_projects')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'skills_projects' ? 'border-cnear-500 text-white font-bold' : 'border-transparent text-slate-450 hover:text-slate-350'
          }`}
        >
          Skills & Projects
        </button>
        <button
          onClick={() => setActiveTab('doc_pref')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'doc_pref' ? 'border-cnear-500 text-white font-bold' : 'border-transparent text-slate-450 hover:text-slate-350'
          }`}
        >
          Resume & Preferences
        </button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8 text-xs">
        {/* TAB 1: PERSONAL & SOCIAL */}
        {activeTab === 'personal' && (
          <div className="flex flex-col gap-6">
            <div className="glass p-6 rounded-3xl">
              <h2 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-1.5">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    placeholder="City, State / Country"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 mb-1.5">Job Title / Headline</label>
                  <input
                    type="text"
                    value={personalInfo.title}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 mb-1.5">Professional Summary</label>
                  <textarea
                    rows="4"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write a professional summary describing your experience, values, and strengths."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl">
              <h2 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-1.5">Social Profiles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">LinkedIn Profile Link</label>
                  <input
                    type="text"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">GitHub Profile Link</label>
                  <input
                    type="text"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Portfolio Link</label>
                  <input
                    type="text"
                    value={socialLinks.portfolio}
                    onChange={(e) => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cnear-500/80"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDUCATION & EXPERIENCE */}
        {activeTab === 'education_experience' && (
          <div className="flex flex-col gap-6">
            {/* WORK EXPERIENCE */}
            <div className="glass p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-bold text-slate-200">Work Experience</h2>
                  <label className="flex items-center gap-1.5 text-xs text-slate-450 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFresher}
                      onChange={(e) => setIsFresher(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-cnear-500 bg-slate-900 border-slate-800"
                    />
                    <span>Fresher / No Experience</span>
                  </label>
                </div>
                {!isFresher && (
                  <button
                    type="button"
                    onClick={addExp}
                    className="px-3 py-1.5 bg-cnear-900/50 hover:bg-cnear-900 border border-cnear-750/30 text-cnear-450 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    + Add Experience
                  </button>
                )}
              </div>

              {isFresher ? (
                <p className="text-xs text-slate-400 py-4 text-center">You have selected "Fresher / No Experience". No work history fields are required.</p>
              ) : experience.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No experience items added. Click "+ Add Experience" to list roles.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl relative">
                      <button
                        type="button"
                        onClick={() => removeExp(idx)}
                        className="absolute right-4 top-4 text-red-500 hover:text-red-400 font-bold"
                        title="Remove experience"
                      >
                        Delete
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 mb-1.5">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExp(idx, 'title', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">Company Name</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExp(idx, 'company', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">Duration (e.g. Nov 2018 - Present)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => updateExp(idx, 'startDate', e.target.value)}
                              placeholder="Start Date (e.g. 2018)"
                              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            />
                            <span className="text-slate-600">to</span>
                            <input
                              type="text"
                              value={exp.endDate}
                              disabled={exp.current}
                              onChange={(e) => updateExp(idx, 'endDate', e.target.value)}
                              placeholder="End Date"
                              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 disabled:opacity-40"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExp(idx, 'current', e.target.checked)}
                            id={`exp-curr-${idx}`}
                            className="w-4 h-4 rounded text-cnear-500 bg-slate-900 border-slate-800"
                          />
                          <label htmlFor={`exp-curr-${idx}`} className="text-slate-400 cursor-pointer select-none">I currently work here</label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-slate-400 mb-1.5">Job Description</label>
                          <textarea
                            rows="3"
                            value={exp.description}
                            onChange={(e) => updateExp(idx, 'description', e.target.value)}
                            placeholder="Responsibilities and achievements in this role."
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EDUCATION */}
            <div className="glass p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-1.5">
                <h2 className="text-sm font-bold text-slate-200">Education Details</h2>
                <button
                  type="button"
                  onClick={addEdu}
                  className="px-3 py-1.5 bg-cnear-900/50 hover:bg-cnear-900 border border-cnear-750/30 text-cnear-450 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  + Add Education
                </button>
              </div>

              {education.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No education items added.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {education.map((edu, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl relative">
                      <button
                        type="button"
                        onClick={() => removeEdu(idx)}
                        className="absolute right-4 top-4 text-red-500 hover:text-red-400 font-bold"
                        title="Remove education"
                      >
                        Delete
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 mb-1.5">School / Institution</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEdu(idx, 'school', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">Degree (e.g. Bachelor of Science)</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEdu(idx, 'degree', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">Field of Study</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEdu(idx, 'fieldOfStudy', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">Academic Years (e.g. 2018 - 2022)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={edu.startDate}
                              onChange={(e) => updateEdu(idx, 'startDate', e.target.value)}
                              placeholder="Start Year"
                              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            />
                            <span className="text-slate-650">to</span>
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => updateEdu(idx, 'endDate', e.target.value)}
                              placeholder="End Year"
                              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-slate-400 mb-1.5">Description / Highlights</label>
                          <textarea
                            rows="2"
                            value={edu.description}
                            onChange={(e) => updateEdu(idx, 'description', e.target.value)}
                            placeholder="E.g. GPA: 3.8, Major accomplishments, relevant coursework."
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS & PROJECTS */}
        {activeTab === 'skills_projects' && (
          <div className="flex flex-col gap-6">
            <div className="glass p-6 rounded-3xl">
              <h2 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-1.5">Technical Skills & Achievements</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Skills (separated by commas)</label>
                  <textarea
                    rows="3"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="React, Node.js, MERN, Typescript, Tailwind CSS, API Integration, AWS"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-relaxed font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Achievements (separated by commas)</label>
                  <textarea
                    rows="2"
                    value={achievementsText}
                    onChange={(e) => setAchievementsText(e.target.value)}
                    placeholder="Winner of Hackathon 2026, Employee of the Month"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Languages Known (separated by commas)</label>
                  <input
                    type="text"
                    value={languagesText}
                    onChange={(e) => setLanguagesText(e.target.value)}
                    placeholder="English, Spanish, Mandarin"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* PROJECTS */}
            <div className="glass p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-1.5">
                <h2 className="text-sm font-bold text-slate-200">Portfolio Projects</h2>
                <button
                  type="button"
                  onClick={addProj}
                  className="px-3 py-1.5 bg-cnear-900/50 hover:bg-cnear-900 border border-cnear-750/30 text-cnear-450 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  + Add Project
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No projects added.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl relative">
                      <button
                        type="button"
                        onClick={() => removeProj(idx)}
                        className="absolute right-4 top-4 text-red-500 hover:text-red-400 font-bold"
                        title="Remove project"
                      >
                        Delete
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 mb-1.5">Project Title</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => updateProj(idx, 'title', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">Project URL / Link</label>
                          <input
                            type="text"
                            value={proj.link}
                            onChange={(e) => updateProj(idx, 'link', e.target.value)}
                            placeholder="https://github.com/..."
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-slate-400 mb-1.5">Technologies Used (separated by commas)</label>
                          <input
                            type="text"
                            value={proj.technologies?.join(', ') || ''}
                            onChange={(e) => updateProjTechs(idx, e.target.value)}
                            placeholder="React, Firebase, Tailwind"
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 font-mono text-[11px]"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-slate-400 mb-1.5">Description</label>
                          <textarea
                            rows="2"
                            value={proj.description}
                            onChange={(e) => updateProj(idx, 'description', e.target.value)}
                            placeholder="Brief details about what you built and how."
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CERTIFICATIONS */}
            <div className="glass p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-1.5">
                <h2 className="text-sm font-bold text-slate-200">Certifications & Licenses</h2>
                <button
                  type="button"
                  onClick={addCert}
                  className="px-3 py-1.5 bg-cnear-900/50 hover:bg-cnear-900 border border-cnear-750/30 text-cnear-450 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  + Add Cert
                </button>
              </div>

              {certifications.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No certifications added.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl relative">
                      <button
                        type="button"
                        onClick={() => removeCert(idx)}
                        className="absolute right-4 top-4 text-red-500 hover:text-red-400 font-bold"
                        title="Remove certification"
                      >
                        Delete
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 mb-1.5">Certificate Name</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCert(idx, 'name', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">Issuing Organization</label>
                          <input
                            type="text"
                            value={cert.issuingOrganization}
                            onChange={(e) => updateCert(idx, 'issuingOrganization', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENTS & JOB PREFERENCES */}
        {activeTab === 'doc_pref' && (
          <div className="flex flex-col gap-6">
            {/* RESUME UPLOAD */}
            <div className="glass p-6 rounded-3xl">
              <h2 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-1.5">Active Resume File</h2>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="font-semibold text-slate-250">
                    Current Resume: {profile.resumeFileName ? (
                      <span className="text-teal-400 underline font-mono text-[10.5px] ml-1">{profile.resumeFileName}</span>
                    ) : (
                      <span className="text-slate-500 italic ml-1">No file uploaded</span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-lg leading-relaxed">
                    Uploading a new resume will run the parser engine and automatically merge any discovered education, work, and skill blocks directly into your active profile fields.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleUploadFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      className="px-4 py-2.5 border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
                    >
                      {uploadFile ? uploadFile.name : 'Select PDF File'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadResumeOnly}
                    disabled={uploading || !uploadFile}
                    className="px-4 py-2.5 bg-cnear-900 border border-cnear-750 text-cnear-450 hover:text-cnear-400 font-bold rounded-xl text-xs disabled:opacity-40 transition-all"
                  >
                    {uploading ? 'Processing...' : 'Upload & Parse'}
                  </button>
                </div>
              </div>
            </div>

            {/* PREFERENCES */}
            <div className="glass p-6 rounded-3xl">
              <h2 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-1.5">Job Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Desired Role Categories (comma-separated)</label>
                  <input
                    type="text"
                    value={jobPreferences.desiredRoles?.join(', ') || ''}
                    onChange={(e) => setJobPreferences({ ...jobPreferences, desiredRoles: e.target.value.split(',').map(r => r.trim()).filter(r => r.length > 0) })}
                    placeholder="Frontend Developer, Full Stack Lead"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Preferred Location</label>
                  <input
                    type="text"
                    value={jobPreferences.preferredLocation}
                    onChange={(e) => setJobPreferences({ ...jobPreferences, preferredLocation: e.target.value })}
                    placeholder="Remote / New York, NY"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Expected Annual Salary (minimum)</label>
                  <input
                    type="text"
                    value={jobPreferences.expectedSalary}
                    onChange={(e) => setJobPreferences({ ...jobPreferences, expectedSalary: e.target.value })}
                    placeholder="e.g. $120,000"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4 border-t border-slate-800 pt-6">
          <button
            type="button"
            onClick={fetchProfile}
            className="px-5 py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel changes
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cnear-500/25 transition-all"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
