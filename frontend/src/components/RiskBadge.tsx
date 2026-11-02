import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface RiskBadgeProps {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  score?: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score }) => {
  const normLevel = level.toUpperCase();

  switch (normLevel) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-950/80 text-red-300 border border-red-500/50 shadow-glow-crimson animate-pulse">
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>CRITICAL RISK {score !== undefined ? `(${score}%)` : ''}</span>
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-950/80 text-orange-300 border border-orange-500/40">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          <span>HIGH RISK {score !== undefined ? `(${score}%)` : ''}</span>
        </span>
      );
    case 'MODERATE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>MODERATE RISK {score !== undefined ? `(${score}%)` : ''}</span>
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>LOW RISK {score !== undefined ? `(${score}%)` : ''}</span>
        </span>
      );
  }
};
