import React, { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LocationSession } from '../types';

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
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

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
    }, 12000); // ping every 12 seconds

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
    } catch (err: any) {
      showToast(err.message || 'Error stopping session.', 'error');
    } finally {
      setIsStopping(false);
    }
  };

  const copyShareLink = () => {
    if (!activeSession) return;
    const shareUrl = `${window.location.origin}/location?session=${activeSession.session_code}`;
    navigator.clipboard.writeText(shareUrl);
    setHasCopied(true);
    showToast('Shareable live tracking link copied to clipboard!', 'success');
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <MapPin className="w-7 h-7 text-indigo-400" />
          <span>Live Location Sharing</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Share your real-time GPS coordinates with trusted guardians during your journey.
        </p>
      </div>

      {/* Main Console */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-indigo-500/30 space-y-8 relative overflow-hidden">
        {/* GPS Sensor Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
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
              <span className="text-slate-200">
                GPS Lat: <strong className="text-white">{coords.latitude?.toFixed(4)}</strong>, Long:{' '}
                <strong className="text-white">{coords.longitude?.toFixed(4)}</strong> (Accuracy: ±
                {Math.round(coords.accuracy || 0)}m)
              </span>
            ) : geoState === 'acquiring' ? (
              <span className="text-amber-300">Searching for high-precision GPS lock...</span>
            ) : (
              <span className="text-red-300">GPS access denied. Please permit browser location.</span>
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
                </div>
                <div className="text-base font-mono font-black text-white">{activeSession.session_code}</div>
              </div>

              <button
                onClick={handleStopSession}
                disabled={isStopping}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow-crimson transition-all disabled:opacity-50"
              >
                <StopCircle className="w-4 h-4" />
                <span>{isStopping ? 'Terminating...' : 'Stop Location Sharing'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-300 font-medium">Shareable Live Tracking Link:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/location?session=${activeSession.session_code}`}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs select-all"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs">
              <a
                href={activeSession.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 hover:text-white font-semibold transition-colors"
              >
                <span>View Coordinates on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Auto-expires: {new Date(activeSession.expires_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Start Session Form */
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Select Sharing Duration (Auto-Expiration)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-3 rounded-xl font-bold border transition-all ${
                      duration === mins
                        ? 'bg-purple-600 border-purple-400 text-white shadow-glow-purple'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60} Hour${mins > 60 ? 's' : ''}` : `${mins} Minutes`}
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
                  <span>Start Live Location Session ({duration} Mins)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Privacy Note */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            <strong>User-Controlled Privacy:</strong> Coordinates are broadcast solely during an active session and automatically cease updating once the session expires or is terminated. We do not maintain unprompted background location history.
          </span>
        </div>
      </div>
    </div>
  );
};
