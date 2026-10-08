import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getInitialToken = () => {
  try {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(getInitialToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          try {
            if (localStorage.getItem('token')) {
              localStorage.setItem('user', JSON.stringify(res.data));
            } else {
              sessionStorage.setItem('user', JSON.stringify(res.data));
            }
          } catch {}
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (usernameOrEmail, password, remember = true) => {
    const res = await authAPI.login({
      username_or_email: usernameOrEmail,
      password: password,
    });
    const { access_token, user: userData } = res.data;

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('token', access_token);
      storage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }

    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (fullName, username, email, password, confirmPassword) => {
    const res = await authAPI.register({
      full_name: fullName,
      username: username,
      email: email,
      password: password,
      confirm_password: confirmPassword,
    });
    return res.data;
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } catch {}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
