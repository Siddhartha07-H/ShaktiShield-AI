import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  RefreshCw,
  Search,
  Key,
  Building2,
  Copy,
  Check,
  UserCheck,
  UserX,
  FileBadge
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { AdminMetrics, User, SOSIncident, AuditRecord, AdminInvitation } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [incidents, setIncidents] = useState<SOSIncident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incidents' | 'users' | 'pending_admins' | 'invitations' | 'audits'>('incidents');

  // Status triage modal / action state
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Invite generation state
  const [orgName, setOrgName] = useState('');
  const [expiryHours, setExpiryHours] = useState(72);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<AdminInvitation | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, incidentRes, userRes, pendingRes, inviteRes, auditRes] = await Promise.all([
        api.get<{ metrics: AdminMetrics }>('/api/admin/dashboard'),
        api.get<SOSIncident[]>('/api/admin/incidents'),
        api.get<User[]>('/api/admin/users'),
        api.get<User[]>('/api/admin/pending-admins'),
        api.get<AdminInvitation[]>('/api/admin/invitations'),
        api.get<AuditRecord[]>('/api/admin/audit-logs'),
      ]);

      setMetrics(dashRes.metrics);
      setIncidents(incidentRes || []);
      setUsers(userRes || []);
      setPendingAdmins(pendingRes || []);
      setInvitations(inviteRes || []);
      setAuditLogs(auditRes || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load administrator telemetry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (incidentId: number, newStatus: 'ACTIVE' | 'RESOLVED' | 'CANCELLED') => {
    setUpdatingId(incidentId);
    try {
      await api.patch(`/api/admin/incidents/${incidentId}/status`, {
        status: newStatus,
        note: `Status triaged to ${newStatus} by platform administrator.`,
      });
      showToast(`Incident #${incidentId} status updated to ${newStatus}.`, 'success');
      await fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Status triage failed.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveAdmin = async (userId: number) => {
    setUpdatingId(userId);
    try {
      await api.post(`/api/admin/approve-admin/${userId}`, {});
      showToast('Administrator application successfully approved.', 'success');
      await fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve administrator.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectAdmin = async (userId: number) => {
    setUpdatingId(userId);
    try {
      await api.post(`/api/admin/reject-admin/${userId}`, {
        approved: false,
        rejection_reason: 'Department credentials could not be verified.',
      });
      showToast('Administrator application rejected.', 'info');
      await fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject application.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingInvite(true);
    try {
      const res = await api.post<AdminInvitation>('/api/admin/invitations', {
        organization_name: orgName || 'Emergency Response Authority',
        expires_in_hours: expiryHours,
      });
      setGeneratedInvite(res);
      showToast('Secure single-use admin invitation generated.', 'success');
      setOrgName('');
      await fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate invitation.', 'error');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Invitation code copied to clipboard!', 'info');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Administrative Command & Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Safety Oversight</h1>
          <p className="text-sm text-slate-400">
            Real-time emergency triage, cryptographic audit verification, and institutional access management.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/30 hover:bg-slate-800 text-purple-300 text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-purple-500/20">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between mb-1">
              <span>Standard Users</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.total_users}</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
            <div className="text-amber-300/80 text-xs font-medium flex items-center justify-between mb-1">
              <span>Pending Admins</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">{pendingAdmins.length}</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-950/20">
            <div className="text-red-300/80 text-xs font-medium flex items-center justify-between mb-1">
              <span>Active SOS Incidents</span>
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-red-400">{metrics.active_incidents}</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between mb-1">
              <span>Resolved Incidents</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300">{metrics.resolved_incidents}</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-purple-500/20">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between mb-1">
              <span>Audit Records</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.total_audit_records}</div>
          </div>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-purple-500/20 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'incidents'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Incident Triage ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending_admins')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pending_admins'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Pending Admin Approvals</span>
          {pendingAdmins.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
              {pendingAdmins.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'invitations'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Admin Invitations ({invitations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audits'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Incident Triage Table */}
      {activeTab === 'incidents' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Incident Code</th>
                  <th className="py-3 px-3">Trigger Type</th>
                  <th className="py-3 px-3">Coordinates</th>
                  <th className="py-3 px-3">Integrity Digest</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white">{inc.incident_code}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                        {inc.trigger_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {inc.latitude && inc.longitude ? `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}` : 'Simulated'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {inc.integrity_hash.substring(0, 14)}...
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.status === 'ACTIVE'
                            ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                            : inc.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(inc.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {inc.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'RESOLVED')}
                          disabled={updatingId === inc.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      {inc.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'CANCELLED')}
                          disabled={updatingId === inc.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Pending Admin Approvals */}
      {activeTab === 'pending_admins' && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Pending Administrator Review Applications</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect official authorization credentials before granting administrative privileges.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              {pendingAdmins.length} Awaiting Review
            </span>
          </div>

          {pendingAdmins.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p>No administrator applications currently pending review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Applicant Name</th>
                    <th className="py-3 px-3">Official Email</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Organization</th>
                    <th className="py-3 px-3">Authorization Reference</th>
                    <th className="py-3 px-3">Submitted</th>
                    <th className="py-3 px-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {pendingAdmins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{adm.full_name}</td>
                      <td className="py-3 px-3 font-mono text-purple-300">{adm.email}</td>
                      <td className="py-3 px-3 text-slate-400">{adm.phone || 'N/A'}</td>
                      <td className="py-3 px-3 font-semibold text-amber-200">{adm.organization_name || 'N/A'}</td>
                      <td className="py-3 px-3 font-mono text-amber-400 font-bold">{adm.authorization_reference || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(adm.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleApproveAdmin(adm.id)}
                          disabled={updatingId === adm.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectAdmin(adm.id)}
                          disabled={updatingId === adm.id}
                          className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Admin Invitations Management */}
      {activeTab === 'invitations' && (
        <div className="space-y-6">
          {/* Invitation Generator Card */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-purple-400" />
              <span>Issue Single-Use Administrator Invitation</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Cryptographically hashes code using SHA-256 before database persistence. Secret code is displayed exactly once.
            </p>

            <form onSubmit={handleGenerateInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Designated Organization / Unit Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. State Disaster Response Force"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Validity Window
                </label>
                <div className="flex gap-2">
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours</option>
                    <option value={72}>72 Hours (Default)</option>
                    <option value={168}>7 Days</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isGeneratingInvite}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple whitespace-nowrap flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isGeneratingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    <span>Generate</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Generated Code Reveal Alert */}
            {generatedInvite && generatedInvite.invitation_code && (
              <div className="mt-5 p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 uppercase tracking-wider">
                    Newly Generated Secret Invitation Code:
                  </span>
                  <span className="text-[11px] text-amber-200">
                    Expires: {new Date(generatedInvite.expires_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-amber-500/50 font-mono text-base font-extrabold text-amber-400 tracking-wider">
                    {generatedInvite.invitation_code}
                  </div>
                  <button
                    onClick={() => handleCopyCode(generatedInvite.invitation_code!)}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Deliver this code securely to the designated officer. The raw code is never stored in plain text and will not be displayed again.
                </p>
              </div>
            )}
          </div>

          {/* Table of Issued Invitations */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white">Issued Invitation Tokens</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Token ID</th>
                    <th className="py-3 px-3">Organization</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Expires At</th>
                    <th className="py-3 px-3">Issued On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400">#{inv.id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{inv.organization_name || 'Emergency Authority'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.is_used
                              ? 'bg-slate-800 text-slate-400'
                              : new Date(inv.expires_at) < new Date()
                              ? 'bg-red-950 text-red-300 border border-red-500/30'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {inv.is_used ? 'CONSUMED' : new Date(inv.expires_at) < new Date() ? 'EXPIRED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(inv.expires_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Roster Table */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Approval Status</th>
                  <th className="py-3 px-3">Organization</th>
                  <th className="py-3 px-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">#{u.id}</td>
                    <td className="py-3 px-3 font-bold text-white">{u.full_name}</td>
                    <td className="py-3 px-3 text-slate-300">{u.email}</td>
                    <td className="py-3 px-3 text-slate-400">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.approval_status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : u.approval_status === 'PENDING_APPROVAL'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-red-950 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {u.approval_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{u.organization_name || 'Citizen'}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: System Audit Trail */}
      {activeTab === 'audits' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Event Action</th>
                  <th className="py-3 px-3">Details</th>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-purple-300">{log.action}</td>
                    <td className="py-3 px-3 text-slate-300 max-w-md truncate">{log.details}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {log.user_id ? `#${log.user_id}` : 'System'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {log.ip_address || 'Internal'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
