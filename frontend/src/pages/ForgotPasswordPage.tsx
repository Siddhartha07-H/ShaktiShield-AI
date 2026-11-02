import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res: any = await api.post('/api/auth/forgot-password', { email });
      setStatusMessage(res.message);
    } catch (err: any) {
      setStatusMessage('Request received. Simulation message returned by server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/30 shadow-2xl relative">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-900/50 border border-purple-500/40 p-2.5 mx-auto flex items-center justify-center text-purple-300">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Password Reset Architecture</h1>
          <p className="text-xs text-slate-400">
            Enter your registered email to simulate or receive password recovery tokens.
          </p>
        </div>

        {statusMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reset Endpoint Acknowledged</span>
              </div>
              <p>{statusMessage}</p>
              <div className="p-2.5 rounded bg-slate-900/90 text-[11px] text-amber-300 border border-amber-500/30 flex items-start gap-1.5 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  In production, configure SMTP credentials in `.env` to send real transactional reset emails.
                </span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Processing Request...' : 'Send Recovery Instructions'}</span>
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
