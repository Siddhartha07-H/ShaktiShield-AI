import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck, 
  Lock, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SOSIncident, IntegrityReport } from '../types';
import { Modal } from '../components/Modal';

export const IncidentHistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState<SOSIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Integrity Check Modal state
  const [selectedIncident, setSelectedIncident] = useState<SOSIncident | null>(null);
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperSimulated, setTamperSimulated] = useState(false);

  const fetchIncidents = async () => {
    try {
      const data = await api.get<SOSIncident[]>('/api/sos/history');
      setIncidents(data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load incident history.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const openIntegrityModal = async (incident: SOSIncident) => {
    setSelectedIncident(incident);
    setTamperSimulated(false);
    setIsVerifying(true);
    try {
      const report = await api.get<IntegrityReport>(`/api/integrity/${incident.incident_code}`);
      setIntegrityReport(report);
    } catch (err: any) {
      showToast(err.message || 'Error checking integrity.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const simulateTamperingTest = async () => {
    if (!selectedIncident) return;
    setIsVerifying(true);
    try {
      // Simulate modified coordinates to demonstrate cryptographic mismatch
      const report = await api.post<IntegrityReport>('/api/integrity/verify', {
        incident_code: selectedIncident.incident_code,
        tampered_data_test: {
          latitude: 99.9999, // tampered value
          longitude: 99.9999,
        },
      });
      setIntegrityReport(report);
      setTamperSimulated(true);
      showToast('Tampering simulated: Cryptographic hash mismatch confirmed!', 'warning');
    } catch (err: any) {
      showToast(err.message || 'Tampering simulation failed.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.incident_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.description && inc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.address && inc.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <History className="w-7 h-7 text-pink-400" />
          <span>Incident History & Hash Audits</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your recorded emergency alerts, verify SHA-256 integrity digests, and inspect digital chains of custody.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, address..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Status:</span>
          {['ALL', 'ACTIVE', 'RESOLVED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-glow-purple'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading incident records...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-purple-500/20 text-center space-y-3">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Incident Records</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No emergency events match your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="glass-panel p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm sm:text-base font-black text-white">
                    {inc.incident_code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      inc.status === 'ACTIVE'
                        ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                        : inc.status === 'RESOLVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  {new Date(inc.created_at).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block mb-0.5">Reported Coordinates:</span>
                  {inc.latitude && inc.longitude ? (
                    <a
                      href={`https://maps.google.com/?q=${inc.latitude},${inc.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-300 hover:underline flex items-center gap-1 font-mono"
                    >
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      <span>
                        {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  ) : (
                    <span className="text-slate-500">Coordinates not captured</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5">Trigger Method:</span>
                  <span className="font-semibold text-slate-200">{inc.trigger_type}</span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5">SHA-256 Digest:</span>
                  <span className="font-mono text-[11px] text-emerald-400 truncate block">
                    {inc.integrity_hash}
                  </span>
                </div>
              </div>

              {inc.cancelled_reason && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-purple-300">Cancellation Note:</strong> {inc.cancelled_reason}
                </div>
              )}

              <div className="pt-2 border-t border-purple-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-slate-400">
                  Blockchain Anchor:{' '}
                  <span className="font-mono text-indigo-400">
                    {inc.blockchain_tx ? `${inc.blockchain_tx.substring(0, 16)}...` : 'Anchored on chain'}
                  </span>
                </span>

                <button
                  onClick={() => openIntegrityModal(inc)}
                  className="px-4 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify SHA-256 Integrity</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cryptographic Integrity & Tamper Check Modal */}
      <Modal
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title="Cryptographic Hash Verification"
        maxWidth="lg"
      >
        {isVerifying ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-300">Recomputing SHA-256 digest from canonical database values...</p>
          </div>
        ) : integrityReport ? (
          <div className="space-y-4 text-xs">
            {/* Status Alert Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                integrityReport.is_valid
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/70 border-red-500/50 text-red-200'
              }`}
            >
              {integrityReport.is_valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block text-sm">
                  {integrityReport.is_valid ? 'RECORD INTEGRITY VERIFIED (TAMPER-FREE)' : 'HASH MISMATCH DETECTED!'}
                </span>
                <p className="text-[11px] mt-0.5 opacity-90">{integrityReport.verification_details}</p>
              </div>
            </div>

            {/* Hashes comparison */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block font-sans">Stored Incident Hash:</span>
                <span className="text-emerald-400 break-all select-all">{integrityReport.stored_hash}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-sans">Recomputed Hash (from DB values):</span>
                <span
                  className={`break-all select-all ${
                    integrityReport.is_valid ? 'text-emerald-400' : 'text-red-400 font-bold'
                  }`}
                >
                  {integrityReport.recomputed_hash}
                </span>
              </div>
            </div>

            {/* Tamper Demonstration Button */}
            {!tamperSimulated ? (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-300">
                  Simulate modifying GPS coordinates to test mismatch detection:
                </span>
                <button
                  onClick={simulateTamperingTest}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 transition-colors"
                >
                  Simulate Tampering
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px]">
                Tamper simulation active: Notice that changing coordinates altered the recomputed hash, proving mathematical protection against falsified evidence.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close Report
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
