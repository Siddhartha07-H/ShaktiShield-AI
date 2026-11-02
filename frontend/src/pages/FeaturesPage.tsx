import React from 'react';
import { 
  AlertTriangle, 
  Users, 
  MapPin, 
  Cpu, 
  FileCheck, 
  Layers, 
  PhoneCall, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
      title: "One-Tap Emergency SOS Trigger",
      badge: "CORE ENGINE",
      badgeColor: "bg-red-950/80 text-red-300 border-red-500/40",
      description:
        "Engineered for high-stress panic moments. Instant one-click activation prompts browser geolocation permission, captures latitude & longitude with sub-meter accuracy, assigns a unique incident identifier, and activates notification queues.",
      highlights: [
        "Hold-to-confirm or immediate tap activation",
        "Captures GPS latitude, longitude, and accuracy radius",
        "Transparent Demo Mode banner with disclaimers",
        "User-controlled false alarm cancellation with recorded reasons"
      ],
      link: "/sos",
      linkText: "Try Emergency SOS"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-400" />,
      title: "Trusted Guardian Network",
      badge: "SAFETY CIRCLE",
      badgeColor: "bg-purple-950/80 text-purple-300 border-purple-500/40",
      description:
        "Manage a curated network of immediate responders—family, friends, neighbors, or workplace colleagues. Set primary responders to be notified first during crisis triggers.",
      highlights: [
        "CRUD management: Add, edit, remove emergency contacts",
        "Designate primary emergency contact with priority badge",
        "Instant one-touch phone dialer links",
        "Strict database isolation: only the account owner accesses contacts"
      ],
      link: "/contacts",
      linkText: "Manage Contacts"
    },
    {
      icon: <MapPin className="w-8 h-8 text-indigo-400" />,
      title: "Time-Limited Live Route Sharing",
      badge: "LIVE GEOLOCATION",
      badgeColor: "bg-indigo-950/80 text-indigo-300 border-indigo-500/40",
      description:
        "Traveling late or in unfamiliar areas? Start an encrypted live GPS session with custom expiration (15m, 30m, 1h, 2h). Share the generated link with trusted contacts to monitor your journey in real time.",
      highlights: [
        "Time-limited auto-expiring sharing sessions",
        "Interactive Google Maps route links",
        "Manual stop control at any moment",
        "Zero background tracking without active session permission"
      ],
      link: "/location",
      linkText: "Start Live Session"
    },
    {
      icon: <Cpu className="w-8 h-8 text-pink-400" />,
      title: "AI Situational Risk Assessment",
      badge: "INTELLIGENT ADVISOR",
      badgeColor: "bg-pink-950/80 text-pink-300 border-pink-500/40",
      description:
        "A transparent rule-based and heuristic AI engine that analyses surrounding environmental factors (lighting, crowd density, time of day, user distress) to calculate a 0-100 risk score and situational guidance.",
      highlights: [
        "Categorized risk tiers: LOW, MODERATE, HIGH, CRITICAL",
        "Identifies contextual hazards (isolation, lighting deficits)",
        "Produces actionable tactical safety checklists",
        "Prominent disclaimer that AI recommendations are informational"
      ],
      link: "/dashboard",
      linkText: "Run Risk Assessment"
    },
    {
      icon: <FileCheck className="w-8 h-8 text-emerald-400" />,
      title: "Cryptographic SHA-256 Tamper Detection",
      badge: "DATA INTEGRITY",
      badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
      description:
        "Every emergency incident is converted to a canonical JSON representation and stamped with a SHA-256 cryptographic digest. Any alteration to incident coordinates or status in the database produces an instant verification mismatch.",
      highlights: [
        "Deterministic canonical serialization (id, timestamp, lat, lng, status)",
        "Instant cryptographic verification endpoint",
        "Tamper simulation test tool for security demonstrations",
        "Maintains audit-grade digital evidentiary chains"
      ],
      link: "/history",
      linkText: "Inspect Incident Logs"
    },
    {
      icon: <Layers className="w-8 h-8 text-cyan-400" />,
      title: "Modular Blockchain Service Layer",
      badge: "DECENTRALIZED READY",
      badgeColor: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40",
      description:
        "Built with a modular service interface designed for anchoring incident digests onto an EVM-compatible chain (e.g., Polygon Amoy / Ethereum Testnet) for ultimate non-repudiation.",
      highlights: [
        "Deterministic merkle leaf transaction generation",
        "Clean separation between web application and web3 provider",
        "Honest testnet / simulation attribution in Demo Mode",
        "Ready for smart contract registry binding in commercial launch"
      ],
      link: "/history",
      linkText: "View Blockchain Receipts"
    },
    {
      icon: <PhoneCall className="w-8 h-8 text-amber-400" />,
      title: "India Emergency Resource Directory",
      badge: "NATIONAL HELPLINES",
      badgeColor: "bg-amber-950/80 text-amber-300 border-amber-500/40",
      description:
        "Comprehensive directory containing verified national emergency helplines (112, 1091, 181, 1930, 1098), state-wise police assistance, and legal rights guidelines under current Indian law.",
      highlights: [
        "Direct telephonic links for one-tap calling",
        "State-by-state women helpline roster",
        "Cyber crime reporting instructions (1930 & cybercrime.gov.in)",
        "Clear non-governmental informational attribution"
      ],
      link: "/resources",
      linkText: "Access Helpline Directory"
    },
    {
      icon: <Lock className="w-8 h-8 text-purple-400" />,
      title: "Administrative Triage & Compliance",
      badge: "ROLE CONTROL",
      badgeColor: "bg-purple-950/80 text-purple-300 border-purple-500/40",
      description:
        "Dedicated administrative command center for emergency coordinators. Monitor platform telemetry, track active SOS alerts, review immutable audit logs, and triage incident resolutions safely.",
      highlights: [
        "Role-based access control (RBAC) enforced on FastAPI endpoints",
        "Platform-wide incident status triage (ACTIVE -> RESOLVED / CANCELLED)",
        "Immutable system audit log review for compliance",
        "User roster without exposing sensitive password digests"
      ],
      link: "/admin",
      linkText: "Open Admin Center"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Full Architectural Specification</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Platform Features & Capabilities
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Every component of SHAKTISHIELD AI has been designed from the ground up for speed, cryptographic reliability, and uncompromising personal safety.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featureList.map((feat, idx) => (
          <div
            key={idx}
            className="glass-panel p-8 rounded-3xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  {feat.icon}
                </div>
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                  {feat.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight">{feat.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{feat.description}</p>

              <div className="pt-2 space-y-2 border-t border-purple-500/10">
                {feat.highlights.map((h, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-purple-500/20">
              <Link
                to={feat.link}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>{feat.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Security Assurance Banner */}
      <div className="rounded-3xl glass-panel border border-purple-500/30 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
            <Lock className="w-5 h-5 text-purple-400" />
            <span>Military-Grade Password & Token Security</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Passphrases are salted and hashed using modern memory-hard Argon2id. Endpoints enforce strict JWT token validation, rate-limiting, and SQL parameterization via SQLAlchemy ORM.
          </p>
        </div>
        <Link
          to="/register"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-glow-purple shrink-0 hover:scale-105 transition-transform"
        >
          Create Protected Account
        </Link>
      </div>
    </div>
  );
};
