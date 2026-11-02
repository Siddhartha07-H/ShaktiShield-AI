import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  PhoneCall, 
  Loader2, 
  Lock, 
  ExternalLink,
  Volume2,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SOSIncident } from '../types';
import { Modal } from '../components/Modal';

export const EmergencySOSPage: React.FC = () => {
  const { showToast } = useToast();

  const [coords, setCoords] = useState<{ latitude: number | null; longitude: number | null; accuracy: number | null }>({
    latitude: null,
    longitude: null,
    accuracy: null,
  });
  const [geoStatus, setGeoStatus] = useState<'idle' | 'acquiring' | 'locked' | 'denied'>('idle');
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeIncident, setActiveIncident] = useState<SOSIncident | null>(null);

  // Cancel dialog
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Accidental trigger - safe');
  const [isCancelling, setIsCancelling] = useState(false);

  // Request browser geolocation on page load
  useEffect(() => {
    if ('geolocation' in navigator) {
      setGeoStatus('acquiring');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setGeoStatus('locked');
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
          setGeoStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGeoStatus('denied');
    }
  }, []);

  const handleTriggerSOS = async () => {
    setIsTriggering(true);
    try {
      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        description: 'Emergency SOS manual alert triggered by user.',
        trigger_type: 'MANUAL_BUTTON',
      };

      const res = await api.post<SOSIncident>('/api/sos', payload);
      setActiveIncident(res);
      showToast(`EMERGENCY SOS LOGGED: Incident ${res.incident_code}`, 'error');
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger SOS.', 'error');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleCancelSOS = async () => {
    if (!activeIncident) return;
    setIsCancelling(true);
    try {
      const res = await api.patch<SOSIncident>(`/api/sos/${activeIncident.id}/cancel`, {
        reason: cancelReason,
      });
      setActiveIncident(res);
      setIsCancelModalOpen(false);
      showToast('Emergency SOS alert cancelled. Safe status recorded.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel incident.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span>SHAKTISHIELD RAPID EMERGENCY CONSOLE</span>
        </div>
        <p className="text-xs text-slate-300">
          In life-threatening danger, dial <strong className="text-white">112</strong> on your phone immediately.
        </p>
      </div>

      {/* Main SOS Trigger Hub */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-red-500/30 text-center space-y-8 relative overflow-hidden shadow-glow-crimson">
        {/* Geolocation status indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs">
          <MapPin
            className={`w-4 h-4 ${
              geoStatus === 'locked' ? 'text-emerald-400' : geoStatus === 'acquiring' ? 'text-amber-400 animate-spin' : 'text-slate-400'
            }`}
          />
          {geoStatus === 'locked' ? (
            <span className="text-emerald-300 font-medium">
              GPS Locked: {coords.latitude?.toFixed(4)}, {coords.longitude?.toFixed(4)} (±{Math.round(coords.accuracy || 0)}m)
            </span>
          ) : geoStatus === 'acquiring' ? (
            <span className="text-amber-300">Acquiring high-precision GPS satellites...</span>
          ) : (
            <span className="text-slate-400">GPS unavailable or denied (Will record timestamp only)</span>
          )}
        </div>

        {/* The Massive Pulsating Trigger Button */}
        <div>
          {activeIncident && activeIncident.status === 'ACTIVE' ? (
            <div className="space-y-4">
              <div className="w-52 h-52 sm:w-64 sm:h-64 mx-auto rounded-full bg-red-600/30 border-8 border-red-500 animate-pulse flex flex-col items-center justify-center p-4">
                <AlertTriangle className="w-16 h-16 text-red-400 mb-2 animate-bounce" />
                <span className="text-xl sm:text-2xl font-black text-white">ALERT ACTIVE</span>
                <span className="text-xs font-mono text-red-200 mt-1">{activeIncident.incident_code}</span>
              </div>
              <p className="text-sm font-semibold text-red-300">
                Emergency protocol initiated. Cryptographic evidence logged in database.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  I Am Safe (Cancel Alert)
                </button>
                <a
                  href="tel:112"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call 112 Dispatch</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={handleTriggerSOS}
                disabled={isTriggering}
                className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white shadow-glow-crimson transition-all duration-300 transform hover:scale-105 active:scale-95 border-8 border-red-400/50 group mx-auto flex flex-col items-center justify-center p-4 relative"
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="w-16 h-16 animate-spin text-white mb-2" />
                    <span className="text-lg font-bold">TRIGGERING...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-16 h-16 text-white mb-2 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="text-3xl sm:text-4xl font-black tracking-wider">TAP SOS</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-red-100 mt-1">
                      Immediate Alert
                    </span>
                  </>
                )}
              </button>

              <div className="max-w-md mx-auto space-y-1">
                <p className="text-xs text-slate-300 font-medium">
                  Triggering records your exact coordinates, generates a SHA-256 audit digest, and alerts trusted guardians.
                </p>
                <span className="text-[11px] text-slate-500 block">
                  (Demo Mode: Event logged securely in system without automated telecom dispatch)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Active Incident Details Card */}
        {activeIncident && (
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Cryptographic Incident Stamp</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeIncident.status === 'ACTIVE'
                    ? 'bg-red-950 text-red-300 border border-red-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Status: {activeIncident.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-400 block">Incident Code:</span>
                <span className="font-mono text-purple-300 font-bold">{activeIncident.incident_code}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Recorded Timestamp:</span>
                <span>{new Date(activeIncident.created_at).toLocaleString()}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">SHA-256 Record Integrity Hash:</span>
                <span className="font-mono text-[11px] text-emerald-400 break-all select-all">
                  {activeIncident.integrity_hash}
                </span>
              </div>
              {activeIncident.blockchain_tx && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block">Blockchain Anchor Receipt:</span>
                  <span className="font-mono text-[11px] text-indigo-400 break-all">
                    {activeIncident.blockchain_tx}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Immediate Emergency Action Checklist */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-4 text-xs">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-purple-400" />
          <span>Immediate Danger Checklist</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
            <span className="font-bold text-red-400 shrink-0">1.</span>
            <span>Dial 112 on speakerphone immediately if being actively pursued.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
            <span className="font-bold text-purple-400 shrink-0">2.</span>
            <span>Move promptly into any lit commercial shop, fuel station, or hotel lobby.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
            <span className="font-bold text-purple-400 shrink-0">3.</span>
            <span>Trigger ShaktiShield SOS to lock your coordinates and time record.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
            <span className="font-bold text-purple-400 shrink-0">4.</span>
            <span>Make audible phone calls or attract civilian attention without hesitation.</span>
          </div>
        </div>
      </div>

      {/* Cancel Alert Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Emergency Alert"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Please confirm that you are safe. A cancellation note will be cryptographically updated in the incident log for record transparency.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reason for Cancellation</label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Accidental click / Safe with family"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Back
            </button>
            <button
              onClick={handleCancelSOS}
              disabled={isCancelling}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5"
            >
              {isCancelling ? 'Updating Hash...' : 'Confirm I Am Safe'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
