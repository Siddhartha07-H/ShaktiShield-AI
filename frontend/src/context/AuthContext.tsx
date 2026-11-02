import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse, AdminMFARequiredResponse } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AdminAuthResult {
  success: boolean;
  isPending?: boolean;
  mfaRequired?: boolean;
  mfaToken?: string;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPendingAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; remember_me?: boolean }) => Promise<{ success: boolean; role?: string; isPending?: boolean; error?: string }>;
  adminLogin: (credentials: { email: string; password: string }) => Promise<AdminAuthResult>;
  verifyAdminMfa: (mfaToken: string, totpCode: string) => Promise<AdminAuthResult>;
  register: (data: any) => Promise<boolean>;
  adminRegister: (data: any) => Promise<AdminAuthResult>;
  logout: () => void;
  updateProfile: (data: any) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('shaktishield_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('shaktishield_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.get<User>('/api/auth/me');
      setUser(userData);
    } catch (error: any) {
      console.warn('Session expired or invalid token:', error.message);
      localStorage.removeItem('shaktishield_token');
      localStorage.removeItem('shaktishield_refresh_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: { email: string; password: string; remember_me?: boolean }): Promise<{ success: boolean; role?: string; isPending?: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.post<AuthResponse>('/api/auth/login', credentials);
      localStorage.setItem('shaktishield_token', res.access_token);
      if (res.refresh_token) {
        localStorage.setItem('shaktishield_refresh_token', res.refresh_token);
      }
      setToken(res.access_token);
      setUser(res.user);
      const isPending = res.user.role === 'admin' && res.user.approval_status === 'PENDING_APPROVAL';
      showToast(`Welcome back, ${res.user.full_name}!`, 'success');
      return { success: true, role: res.user.role, isPending };
    } catch (error: any) {
      const msg = error.message || 'Login failed. Please verify credentials.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (credentials: { email: string; password: string }): Promise<AdminAuthResult> => {
    try {
      setIsLoading(true);
      const res = await api.post<AuthResponse | AdminMFARequiredResponse>('/api/auth/admin/login', credentials);

      // Check if MFA verification is required
      if ('mfa_required' in res && res.mfa_required) {
        showToast('Please provide your 6-digit Multi-Factor Authentication code.', 'info');
        return {
          success: false,
          mfaRequired: true,
          mfaToken: res.mfa_token,
        };
      }

      const authRes = res as AuthResponse;
      localStorage.setItem('shaktishield_token', authRes.access_token);
      if (authRes.refresh_token) {
        localStorage.setItem('shaktishield_refresh_token', authRes.refresh_token);
      }
      setToken(authRes.access_token);
      setUser(authRes.user);

      if (authRes.user.approval_status === 'PENDING_APPROVAL') {
        showToast('Application pending official authorization review.', 'info');
        return { success: true, isPending: true };
      }

      showToast(`Administrator authenticated: ${authRes.user.full_name}`, 'success');
      return { success: true, isPending: false };
    } catch (error: any) {
      const msg = error.message || 'Administrator authentication failed.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAdminMfa = async (mfaToken: string, totpCode: string): Promise<AdminAuthResult> => {
    try {
      setIsLoading(true);
      const res = await api.post<AuthResponse>('/api/auth/admin/mfa-verify', {
        mfa_token: mfaToken,
        totp_code: totpCode,
      });

      localStorage.setItem('shaktishield_token', res.access_token);
      if (res.refresh_token) {
        localStorage.setItem('shaktishield_refresh_token', res.refresh_token);
      }
      setToken(res.access_token);
      setUser(res.user);

      showToast(`Administrator authenticated: ${res.user.full_name}`, 'success');
      return { success: true, isPending: false };
    } catch (error: any) {
      const msg = error.message || 'Invalid Multi-Factor Authentication code.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.post<AuthResponse>('/api/auth/register', data);
      localStorage.setItem('shaktishield_token', res.access_token);
      if (res.refresh_token) {
        localStorage.setItem('shaktishield_refresh_token', res.refresh_token);
      }
      setToken(res.access_token);
      setUser(res.user);
      showToast('Registration successful! Safety shield activated.', 'success');
      return true;
    } catch (error: any) {
      const msg = error.message || 'Registration failed.';
      showToast(msg, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adminRegister = async (data: any): Promise<AdminAuthResult> => {
    try {
      setIsLoading(true);
      const res = await api.post<AuthResponse>('/api/auth/admin/register', data);
      localStorage.setItem('shaktishield_token', res.access_token);
      if (res.refresh_token) {
        localStorage.setItem('shaktishield_refresh_token', res.refresh_token);
      }
      setToken(res.access_token);
      setUser(res.user);
      showToast('Administrator credentials submitted for review.', 'info');
      return { success: true, isPending: true };
    } catch (error: any) {
      const msg = error.message || 'Administrator registration failed.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // Ignore API logout error
    } finally {
      localStorage.removeItem('shaktishield_token');
      localStorage.removeItem('shaktishield_refresh_token');
      setToken(null);
      setUser(null);
      showToast('Logged out securely.', 'info');
    }
  };

  const updateProfile = async (data: any): Promise<boolean> => {
    try {
      const updated = await api.put<User>('/api/auth/profile', data);
      setUser(updated);
      showToast('Profile information successfully updated.', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile.', 'error');
      return false;
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isAdmin = user?.role === 'admin' && user?.approval_status === 'APPROVED';
  const isPendingAdmin = user?.role === 'admin' && user?.approval_status === 'PENDING_APPROVAL';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        isPendingAdmin,
        isLoading,
        login,
        adminLogin,
        verifyAdminMfa,
        register,
        adminRegister,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
