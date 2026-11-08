// src/screens/ChauffeurStatsScreen.js
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
import { COLORS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function ChauffeurStatsScreen({ navigation }) {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchData = async () => {
    try {
      const [demandesData, planningsData] = await Promise.all([
        getAllDemandes(),
        getPlannings()
      ]);
      setDemandes(Array.isArray(demandesData) ? demandesData : []);
      setPlannings(Array.isArray(planningsData) ? planningsData : []);
    } catch (e) {
      console.error('Erreur:', e.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Calcul des statistiques basé sur les données réelles
  const calculateStats = () => {
    // Filtrer les plannings du chauffeur connecté
    const chauffeurPlannings = plannings.filter(p => p?.chauffeur_id === user?.id);
    const chauffeurDemandes = demandes.filter(d => d?.chauffeur_id === user?.id);
    
    // Statistiques des trajets
    const completedTrips = chauffeurPlannings.filter(p => p?.statut === 'termine');
    const pendingTrips = chauffeurDemandes.filter(d => d?.statut === 'en_attente');
    const inProgressTrips = chauffeurPlannings.filter(p => p?.statut === 'en_cours');
    const cancelledTrips = chauffeurPlannings.filter(p => p?.statut === 'annule');
    
    // Calcul des distances et gains
    const totalDistance = completedTrips.reduce((sum, trip) => {
      const distance = trip?.distance || 
        (trip?.ville_depart?.distance && trip?.ville_arrivee?.distance ? 
          haversineDistance(trip.ville_depart, trip.ville_arrivee) : 0);
      return sum + distance;
    }, 0);
    
    // Prix au km (à ajuster selon votre logique métier)
    const PRICE_PER_KM = 150;
    const totalEarnings = totalDistance * PRICE_PER_KM;
    
    // Calcul des gains par jour (pour les 7 derniers jours)
    const last7Days = getLast7DaysEarnings(completedTrips, PRICE_PER_KM);
    
    // Calcul des gains par mois
    const monthlyEarnings = getMonthlyEarnings(completedTrips, PRICE_PER_KM);
    
    // Taux de satisfaction (si vous avez des notes)
    const avgRating = calculateAverageRating(chauffeurPlannings);
    
    // Calcul du revenu moyen par jour
    const daysWithTrips = new Set(completedTrips.map(t => t?.date?.split('T')[0])).size;
    const avgPerDay = daysWithTrips > 0 ? totalEarnings / daysWithTrips : 0;
    
    // Taux de complétion
    const completionRate = chauffeurPlannings.length > 0 
      ? Math.round((completedTrips.length / chauffeurPlannings.length) * 100) 
      : 0;
    
    return {
      totalTrips: completedTrips.length,
      pendingTrips: pendingTrips.length,
      inProgressTrips: inProgressTrips.length,
      cancelledTrips: cancelledTrips.length,
      totalDistance: Math.round(totalDistance),
      totalEarnings: Math.round(totalEarnings),
      avgEarningsPerDay: Math.round(avgPerDay),
      satisfactionRate: avgRating,
      completionRate,
      last7Days,
      monthlyEarnings,
      totalPlannings: chauffeurPlannings.length,
      totalDemandes: chauffeurDemandes.length,
    };
  };

  // Fonction de calcul de distance Haversine
  const haversineDistance = (ville1, ville2) => {
    if (!ville1 || !ville2) return 0;
    const R = 6371;
    const lat1 = parseFloat(ville1.latitude);
    const lon1 = parseFloat(ville1.longitude);
    const lat2 = parseFloat(ville2.latitude);
    const lon2 = parseFloat(ville2.longitude);
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  // Obtenir les gains des 7 derniers jours
  const getLast7DaysEarnings = (trips, pricePerKm) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();
    const earnings = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      const dayTrips = trips.filter(t => t?.date?.split('T')[0] === dateStr);
      const dayEarnings = dayTrips.reduce((sum, t) => {
        const distance = t?.distance || 0;
        return sum + (distance * pricePerKm);
      }, 0);
      
      earnings.push({
        day: dayName,
        earnings: dayEarnings,
        trips: dayTrips.length,
        date: dateStr
      });
    }
    return earnings;
  };

  // Obtenir les gains par mois
  const getMonthlyEarnings = (trips, pricePerKm) => {
    const monthlyData = {};
    trips.forEach(trip => {
      if (trip?.date) {
        const month = trip.date.substring(0, 7); // YYYY-MM
        const distance = trip?.distance || 0;
        const earnings = distance * pricePerKm;
        if (!monthlyData[month]) {
          monthlyData[month] = { earnings: 0, trips: 0 };
        }
        monthlyData[month].earnings += earnings;
        monthlyData[month].trips += 1;
      }
    });
    
    // Convertir en tableau pour l'affichage
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      earnings: Math.round(data.earnings),
      trips: data.trips
    })).slice(-4); // Derniers 4 mois
  };

  // Calculer la note moyenne
  const calculateAverageRating = (trips) => {
    const ratings = trips.filter(t => t?.note).map(t => t.note);
    if (ratings.length === 0) return 4.8; // Note par défaut
    const sum = ratings.reduce((a, b) => a + b, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const stats = calculateStats();

  // Données pour le graphique selon la période sélectionnée
  const getChartData = () => {
    if (selectedPeriod === 'week') {
      return stats.last7Days;
    } else {
      return stats.monthlyEarnings.map(item => ({
        week: item.month,
        earnings: item.earnings,
        trips: item.trips
      }));
    }
  };

  const chartData = getChartData();
  const maxEarnings = chartData.length > 0 ? Math.max(...chartData.map(d => d.earnings)) : 1000;

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <LinearGradient colors={[`${color}10`, `${color}05`]} style={styles.statCard}>
      <View style={[styles.statIconWrapper, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  );

  const ChartBar = ({ data, maxValue }) => (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.chartBar}>
          <Text style={styles.chartBarDay}>{item.day || item.week}</Text>
          <View style={[styles.chartBarFill, { 
            height: maxValue > 0 ? (item.earnings / maxValue) * 120 : 0,
            backgroundColor: COLORS.accent || '#F97316' 
          }]} />
          <Text style={styles.chartBarValue}>{Math.round(item.earnings / 1000)}k</Text>
          <Text style={styles.chartBarTrips}>{item.trips} trajets</Text>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]} style={styles.header}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.headerTitle}>Mes Statistiques</Text>
          <Text style={styles.headerSub}>Performance et gains</Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Sélecteur de période */}
        <View style={styles.periodSelector}>
          <TouchableOpacity style={[styles.periodBtn, selectedPeriod === 'week' && styles.periodBtnActive]} onPress={() => setSelectedPeriod('week')}>
            <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>Cette semaine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.periodBtn, selectedPeriod === 'month' && styles.periodBtnActive]} onPress={() => setSelectedPeriod('month')}>
            <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>Ce mois</Text>
          </TouchableOpacity>
        </View>

        {/* Cartes KPI */}
        <View style={styles.kpiGrid}>
          <StatCard 
            title="Gains totaux" 
            value={`${stats.totalEarnings.toLocaleString()} Ar`} 
            icon="cash-outline" 
            color="#10B981" 
            subtitle={`${stats.totalTrips} trajets effectués`}
          />
          <StatCard 
            title="Courses effectuées" 
            value={stats.totalTrips} 
            icon="car-sport-outline" 
            color={COLORS.primary} 
            subtitle={`${stats.completionRate}% de réussite`}
          />
          <StatCard 
            title="Distance parcourue" 
            value={`${stats.totalDistance} km`} 
            icon="map-outline" 
            color="#8B5CF6" 
          />
          <StatCard 
            title="Note moyenne" 
            value={stats.satisfactionRate} 
            icon="star-outline" 
            color="#EAB308" 
            subtitle="sur 5"
          />
        </View>

        {/* Graphique d'évolution */}
        {chartData.length > 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Évolution des gains</Text>
                <Text style={styles.chartSubtitle}>
                  {selectedPeriod === 'week' ? 'Cette semaine' : 'Ces 4 derniers mois'}
                </Text>
              </View>
              <View style={styles.totalEarningsBadge}>
                <Text style={styles.totalEarningsLabel}>Total</Text>
                <Text style={styles.totalEarningsValue}>
                  {chartData.reduce((sum, d) => sum + d.earnings, 0).toLocaleString()} Ar
                </Text>
              </View>
            </View>
            <ChartBar data={chartData} maxValue={maxEarnings} />
          </View>
        )}

        {/* Statistiques détaillées */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Statistiques détaillées</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Courses en attente</Text>
                <Text style={styles.detailValue}>{stats.pendingTrips}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="refresh-outline" size={20} color={COLORS.accent} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>En cours</Text>
                <Text style={styles.detailValue}>{stats.inProgressTrips}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Annulées</Text>
                <Text style={styles.detailValue}>{stats.cancelledTrips}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Moyenne par jour</Text>
                <Text style={styles.detailValue}>{stats.avgEarningsPerDay.toLocaleString()} Ar</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="document-text-outline" size={20} color="#06B6D4" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Total demandes</Text>
                <Text style={styles.detailValue}>{stats.totalDemandes}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="trending-up-outline" size={20} color="#10B981" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Taux de complétion</Text>
                <Text style={styles.detailValue}>{stats.completionRate}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Meilleurs jours (basé sur les données réelles) */}
        {stats.last7Days.length > 0 && (
          <View style={styles.bestDaysCard}>
            <Text style={styles.bestDaysTitle}>🏆 Meilleurs jours (7 derniers jours)</Text>
            <View style={styles.bestDaysList}>
              {stats.last7Days
                .sort((a, b) => b.earnings - a.earnings)
                .slice(0, 3)
                .map((item, index) => (
                  <View key={index} style={styles.bestDayItem}>
                    <Text style={styles.bestDayRank}>{index + 1}</Text>
                    <Text style={styles.bestDayName}>{item.day}</Text>
                    <Text style={styles.bestDayValue}>{item.earnings.toLocaleString()} Ar</Text>
                    <Text style={styles.bestDayTrips}>{item.trips} trajets</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Objectifs basés sur les données réelles */}
        <View style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>🎯 Objectifs du mois</Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalLabel}>Objectif financier</Text>
              <Text style={styles.goalProgress}>
                {stats.totalEarnings.toLocaleString()} Ar / 1 500 000 Ar
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${Math.min(100, (stats.totalEarnings / 1500000) * 100)}%` 
              }]} />
            </View>
            <Text style={styles.goalRemaining}>
              {stats.totalEarnings >= 1500000 ? '✅ Objectif atteint !' : 
                `Encore ${(1500000 - stats.totalEarnings).toLocaleString()} Ar à atteindre`}
            </Text>
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalLabel}>Objectif de courses</Text>
              <Text style={styles.goalProgress}>{stats.totalTrips} / 40 courses</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${Math.min(100, (stats.totalTrips / 40) * 100)}%` 
              }]} />
            </View>
            <Text style={styles.goalRemaining}>
              {stats.totalTrips >= 40 ? '✅ Objectif atteint !' : 
                `Encore ${40 - stats.totalTrips} courses ce mois`}
            </Text>
          </View>
        </View>
      </Animated.View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  header: { paddingTop: Platform.OS === 'ios' ? 55 : 45, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerDecor1: { position: 'absolute', top: -50, right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(249,115,22,0.15)' },
  headerDecor2: { position: 'absolute', bottom: -30, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(82,183,136,0.12)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  periodSelector: { flexDirection: 'row', margin: SPACING.lg, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 4, ...SHADOW.sm },
  periodBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  periodTextActive: { color: '#fff' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.md, gap: 12 },
  statCard: { width: (width - 48) / 2, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  statIconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  statTitle: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  statSubtitle: { fontSize: 10, color: '#10B981' },
  chartCard: { backgroundColor: '#fff', margin: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOW.md },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  chartTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  chartSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  totalEarningsBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md, alignItems: 'flex-end' },
  totalEarningsLabel: { fontSize: 10, color: '#92400E' },
  totalEarningsValue: { fontSize: 14, fontWeight: '800', color: '#D97706' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 200, paddingVertical: SPACING.md },
  chartBar: { alignItems: 'center', width: 50 },
  chartBarDay: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 8 },
  chartBarFill: { width: 30, borderRadius: 6, marginBottom: 6, minHeight: 2 },
  chartBarValue: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  chartBarTrips: { fontSize: 9, color: '#94A3B8', marginTop: 2 },
  detailsCard: { backgroundColor: '#fff', marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOW.sm },
  detailsTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: SPACING.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B' },
  detailValue: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  detailDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: SPACING.md },
  bestDaysCard: { backgroundColor: '#fff', marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOW.sm },
  bestDaysTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: SPACING.md },
  bestDaysList: { gap: 12 },
  bestDayItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  bestDayRank: { width: 30, fontSize: 14, fontWeight: '800', color: COLORS.accent },
  bestDayName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  bestDayValue: { fontSize: 14, fontWeight: '700', color: '#10B981', marginRight: 8 },
  bestDayTrips: { fontSize: 12, color: '#64748B' },
  goalsCard: { backgroundColor: '#fff', marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOW.sm },
  goalsTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: SPACING.md },
  goalItem: { marginBottom: SPACING.md },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  goalProgress: { fontSize: 12, color: '#64748B' },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  goalRemaining: { fontSize: 11, color: '#64748B' },
});