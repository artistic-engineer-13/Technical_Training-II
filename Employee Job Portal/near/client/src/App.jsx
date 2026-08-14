import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobListing from './pages/JobListing';
import JobDetails from './pages/JobDetails';

import EmployeeOnboarding from './pages/EmployeeOnboarding';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import ResumeBuilder from './pages/ResumeBuilder';
import ApplicationsTracker from './pages/ApplicationsTracker';

import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterJobForm from './pages/RecruiterJobForm';
import RecruiterApplicants from './pages/RecruiterApplicants';
import RecruiterCompany from './pages/RecruiterCompany';

import AdminDashboard from './pages/AdminDashboard';

// Secure Route Guards
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg text-slate-100">
        <svg className="animate-spin h-8 w-8 text-cnear-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Intercept employee if not onboarded yet (unless they are visiting the onboarding route)
  if (
    user.role === 'employee' &&
    !user.profile?.isOnboarded &&
    window.location.pathname !== '/employee/onboarding'
  ) {
    return <Navigate to="/employee/onboarding" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-darkBg text-slate-205 flex flex-col justify-between">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobListing />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Employee Routes */}
              <Route
                path="/employee/onboarding"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeOnboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/profile"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/resume"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <ResumeBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/applications"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <ApplicationsTracker />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterJobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterJobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/applicants"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterApplicants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/company"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterCompany />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}
