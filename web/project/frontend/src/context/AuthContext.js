import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/profile')
        .then(res => setCurrentUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, mot_de_passe) => {
    const res = await api.post('/auth/login', { email, mot_de_passe });
    localStorage.setItem('token', res.data.token);
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = { currentUser, login, register, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};