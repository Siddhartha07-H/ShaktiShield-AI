import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FileCheck,
  RotateCcw,
  Navigation,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SOSIncident } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';

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

  // Accidental protection state: 3-second countdown mode
  const [isArming, setIsArming] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Accidental trigger - user safe');
  const [isCancelling, setIsCancelling] = useState(false);

  // Acquire GPS on page mount
  const requestLocation = () => {
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
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setGeoStatus('denied');
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Handle countdown trigger
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isArming && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isArming && countdown === 0) {
      setIsArming(false);
      setCountdown(3);
      executeTrigger();
    }
    return () => clearTimeout(timer);
  }, [isArming, countdown]);

  const startCountdown = () => {
    setIsArming(true);
    setCountdown(3);
  };

  const abortCountdown = () => {
    setIsArming(false);
    setCountdown(3);
    showToast('SOS countdown cancelled. Accidental trigger prevented.', 'info');
  };

  const executeTrigger = async () => {
    setIsTriggering(true);
    try {
      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        description: 'Emergency SOS alert triggered by user.',
        trigger_type: 'MANUAL_BUTTON',
      };

      const res = await api.post<SOSIncident>('/api/sos', payload);
      setActiveIncident(res);
      showToast(`EMERGENCY SOS LOGGED: Incident ${res.incident_code}`, 'error');
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger SOS alert.', 'error');
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

  const getAccuracyBadge = (accuracy: number | null) => {
    if (accuracy === null) return null;
    if (accuracy <= 15) {
      return <span className="text-emerald-400 font-bold">High Precision (&plusmn;{accuracy.toFixed(0)}m)</span>;
    }
    if (accuracy <= 50) {
      return <span className="text-amber-400 font-bold">Moderate Precision (&plusmn;{accuracy.toFixed(0)}m)</span>;
    }
    return <span className="text-red-400 font-bold">Low Precision (&plusmn;{accuracy.toFixed(0)}m)</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Critical Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-red-950/70 border border-red-500/40 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2.5 text-red-200">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span>
            <strong>IN DANGER RIGHT NOW?</strong> Dial India Emergency Service <strong>112</strong> immediately. ShaktiShield AI supplements response with cryptographic incident logs.
          </span>
        </div>
        <a
          href="tel:112"
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5" /> Call 112
        </a>
      </div>

      {/* Main SOS Trigger Console */}
      <div className="glass-panel p-6 sm:p-12 rounded-3xl border border-red-500/30 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto space-y-3 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Emergency SOS Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Press and confirm to generate a cryptographically hashed emergency record with live GPS coordinates.
          </p>
        </div>

        {/* GPS Geolocation Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-xs text-slate-300 mb-8">
          <Navigation className={`w-3.5 h-3.5 ${geoStatus === 'locked' ? 'text-emerald-400' : 'text-amber-400 animate-spin'}`} />
          {geoStatus === 'locked' && (
            <span>GPS Locked: {coords.latitude?.toFixed(4)}, {coords.longitude?.toFixed(4)} ({getAccuracyBadge(coords.accuracy)})</span>
          )}
          {geoStatus === 'acquiring' && <span>Acquiring satellite GPS fix...</span>}
          {geoStatus === 'denied' && (
            <span className="text-amber-300">Location permission denied (Coordinates will be simulated)</span>
          )}
        </div>

        {/* The Big SOS Button */}
        <div className="py-6 flex flex-col items-center justify-center">
          {isArming ? (
            /* Countdown cancel view */
            <div className="space-y-4">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-red-600 to-rose-900 border-4 border-white flex flex-col items-center justify-center text-white shadow-glow-crimson animate-pulse mx-auto">
                <span className="text-6xl sm:text-7xl font-black">{countdown}</span>
                <span className="text-xs uppercase font-bold tracking-widest mt-1 text-red-200">
                  Arming SOS...
                </span>
              </div>
              <div>
                <button
                  onClick={abortCountdown}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Cancel / False Alarm</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Launch Button */
            <div className="space-y-4">
              <button
                type="button"
                onClick={startCountdown}
                disabled={isTriggering}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-rose-800 hover:from-red-600 hover:to-rose-900 text-white shadow-glow-crimson flex flex-col items-center justify-center gap-1 group transform hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-red-400/50 mx-auto"
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="w-12 h-12 animate-spin text-white" />
                    <span className="text-xs font-bold tracking-wider mt-2">Logging SOS...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-16 h-16 text-white group-hover:scale-110 transition-transform animate-bounce" />
                    <span className="text-3xl sm:text-4xl font-black tracking-wider">SOS</span>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-red-200">
                      Tap (3s Countdown)
                    </span>
                  </>
                )}
              </button>

              {/* Instant Trigger Bypass Option */}
              <div>
                <button
                  type="button"
                  onClick={executeTrigger}
                  disabled={isTriggering}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                >
                  Skip Countdown: Trigger Instant SOS
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Accidental Protection Notice */}
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-4 leading-relaxed">
          Accidental trigger protection active. You have 3 seconds to abort if tapped unintentionally.
        </p>
      </div>

      {/* Active Incident Details Card (If an incident was just triggered) */}
      {activeIncident && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/40 space-y-4 animate-in slide-in-from-bottom-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-red-500/20 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">ACTIVE INCIDENT RECORD:</span>
                <span className="font-mono font-black text-amber-400 text-sm">{activeIncident.incident_code}</span>
              </div>
              <span className="text-xs text-slate-400">
                Created: {new Date(activeIncident.created_at).toLocaleString()}
              </span>
            </div>
            <StatusBadge status={activeIncident.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">GPS Coordinates:</span>
              <span className="font-mono font-bold text-white">
                {activeIncident.latitude && activeIncident.longitude
                  ? `${activeIncident.latitude.toFixed(5)}, ${activeIncident.longitude.toFixed(5)}`
                  : 'Coordinates pending satellite fix'}
              </span>
              {activeIncident.accuracy && (
                <span className="text-[11px] text-slate-400 block">Accuracy: &plusmn;{activeIncident.accuracy.toFixed(1)}m</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Cryptographic SHA-256 Digest:</span>
              <span className="font-mono text-purple-300 text-[11px] break-all block">
                {activeIncident.integrity_hash}
              </span>
            </div>
          </div>

          {activeIncident.status === 'ACTIVE' && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                Cancel SOS (Mark as Safe)
              </button>

              <Link
                to="/history"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple text-center transition-all"
              >
                View Incident in History & Ledger &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Modal with Mandatory Reason */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Emergency SOS Alert"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Please provide a cancellation reason. This will be cryptographically logged to the incident audit trail:
          </p>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Cancellation Reason:</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Accidental trigger - user safe">Accidental trigger - user safe</option>
              <option value="Situation de-escalated - safely resolved">Situation de-escalated - safely resolved</option>
              <option value="Emergency resolved by family / bystander">Emergency resolved by family / bystander</option>
              <option value="Testing platform emergency functionality">Testing platform emergency functionality</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Keep SOS Active
            </button>
            <button
              onClick={handleCancelSOS}
              disabled={isCancelling}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Safe & Cancel</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
