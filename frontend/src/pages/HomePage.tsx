import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Lock, 
  Cpu, 
  Sparkles, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  Flame,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/RiskBadge';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [quickRiskScenario, setQuickRiskScenario] = useState<'alley' | 'transit' | 'mall'>('alley');

  const riskScenarios = {
    alley: {
      location: 'Deserted Alley, 11:30 PM',
      riskLevel: 'CRITICAL' as const,
      score: 85,
      hazard: 'Isolated corridor, zero streetlights, lack of bystander support.',
      recommendation: 'Arm SOS immediately, exit toward illuminated main road, call 112 if followed.',
    },
    transit: {
      location: 'Metro Station Bus Stand, 9:00 PM',
      riskLevel: 'MODERATE' as const,
      score: 45,
      hazard: 'Sparse commuters, waiting for next shuttle.',
      recommendation: 'Share live GPS route with primary contact, keep phone in hand.',
    },
    mall: {
      location: 'Commercial Retail Center, 4:00 PM',
      riskLevel: 'LOW' as const,
      score: 15,
      hazard: 'Well-monitored zone with high civilian density.',
      recommendation: 'Maintain general awareness, verify taxi license before boarding.',
    },
  };

  const currentScenario = riskScenarios[quickRiskScenario];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Next-Generation Women's Safety Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Defend. Protect.{' '}
                <span className="gradient-text-purple block mt-1">SHAKTISHIELD AI</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                An intelligent, rapid-response women's safety ecosystem. Instantly trigger emergency SOS alerts with high-precision GPS coordinates, cryptographically hash incident logs for tamper-proof records, and receive real-time situational AI hazard assessment.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/sos"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-glow-crimson hover:scale-105 active:scale-95 transition-all"
                >
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span>Launch Emergency SOS</span>
                </Link>

                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-panel glass-panel-hover text-white font-semibold text-base border border-purple-500/30"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-panel glass-panel-hover text-white font-semibold text-base border border-purple-500/30"
                  >
                    <span>Create Safe Account</span>
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </Link>
                )}
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-purple-500/20 grid grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">SHA-256</div>
                  <div className="text-xs text-slate-400">Tamper-Proof Audit Hashing</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-400">&lt; 1 Second</div>
                  <div className="text-xs text-slate-400">One-Tap SOS Trigger</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">112 Ready</div>
                  <div className="text-xs text-slate-400">India Emergency Directory</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive SOS Visualizer Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Emergency Console Live
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    DEMO ENVIRONMENT
                  </span>
                </div>

                {/* Central SOS Trigger Button Preview */}
                <div className="py-4 text-center space-y-4">
                  <Link
                    to="/sos"
                    className="inline-flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-red-500 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white shadow-glow-crimson transition-all duration-300 transform hover:scale-105 active:scale-95 border-4 border-red-400/50 group mx-auto"
                  >
                    <AlertTriangle className="w-12 h-12 text-white mb-1 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="text-2xl sm:text-3xl font-black tracking-wider">SOS</span>
                    <span className="text-[11px] uppercase tracking-widest text-red-200 font-semibold mt-0.5">
                      Tap To Activate
                    </span>
                  </Link>

                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Captures precise GPS latitude & longitude, logs SHA-256 cryptographic proof, and alerts trusted emergency contacts.
                  </p>
                </div>

                {/* Quick Info Grid */}
                <div className="mt-6 pt-4 border-t border-purple-500/20 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">National Helpline:</span>
                    <a href="tel:112" className="text-red-400 font-bold flex items-center gap-1 hover:underline">
                      <PhoneCall className="w-3 h-3" /> Dial 112 (Police)
                    </a>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Women Helpline:</span>
                    <a href="tel:1091" className="text-purple-300 font-bold flex items-center gap-1 hover:underline">
                      <PhoneCall className="w-3 h-3" /> Dial 1091 (All India)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Situational Risk Assessment Interactive Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-purple-500/30 relative">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Situational Safety Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Instant Environmental Risk Intelligence
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Our rule-based heuristic AI evaluates lighting levels, time of day, pedestrian density, and reported distress to provide immediate tactical guidance. Test sample scenarios below:
            </p>
          </div>

          {/* Scenario Selector Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setQuickRiskScenario('alley')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                quickRiskScenario === 'alley'
                  ? 'bg-red-600 text-white shadow-glow-crimson'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Scenario A: Deserted Alley (Late Night)
            </button>
            <button
              onClick={() => setQuickRiskScenario('transit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                quickRiskScenario === 'transit'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Scenario B: Transit Bus Stand (Dusk)
            </button>
            <button
              onClick={() => setQuickRiskScenario('mall')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                quickRiskScenario === 'mall'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Scenario C: Shopping Center (Daylight)
            </button>
          </div>

          {/* Scenario Result Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-purple-500/20 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium">ENVIRONMENTAL CONTEXT</span>
              <p className="text-base font-bold text-white">{currentScenario.location}</p>
              <div className="pt-1">
                <RiskBadge level={currentScenario.riskLevel} score={currentScenario.score} />
              </div>
            </div>

            <div className="space-y-1 md:border-l md:border-slate-800 md:pl-6">
              <span className="text-xs text-slate-400 font-medium">IDENTIFIED HAZARDS</span>
              <p className="text-xs text-slate-200 leading-relaxed">{currentScenario.hazard}</p>
            </div>

            <div className="space-y-1 md:border-l md:border-slate-800 md:pl-6">
              <span className="text-xs text-purple-400 font-medium">ACTIONABLE GUIDANCE</span>
              <p className="text-xs text-slate-200 leading-relaxed">{currentScenario.recommendation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Full-Spectrum Women's Protection</h2>
          <p className="text-slate-400 text-sm">
            Designed for real-world reliability, mathematical data integrity, and uncompromising user privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-950/70 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">One-Tap Emergency SOS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant activation capturing device geolocation, generating an immutable record, and triggering emergency protocols with zero friction.
            </p>
            <Link to="/sos" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              Test SOS Module <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Trusted Guardian Circle</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage verified emergency contacts with designated primary responders, direct telephonic dials, and immediate alert routing.
            </p>
            <Link to="/contacts" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              Configure Contacts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Live Route Sharing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate time-limited, user-controlled live GPS tracking links shareable via WhatsApp or SMS, expiring automatically upon safe arrival.
            </p>
            <Link to="/location" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              Start Live Tracking <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-pink-950/70 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Data Integrity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every SOS event is stamped with a SHA-256 cryptographic digest, ensuring tamper-free incident evidence suitable for formal legal review.
            </p>
            <Link to="/history" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              View Hash Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Quick-Dial CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-red-950 via-purple-950 to-slate-950 border border-red-500/30 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-glow-crimson">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">IMMEDIATE POLICE AID</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              National Emergency Response Service: 112
            </h2>
            <p className="text-sm text-slate-300">
              ShaktiShield AI connects you instantly to India's unified 112 emergency response portal for immediate police, fire, or ambulance dispatch.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="tel:112"
              className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-2xl transition-all"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call 112 Now</span>
            </a>
            <Link
              to="/resources"
              className="px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-purple-300 font-bold text-base border border-purple-500/30 transition-all"
            >
              All Safety Helplines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
