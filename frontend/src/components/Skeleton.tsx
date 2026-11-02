import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-slate-800/80 rounded-xl';

  if (variant === 'circular') {
    return <div className={`rounded-full ${baseClasses} ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="w-28 h-4 rounded-lg bg-slate-800 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
        </div>
        <div className="w-3/4 h-6 rounded-lg bg-slate-800 animate-pulse" />
        <div className="w-full h-3 rounded-md bg-slate-800/60 animate-pulse" />
        <div className="w-2/3 h-3 rounded-md bg-slate-800/60 animate-pulse" />
      </div>
    );
  }

  if (variant === 'rectangular') {
    return <div className={`${baseClasses} ${className}`} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 ${baseClasses} ${
            index === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full'
          } ${className}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton variant="card" className={className} />
);
