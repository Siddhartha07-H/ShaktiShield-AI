import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Share2, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  StopCircle, 
  Loader2, 
  Navigation,
  MessageCircle,
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LocationSession } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';

export const LiveLocationPage: React.FC = () => {
  const { showToast } = useToast();

  const [coords, setCoords] = useState<{ latitude: number | null; longitude: number | null; accuracy: number | null }>({
    latitude: null,
    longitude: null,
    accuracy: null,
  });
  const [geoState, setGeoState] = useState<'idle' | 'acquiring' | 'ready' | 'denied'>('idle');
  const [duration, setDuration] = useState<number>(60);
  const [activeSession, setActiveSession] = useState<LocationSession | null>(null);
  const [history, setHistory] = useState<LocationSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Fetch active session and history on mount
  const loadSessionsData = useCallback(async () => {
    try {
      const [activeRes, histRes] = await Promise.allSettled([
        api.get<LocationSession | null>('/api/location/active'),
        api.get<LocationSession[]>('/api/location/history?limit=10'),
      ]);

      if (activeRes.status === 'fulfilled' && activeRes.value) {
        setActiveSession(activeRes.value);
      } else {
        setActiveSession(null);
      }

      if (histRes.status === 'fulfilled' && Array.isArray(histRes.value)) {
        setHistory(histRes.value);
      }
    } catch (e: any) {
      console.warn('Could not load location session data:', e.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadSessionsData();
  }, [loadSessionsData]);

  // Request browser geolocation
  const acquireLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoState('denied');
      return;
    }

    setGeoState('acquiring');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGeoState('ready');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGeoState('denied');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    acquireLocation();
  }, []);

  // Countdown timer for active session
  useEffect(() => {
    if (!activeSession || !activeSession.is_active) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const exp = new Date(activeSession.expires_at).getTime();
      const now = Date.now();
      const diff = exp - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setActiveSession(null);
        loadSessionsData();
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession, loadSessionsData]);

  // Periodic coordinate ping while session is active
  useEffect(() => {
    if (!activeSession || !activeSession.is_active) return;

    const interval = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = pos.coords.accuracy;
          setCoords({ latitude: lat, longitude: lng, accuracy: acc });

          // Send ping update to backend
          api
            .patch<LocationSession>(`/api/location/${activeSession.session_code}/ping`, {
              latitude: lat,
              longitude: lng,
              accuracy: acc,
            })
            .catch((e) => console.warn('Ping update warning:', e.message));
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartSession = async () => {
    if (coords.latitude === null || coords.longitude === null) {
      showToast('Acquiring your location first. Please grant GPS permission.', 'warning');
      acquireLocation();
      return;
    }

    setIsStarting(true);
    try {
      const res = await api.post<LocationSession>('/api/location/start', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        duration_minutes: duration,
      });
      setActiveSession(res);
      showToast('Live location sharing session initiated.', 'success');
      loadSessionsData();
    } catch (err: any) {
      showToast(err.message || 'Failed to start location session.', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopSession = async () => {
    if (!activeSession) return;
    setIsStopping(true);
    try {
      await api.post(`/api/location/${activeSession.session_code}/stop`);
      setActiveSession(null);
      showToast('Location sharing stopped successfully.', 'info');
      loadSessionsData();
    } catch (err: any) {
      showToast(err.message || 'Error stopping session.', 'error');
    } finally {
      setIsStopping(false);
    }
  };

  const getShareUrl = () => {
    if (!activeSession) return '';
    return `${window.location.origin}/location?session=${activeSession.session_code}`;
  };

  const copyShareLink = () => {
    const url = getShareUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    showToast('Shareable live tracking link copied to clipboard!', 'success');
    setTimeout(() => setHasCopied(false), 3000);
  };

  const shareViaWhatsApp = () => {
    const url = getShareUrl();
    if (!url) return;
    const msg = `🚨 Live Location Tracking (SHAKTISHIELD AI)\n\nI have shared my live GPS coordinates with you for safety.\nTrack my journey here: ${url}\n\nAuto-expires in ${duration} minutes.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getAccuracyBadge = () => {
    if (!coords.accuracy) return null;
    const acc = Math.round(coords.accuracy);
    if (acc <= 15) {
      return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> High Precision (±{acc}m)</span>;
    } else if (acc <= 50) {
      return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Moderate Precision (±{acc}m)</span>;
    }
    return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Low Precision (±{acc}m)</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-indigo-400" />
            <span>Live GPS Location Sharing</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Share end-to-end user-controlled GPS coordinates with trusted guardians during your journey.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSession && activeSession.is_active ? (
            <StatusBadge status="ACTIVE" label="SESSION ACTIVE" />
          ) : (
            <StatusBadge status="IDLE" label="STANDBY" />
          )}
        </div>
      </div>

      {/* Main Console */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-indigo-500/30 space-y-8 relative overflow-hidden">
        {/* GPS Sensor Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <Navigation
              className={`w-4 h-4 ${
                geoState === 'ready'
                  ? 'text-emerald-400 animate-pulse'
                  : geoState === 'acquiring'
                  ? 'text-amber-400 animate-spin'
                  : 'text-slate-500'
              }`}
            />
            {geoState === 'ready' ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-200">
                  GPS: <strong className="text-white">{coords.latitude?.toFixed(4)}° N, {coords.longitude?.toFixed(4)}° E</strong>
                </span>
                {getAccuracyBadge()}
              </div>
            ) : geoState === 'acquiring' ? (
              <span className="text-amber-300">Acquiring high-precision GPS lock...</span>
            ) : (
              <span className="text-red-300">GPS access denied. Please allow browser location permissions.</span>
            )}
          </div>

          <button
            onClick={acquireLocation}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline"
          >
            Refresh Coordinates
          </button>
        </div>

        {activeSession && activeSession.is_active ? (
          /* Active Session View */
          <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Live Session Active
                  </span>
                  {timeLeft && (
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-md">
                      ⏳ {timeLeft} remaining
                    </span>
                  )}
                </div>
                <div className="text-base font-mono font-black text-white">{activeSession.session_code}</div>
              </div>

              <button
                onClick={handleStopSession}
                disabled={isStopping}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow-crimson transition-all disabled:opacity-50"
              >
                <StopCircle className="w-4 h-4" />
                <span>{isStopping ? 'Terminating...' : 'Stop Sharing & Revoke Access'}</span>
              </button>
            </div>

            {/* Share link input and action buttons */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-300 font-medium">Shareable Live Tracking Link:</span>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs select-all"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copyShareLink}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{hasCopied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-glow-emerald"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
              <a
                href={activeSession.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 hover:text-white font-semibold transition-colors"
              >
                <span>View Real-Time on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Expires at: {new Date(activeSession.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Start Session Form */
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Select Sharing Duration (Auto-Expires After)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {[
                  { label: '15 Mins', val: 15 },
                  { label: '30 Mins', val: 30 },
                  { label: '1 Hour', val: 60 },
                  { label: '2 Hours', val: 120 },
                  { label: '4 Hours', val: 240 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setDuration(item.val)}
                    className={`py-3 rounded-xl font-bold border transition-all ${
                      duration === item.val
                        ? 'bg-purple-600 border-purple-400 text-white shadow-glow-purple'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={isStarting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initiating Encrypted Session...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Start Live Location Session ({duration >= 60 ? `${duration / 60}h` : `${duration}m`})</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Privacy Note */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            <strong>User-Controlled Location Privacy:</strong> Coordinates are broadcast exclusively while an active session is in progress and immediately stop broadcasting upon manual termination or time expiration. No unprompted background location history is ever recorded.
          </span>
        </div>
      </div>

      {/* Session History */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Recent Location Sharing Sessions</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Last 10 sessions</span>
        </div>

        {loadingHistory ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No location sessions yet"
            description="When you start a live tracking session, records of your expired sessions will be listed here."
          />
        ) : (
          <div className="divide-y divide-slate-800/60 overflow-x-auto">
            {history.map((sess) => {
              const isEnded = !sess.is_active;
              return (
                <div key={sess.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">{sess.session_code}</span>
                      <StatusBadge status={sess.is_active ? 'ACTIVE' : 'EXPIRED'} label={sess.is_active ? 'ACTIVE' : 'ENDED'} />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Created: {new Date(sess.created_at).toLocaleString()}</span>
                      <span>Expires: {new Date(sess.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">
                      {sess.latitude.toFixed(4)}, {sess.longitude.toFixed(4)}
                    </span>
                    <a
                      href={sess.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 hover:text-white font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
