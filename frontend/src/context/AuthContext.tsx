import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
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
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.post<AuthResponse>('/api/auth/login', credentials);
      localStorage.setItem('shaktishield_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.full_name}!`, 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Login failed. Please check credentials.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.post<AuthResponse>('/api/auth/register', data);
      localStorage.setItem('shaktishield_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast('Registration successful! Your safety profile is armed.', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Registration failed.', 'error');
      return false;
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
      setToken(null);
      setUser(null);
      showToast('You have been logged out safely.', 'info');
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
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
