import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the httpOnly auth cookie on first load.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (active) setUser(data);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (details) => {
    const { data } = await api.post('/auth/register', details);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  // Re-fetch the profile (e.g. after wishlist changes).
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
