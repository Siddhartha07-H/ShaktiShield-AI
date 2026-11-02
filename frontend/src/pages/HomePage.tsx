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
  FileCheck,
  ChevronDown,
  ChevronUp,
  Radio,
  Eye,
  ShieldCheck,
  Share2,
  FileText,
  HelpCircle,
  Mail,
  Send,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/RiskBadge';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [quickRiskScenario, setQuickRiskScenario] = useState<'alley' | 'transit' | 'mall'>('alley');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const riskScenarios = {
    alley: {
      location: 'Deserted Alleyway, 11:30 PM',
      riskLevel: 'CRITICAL' as const,
      score: 85,
      hazard: 'Zero streetlighting, isolated corridor, no bystander visibility.',
      recommendation: 'Arm SOS immediately, exit toward main road, call 112 if followed.',
    },
    transit: {
      location: 'Suburban Bus Stand, 9:15 PM',
      riskLevel: 'MODERATE' as const,
      score: 45,
      hazard: 'Low pedestrian density, waiting for scheduled commute.',
      recommendation: 'Share live GPS route link with primary trusted contact, keep phone in hand.',
    },
    mall: {
      location: 'Commercial Market Center, 4:30 PM',
      riskLevel: 'LOW' as const,
      score: 15,
      hazard: 'CCTV monitored zone, active commercial activity.',
      recommendation: 'Maintain baseline situational awareness, verify vehicle license before boarding.',
    },
  };

  const currentScenario = riskScenarios[quickRiskScenario];

  const faqs = [
    {
      q: 'Does ShaktiShield AI replace calling 112 in a life-threatening emergency?',
      a: 'No. ShaktiShield AI is a supplementary emergency platform and situational safety tool. In immediate, imminent physical danger, always dial 112 (India unified emergency) or local law enforcement immediately.',
    },
    {
      q: 'How does live location sharing work, and who can see my location?',
      a: 'Your location is only shared when you explicitly initiate a session. You choose the duration (e.g. 15m, 30m, 1h, 4h). A private link is generated for your trusted contacts. You can revoke and terminate the live link at any second with one tap.',
    },
    {
      q: 'What is SHA-256 incident integrity verification?',
      a: 'When an SOS alert is logged, the platform calculates a unique 64-character SHA-256 cryptographic digest binding your user ID, incident code, timestamp, status, and GPS coordinates. If anyone attempts to alter timestamps or coordinates later, the hash recalculation immediately detects the tampering, ensuring immutable audit-trail integrity.',
    },
    {
      q: 'How are trusted emergency contacts alerted?',
      a: 'Your contacts are saved in your encrypted profile. In production environments with active SMS/telecom integration, automated alerts dispatch coordinates and distress notices. Contacts are also displayed with direct phone dial buttons for instant calling.',
    },
    {
      q: 'How does administrator registration work?',
      a: 'Administrator accounts cannot be self-approved. Registration requires an official government or agency reference and a securely issued, single-use invitation code. Applications remain in PENDING_APPROVAL status until verified and manually signed off by an authorized platform administrator.',
    },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 lg:pt-20">
        {/* Ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none" />
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
                An intelligent, rapid-response women's safety ecosystem. Instantly trigger emergency SOS alerts with high-precision GPS coordinates, cryptographically hash incident logs for tamper-proof records, and access verified emergency networks.
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
                  <div className="flex items-center gap-2">
                    <Link
                      to="/register"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-base shadow-glow-purple transition-all"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="px-5 py-3.5 rounded-xl glass-panel glass-panel-hover text-slate-200 font-semibold text-base border border-purple-500/30"
                    >
                      Sign In
                    </Link>
                  </div>
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
                  <div className="text-xs text-slate-400">Tactile SOS Trigger</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">112 Ready</div>
                  <div className="text-xs text-slate-400">India Emergency Directory</div>
                </div>
              </div>
            </div>

            {/* Right Column: SOS Trigger Preview */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Emergency Console Live
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    PROTECTED
                  </span>
                </div>

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
                    Captures precise GPS coordinates, logs SHA-256 cryptographic proof, and alerts trusted emergency contacts.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-500/20 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">National Emergency:</span>
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

      {/* 2. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Workflow Architecture</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">How ShaktiShield AI Protects You</h2>
          <p className="text-slate-400 text-sm">
            Four systematic phases designed for high-stress emergency reliability and cryptographic proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
              01
            </div>
            <h3 className="text-base font-bold text-white">Register Profile & Contacts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arm your safety circle with verified phone numbers, designated primary responders, and optional emergency medical notes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
              02
            </div>
            <h3 className="text-base font-bold text-white">Live Route Sharing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Initiate consent-based, time-limited GPS sharing before entering unfamiliar transit or late-night routes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-extrabold text-xs flex items-center justify-center">
              03
            </div>
            <h3 className="text-base font-bold text-white">One-Tap Emergency SOS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When threatened, tap SOS to immediately capture coordinates, create a timestamped incident, and alert your trusted network.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
              04
            </div>
            <h3 className="text-base font-bold text-white">Tamper-Proof Audit Trail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Incident logs are stamped with a SHA-256 cryptographic hash, ensuring immutable records admissible in legal and police proceedings.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM CORE CAPABILITIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Comprehensive Safety Features</h2>
          <p className="text-slate-400 text-sm">
            Built with zero compromise on privacy, cryptographic integrity, and emergency speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Emergency SOS */}
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/70 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Accidental-Protected SOS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-priority emergency trigger with optional 3-second hold prevention and transparent cancellation reason logging.
            </p>
            <Link to="/sos" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              Test SOS Module &rarr;
            </Link>
          </div>

          {/* Card 2: Guardian Circle */}
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Trusted Guardian Circle</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Store verified emergency contacts in PostgreSQL with primary responder hierarchy and direct one-click telephonic dialing.
            </p>
            <Link to="/contacts" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              Manage Contacts &rarr;
            </Link>
          </div>

          {/* Card 3: Live GPS Location */}
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Live GPS Location Sharing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              User-controlled tracking links with configurable expiration (15m to 4h) and accuracy indicators. Terminates instantly upon demand.
            </p>
            <Link to="/location" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              Share Live Location &rarr;
            </Link>
          </div>

          {/* Card 4: SHA-256 Ledger */}
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-950/70 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">SHA-256 Incident Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographically verified incident logs. On-demand verification recalculates hashes to prove zero alteration of emergency facts.
            </p>
            <Link to="/history" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              Verify Incident Logs &rarr;
            </Link>
          </div>

          {/* Card 5: AI Hazard Evaluation */}
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Situational Risk Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates environmental factors like lighting, crowd density, transit type, and time of day to generate tactical guidance.
            </p>
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              Explore Risk Engine &rarr;
            </Link>
          </div>

          {/* Card 6: Emergency Directory */}
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified National Helplines</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant access to India's unified 112, women helplines (1091, 181), cyber crime (1930), and state specialized police cells.
            </p>
            <Link to="/resources" className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:text-purple-300 pt-1">
              View Directory & Legal Rights &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4. AI SITUATIONAL RISK ENGINE INTERACTIVE DEMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-purple-500/30 relative">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tactical Assessment Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Environmental Risk Intelligence Demo
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Test how environmental conditions change tactical safety recommendations in real-time:
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
              Scenario A: Deserted Alleyway (Midnight)
            </button>
            <button
              onClick={() => setQuickRiskScenario('transit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                quickRiskScenario === 'transit'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Scenario B: Suburban Transit Stand (Dusk)
            </button>
            <button
              onClick={() => setQuickRiskScenario('mall')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                quickRiskScenario === 'mall'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Scenario C: Commercial Plaza (Daylight)
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

      {/* 5. PRIVACY & DATA SECURITY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Compromise Security</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Privacy-First Architecture Built for Safety
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                ShaktiShield AI is engineered from the ground up to protect user identity and coordinates:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Argon2id Hashing:</strong> Passwords are never stored in plain text and are hashed using state-of-the-art Argon2 memory-hard cryptography.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Unsolicited Tracking:</strong> GPS coordinates are gathered only when you explicitly press SOS or start a live sharing session.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Role-Based Access Control:</strong> Strict server-side verification ensures administrators cannot access unauthorized private records.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Immutable Audit Logs:</strong> Sensitive platform events are logged in a tamper-evident audit trail for accountability.</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-3 w-full max-w-sm text-center">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Compliance & Transparency</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No advertising trackers. No third-party data broker sales. Your safety logs belong exclusively to you.
                </p>
                <div className="pt-2">
                  <Link
                    to="/privacy"
                    className="inline-flex items-center gap-1 text-xs text-purple-400 font-semibold hover:underline"
                  >
                    Read Full Privacy Policy &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Clear, honest answers regarding how ShaktiShield AI functions.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-purple-500/20 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-white hover:text-purple-300"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 leading-relaxed border-t border-purple-500/10 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. CONTACT & EMERGENCY SUPPORT CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-red-950 via-purple-950 to-slate-950 border border-red-500/30 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-glow-crimson">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">CRITICAL EMERGENCY NOTICE</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Immediate Police Intervention: 112
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              If you are in immediate, active danger, call India's unified 112 Emergency Support immediately. ShaktiShield AI supplements your emergency response with cryptographic logs and contact alerts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="tel:112"
              className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-2xl transition-all"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call 112 Directly</span>
            </a>
            <Link
              to="/resources"
              className="px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-purple-300 font-bold text-sm border border-purple-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              <span>National Safety Helplines</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
