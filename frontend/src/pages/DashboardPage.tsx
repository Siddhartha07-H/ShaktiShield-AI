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
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TrustedContact, SOSIncident, RiskAssessmentResponse } from '../types';
import { RiskBadge } from '../components/RiskBadge';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<SOSIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Risk Assessment in-dashboard state
  const [riskLocation, setRiskLocation] = useState('Isolated Metro Walkway');
  const [riskTime, setRiskTime] = useState('Late Night');
  const [riskCrowd, setRiskCrowd] = useState('Deserted');
  const [riskLighting, setRiskLighting] = useState('Dark');
  const [riskFeeling, setRiskFeeling] = useState('Uneasy');
  const [riskResult, setRiskResult] = useState<RiskAssessmentResponse | null>(null);
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactRes, incidentRes] = await Promise.all([
          api.get<TrustedContact[]>('/api/contacts'),
          api.get<SOSIncident[]>('/api/sos/history'),
        ]);
        setContacts(contactRes || []);
        setRecentIncidents((incidentRes || []).slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    } catch (err) {
      console.error('Risk assessment error:', err);
    } finally {
      setIsEvaluatingRisk(false);
    }
  };

  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Safety System Armed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome, {user?.full_name || 'Guardian'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Your emergency protocols, trusted guardian circles, and cryptographic incident ledgers are synchronized.
          </p>
          {user?.blood_type && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 pt-1">
              <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/30 text-red-300 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" /> Blood Group: {user.blood_type}
              </span>
              {user.phone && <span className="text-slate-400">Phone: {user.phone}</span>}
            </div>
          )}
        </div>

        {/* Big Quick SOS Trigger Button */}
        <div className="shrink-0 z-10 text-center">
          <Link
            to="/sos"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg shadow-glow-crimson hover:scale-105 active:scale-95 transition-all"
          >
            <AlertTriangle className="w-6 h-6 animate-bounce" />
            <span>EMERGENCY SOS</span>
          </Link>
          <span className="text-[11px] text-slate-400 block mt-1.5">One-click geolocation capture</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Link
          to="/contacts"
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-purple-500/20 block space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>TRUSTED CONTACTS</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{contacts.length}</div>
          <div className="text-[11px] text-purple-300">
            {primaryContact ? `Primary: ${primaryContact.name}` : 'No contacts added yet'}
          </div>
        </Link>

        {/* Metric 2 */}
        <Link
          to="/location"
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-purple-500/20 block space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>LIVE GPS SHARING</span>
            <MapPin className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300">Active Ready</div>
          <div className="text-[11px] text-slate-400">Time-limited session links</div>
        </Link>

        {/* Metric 3 */}
        <Link
          to="/history"
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-purple-500/20 block space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>INCIDENT LOGS</span>
            <History className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{recentIncidents.length}</div>
          <div className="text-[11px] text-pink-300">Cryptographically stamped</div>
        </Link>

        {/* Metric 4 */}
        <a
          href="tel:112"
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-red-500/30 bg-red-950/20 block space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-red-300 font-semibold">
            <span>NATIONAL DISPATCH</span>
            <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-red-400">112</div>
          <div className="text-[11px] text-slate-300 font-medium">Click to dial police directly</div>
        </a>
      </div>

      {/* Main Grid: AI Safety Assessment Tool + Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: AI Risk Evaluation Panel (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-900/50 border border-purple-500/30 text-purple-300">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Situational Risk Assessment</h2>
                <p className="text-xs text-slate-400">Analyze environment and receive situational guidance</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRunRiskAssessment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Location Context</label>
                <select
                  value={riskLocation}
                  onChange={(e) => setRiskLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="Isolated Metro Walkway">Isolated Metro Walkway</option>
                  <option value="Desolate Underpass">Desolate Underpass</option>
                  <option value="Commercial Market">Commercial Market</option>
                  <option value="Residential Street">Residential Street</option>
                  <option value="Highway Cab Ride">Highway Cab Ride</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Time of Day</label>
                <select
                  value={riskTime}
                  onChange={(e) => setRiskTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="Late Night">Late Night (11 PM - 5 AM)</option>
                  <option value="Evening / Dusk">Evening / Dusk</option>
                  <option value="Early Morning">Early Morning</option>
                  <option value="Daylight Afternoon">Daylight Afternoon</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Crowd Density</label>
                <select
                  value={riskCrowd}
                  onChange={(e) => setRiskCrowd(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="Deserted">Deserted / Empty</option>
                  <option value="Sparse">Sparse Pedestrians</option>
                  <option value="Moderate">Moderate Civilian Presence</option>
                  <option value="Crowded">Crowded</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Lighting Level</label>
                <select
                  value={riskLighting}
                  onChange={(e) => setRiskLighting(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="Dark">Pitch Dark / Streetlights Broken</option>
                  <option value="Poorly Lit">Poorly Lit / Shadows</option>
                  <option value="Moderate">Moderate Lighting</option>
                  <option value="Well-lit">Well-lit Commercial Illumination</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isEvaluatingRisk}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEvaluatingRisk ? 'Evaluating Heuristics...' : 'Compute Risk Score'}</span>
              </button>
            </div>
          </form>

          {/* Result Output */}
          {riskResult && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">AI Assessment Result:</span>
                <RiskBadge level={riskResult.risk_level} score={riskResult.risk_score} />
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-purple-300">Tactical Recommendations:</span>
                <ul className="space-y-1 text-slate-200 pl-4 list-disc">
                  {riskResult.actionable_recommendations.map((rec, rIdx) => (
                    <li key={rIdx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 italic">
                {riskResult.disclaimer}
              </div>
            </div>
          )}
        </div>

        {/* Right: Recent Incidents & Quick Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Incident Feed */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Recent Incident Records</span>
              </h3>
              <Link to="/history" className="text-xs text-purple-400 hover:underline">
                View All
              </Link>
            </div>

            {recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No emergency incidents logged. Your safety timeline is clear.
              </div>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-300">{inc.incident_code}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.status === 'ACTIVE'
                            ? 'bg-red-950 text-red-300 border border-red-500/30'
                            : inc.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>
                    <div className="text-slate-300 truncate">{inc.description || 'Emergency SOS Triggered'}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Hash: {inc.integrity_hash?.substring(0, 10)}...</span>
                      <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Helplines Box */}
          <div className="glass-panel p-6 rounded-3xl border border-red-500/20 space-y-3 bg-gradient-to-br from-red-950/20 to-slate-950/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-400" />
              <span>Direct Emergency Helpline Speed Dial</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:112"
                className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex flex-col items-center justify-center transition-colors"
              >
                <span>Police / 112</span>
                <span className="text-[10px] opacity-90">National Helpline</span>
              </a>
              <a
                href="tel:1091"
                className="p-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-100 font-bold flex flex-col items-center justify-center transition-colors"
              >
                <span>Women / 1091</span>
                <span className="text-[10px] opacity-90">All India Women</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
