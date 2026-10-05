import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  { label: 'Admin (Director Vance)', email: 'admin@university.edu', role: 'ADMIN', badge: 'Admin Portal', color: 'bg-purple-100 text-purple-800' },
  { label: 'Gate Officer 1 (Main Gate)', email: 'officer1@university.edu', role: 'GATE_OFFICER', badge: 'Main Gate Scanner', color: 'bg-blue-100 text-blue-800' },
  { label: 'Gate Officer 2 (North Gate)', email: 'officer2@university.edu', role: 'GATE_OFFICER', badge: 'North Gate Scanner', color: 'bg-indigo-100 text-indigo-800' },
  { label: 'Student (Alexander Hayes)', email: 'student@university.edu', role: 'STUDENT', badge: 'Student Portal', color: 'bg-emerald-100 text-emerald-800' },
  { label: 'Staff (Prof. David Miller)', email: 'staff@university.edu', role: 'STAFF', badge: 'Staff Portal', color: 'bg-amber-100 text-amber-800' },
  { label: 'Visitor (Dr. Robert Sterling)', email: 'visitor@university.edu', role: 'VISITOR', badge: 'Visitor Portal', color: 'bg-rose-100 text-rose-800' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [officerProfile, setOfficerProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setOfficerProfile(res.data.officerProfile || null);
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser, officerProfile: receivedOfficer } = res.data;

    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    setOfficerProfile(receivedOfficer || null);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const quickLoginAs = async (email) => {
    return await login(email, 'Password123!');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOfficerProfile(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setOfficerProfile(res.data.officerProfile || null);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = {
    user,
    officerProfile,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    quickLoginAs,
    logout,
    refreshUser,
    isAdmin: user?.role === 'ADMIN',
    isGateOfficer: user?.role === 'GATE_OFFICER',
    isStudent: user?.role === 'STUDENT',
    isStaff: user?.role === 'STAFF',
    isVisitor: user?.role === 'VISITOR',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
