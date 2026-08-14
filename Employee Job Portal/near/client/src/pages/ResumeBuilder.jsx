import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('classic'); // classic, modern, creative
  const [downloadingFormat, setDownloadingFormat] = useState(null); // 'docx' or 'pdf' or null

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      setProfile(res.data);

      // Lock resume builder if profile not complete
      const completion = res.data.completionDetails?.percentage ?? res.data.profileCompletion ?? 0;
      if (completion < 100) {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    try {
      const res = await api.get(`/resume/download/${selectedTemplate}/${format}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `cnear_resume_${selectedTemplate}_${Date.now()}.${format}`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      alert('Failed to generate resume. Please verify profile details.');
    } finally {
      setDownloadingFormat(null);
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

  const { personalInfo = {}, socialLinks = {}, summary = '', education = [], experience = [], skills = [], projects = [], certifications = [], achievements = [] } = profile;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Resume Generator</h1>
          <p className="text-xs text-slate-400 mt-1">Select a layout format and download your resume. Information compiles from MongoDB profile automatically.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDownload('docx')}
            disabled={downloadingFormat !== null}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            {downloadingFormat === 'docx' ? 'Compiling Word...' : 'Download Word (.docx)'}
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat !== null}
            className="px-5 py-2.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-cnear-500/25 glow-btn"
          >
            {downloadingFormat === 'pdf' ? 'Generating PDF...' : 'Download PDF (.pdf)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* TEMPLATE PICKER */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Templates:</span>
          
          <button
            onClick={() => setSelectedTemplate('classic')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedTemplate === 'classic'
                ? 'border-cnear-500 bg-cnear-950/20 text-white'
                : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700/60'
            }`}
          >
            <p className="text-xs font-bold">Classic / ATS-Friendly</p>
            <p className="text-[10px] mt-1 text-slate-400">Single column layout with simple horizontal segment rulers. Best for general applications.</p>
          </button>

          <button
            onClick={() => setSelectedTemplate('modern')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedTemplate === 'modern'
                ? 'border-cnear-500 bg-cnear-950/20 text-white'
                : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700/60'
            }`}
          >
            <p className="text-xs font-bold">Modern Sidebar Column</p>
            <p className="text-[10px] mt-1 text-slate-400">Split structure featuring a dark left sidebar detailing contact/skills and experience summary on the right.</p>
          </button>

          <button
            onClick={() => setSelectedTemplate('creative')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedTemplate === 'creative'
                ? 'border-cnear-500 bg-cnear-950/20 text-white'
                : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700/60'
            }`}
          >
            <p className="text-xs font-bold">Creative Teal Accents</p>
            <p className="text-[10px] mt-1 text-slate-400">Centered clean banner layouts introducing highlights with customized teal headers and borders.</p>
          </button>
        </div>

        {/* LIVE SIMULATED PREVIEW PANEL */}
        <div className="lg:col-span-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-4">Resume Preview:</span>
          
          <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-12 min-h-[750px] shadow-2xl relative overflow-hidden text-[11px] text-slate-800 selection:bg-teal-500/20 select-none">
            {/* Template: CLASSIC */}
            {selectedTemplate === 'classic' && (
              <div className="text-slate-950 bg-white p-8 border border-slate-200 font-sans shadow-lg min-h-[700px]">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">{personalInfo.name || 'Full Name'}</h2>
                  <p className="text-xs text-slate-500 italic mt-0.5">{personalInfo.title}</p>
                  <p className="text-[9px] text-slate-500 mt-2 flex flex-wrap justify-center gap-1.5">
                    <span>{personalInfo.email}</span> • <span>{personalInfo.phone}</span> • <span>{personalInfo.location}</span>
                    {socialLinks.linkedin && <> • <span className="underline">{socialLinks.linkedin}</span></>}
                    {socialLinks.github && <> • <span className="underline">{socialLinks.github}</span></>}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-900 uppercase text-[10px]">Summary</h3>
                  <p className="mt-2 text-slate-700 text-justify leading-relaxed">{summary || personalInfo.bio}</p>
                </div>

                {experience.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-900 uppercase text-[10px]">Work Experience</h3>
                    <div className="flex flex-col gap-3 mt-2">
                      {experience.map((exp, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{exp.title}</span>
                            <span className="font-medium text-slate-500 text-[9.5px]">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                          </div>
                          <div className="text-slate-650 italic font-medium">{exp.company} {exp.location && `• ${exp.location}`}</div>
                          <p className="mt-1 text-slate-700 leading-normal whitespace-pre-wrap">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {education.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-900 uppercase text-[10px]">Education</h3>
                    <div className="flex flex-col gap-3 mt-2">
                      {education.map((edu, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{edu.degree} in {edu.fieldOfStudy}</span>
                            <span className="font-medium text-slate-500 text-[9.5px]">{edu.startDate} - {edu.endDate}</span>
                          </div>
                          <div className="text-slate-650">{edu.school}</div>
                          {edu.description && <p className="text-[9.5px] text-slate-600 mt-1">{edu.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-900 uppercase text-[10px]">Skills</h3>
                    <p className="mt-2 text-slate-700 leading-normal">{skills.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Template: MODERN (TWO COLUMN) */}
            {selectedTemplate === 'modern' && (
              <div className="bg-white text-slate-800 shadow-lg min-h-[700px] flex border border-slate-200">
                {/* Left Sidebar */}
                <div className="w-1/3 bg-slate-900 text-slate-300 p-6 flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">{personalInfo.name || 'Full Name'}</h2>
                    <p className="text-[9.5px] text-teal-400 mt-1">{personalInfo.title}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-white uppercase border-b border-slate-800 pb-1 block mb-2">Contact</span>
                    <div className="flex flex-col gap-2 text-[9px] text-slate-300">
                      <div><span className="text-slate-500 block">Email:</span>{personalInfo.email}</div>
                      <div><span className="text-slate-500 block">Phone:</span>{personalInfo.phone}</div>
                      <div><span className="text-slate-500 block">Location:</span>{personalInfo.location}</div>
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div>
                      <span className="text-[9px] font-bold text-white uppercase border-b border-slate-800 pb-1 block mb-2">Skills</span>
                      <ul className="flex flex-col gap-1.5">
                        {skills.map((skill, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[9.5px] text-slate-250">
                            <span className="w-1 h-1 bg-teal-400 rounded-full" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Body */}
                <div className="w-2/3 p-8 flex flex-col gap-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">Professional Summary</h3>
                    <p className="text-slate-650 leading-relaxed text-justify">{summary || personalInfo.bio}</p>
                  </div>

                  {experience.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Work History</h3>
                      <div className="flex flex-col gap-4">
                        {experience.map((exp, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>{exp.title}</span>
                              <span className="text-slate-500 text-[9px]">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                            </div>
                            <p className="text-slate-500 italic text-[9.5px] font-medium">{exp.company}</p>
                            <p className="mt-1 text-slate-600 leading-normal">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {education.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Education</h3>
                      <div className="flex flex-col gap-3">
                        {education.map((edu, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>{edu.degree} in {edu.fieldOfStudy}</span>
                              <span className="text-slate-500 text-[9px]">{edu.startDate} - {edu.endDate}</span>
                            </div>
                            <p className="text-slate-500">{edu.school}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template: CREATIVE */}
            {selectedTemplate === 'creative' && (
              <div className="text-slate-900 bg-white p-8 border border-slate-200 font-sans shadow-lg min-h-[700px]">
                {/* Colored Top Block */}
                <div className="p-6 bg-teal-50 border-l-4 border-teal-500 mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-teal-800">{personalInfo.name || 'Full Name'}</h2>
                  <p className="text-xs text-teal-600 italic mt-0.5">{personalInfo.title}</p>
                  <p className="text-[9px] text-slate-500 mt-2">
                    {personalInfo.email}  |  {personalInfo.phone}  |  {personalInfo.location}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-teal-600 uppercase text-[9.5px] mb-1">About Me</h3>
                  <hr className="border-teal-100 mb-2" />
                  <p className="text-slate-700 leading-relaxed text-justify">{summary || personalInfo.bio}</p>
                </div>

                {experience.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold text-teal-600 uppercase text-[9.5px] mb-1">Professional Experience</h3>
                    <hr className="border-teal-100 mb-2" />
                    <div className="flex flex-col gap-4 mt-2">
                      {experience.map((exp, idx) => (
                        <div key={idx} className="border-l border-slate-100 pl-3 ml-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{exp.title}</span>
                            <span className="font-medium text-slate-500 text-[9px]">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                          </div>
                          <div className="text-teal-600 italic text-[9.5px]">{exp.company}</div>
                          <p className="mt-1 text-slate-700 leading-normal whitespace-pre-wrap">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {education.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold text-teal-600 uppercase text-[9.5px] mb-1">Academic Credentials</h3>
                    <hr className="border-teal-100 mb-2" />
                    <div className="flex flex-col gap-3 mt-2">
                      {education.map((edu, idx) => (
                        <div key={idx} className="border-l border-slate-100 pl-3 ml-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{edu.degree} in {edu.fieldOfStudy}</span>
                            <span className="font-medium text-slate-500 text-[9px]">{edu.startDate} - {edu.endDate}</span>
                          </div>
                          <div className="text-slate-650">{edu.school}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
