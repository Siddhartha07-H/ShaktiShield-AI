import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  MapPin, 
  History, 
  PhoneCall, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard,
  Lock,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isPendingAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-glow-purple group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            </div>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              SHAKTISHIELD <span className="text-xs px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300 border border-purple-500/40 font-mono">AI</span>
            </span>
            <span className="text-[10px] text-purple-300/70 block tracking-wider font-medium uppercase -mt-0.5">
              Women's Safety Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/') ? 'text-purple-300 bg-purple-900/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/about') ? 'text-purple-300 bg-purple-900/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            About
          </Link>
          <Link
            to="/features"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/features') ? 'text-purple-300 bg-purple-900/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Features
          </Link>
          <Link
            to="/resources"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/resources') ? 'text-purple-300 bg-purple-900/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Resources
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/dashboard') ? 'text-purple-300 bg-purple-900/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/contacts"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/contacts') ? 'text-purple-300 bg-purple-900/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Contacts
              </Link>
              <Link
                to="/location"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/location') ? 'text-purple-300 bg-purple-900/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Live Tracking
              </Link>
              <Link
                to="/history"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/history') ? 'text-purple-300 bg-purple-900/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Incidents
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-amber-300 bg-amber-950/40 border border-amber-500/30 ${
                    isActive('/admin') ? 'ring-1 ring-amber-400 font-bold' : 'hover:bg-amber-900/50'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Admin
                </Link>
              )}
              {isPendingAdmin && (
                <Link
                  to="/admin/pending-approval"
                  className="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border border-amber-500/40 animate-pulse text-xs font-semibold"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Pending Approval
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick Emergency SOS button */}
          <Link
            to="/sos"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-glow-crimson hover:scale-105 active:scale-95 transition-all"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>SOS</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Profile"
              >
                <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span className="text-xs font-medium text-slate-300 max-w-[100px] truncate hidden md:inline">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/70 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-purple transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            to="/sos"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600 text-white font-bold text-xs shadow-glow-crimson"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOS</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden glass-panel border-b border-purple-500/20 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            About
          </Link>
          <Link
            to="/features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Features
          </Link>
          <Link
            to="/resources"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Safety Resources
          </Link>

          {isAuthenticated ? (
            <>
              <div className="pt-2 border-t border-slate-800/80">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/contacts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Trusted Contacts
                </Link>
                <Link
                  to="/location"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Live Location Sharing
                </Link>
                <Link
                  to="/history"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Incident History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  User Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-300 bg-amber-950/40"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {isPendingAdmin && (
                  <Link
                    to="/admin/pending-approval"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-300 bg-amber-950/60 border border-amber-500/40 animate-pulse"
                  >
                    Pending Review
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 flex items-center gap-2 mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user?.email})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg text-sm font-semibold bg-slate-800 text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
