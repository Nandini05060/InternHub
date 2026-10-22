import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { BrowseInternshipsPage } from './pages/BrowseInternshipsPage.jsx';
import { StudentDashboardPage } from './pages/StudentDashboardPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { TestCaseDashboardPage } from './pages/TestCaseDashboardPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Career Tools Suite Pages
import { ResumeBuilderPage } from './pages/ResumeBuilderPage.jsx';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage.jsx';
import { ResumeVersionsPage } from './pages/ResumeVersionsPage.jsx';
import { InternshipMatchPage } from './pages/InternshipMatchPage.jsx';
import { PlacementPrepPage } from './pages/PlacementPrepPage.jsx';
import { SkillsCertificationsPage } from './pages/SkillsCertificationsPage.jsx';
import { InterviewPracticePage } from './pages/InterviewPracticePage.jsx';
import { DocumentVaultPage } from './pages/DocumentVaultPage.jsx';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/student/dashboard'} replace />;
  }

  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/internships" element={<BrowseInternshipsPage />} />
                <Route path="/test-cases" element={<TestCaseDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/saved"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Career Tools Suite Routes */}
                <Route
                  path="/student/resume-builder"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ResumeBuilderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/resume-analyzer"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ResumeAnalyzerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/resume-versions"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ResumeVersionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/internship-match"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <InternshipMatchPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/placement-prep"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <PlacementPrepPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/skills-certifications"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <SkillsCertificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/interview-practice"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <InterviewPracticePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/document-vault"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <DocumentVaultPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />


                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
