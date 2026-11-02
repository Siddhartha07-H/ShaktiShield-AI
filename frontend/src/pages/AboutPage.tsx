import React from 'react';
import { Shield, Lock, Cpu, Eye, Scale, Users, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>Mission & Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          About <span className="gradient-text-purple">SHAKTISHIELD AI</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Bridging the critical gap between distress, emergency alerting, and tamper-proof legal record integrity for women everywhere.
        </p>
      </div>

      {/* The Problem & Our Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-4">
          <h2 className="text-2xl font-bold text-white">The Reality We Are Solving</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            In threatening situations, individuals have mere seconds to react. Conventional reporting requires unlocking smartphones, dialing numbers, and explaining locations under severe adrenaline and duress.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Furthermore, after incidents occur, victims frequently face challenges proving exact coordinates, timestamps, and sequence of distress events due to lack of verifiable digital audit records.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 space-y-4 bg-gradient-to-br from-indigo-950/40 to-purple-950/40">
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            To provide a frictionless, accessible, and mathematically verifiable safety shield. One tap captures GPS coordinates, computes a cryptographic SHA-256 integrity hash, queues trusted guardians, and logs an immutable audit trail.
          </p>
          <div className="space-y-2 text-xs font-medium text-purple-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero background tracking without explicit user initiation.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full compliance with cryptographic integrity standards.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Modular architecture ready for public launch & smart contracts.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars of ShaktiShield */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center">Architectural Pillars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center text-purple-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Complete Transparency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never falsify police contact or pretend SMS has been sent when external telecom credentials are not present. Clear Demo Mode indicators guarantee honesty.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-900/60 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Cryptographic Hashing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every emergency incident is converted into a canonical JSON payload and hashed with SHA-256. Any direct tampering in the database is instantly flagged.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-900/60 flex items-center justify-center text-pink-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Modular AI Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rule-based heuristic risk scoring evaluates environmental factors to suggest actionable precautions, designed for future integration with predictive neural models.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/60 flex items-center justify-center text-red-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Indian Legal Alignment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct access to official national emergency mechanisms (112, 1091, 181, 1930) and legal rights directories under modern Indian justice legislation.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Engineered With Modern Industry Standards</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center text-xs">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-purple-300 text-sm">React & TS</div>
            <span className="text-slate-400">Type-Safe UI</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-purple-300 text-sm">FastAPI</div>
            <span className="text-slate-400">High-Speed Python</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-purple-300 text-sm">PostgreSQL</div>
            <span className="text-slate-400">Relational DB</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-purple-300 text-sm">Argon2id</div>
            <span className="text-slate-400">Password Hashes</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-purple-300 text-sm">SHA-256</div>
            <span className="text-slate-400">Audit Digests</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-purple-300 text-sm">Vercel</div>
            <span className="text-slate-400">Global Edge</span>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center pt-4">
        <Link
          to="/features"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-purple transition-all"
        >
          Explore Complete Feature Suite
        </Link>
      </div>
    </div>
  );
};
