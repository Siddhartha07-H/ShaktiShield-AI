import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  MapPin, 
  History, 
  PhoneCall, 
  Cpu, 
  ArrowRight, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  Bell,
  StopCircle,
  Copy,
  Check,
  CheckCheck,
  Loader2,
  Lock,
  RefreshCw,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TrustedContact, SOSIncident, RiskAssessmentResponse, LocationSession, InAppNotification } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<SOSIncident[]>([]);
  const [activeSession, setActiveSession] = useState<LocationSession | null>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Active location session state
  const [isStoppingSession, setIsStoppingSession] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Risk Assessment in-dashboard state
  const [riskLocation, setRiskLocation] = useState('Isolated Metro Walkway');
  const [riskTime, setRiskTime] = useState('Late Night');
  const [riskCrowd, setRiskCrowd] = useState('Deserted');
  const [riskLighting, setRiskLighting] = useState('Dark');
  const [riskFeeling, setRiskFeeling] = useState('Uneasy');
  const [riskResult, setRiskResult] = useState<RiskAssessmentResponse | null>(null);
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [contactRes, incidentRes, sessionRes, notifRes, unreadRes] = await Promise.all([
        api.get<TrustedContact[]>('/api/contacts').catch(() => []),
        api.get<SOSIncident[]>('/api/sos/history').catch(() => []),
        api.get<LocationSession | null>('/api/location/active').catch(() => null),
        api.get<InAppNotification[]>('/api/notifications').catch(() => []),
        api.get<{ unread_count: number }>('/api/notifications/unread-count').catch(() => ({ unread_count: 0 })),
      ]);

      setContacts(contactRes || []);
      setRecentIncidents((incidentRes || []).slice(0, 5));
      setActiveSession(sessionRes);
      setNotifications(notifRes || []);
      setUnreadCount(unreadRes?.unread_count || 0);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStopLocationSharing = async () => {
    if (!activeSession) return;
    setIsStoppingSession(true);
    try {
      await api.post(`/api/location/${activeSession.session_code}/stop`);
      setActiveSession(null);
      showToast('Live location sharing session ended.', 'info');
      await fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to stop session.', 'error');
    } finally {
      setIsStoppingSession(false);
    }
  };

  const handleCopyLocationLink = () => {
    if (!activeSession) return;
    const shareUrl = `${window.location.origin}/location?code=${activeSession.session_code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Live location link copied to clipboard.', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update notifications.', 'error');
    }
  };

  const handleRunRiskAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluatingRisk(true);
    try {
      const res = await api.post<RiskAssessmentResponse>('/api/ai/risk-assessment', {
        location_type: riskLocation,
        time_of_day: riskTime,
        crowd_density: riskCrowd,
        lighting_level: riskLighting,
        user_feeling: riskFeeling,
      });
      setRiskResult(res);
      showToast('Risk assessment calculated successfully.', 'success');
    } catch (err) {
      console.error('Risk assessment error:', err);
    } finally {
      setIsEvaluatingRisk(false);
    }
  };

  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Welcome Card & Profile Summary */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authenticated Protection Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome, {user?.full_name || 'Safety Guardian'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Your emergency protocols, trusted guardian circles, and cryptographic incident ledgers are synchronized.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-xs font-medium">
            {user?.blood_type && (
              <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500/30 text-red-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400" /> Blood Group: {user.blood_type}
              </span>
            )}
            {user?.phone && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center gap-1">
                <Phone className="w-3 h-3 text-purple-400" /> {user.phone}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono">
              Status: {user?.approval_status || 'APPROVED'}
            </span>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 z-10 w-full sm:w-auto">
          <Link
            to="/sos"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-glow-crimson hover:scale-105 active:scale-95 transition-all text-center"
          >
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>Launch Emergency SOS</span>
          </Link>

          <Link
            to="/location"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-purple-300 font-semibold text-xs border border-purple-500/30 transition-all text-center"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Live GPS Sharing</span>
          </Link>
        </div>
      </div>

      {/* 2. Live GPS Session Banner (If active) */}
      {activeSession && activeSession.is_active && (
        <div className="p-5 sm:p-6 rounded-3xl bg-indigo-950/60 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-300">
                  ACTIVE LIVE TRACKING: {activeSession.session_code}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Coordinates streaming. Expires: {new Date(activeSession.expires_at).toLocaleTimeString()}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLocationLink}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
            </button>
            <button
              onClick={handleStopLocationSharing}
              disabled={isStoppingSession}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              {isStoppingSession ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <StopCircle className="w-3.5 h-3.5" />}
              <span>Stop Sharing</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Grid: Left 2 Cols (Contacts & Incidents), Right 1 Col (Notifications & Security) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Primary Guardian Card */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Trusted Guardian Circle</h2>
              </div>
              <Link
                to="/contacts"
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <span>Manage Contacts ({contacts.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <Skeleton lines={3} />
            ) : contacts.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Trusted Contacts Added"
                description="Add family members, close friends, or colleagues to receive instant emergency SOS alerts."
                actionText="Add Primary Contact"
                onAction={() => window.location.href = '/contacts'}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contacts.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{c.name}</span>
                        {c.is_primary && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-900/80 border border-purple-500/30 text-[10px] font-bold text-purple-300">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block">{c.relationship} &bull; {c.phone}</span>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="p-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white shadow-sm transition-colors"
                      title="Quick Dial"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent SOS Incidents Card */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Recent Incident Records</h2>
              </div>
              <Link
                to="/history"
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <Skeleton lines={3} />
            ) : recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p>No recent SOS incidents recorded. Your safety shield is clear.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{inc.incident_code}</span>
                        <StatusBadge status={inc.status} size="sm" />
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Triggered on {new Date(inc.created_at).toLocaleString()} &bull; Hash: {inc.integrity_hash.substring(0, 16)}...
                      </span>
                    </div>

                    <Link
                      to="/history"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold self-start sm:self-center transition-colors"
                    >
                      Verify SHA-256
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Situational Risk Assessment Module */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-purple-500/20">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-base font-bold text-white">Tactical Risk Assessment Engine</h2>
                <p className="text-xs text-slate-400">Evaluate route hazards and receive immediate tactical safety steps.</p>
              </div>
            </div>

            <form onSubmit={handleRunRiskAssessment} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location Type</label>
                <select
                  value={riskLocation}
                  onChange={(e) => setRiskLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="Isolated Metro Walkway">Isolated Metro Walkway</option>
                  <option value="Dark Alleyway / Side Street">Dark Alleyway / Side Street</option>
                  <option value="Crowded Bus Station">Crowded Bus Station</option>
                  <option value="Taxi / Ride Share Transit">Taxi / Ride Share Transit</option>
                  <option value="Residential Colony Gate">Residential Colony Gate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Time of Day</label>
                <select
                  value={riskTime}
                  onChange={(e) => setRiskTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="Late Night (11 PM - 4 AM)">Late Night (11 PM - 4 AM)</option>
                  <option value="Evening / Dusk (6 PM - 11 PM)">Evening / Dusk (6 PM - 11 PM)</option>
                  <option value="Afternoon (12 PM - 6 PM)">Afternoon (12 PM - 6 PM)</option>
                  <option value="Morning (6 AM - 12 PM)">Morning (6 AM - 12 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lighting & Crowd</label>
                <div className="flex gap-2">
                  <select
                    value={riskLighting}
                    onChange={(e) => setRiskLighting(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="Dark / Broken Lights">Dark / Broken Lights</option>
                    <option value="Dim Lighting">Dim Lighting</option>
                    <option value="Well Lit">Well Lit</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isEvaluatingRisk}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
                  >
                    {isEvaluatingRisk ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Analyze</span>}
                  </button>
                </div>
              </div>
            </form>

            {riskResult && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">ASSESSMENT RESULT</span>
                  <RiskBadge level={riskResult.risk_level} score={riskResult.risk_score} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-purple-300">Tactical Recommendations:</span>
                  <ul className="mt-1 space-y-1 text-xs text-slate-200 list-disc list-inside">
                    {riskResult.actionable_recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section (4 cols: Notification Center & Security) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* In-App Notification Center Card */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Notification Center</h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <p>No notifications at this time.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      n.is_read
                        ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                        : 'bg-purple-950/40 border-purple-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-[11px] truncate max-w-[180px]">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Security Summary */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-purple-500/20">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Account Security Status</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Password Encryption</span>
                <span className="text-emerald-400 font-semibold font-mono">Argon2id</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role Verification</span>
                <span className="text-purple-300 font-semibold uppercase">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Privilege Elevation</span>
                <span className="text-emerald-400 font-semibold">Protected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cryptographic Ledger</span>
                <span className="text-emerald-400 font-semibold font-mono">SHA-256</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/profile"
                className="w-full block py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-semibold text-center border border-purple-500/20 transition-colors"
              >
                Edit Medical Profile
              </Link>
            </div>
          </div>

          {/* National Emergency Directory Quick Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-red-950/60 to-purple-950/60 border border-red-500/30 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
              Emergency Direct Line
            </span>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-white">112</div>
                <div className="text-[11px] text-slate-300">National Police & Emergency</div>
              </div>
              <a
                href="tel:112"
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
