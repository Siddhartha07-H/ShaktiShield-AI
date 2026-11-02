import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, User, Phone, FileBadge, Key, ArrowRight, Loader2, AlertCircle, ShieldAlert, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PasswordInput } from '../components/PasswordInput';

export const AdminRegisterPage: React.FC = () => {
  const { adminRegister } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization_name: '',
    authorization_reference: '',
    invitation_code: '',
    password: '',
    confirm_password: '',
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.organization_name ||
      !formData.authorization_reference ||
      !formData.invitation_code ||
      !formData.password ||
      !formData.confirm_password
    ) {
      setErrorMessage('Please fill in all mandatory administrator application fields.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await adminRegister({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      organization_name: formData.organization_name,
      authorization_reference: formData.authorization_reference,
      invitation_code: formData.invitation_code.trim(),
      password: formData.password,
      license_document_url: fileName ? `secure_vault://docs/${fileName}` : undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      navigate('/admin/pending-approval');
    } else {
      setErrorMessage(res.error || 'Failed to submit administrator application. Please verify invitation token.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-700 p-0.5 mx-auto shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Official enrollment for emergency dispatchers, law enforcement liaisons, and safety coordinators.
          </p>
        </div>

        {/* Security Compliance Notice */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1.5 text-xs text-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Strict Authorization & Compliance Review Notice:</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-200/90">
            Administrator privileges are never granted automatically upon submission. Registrations require a valid, single-use invitation code and will remain in <strong>PENDING_APPROVAL</strong> status until verified via manual review or authorized government verification channels.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Official Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Officer Full Name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Email Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@agency.gov.in"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Official Phone & Organization Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Phone Number <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 11 2345 6789"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Organization / Department Name <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  placeholder="e.g. Delhi Police Emergency Command"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Authorization Reference & Admin Invitation Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Govt License / Authorization Ref <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <FileBadge className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="authorization_reference"
                  value={formData.authorization_reference}
                  onChange={handleChange}
                  placeholder="e.g. AUTH-POL-2026-X99"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Secure Admin Invitation Code <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="invitation_code"
                  value={formData.invitation_code}
                  onChange={handleChange}
                  placeholder="SHAKTI-ADM-XXXXXXXX"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-amber-500/50 text-white font-mono text-sm focus:outline-none focus:border-amber-400 transition-colors uppercase"
                />
              </div>
            </div>
          </div>

          {/* Optional License Document Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Authorization Document / ID Reference (Optional)
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80">
              <Upload className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-950/70 file:text-amber-300 hover:file:bg-amber-900/80"
              />
              {fileName && (
                <span className="text-xs text-amber-400 truncate max-w-[200px]">
                  {fileName}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Government credentials are encrypted and strictly stored in private compliance vaults. Never publicly accessible.
            </span>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password <span className="text-amber-400">*</span>
              </label>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                showStrengthMeter={true}
                autoComplete="new-password"
                borderColor="focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password <span className="text-amber-400">*</span>
              </label>
              <PasswordInput
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm password"
                autoComplete="new-password"
                borderColor="focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Official Application...</span>
              </>
            ) : (
              <>
                <span>Submit Application for Review</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-purple-500/20 text-center text-xs text-slate-400">
          Already approved?{' '}
          <Link to="/admin/login" className="text-amber-400 font-semibold hover:text-amber-300 underline">
            Sign In as Admin
          </Link>
        </div>
      </div>
    </div>
  );
};
