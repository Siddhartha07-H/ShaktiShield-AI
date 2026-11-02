import React from 'react';
import { ShieldAlert, PhoneCall } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-red-950 border-b border-purple-500/30 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2 text-purple-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong className="text-amber-300 font-semibold uppercase tracking-wider">Demo / Hackathon Mode:</strong>{' '}
            SOS triggers log cryptographic tamper-proof records. External SMS and police dispatch are simulated.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-400 hidden md:inline">Imminent danger?</span>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white font-bold transition-all shadow-sm"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call 112 Directly</span>
          </a>
        </div>
      </div>
    </div>
  );
};
