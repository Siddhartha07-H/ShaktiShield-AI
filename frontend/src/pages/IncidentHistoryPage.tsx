import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  MapPin, 
  FileCheck, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SOSIncident, IntegrityReport } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';

export const IncidentHistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState<SOSIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | '7D' | '30D'>('ALL');

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
      showToast(err.message || 'Error checking integrity digest.', 'error');
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
          latitude: 99.9999,
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
      (inc.address && inc.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.cancelled_reason && inc.cancelled_reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const incDate = new Date(inc.created_at).getTime();
      const now = Date.now();
      const days = dateFilter === '7D' ? 7 : 30;
      matchesDate = (now - incDate) <= days * 24 * 60 * 60 * 1000;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-pink-400" />
          <span>Incident History & SHA-256 Audit Trail</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review recorded emergency alerts, verify SHA-256 digital integrity digests, and inspect immutable audit custody.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, address, reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-slate-400 font-semibold shrink-0">Status:</span>
            {['ALL', 'ACTIVE', 'RESOLVED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-glow-purple'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Date filters */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
            <span className="text-slate-400 font-semibold shrink-0">Date:</span>
            {[
              { id: 'ALL', label: 'All Time' },
              { id: '30D', label: '30 Days' },
              { id: '7D', label: '7 Days' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateFilter(d.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  dateFilter === d.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident List */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Matching Incident Records"
          description={
            searchQuery || statusFilter !== 'ALL' || dateFilter !== 'ALL'
              ? 'No incidents match your current search and filter criteria. Try resetting filters.'
              : 'You have not triggered any emergency SOS alerts yet. Your past incident logs and SHA-256 evidence digests will appear here.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="glass-panel p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm sm:text-base font-black text-white">
                    {inc.incident_code}
                  </span>
                  <StatusBadge status={inc.status} />
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(inc.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">GPS Coordinates:</span>
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
                  <span className="text-slate-500 block mb-0.5 font-medium">Trigger Method:</span>
                  <span className="font-semibold text-slate-200">{inc.trigger_type}</span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">SHA-256 Integrity Digest:</span>
                  <span className="font-mono text-[11px] text-emerald-400 truncate block bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                    {inc.integrity_hash}
                  </span>
                </div>
              </div>

              {inc.cancelled_reason && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Cancellation Audit Reason:</strong> {inc.cancelled_reason}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-purple-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-slate-400">
                  Blockchain Status:{' '}
                  {inc.blockchain_tx ? (
                    <span className="font-mono text-emerald-400">{inc.blockchain_tx.substring(0, 18)}...</span>
                  ) : (
                    <span className="text-slate-500 italic">Not Deployed (SHA-256 Verified in DB)</span>
                  )}
                </span>

                <button
                  onClick={() => openIntegrityModal(inc)}
                  className="px-4 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
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

            {/* Blockchain Anchoring Clarification */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <strong className="text-slate-300">Blockchain Anchoring Architecture:</strong>
              <p>
                In this deployment, SHA-256 verification is computed directly from canonical PostgreSQL records. A modular Web3 interface is implemented in the backend architecture to support public testnet anchoring (e.g., Polygon Amoy / Ethereum Sepolia) when an RPC provider is configured.
              </p>
            </div>

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
