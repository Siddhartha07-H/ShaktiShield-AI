import React from 'react';
import { Scale, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Scale className="w-3.5 h-3.5 text-purple-400" />
          <span>Terms of Service & Usage Framework</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Terms and Conditions</h1>
        <p className="text-xs text-slate-400">
          Last Updated: November 2, 2026 &bull; Hackathon Demonstration & Prototype Terms
        </p>
      </div>

      {/* Main Content */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/20 space-y-6 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-2 p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-200">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            CRITICAL DISCLAIMER: NOT AN OFFICIAL POLICE DISPATCH AGENCY
          </h2>
          <p>
            SHAKTISHIELD AI is an independent technological platform developed for emergency assistance, contact notification, and evidentiary logging. <strong>It is NOT a police department, emergency medical service, or government law enforcement agency.</strong> If you or someone you know is in immediate physical danger, you must call India's National Emergency Helpline <strong>112</strong> or local police directly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            1. Nature of the Service & Demo Mode
          </h2>
          <p>
            The software is provided for hackathon demonstration, evaluation, and future commercial deployment. In Demo Mode, notifications are recorded in the database and audit trail; automated telecom SMS and police escalation will only occur if external third-party provider credentials are explicitly enabled.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            2. AI Guidance & Situational Recommendations
          </h2>
          <p>
            The AI situational risk assessment module provides heuristic guidance based on user-provided environmental attributes (lighting, crowd density, time). <strong>Such recommendations are informational only.</strong> They do not predict criminal behavior, guarantee physical safety, or replace commonsense precautions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            3. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, the developers, contributors, and operators of SHAKTISHIELD AI shall not be held liable for any damages, personal injuries, delays, network outages, GPS inaccuracies, or third-party telecom transmission failures arising from the use or inability to use the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            4. User Responsibilities
          </h2>
          <p>
            Users agree not to misuse the Emergency SOS functionality for fraudulent, prank, or unlawful purposes. Users are responsible for keeping emergency contact information accurate and verified.
          </p>
        </section>
      </div>
    </div>
  );
};
