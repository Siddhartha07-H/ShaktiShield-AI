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
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { AdminMetrics, User, SOSIncident, AuditRecord } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [incidents, setIncidents] = useState<SOSIncident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incidents' | 'users' | 'audits'>('incidents');

  // Status triage modal / action state
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, incidentRes, userRes, auditRes] = await Promise.all([
        api.get<{ metrics: AdminMetrics }>('/api/admin/dashboard'),
        api.get<SOSIncident[]>('/api/admin/incidents'),
        api.get<User[]>('/api/admin/users'),
        api.get<AuditRecord[]>('/api/admin/audit-logs'),
      ]);

      setMetrics(dashRes.metrics);
      setIncidents(incidentRes || []);
      setUsers(userRes || []);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>EXECUTIVE COMMAND CENTER &bull; ROLE: ADMIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Telemetry & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time platform emergency triage, user management, and compliance audit trail.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Users</span>
            <span className="text-2xl font-black text-white">{metrics.total_users}</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Total SOS</span>
            <span className="text-2xl font-black text-purple-400">{metrics.total_incidents}</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-red-500/40 bg-red-950/20 text-center">
            <span className="text-[10px] text-red-300 font-bold block uppercase">Active SOS</span>
            <span className="text-2xl font-black text-red-400 animate-pulse">{metrics.active_incidents}</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 font-bold block uppercase">Resolved</span>
            <span className="text-2xl font-black text-emerald-400">{metrics.resolved_incidents}</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Contacts</span>
            <span className="text-2xl font-black text-indigo-300">{metrics.total_contacts}</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Audits</span>
            <span className="text-2xl font-black text-pink-300">{metrics.total_audit_records}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-purple-500/20 gap-2">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'incidents'
              ? 'border-purple-500 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Platform Incidents ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-purple-500 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Roster ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'audits'
              ? 'border-purple-500 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Incidents Triage Table */}
      {activeTab === 'incidents' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Code / ID</th>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Coordinates</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Logged At</th>
                  <th className="py-3 px-3 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white">{inc.incident_code}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">User #{inc.user_id}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-purple-300">
                      {inc.latitude ? `${inc.latitude.toFixed(4)}, ${inc.longitude?.toFixed(4)}` : 'N/A'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
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
                  <th className="py-3 px-3">Blood Group</th>
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
                    <td className="py-3 px-3 text-red-300 font-semibold">{u.blood_type || 'N/A'}</td>
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

      {/* Tab 3: System Audit Trail */}
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
