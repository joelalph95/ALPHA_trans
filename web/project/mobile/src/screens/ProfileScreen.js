import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView, Linking, Platform,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const ROLE_LABELS = {
  passager: { label: 'Passager', icon: 'person', color: COLORS.primary },
  chauffeur: { label: 'Chauffeur', icon: 'car-sport', color: '#0891B2' },
  cooperative: { label: 'Coopérative', icon: 'business', color: '#7C3AED' },
  admin: { label: 'Administrateur', icon: 'shield-checkmark', color: COLORS.accent },
};

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const roleConfig = ROLE_LABELS[user?.role] || ROLE_LABELS.passager;

  const handleLogout = () => {
    const executeLogout = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
      }
    };

    if (Platform.OS === 'web') {
      const confirmWeb = window.confirm('Voulez-vous vraiment vous déconnecter ?');
      if (confirmWeb) {
        executeLogout();
      }
    } else {
      Alert.alert(
        'Déconnexion',
        'Voulez-vous vraiment vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnexion', style: 'destructive', onPress: executeLogout },
        ]
      );
    }
  };

  const OPEN_WEB_URL = 'http://localhost:3000';

  const handleOpenWeb = async () => {
    try {
      await Linking.openURL(OPEN_WEB_URL);
    } catch (e) {
      Alert.alert('Erreur', `Impossible d'ouvrir le lien: ${OPEN_WEB_URL}`);
    }
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Informations personnelles', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
    { icon: 'shield-outline', label: 'Sécurité', onPress: () => {} },
    { icon: 'language-outline', label: 'Langue', value: 'Français', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Aide & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'À propos', onPress: () => {} },
    { icon: 'globe-outline', label: 'Open Web', onPress: handleOpenWeb },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerDecor} />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {user?.nom?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: `${roleConfig.color}20`, borderColor: `${roleConfig.color}40` }]}>
            <Ionicons name={roleConfig.icon} size={14} color={roleConfig.color} />
            <Text style={[styles.roleBadgeText, { color: roleConfig.color }]}>{roleConfig.label}</Text>
          </View>
        </View>

        <Text style={styles.userName}>{user?.nom}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <InfoRow icon="person-outline" label="Nom complet" value={user?.nom} />
          <View style={styles.infoSep} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email} />
          <View style={styles.infoSep} />
          <InfoRow icon="call-outline" label="Téléphone" value={user?.telephone || 'Non renseigné'} />
          <View style={styles.infoSep} />
          <InfoRow icon="briefcase-outline" label="Rôle" value={roleConfig.label} />
        </View>
      </View>

     
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ALPHA trans v1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color={COLORS.primary} />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 55, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg, alignItems: 'center', overflow: 'hidden' },
  headerDecor: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(249,115,22,0.1)' },
  backBtn: { position: 'absolute', top: 55, left: SPACING.lg, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  avatarWrapper: { alignItems: 'center', marginBottom: SPACING.sm, marginTop: SPACING.md },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', marginBottom: SPACING.sm },
  avatarLetter: { fontSize: FONTS.xxxl, fontWeight: '800', color: '#fff' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  roleBadgeText: { fontSize: FONTS.xs, fontWeight: '800', letterSpacing: 0.5 },
  userName: { fontSize: FONTS.xxl, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: FONTS.sm, color: 'rgba(255,255,255,0.7)' },
  infoSection: { padding: SPACING.lg, paddingBottom: 0 },
  infoCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, ...SHADOW.md, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  infoSep: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  infoLabel: { fontSize: FONTS.xs, color: COLORS.textLight, fontWeight: '600', textTransform: 'uppercase' },
  infoValue: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  menuSection: { padding: SPACING.lg, paddingBottom: 0 },
  menuTitle: { fontSize: FONTS.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  menuCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, ...SHADOW.md, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  menuIconWrapper: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: `${COLORS.primary}12`, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: FONTS.md, fontWeight: '600', color: COLORS.text },
  menuValue: { fontSize: FONTS.sm, color: COLORS.textLight },
  menuSep: { height: 1, backgroundColor: COLORS.border, marginLeft: 68 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, margin: SPACING.lg, marginTop: SPACING.lg, backgroundColor: '#FEE2E2', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.error },
  version: { textAlign: 'center', fontSize: FONTS.xs, color: COLORS.textLight },
});