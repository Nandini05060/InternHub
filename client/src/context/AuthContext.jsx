import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('internhub_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('internhub_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on mount
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.success) {
          setUser(res.user);
          setProfile(res.profile);
          localStorage.setItem('internhub_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Session verification error:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifySession();

    // Listen for 401 auth-expired event from API client
    const handleExpired = () => {
      logout();
    };
    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      localStorage.setItem('internhub_token', res.token);
      localStorage.setItem('internhub_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      localStorage.setItem('internhub_token', res.token);
      localStorage.setItem('internhub_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('internhub_token');
    localStorage.removeItem('internhub_user');
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateProfile(profileData);
    if (res.success) {
      setUser(res.user);
      setProfile(res.profile);
      localStorage.setItem('internhub_user', JSON.stringify(res.user));
    }
    return res;
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await authApi.getMe();
      if (res.success) {
        setUser(res.user);
        setProfile(res.profile);
        localStorage.setItem('internhub_user', JSON.stringify(res.user));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
