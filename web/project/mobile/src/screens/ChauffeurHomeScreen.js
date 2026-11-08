import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, Animated,
  Dimensions, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getAllDemandes, getPlannings } from '../api/client';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function ChauffeurHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('online'); // online, busy, offline

  // Animations (Utilisation de useRef persistant)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation de pulsation du statut autonome
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Récupération sécurisée des données
  const fetchData = async () => {
    try {
      const [demandesData, planningsData] = await Promise.all([
        getAllDemandes(),
        getPlannings()
      ]);
      setDemandes(Array.isArray(demandesData) ? demandesData : []);
      setPlannings(Array.isArray(planningsData) ? planningsData : []);
    } catch (e) {
      console.error('Erreur lors de la récupération des données:', e.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Lancement de l'animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const changeStatus = () => {
    const nextStatus = {
      online: 'busy',
      busy: 'offline',
      offline: 'online',
    };
    setStatus(nextStatus[status]);
  };

  const getStatusDetails = () => {
    switch (status) {
      case 'busy':
        return { color: COLORS.warning || '#F59E0B', label: 'Occupé · En trajet' };
      case 'offline':
        return { color: COLORS.error || '#EF4444', label: 'Hors ligne · Indisponible' };
      case 'online':
      default:
        return { color: COLORS.success || '#10B981', label: 'En ligne · Disponible' };
    }
  };

  const currentStatus = getStatusDetails();
  const pendingDemandesCount = demandes.filter(d => d?.statut === 'en_attente').length;

  const menuItems = [
    {
      icon: 'people-outline',
      label: 'Mes Passagers',
      sub: `${pendingDemandesCount} demande(s) en attente`,
      color: COLORS.accent || '#F97316',
      onPress: () => navigation.navigate('MesPassagers'),
      badge: pendingDemandesCount,
    },
    {
      icon: 'map-outline',
      label: 'Navigation',
      sub: 'Voir la carte de votre trajet',
      color: COLORS.primary || '#1E3A8A',
      onPress: () => navigation.navigate('Trajet', { demande: null }),
    },
    {
      icon: 'calendar-outline',
      label: 'Planning',
      sub: `${plannings.length} trajet(s) planifié(s)`,
      color: '#8B5CF6',
      onPress: () => navigation.navigate('Planning'),
    },
    {
      icon: 'stats-chart-outline',
      label: 'Mes Statistiques',
      sub: 'Performance et gains',
      color: '#10B981',
      onPress: () => navigation.navigate('ChauffeurStats'),
    },
    {
      icon: 'person-outline',
      label: 'Mon Profil',
      sub: 'Gérer mes informations',
      color: '#06B6D4',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const todayEarnings = 125000;
  const weeklyTrips = 24;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary || '#1E3A8A'}
          colors={[COLORS.primary || '#1E3A8A']}
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark || '#1E3A8A', COLORS.primary || '#3B82F6', '#10B981']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.decor1} />
        <View style={styles.decor2} />

        <View style={styles.headerTop}>
          <View style={styles.driverBadge}>
            <Ionicons name="car-sport" size={14} color={COLORS.accent || '#F97316'} />
            <Text style={styles.driverBadgeText}>CHAUFFEUR</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn} activeOpacity={0.8}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={40} color="rgba(255,255,255,0.95)" />
            </View>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.greeting}>Bonjour, Chauffeur 👋</Text>
          <Text style={styles.name} numberOfLines={1}>{user?.nom || 'Partenaire'}</Text>
        </Animated.View>

        {/* Stats bar */}
        <Animated.View style={[styles.statsBar, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{demandes.length}</Text>
            <Text style={styles.statLabel}>Demandes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{plannings.filter(p => p?.statut === 'en_cours').length}</Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{plannings.filter(p => p?.statut === 'termine').length}</Text>
            <Text style={styles.statLabel}>Terminés</Text>
          </View>
        </Animated.View>

        {/* Earnings card */}
        <Animated.View style={[styles.earningsCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View>
            <Text style={styles.earningsLabel}>Gains aujourd'hui</Text>
            <Text style={styles.earningsValue}>{todayEarnings.toLocaleString('fr-FR')} Ar</Text>
          </View>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsStats}>
            <Text style={styles.earningsStatLabel}>Estimation mois</Text>
            <Text style={styles.earningsStatValue}>{(todayEarnings * 20).toLocaleString('fr-FR')} Ar</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Status indicator */}
      <Animated.View style={[styles.statusBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.statusDotContainer}>
          <Animated.View style={[styles.statusDotPulse, { backgroundColor: currentStatus.color, transform: [{ scale: pulseAnim }] }]} />
          <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
        </View>
        <Text style={styles.statusText}>{currentStatus.label}</Text>
        <TouchableOpacity onPress={changeStatus} style={styles.statusChangeBtn} activeOpacity={0.7}>
          <Text style={styles.statusChange}>Changer</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Menu items */}
      <Animated.View style={[styles.menu, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub} numberOfLines={1}>{item.sub}</Text>
            </View>
            {item.badge > 0 && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}
            <View style={styles.menuArrow}>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Recent demands section */}
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : (
        demandes.length > 0 && (
          <Animated.View style={[styles.recentSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Demandes récentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MesPassagers')} activeOpacity={0.6}>
                <Text style={styles.recentSeeAll}>Voir tout →</Text>
              </TouchableOpacity>
            </View>

            {demandes.slice(0, 3).map((d, i) => (
              <TouchableOpacity
                key={d.id || i}
                style={styles.demandeCard}
                onPress={() => navigation.navigate('DemandeDetail', { demande: d })}
                activeOpacity={0.7}
              >
                <View style={styles.demandeAvatar}>
                  <LinearGradient
                    colors={[COLORS.primary || '#3B82F6', COLORS.accent || '#F97316']}
                    style={styles.demandeAvatarGradient}
                  >
                    <Text style={styles.demandeAvatarText}>
                      {d?.passager?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  </LinearGradient>
                </View>
                <View style={styles.demandeInfo}>
                  <Text style={styles.demandeName} numberOfLines={1}>{d?.passager || 'Passager'}</Text>
                  <Text style={styles.demandeRoute} numberOfLines={1}>
                    <Ionicons name="location" size={11} color="#64748B" />
                    {' '}{d?.ville_depart || '...'} → {d?.ville_arrivee || '...'}
                  </Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>En attente</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )
      )}

      {/* Weekly stats */}
      <Animated.View style={[styles.weeklyStats, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.weeklyTitle}>Cette semaine</Text>
        <View style={styles.weeklyRow}>
          <View style={styles.weeklyItem}>
            <View style={styles.weeklyIconBg}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary || '#3B82F6'} />
            </View>
            <Text style={styles.weeklyValue}>{weeklyTrips}</Text>
            <Text style={styles.weeklyLabel}>Trajets</Text>
          </View>
          <View style={styles.weeklyDivider} />
          <View style={styles.weeklyItem}>
            <View style={styles.weeklyIconBg}>
              <Ionicons name="star" size={18} color="#EAB308" />
            </View>
            <Text style={styles.weeklyValue}>4.8</Text>
            <Text style={styles.weeklyLabel}>Note</Text>
          </View>
          <View style={styles.weeklyDivider} />
          <View style={styles.weeklyItem}>
            <View style={styles.weeklyIconBg}>
              <Ionicons name="cash-outline" size={18} color="#10B981" />
            </View>
            <Text style={styles.weeklyValue}>850k</Text>
            <Text style={styles.weeklyLabel}>Gains (Ar)</Text>
          </View>
        </View>
      </Animated.View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: 20,
    paddingBottom: 35,
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  decor1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  driverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  driverBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
  },
  avatarBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 14,
    ...SHADOW.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff'
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 6
  },
  earningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  earningsLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 2,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  earningsDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  earningsStats: {
    alignItems: 'flex-end',
  },
  earningsStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 2,
  },
  earningsStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F97316',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 18,
    padding: 16,
    ...SHADOW.md,
  },
  statusDotContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  statusDotPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B'
  },
  statusChangeBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusChange: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '700'
  },
  menu: {
    padding: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    gap: 14,
    ...SHADOW.sm,
  },
  menuIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B'
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  menuBadge: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  menuArrow: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  recentSeeAll: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  demandeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    ...SHADOW.sm,
  },
  demandeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  demandeAvatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demandeAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  demandeInfo: {
    flex: 1,
  },
  demandeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B'
  },
  demandeRoute: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706'
  },
  weeklyStats: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    ...SHADOW.sm,
  },
  weeklyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weeklyIconBg: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginBottom: 2,
  },
  weeklyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  weeklyLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  weeklyDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E2E8F0',
  },
});