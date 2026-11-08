import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getMesDemandes } from '../api/client';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  en_attente: { label: 'En attente', color: COLORS.warning, bg: '#FEF3C7', icon: 'time-outline' },
  acceptee:   { label: 'Acceptée',   color: COLORS.success, bg: '#DCFCE7', icon: 'checkmark-circle-outline' },
  refusee:    { label: 'Refusée',    color: COLORS.error,   bg: '#FEE2E2', icon: 'close-circle-outline' },
};

// Configuration météo par ville (à remplacer par une API réelle)
const WEATHER_DATA = {
  'Antananarivo': { temp: 22, condition: 'partly-sunny', humidity: 65, wind: 12 },
  'Toamasina': { temp: 28, condition: 'rainy', humidity: 80, wind: 15 },
  'Mahajanga': { temp: 32, condition: 'sunny', humidity: 60, wind: 10 },
  'Fianarantsoa': { temp: 20, condition: 'cloudy', humidity: 70, wind: 8 },
  'Toliara': { temp: 30, condition: 'sunny', humidity: 55, wind: 14 },
  'Antsiranana': { temp: 29, condition: 'partly-sunny', humidity: 68, wind: 11 },
};

const getWeatherIcon = (condition) => {
  switch(condition) {
    case 'sunny': return 'sunny-outline';
    case 'partly-sunny': return 'partly-sunny-outline';
    case 'cloudy': return 'cloudy-outline';
    case 'rainy': return 'rainy-outline';
    default: return 'partly-sunny-outline';
  }
};

