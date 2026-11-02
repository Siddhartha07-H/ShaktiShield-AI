import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous,
  variant = 'primary',
  isLoading = false,
}) => {
  const handleClose = onCancel || onClose || (() => {});
  const isDanger = isDangerous || variant === 'danger';
  const bodyText = description || message || '';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              isDanger
                ? 'bg-red-950/70 border border-red-500/40 text-red-400'
                : 'bg-purple-950/70 border border-purple-500/40 text-purple-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{bodyText}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-purple-500/20">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 shadow-glow-crimson'
                : 'bg-purple-600 hover:bg-purple-500 shadow-glow-purple'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
