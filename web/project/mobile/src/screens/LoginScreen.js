import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/client';
import { COLORS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email.trim().toLowerCase(), password);
      await signIn(data.user, data.token);
    } catch (err) {
      const errorMsg = err?.message || 'Identifiants incorrects.';
      if (Platform.OS === 'web') {
        window.alert(`Erreur : ${errorMsg}`);
      } else {
        Alert.alert('Erreur de connexion', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* En-tête avec dégradé moderne texturé */}
        <LinearGradient
          colors={[COLORS.primaryDark || '#1E293B', COLORS.primary || '#0F172A']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.logoBadge}>
            <Ionicons name="car-sport" size={36} color="#fff" />
          </View>
          <Text style={styles.appName}>ALPHA trans</Text>
          <Text style={styles.tagline}>Voyagez à Madagascar</Text>
        </LinearGradient>

        {/* Formulaire stylisé en carte */}
        <View style={styles.formCard}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Ravis de vous revoir !</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Input Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Adresse e-mail</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="exemple@email.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
              />
            </View>
          </View>

          {/* Input Mot de passe */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton de Connexion Premium */}
          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={loading ? ['#94A3B8', '#94A3B8'] : [COLORS.accent || '#EA580C', '#C2410C']}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnText}>Se connecter</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer d'inscription */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1 },
  
  // Header avec une belle courbe en bas
  header: { 
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  appName: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 },
  
  // Conteneur du formulaire remonté sur le header
  formCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 24,
    padding: 24,
    ...SHADOW.lg, // Récupère l'ombre de votre thème pour l'effet de carte flottante
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  
  // Alerte d'erreur stylée
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: { color: '#EF4444', fontSize: 14, fontWeight: '600', flex: 1 },

  inputWrapper: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  
  // Inputs modernes avec icônes intégrées
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#0F172A', fontWeight: '500' },
  
  // Bouton dégradé orange/accent
  loginBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 10, ...SHADOW.md },
  btnGradient: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, paddingBottom: 10 },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: COLORS.primary || '#0F172A', fontSize: 14, fontWeight: '700' }
});