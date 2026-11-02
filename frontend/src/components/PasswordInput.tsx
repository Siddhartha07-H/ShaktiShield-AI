import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  showStrengthMeter?: boolean;
  autoComplete?: string;
  className?: string;
  borderColor?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  name = 'password',
  placeholder = 'Enter password',
  required = true,
  showStrengthMeter = false,
  autoComplete = 'current-password',
  className = '',
  borderColor = 'focus:border-purple-500',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Compute strength score: 0 to 4
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(value);

  const getStrengthLabel = (score: number) => {
    if (!value) return { text: '', color: 'bg-slate-700', textColor: 'text-slate-500' };
    switch (score) {
      case 1:
        return { text: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
      case 2:
        return { text: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' };
      case 3:
        return { text: 'Strong', color: 'bg-purple-500', textColor: 'text-purple-300' };
      case 4:
      default:
        return { text: 'Very Strong (Cryptographic Grade)', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
    }
  };

  const strengthInfo = getStrengthLabel(strength);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors ${borderColor} ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrengthMeter && value.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${strength >= 1 ? strengthInfo.color : 'bg-transparent'}`} />
            <div className={`h-full ${strength >= 2 ? strengthInfo.color : 'bg-transparent'}`} />
            <div className={`h-full ${strength >= 3 ? strengthInfo.color : 'bg-transparent'}`} />
            <div className={`h-full ${strength >= 4 ? strengthInfo.color : 'bg-transparent'}`} />
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Password Strength:</span>
            <span className={`font-semibold ${strengthInfo.textColor}`}>{strengthInfo.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
