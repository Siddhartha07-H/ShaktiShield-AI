import React from 'react';

export type StatusType = 
  | 'ACTIVE' 
  | 'RESOLVED' 
  | 'CANCELLED' 
  | 'APPROVED' 
  | 'PENDING_APPROVAL' 
  | 'REJECTED' 
  | 'SUSPENDED'
  | 'TAMPER_FREE'
  | 'CORRUPTED_OR_TAMPERED'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'
  | 'IDLE'
  | 'EXPIRED';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  const getStyle = (): { bg: string; text: string; border: string; dot: string } => {
    switch (normalized) {
      case 'ACTIVE':
      case 'CRITICAL':
      case 'CORRUPTED_OR_TAMPERED':
        return {
          bg: 'bg-red-950/70',
          text: 'text-red-300',
          border: 'border-red-500/40',
          dot: 'bg-red-500 animate-ping',
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-950/70',
          text: 'text-rose-300',
          border: 'border-rose-500/40',
          dot: 'bg-rose-500',
        };
      case 'PENDING_APPROVAL':
      case 'MODERATE':
        return {
          bg: 'bg-amber-950/70',
          text: 'text-amber-300',
          border: 'border-amber-500/40',
          dot: 'bg-amber-400 animate-pulse',
        };
      case 'RESOLVED':
      case 'APPROVED':
      case 'TAMPER_FREE':
      case 'LOW':
        return {
          bg: 'bg-emerald-950/70',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40',
          dot: 'bg-emerald-400',
        };
      case 'CANCELLED':
      case 'REJECTED':
      case 'SUSPENDED':
      case 'EXPIRED':
      case 'IDLE':
      default:
        return {
          bg: 'bg-slate-900',
          text: 'text-slate-400',
          border: 'border-slate-700',
          dot: 'bg-slate-500',
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold font-mono uppercase tracking-wider rounded-lg border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{label || normalized.replace(/_/g, ' ')}</span>
    </span>
  );
};
