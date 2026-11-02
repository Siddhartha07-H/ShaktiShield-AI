import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, ExternalLink, Heart, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050810] border-t border-purple-500/20 text-slate-400 text-sm mt-auto">
      {/* Emergency Quick Helpline Ticker */}
      <div className="bg-gradient-to-r from-red-950/40 via-purple-950/30 to-red-950/40 border-b border-purple-500/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Phone className="w-4 h-4 text-red-400 animate-pulse" />
            <span>INDIA EMERGENCY HELPLINES (TOLL-FREE):</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <a href="tel:112" className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-600/80 hover:bg-red-500 text-white transition-colors">
              <span>National Emergency:</span>
              <span className="font-extrabold text-sm tracking-wider">112</span>
            </a>
            <a href="tel:1091" className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 transition-colors">
              <span>Women Helpline:</span>
              <span className="font-bold">1091</span>
            </a>
            <a href="tel:181" className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 transition-colors">
              <span>Women in Distress:</span>
              <span className="font-bold">181</span>
            </a>
            <a href="tel:1930" className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/30 transition-colors">
              <span>Cyber Crime:</span>
              <span className="font-bold">1930</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Purpose */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-white tracking-tight">SHAKTISHIELD AI</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Empowering women through rapid emergency SOS triggers, cryptographic tamper-free incident hashing, live GPS location sharing, and AI-assisted safety guidance.
          </p>
          <div className="flex items-center gap-2 text-xs text-purple-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Platform Status: Operational (Demo Mode)</span>
          </div>
        </div>

        {/* Essential Navigation */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Platform Pages</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-purple-300 transition-colors">Home Landing Page</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-purple-300 transition-colors">About ShaktiShield</Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-purple-300 transition-colors">Features & Capabilities</Link>
            </li>
            <li>
              <Link to="/sos" className="hover:text-red-400 font-semibold transition-colors">Emergency SOS Module</Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-purple-300 transition-colors">User Dashboard</Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-amber-300 transition-colors">Admin Dashboard</Link>
            </li>
          </ul>
        </div>

        {/* Safety Tools & Account */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Safety & Account</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/contacts" className="hover:text-purple-300 transition-colors">Trusted Emergency Contacts</Link>
            </li>
            <li>
              <Link to="/location" className="hover:text-purple-300 transition-colors">Live Location Sharing</Link>
            </li>
            <li>
              <Link to="/history" className="hover:text-purple-300 transition-colors">Incident History & Hash Logs</Link>
            </li>
            <li>
              <Link to="/resources" className="hover:text-purple-300 transition-colors">National Safety Helplines</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-purple-300 transition-colors">User Medical & Emergency Profile</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-purple-300 transition-colors">Sign In / Demo Login</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-purple-300 transition-colors">Create Free Account</Link>
            </li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Legal & Transparency</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/privacy" className="hover:text-purple-300 transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-purple-300 transition-colors">Terms of Service</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-purple-300 transition-colors">Contact Support Team</Link>
            </li>
            <li>
              <Link to="/forgot-password" className="hover:text-purple-300 transition-colors">Password Recovery</Link>
            </li>
          </ul>
          <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Safety Disclaimer</span>
            </div>
            ShaktiShield AI is an emergency assistance and cryptographic audit tool. It is not an official government or police service. Always call 112 in immediate danger.
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} SHAKTISHIELD AI. Built for hackathon demonstration and women's safety advancement.
        </p>
      </div>
    </footer>
  );
};
