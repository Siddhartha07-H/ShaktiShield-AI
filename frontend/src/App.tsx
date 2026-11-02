import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';

// Layout & Global Components (kept synchronous for instant initial shell)
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DemoBanner } from './components/DemoBanner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Route-Based Code Splitting via React.lazy
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminRegisterPage = lazy(() => import('./pages/AdminRegisterPage').then(m => ({ default: m.AdminRegisterPage })));
const AdminPendingApprovalPage = lazy(() => import('./pages/AdminPendingApprovalPage').then(m => ({ default: m.AdminPendingApprovalPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EmergencySOSPage = lazy(() => import('./pages/EmergencySOSPage').then(m => ({ default: m.EmergencySOSPage })));
const TrustedContactsPage = lazy(() => import('./pages/TrustedContactsPage').then(m => ({ default: m.TrustedContactsPage })));
const LiveLocationPage = lazy(() => import('./pages/LiveLocationPage').then(m => ({ default: m.LiveLocationPage })));
const IncidentHistoryPage = lazy(() => import('./pages/IncidentHistoryPage').then(m => ({ default: m.IncidentHistoryPage })));
const SafetyResourcesPage = lazy(() => import('./pages/SafetyResourcesPage').then(m => ({ default: m.SafetyResourcesPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <div className="relative flex items-center justify-center">
      <Shield className="w-8 h-8 text-rose-500 animate-pulse" />
      <Loader2 className="w-12 h-12 text-rose-500/40 animate-spin absolute" />
    </div>
    <p className="text-xs font-medium tracking-wide uppercase text-slate-400">Loading Module...</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-shield-bg text-shield-textLight">
      {/* Global Demo Alert Banner */}
      <DemoBanner />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Router with Suspense Boundary */}
      <main className="flex-1">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />
            <Route path="/admin/pending-approval" element={<AdminPendingApprovalPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/resources" element={<SafetyResourcesPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Quick SOS Trigger */}
            <Route path="/sos" element={<EmergencySOSPage />} />

            {/* Protected User Pages */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <TrustedContactsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/location"
              element={
                <ProtectedRoute>
                  <LiveLocationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <IncidentHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Dashboard */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
