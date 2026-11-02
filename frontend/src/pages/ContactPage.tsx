import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: '',
  });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    showToast('Your message has been received by the ShaktiShield team.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>Get In Touch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Contact <span className="gradient-text-purple">ShaktiShield AI</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Have feedback, need technical support, or interested in deploying ShaktiShield AI for your institution or hackathon showcase? Reach out to our engineering team.
        </p>
      </div>

      {/* Emergency Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span>DO NOT USE THIS CONTACT FORM FOR ACTIVE EMERGENCIES</span>
        </div>
        <p className="text-[11px] text-slate-300">
          This form is monitored for developer and institutional inquiries. In immediate physical danger, dial{' '}
          <a href="tel:112" className="text-white font-bold underline">
            112
          </a>{' '}
          on your phone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Side Card */}
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 space-y-6">
          <h2 className="text-lg font-bold text-white">Project Information</h2>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block">Developer Support:</span>
                <span className="font-semibold text-white">support@shaktishield.ai</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block">National Emergency:</span>
                <span className="font-bold text-red-400">112 (Toll-Free, 24/7)</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block">Headquarters:</span>
                <span className="text-white">New Delhi & Bengaluru, India</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-purple-500/10 text-[11px] text-slate-400 leading-relaxed">
            ShaktiShield AI is open to municipal, collegiate, and corporate pilot integrations with campus security and local emergency dispatch.
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-purple-500/20">
          {isSent ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Message Transmitted</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Thank you for reaching out. A ShaktiShield developer will review your inquiry and follow up shortly.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="mt-4 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Maya Swaminathan"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="maya@example.com"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inquiry Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Hackathon Showcase">Hackathon Showcase</option>
                    <option value="Security & Code Audit">Security & Code Audit</option>
                    <option value="Institutional Deployment">Institutional Deployment</option>
                    <option value="Technical Bug Report">Technical Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Summary of inquiry"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Details</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your query or feedback in detail..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-2 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
