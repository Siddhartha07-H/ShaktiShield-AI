import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Heart, 
  FileText, 
  Shield, 
  Save, 
  Loader2, 
  Lock, 
  Calendar,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodType, setBloodType] = useState(user?.blood_type || 'O+');
  const [emergencyNotes, setEmergencyNotes] = useState(user?.emergency_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setBloodType(user.blood_type || 'O+');
      setEmergencyNotes(user.emergency_notes || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      full_name: fullName,
      phone,
      blood_type: bloodType,
      emergency_notes: emergencyNotes,
    });
    setIsSaving(false);
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <UserIcon className="w-7 h-7 text-purple-400" />
            <span>Safety & Medical Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Keep your medical notes, contact numbers, and identification details up to date.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Safely</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Account Overview Card */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-6 h-fit">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-1 mx-auto shadow-glow-purple">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-2xl font-black text-purple-300">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.full_name}</h2>
              <span className="text-xs text-purple-400 font-mono capitalize">
                Account Role: {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-purple-500/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{user?.phone || 'No phone registered'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400 shrink-0" />
              <span>Blood Group: {user?.blood_type || 'Unspecified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-200">
            <strong>Encryption Notice:</strong> Passwords are protected via Argon2id with memory-hard cost. Session tokens are digitally signed with JWT.
          </div>
        </div>

        {/* Right: Editable Profile Form */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>Update Emergency Information</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Emergency & Medical Notes (Critical for First Responders)
              </label>
              <textarea
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                rows={4}
                placeholder="e.g. Asthmatic, carries salbutamol inhaler. Severe peanut allergy. Emergency contact preference: Sister."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                This information is attached to your SOS cryptographic profile to assist emergency medics and contacts.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
