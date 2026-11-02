import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  actionIcon: ActionIcon,
  action,
}) => {
  const finalActionText = action?.label || actionText;
  const finalActionHandler = action?.onClick || onAction;
  const FinalIcon = action?.icon || ActionIcon;

  return (
    <div className="text-center py-12 px-4 glass-panel rounded-3xl border border-purple-500/20 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-6">
        {description}
      </p>
      {finalActionText && finalActionHandler && (
        <button
          onClick={finalActionHandler}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-glow-purple transition-all"
        >
          {FinalIcon && <FinalIcon className="w-4 h-4" />}
          <span>{finalActionText}</span>
        </button>
      )}
    </div>
  );
};
