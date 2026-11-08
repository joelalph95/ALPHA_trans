import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { register, login } from '../api/client';
import { COLORS } from '../utils/theme';

export default function RegisterScreen({ navigation }) {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', mot_de_passe: '' });
  const [role, setRole] = useState('passager');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.nom) newErrors.nom = 'Nom requis';
    if (!form.email) newErrors.email = 'Email requis';
    else if (!form.email.includes('@')) newErrors.email = 'Email invalide';
    if (!form.mot_de_passe) newErrors.mot_de_passe = 'Mot de passe requis';
    else if (form.mot_de_passe.length < 6) newErrors.mot_de_passe = '6 caractères minimum';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register(form.nom, form.email, form.mot_de_passe, role, form.telephone);
      const data = await login(form.email, form.mot_de_passe);
      await signIn(data.user, data.token);
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible de créer le compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez ALPHA trans</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Role */}
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleBtn, role === 'passager' && styles.roleActive]}
              onPress={() => setRole('passager')}>
              <Text style={[styles.roleText, role === 'passager' && styles.roleTextActive]}>Passager</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleBtn, role === 'chauffeur' && styles.roleActive]}
              onPress={() => setRole('chauffeur')}>
              <Text style={[styles.roleText, role === 'chauffeur' && styles.roleTextActive]}>Chauffeur</Text>
            </TouchableOpacity>
          </View>

          {/* Nom */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.nom && styles.inputError]}
              placeholder="Nom complet"
              value={form.nom}
              onChangeText={(text) => setForm({...form, nom: text})}
              editable={!loading}
            />
            {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Téléphone (optionnel)"
              value={form.telephone}
              onChangeText={(text) => setForm({...form, telephone: text})}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => setForm({...form, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Mot de passe */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.mot_de_passe && styles.inputError]}
                placeholder="Mot de passe (6 caractères min)"
                value={form.mot_de_passe}
                onChangeText={(text) => setForm({...form, mot_de_passe: text})}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {errors.mot_de_passe && <Text style={styles.errorText}>{errors.mot_de_passe}</Text>}
          </View>

          {/* Bouton */}
          <TouchableOpacity 
            style={[styles.registerBtn, loading && styles.btnDisabled]} 
            onPress={handleRegister} 
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          {/* Lien connexion */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
            <Text style={styles.loginText}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  roleActive: {
    backgroundColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  registerBtn: {
    backgroundColor: COLORS.accent || COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});