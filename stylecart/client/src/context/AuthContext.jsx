import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, attempt to restore the session from the auth cookie.
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // TODO: implement — placeholder mock functions.
  const login = async (credentials) => {
    // const { data } = await api.post('/auth/login', credentials);
    // setUser(data);
    return { message: 'TODO' };
  };

  const register = async (details) => {
    // const { data } = await api.post('/auth/register', details);
    // setUser(data);
    return { message: 'TODO' };
  };

  const logout = async () => {
    // await api.post('/auth/logout');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
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
