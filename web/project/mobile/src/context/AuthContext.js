import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native'; // 1. Importer Platform pour détecter le Web
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      let storedToken = null;
      let storedUser = null;

      // Lecture sécurisée selon la plateforme
      if (Platform.OS === 'web') {
        storedToken = localStorage.getItem('token');
        storedUser = localStorage.getItem('user');
      } else {
        storedToken = await AsyncStorage.getItem('token');
        storedUser = await AsyncStorage.getItem('user');
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('Erreur chargement auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (userData, userToken) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
      setToken(userToken);
      setUser(userData);
    } catch (e) {
      console.log('Erreur lors du signIn:', e);
    }
  };

  // ─── CORRECTION DE LA FONCTION SIGN OUT ───────────────────────────────────────
  const signOut = async () => {
    try {
      if (Platform.OS === 'web') {
        // Nettoyage direct et instantané pour le navigateur Web
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.clear();
      } else {
        // Nettoyage pour Android / iOS
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
    } catch (e) {
      console.log('Erreur lors de la suppression des données de session:', e);
    } finally {
      // TRÈS IMPORTANT : Quoi qu'il arrive (même en cas d'erreur de stockage),
      // on remet les états à null pour forcer la redirection visuelle vers le Login.
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);