import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Loader2, KeyRound, Building2, User, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PasswordInput } from '../components/PasswordInput';

interface LoginPageProps {
  initialTab?: 'user' | 'admin';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialTab = 'user' }) => {
  const { login, adminLogin, verifyAdminMfa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'user' | 'admin'>(initialTab);

  // User form state
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = (location.state as any)?.from?.pathname;

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !userPassword) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await login({ email: userEmail, password: userPassword, remember_me: rememberMe });
    setIsSubmitting(false);

    if (res.success) {
      if (res.role === 'admin') {
        if (res.isPending) {
          navigate('/admin/pending-approval');
        } else {
          navigate(from || '/admin', { replace: true });
        }
      } else {
        navigate(from || '/dashboard', { replace: true });
      }
    } else {
      setErrorMessage(res.error || 'Invalid email or password credentials.');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setErrorMessage('Please provide your official administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await adminLogin({ email: adminEmail, password: adminPassword });
    setIsSubmitting(false);

    if (res.mfaRequired && res.mfaToken) {
      setMfaToken(res.mfaToken);
      return;
    }

    if (res.success) {
      if (res.isPending) {
        navigate('/admin/pending-approval');
      } else {
        navigate(from || '/admin', { replace: true });
      }
    } else {
      setErrorMessage(res.error || 'Administrator authentication failed. Please verify credentials.');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken || !mfaCode) {
      setErrorMessage('Please enter the 6-digit MFA verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await verifyAdminMfa(mfaToken, mfaCode);
    setIsSubmitting(false);

    if (res.success) {
      if (res.isPending) {
        navigate('/admin/pending-approval');
      } else {
        navigate(from || '/admin', { replace: true });
      }
    } else {
      setErrorMessage(res.error || 'Invalid Multi-Factor Authentication code.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 mx-auto shadow-glow-purple">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Security Portal</h1>
          <p className="text-xs text-slate-400">
            Cryptographically authenticated access to ShaktiShield AI safety networks.
          </p>
        </div>

        {/* Tab Switcher: User Sign In vs Admin Sign In */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-purple-500/20 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('user');
              setErrorMessage('');
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'user'
                ? 'bg-purple-600 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>User Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Admin Sign In</span>
          </button>
        </div>

        {/* Validation / Error banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* User Sign In Form */}
        {activeTab === 'user' && (
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Enter your account password"
                autoComplete="current-password"
                borderColor="focus:border-purple-500"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-purple-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>Remember Me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 text-center border-t border-purple-500/10 text-xs text-slate-400">
              New to ShaktiShield?{' '}
              <Link to="/register" className="text-purple-400 font-semibold hover:text-purple-300 underline">
                Create User Account
              </Link>
            </div>
          </form>
        )}

        {/* Admin Sign In Form */}
        {activeTab === 'admin' && !mfaToken && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-[11px] leading-relaxed">
              <strong>Official Personnel Portal:</strong> Requires verified credentials. All administrative authentication attempts are recorded in immutable audit logs.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Admin Email
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin.name@authority.gov.in"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter administrator password"
                autoComplete="current-password"
                borderColor="focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Official Access...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 text-center border-t border-purple-500/10 text-xs text-slate-400">
              Need authorized administrator access?{' '}
              <Link to="/admin/register" className="text-amber-400 font-semibold hover:text-amber-300 underline">
                Register as Administrator
              </Link>
            </div>
          </form>
        )}

        {/* Admin MFA Challenge Form */}
        {activeTab === 'admin' && mfaToken && (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs leading-relaxed flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Multi-Factor Authentication required for verified administrative personnel.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                6-Digit Security Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={12}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.trim())}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-white font-mono text-center tracking-widest text-lg placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !mfaCode}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying MFA Code...</span>
                </>
              ) : (
                <>
                  <span>Complete Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMfaToken(null);
                setMfaCode('');
                setErrorMessage('');
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1"
            >
              Back to Password Sign In
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
