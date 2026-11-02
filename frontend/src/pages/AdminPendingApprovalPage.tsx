import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, CheckCircle, RefreshCw, LogOut, Building2, User, FileBadge, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminPendingApprovalPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = async () => {
    setIsChecking(true);
    await refreshUser();
    setIsChecking(false);
    if (user?.role === 'admin' && user?.approval_status === 'APPROVED') {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/40 shadow-2xl relative z-10 text-center">
        
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-950/60 border border-amber-500/50 p-1 mx-auto mb-6 flex items-center justify-center shadow-lg">
          <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Pending Authorization Review</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Administrator Application Submitted
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
          Your credentials have been securely registered with ShaktiShield AI compliance. Administrative privileges remain locked until manual review and sign-off by a platform supervisor.
        </p>

        {/* Applicant Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-left space-y-2.5 mb-8 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              Applicant Name:
            </span>
            <span className="font-semibold text-white">{user?.full_name || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              Official Email:
            </span>
            <span className="font-mono text-slate-200">{user?.email || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Organization:
            </span>
            <span className="font-semibold text-amber-200">{user?.organization_name || 'Government / Emergency Agency'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FileBadge className="w-3.5 h-3.5 text-amber-400" />
              Authorization Ref:
            </span>
            <span className="font-mono text-amber-300 font-bold">{user?.authorization_reference || 'PENDING'}</span>
          </div>
        </div>

        {/* Verification Workflow Progress */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-purple-500/20 text-left mb-8 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-2">
            Verification Protocol Stages:
          </div>

          <div className="flex items-start gap-2.5 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <span className="font-semibold">Step 1: Invitation Token Cryptographically Validated</span>
              <p className="text-[11px] text-slate-400">Single-use token consumed and attached to applicant ID.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-amber-300">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400 animate-spin" />
            <div>
              <span className="font-semibold">Step 2: Department Authorization Review</span>
              <p className="text-[11px] text-slate-400">Chief Security Officer verifies government agency documentation.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-500">
            <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Step 3: Administrative Access Provisioning</span>
              <p className="text-[11px] text-slate-500">Upon approval, access to telemetry, dispatch, and triage is enabled.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isChecking}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-purple transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check Approval Status</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
