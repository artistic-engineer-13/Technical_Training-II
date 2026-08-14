import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      title: 'AI Resume Parser',
      description: 'Upload your PDF resume. We instantly read, analyze, and structure your credentials into your profile.',
      icon: (
        <svg className="w-6 h-6 text-cnear-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      title: 'ATS-Friendly Templates',
      description: 'Generate real Word docx and pixel-perfect PDF resumes on-the-fly using 3 elite professional formats.',
      icon: (
        <svg className="w-6 h-6 text-cnear-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Double-Sided Workflows',
      description: 'Connected job pipelines. Recruiter shortlists and application timelines sync instantly with email notifications.',
      icon: (
        <svg className="w-6 h-6 text-cnear-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-cnear-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-20 flex-grow flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex-1 max-w-2xl text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cnear-950 border border-cnear-500/30 text-xs font-semibold text-cnear-400 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-cnear-400 rounded-full animate-ping" />
            AI Resume Parsing & Job Application Sync
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The next generation <br />
            <span className="bg-gradient-to-r from-cnear-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              career gateway
            </span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-slate-400 leading-relaxed">
            Create an original Cnear profile from your existing resume in 30 seconds. Calculate profile strength, generate Word or PDF resumes, and apply directly to matching global vacancies.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {user ? (
              <Link
                to={user.role === 'employee' ? '/employee/dashboard' : (user.role === 'recruiter' ? '/recruiter/dashboard' : '/admin/dashboard')}
                className="px-6 py-3.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-cnear-500/25 transition-all text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3.5 bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-cnear-500/25 transition-all text-sm glow-btn"
                >
                  Create an Account
                </Link>
                <Link
                  to="/jobs"
                  className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 text-slate-200 hover:text-white font-semibold rounded-xl transition-all text-sm"
                >
                  Explore Jobs
                </Link>
              </>
            )}
          </div>

          {/* Quick stats */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-white">10k+</p>
              <p className="text-xs text-slate-500 mt-1">Active Positions</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-white">99.2%</p>
              <p className="text-xs text-slate-500 mt-1">Parser Accuracy</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-white">1.8M</p>
              <p className="text-xs text-slate-500 mt-1">Resumes Generated</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="flex-1 w-full max-w-xl flex flex-col gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl glass hover:border-cnear-500/40 hover:bg-slate-800/30 transition-all duration-300 flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-cnear-950/60 border border-cnear-750 flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-800/40 bg-slate-950/80 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Cnear Job Portal. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