export default function PassagerHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [greeting, setGreeting] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const timeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Mise à jour de l'heure chaque seconde
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      animateTime();
    }, 1000);
    
    // Chargement de la météo
    loadWeather();
    
    // Définir le message de salutation
    updateGreeting();
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    return () => clearInterval(timer);
  }, []);

  const animateTime = () => {
    Animated.sequence([
      Animated.timing(timeScale, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(timeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  };

  const loadWeather = async () => {
    try {
      // Simulation d'appel API météo
      // À remplacer par un vrai appel API comme OpenWeatherMap
      const defaultCity = 'Antananarivo';
      const weatherData = WEATHER_DATA[defaultCity] || WEATHER_DATA['Antananarivo'];
      setWeather(weatherData);
    } catch (error) {
      console.log('Erreur météo:', error);
      // Météo par défaut
      setWeather({ temp: 22, condition: 'partly-sunny', humidity: 65, wind: 12 });
    }
  };

  const fetchDemandes = async () => {
    try {
      const data = await getMesDemandes();
      setDemandes(data);
    } catch (e) {
      console.log('Erreur demandes:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchDemandes(); 
    updateGreeting();
  }, []);

  const onRefresh = () => { 
    setRefreshing(true); 
    fetchDemandes();
    loadWeather();
    updateGreeting();
  };

  const latestDemande = demandes[0] || null;
  
  // Formatage de l'heure
  const timeStr = currentTime.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const dateStr = currentTime.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });

  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={COLORS.primary}
          colors={[COLORS.primary, COLORS.accent]}
        />
      }
    >
      {/* Top header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, '#2D6A4F']}
        style={styles.header}
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        <View style={styles.headerDecor3} />
        <View style={styles.headerDecor4} />

        <View style={styles.headerTop}>
          <View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingIcon}>{getGreetingIcon()}</Text>
              <Text style={styles.greeting}>{greeting}</Text>
            </View>
            <Text style={styles.userName}>{user?.nom || 'Voyageur'}</Text>
            <View style={styles.userBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.userBadgeText}>Membre Premium</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.profileGradient}
            >
              <Ionicons name="person-circle" size={44} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Widgets météo et date avec heure réelle */}
        <View style={styles.widgetRow}>
          {/* Météo widget */}
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <Ionicons 
                name={weather ? getWeatherIcon(weather.condition) : 'partly-sunny-outline'} 
                size={24} 
                color={COLORS.accent} 
              />
              <View style={styles.widgetTemp}>
                <Text style={styles.widgetValue}>{weather?.temp || '--'}°C</Text>
                <Text style={styles.widgetUnit}>Ressenti {weather?.temp ? weather.temp - 2 : '--'}°</Text>
              </View>
            </View>
            <Text style={styles.widgetLabel}>Antananarivo</Text>
            <View style={styles.widgetDetails}>
              <View style={styles.widgetDetail}>
                <Ionicons name="water-outline" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.widgetDetailText}>{weather?.humidity || '--'}%</Text>
              </View>
              <View style={styles.widgetDetail}>
                <Ionicons name="leaf-outline" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.widgetDetailText}>{weather?.wind || '--'} km/h</Text>
              </View>
            </View>
          </View>

          {/* Date & heure widget */}
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <Ionicons name="time-outline" size={22} color={COLORS.primaryLight} />
              <Animated.Text 
                style={[
                  styles.widgetValue,
                  { transform: [{ scale: timeScale }] }
                ]}
              >
                {timeStr}
              </Animated.Text>
            </View>
            <Text style={styles.widgetLabel}>{dateStr}</Text>
            <View style={styles.widgetDetails}>
              <View style={styles.widgetDetail}>
                <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.widgetDetailText}>
                  Semaine {Math.ceil(currentTime.getDate() / 7)}
                </Text>
              </View>
              <View style={styles.widgetDetail}>
                <Ionicons name="alarm-outline" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.widgetDetailText}>
                  {currentTime.getHours() >= 18 ? 'Soirée' : 'Journée'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
          }
        ]}
      >
        {/* Last trip card */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.sectionDot}
            />
            <Text style={styles.sectionTitle}>Dernier trajet</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('MesDemandes')}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAll}>Voir tout</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Chargement de vos trajets...</Text>
          </View>
        ) : latestDemande ? (
          <TrajetCard 
            demande={latestDemande} 
            onPress={() => navigation.navigate('Trajet', { demande: latestDemande })} 
          />
        ) : (
          <EmptyCard onPress={() => navigation.navigate('Reservation')} />
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.sectionDot}
            />
            <Text style={styles.sectionTitle}>Actions rapides</Text>
          </View>
        </View>
        
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="map-outline"
            label="Réserver"
            color={COLORS.primary}
            onPress={() => navigation.navigate('Reservation')}
          />
          <QuickAction
            icon="list-outline"
            label="Demandes"
            color={COLORS.accent}
            onPress={() => navigation.navigate('MesDemandes')}
          />
          <QuickAction
            icon="navigate-outline"
            label="Suivi"
            color='#7C3AED'
            onPress={() => navigation.navigate('Trajet', { demande: latestDemande })}
            disabled={!latestDemande}
          />
          <QuickAction
            icon="person-outline"
            label="Profil"
            color='#0891B2'
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {/* Stats */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.sectionDot}
            />
            <Text style={styles.sectionTitle}>Mes statistiques</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.statsDetail}>Détails →</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <StatCard 
            label="Total demandes" 
            value={demandes.length} 
            icon="layers-outline" 
            color={COLORS.primary}
            trend="+12%"
          />
          <StatCard
            label="Acceptées"
            value={demandes.filter(d => d.statut === 'acceptee').length}
            icon="checkmark-circle-outline"
            color={COLORS.success}
            trend="+5"
          />
          <StatCard
            label="En attente"
            value={demandes.filter(d => d.statut === 'en_attente').length}
            icon="time-outline"
            color={COLORS.warning}
            trend=""
          />
        </View>

        {/* Section recommandation */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.sectionDot}
            />
            <Text style={styles.sectionTitle}>Recommandations</Text>
          </View>
        </View>
        
        <RecommendationCard />

        <View style={{ height: SPACING.xl }} />
      </Animated.View>
    </ScrollView>
  );
}

const TrajetCard = ({ demande, onPress }) => {
  const cfg = STATUS_CONFIG[demande.statut] || STATUS_CONFIG.en_attente;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={styles.trajetCard} 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.trajetLeft}>
          <View style={styles.trajetRoute}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.routeCity}>{demande.ville_depart}</Text>
            </View>
            <View style={styles.routeLine}>
              <View style={styles.routeLineBar} />
              <Ionicons name="car" size={12} color={COLORS.primary} style={styles.routeCar} />
              <View style={styles.routeLineBar} />
            </View>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.accent }]} />
              <Text style={styles.routeCity}>{demande.ville_arrivee}</Text>
            </View>
          </View>
          <View style={styles.trajetMeta}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.trajetDate}>En cours de traitement</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={14} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyCard = ({ onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  return (
    <TouchableOpacity style={styles.emptyCard} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={['#fff', '#F8FAFC']}
        style={styles.emptyGradient}
      >
        <Animated.View style={[styles.emptyIconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.emptyIconGradient}
          >
            <Ionicons name="car-sport-outline" size={48} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.emptyTitle}>Prêt à voyager ?</Text>
        <Text style={styles.emptyDesc}>Réservez votre premier trajet dès maintenant</Text>
        <View style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Commencer</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const QuickAction = ({ icon, label, color, onPress, disabled }) => (
  <TouchableOpacity 
    style={[styles.quickAction, disabled && styles.quickActionDisabled]} 
    onPress={onPress} 
    activeOpacity={0.8}
    disabled={disabled}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={[styles.quickActionLabel, disabled && styles.quickActionLabelDisabled]}>{label}</Text>
  </TouchableOpacity>
);

const StatCard = ({ label, value, icon, color, trend }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}10` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend && trend !== '' && (
      <View style={styles.statTrend}>
        <Ionicons name="trending-up" size={10} color={COLORS.success} />
        <Text style={styles.statTrendText}>{trend}</Text>
      </View>
    )}
  </View>
);

const RecommendationCard = () => (
  <LinearGradient
    colors={['#667eea', '#764ba2']}
    style={styles.recommendationCard}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={styles.recommendationContent}>
      <View>
        <Text style={styles.recommendationTitle}>Offre spéciale</Text>
        <Text style={styles.recommendationDesc}>-20% sur vos 3 prochains trajets</Text>
        <TouchableOpacity style={styles.recommendationButton}>
          <Text style={styles.recommendationButtonText}>Profiter</Text>
        </TouchableOpacity>
      </View>
      <Ionicons name="gift-outline" size={60} color="rgba(255,255,255,0.2)" />
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  
  headerDecor1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(249,115,22,0.15)',
  },
  
  headerDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(82,183,136,0.12)',
  },
  
  headerDecor3: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  
  headerDecor4: {
    position: 'absolute',
    bottom: '20%',
    right: '10%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  greetingIcon: {
    fontSize: 20,
  },
  
  greeting: {
    fontSize: FONTS.md,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  
  userBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  
  profileBtn: {
    overflow: 'hidden',
    borderRadius: RADIUS.full,
    ...SHADOW.md,
  },
  
  profileGradient: {
    padding: 2,
    borderRadius: RADIUS.full,
  },

  widgetRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  
  widget: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  widgetTemp: {
    alignItems: 'flex-end',
  },
  
  widgetValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  
  widgetUnit: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  
  widgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  
  widgetDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  
  widgetDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  widgetDetailText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },

  content: {
    flex: 1,
    padding: SPACING.lg,
    marginTop: -SPACING.lg,
  },

  loaderContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    ...SHADOW.sm,
  },
  
  loaderText: {
    marginTop: SPACING.md,
    color: '#64748B',
    fontSize: FONTS.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  sectionDot: {
    width: 4,
    height: 24,
    borderRadius: RADIUS.full,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  seeAll: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  statsDetail: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  trajetCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOW.md,
  },
  
  trajetLeft: {
    flex: 1,
  },
  
  trajetRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  
  routePoint: {
    alignItems: 'center',
    gap: 6,
  },
  
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  
  routeCity: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  
  routeLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  
  routeLineBar: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  
  routeCar: {
    marginHorizontal: 4,
  },
  
  trajetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  trajetDate: {
    fontSize: 11,
    color: '#64748B',
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  
  emptyGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  
  emptyIconContainer: {
    marginBottom: SPACING.md,
  },
  
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: SPACING.xs,
  },
  
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    ...SHADOW.sm,
  },
  
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  
  quickAction: {
    width: (width - (SPACING.lg * 2) - SPACING.md) / 2,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  
  quickActionDisabled: {
    opacity: 0.5,
  },
  
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  
  quickActionLabelDisabled: {
    color: '#94A3B8',
  },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 8,
    ...SHADOW.sm,
  },
  
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  
  statTrendText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
  
  recommendationCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.xs,
    ...SHADOW.md,
  },
  
  recommendationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  
  recommendationDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md,
  },
  
  recommendationButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  
  recommendationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});