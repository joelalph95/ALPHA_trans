import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getMesDemandes, deleteDemande } from '../api/client';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const STATUS_CONFIG = {
  en_attente: { label: 'En attente',  color: '#D97706', bg: '#FEF3C7', icon: 'time-outline' },
  acceptee:   { label: 'Acceptée',    color: '#059669', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
  refusee:    { label: 'Refusée',     color: '#DC2626', bg: '#FEE2E2', icon: 'close-circle-outline' },
};

export default function MesDemandesScreen({ navigation }) {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDemandes = async () => {
    try {
      const data = await getMesDemandes();
      setDemandes(data);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDemandes(); }, []);

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.statut] || STATUS_CONFIG.en_attente;
    const date = new Date(item.date_demande);
    const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Trajet', { demande: item })}
        activeOpacity={0.85}
      >
        {/* Status bar */}
        <View style={[styles.statusBar, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={14} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={styles.cardDate}>{dateStr} · {timeStr}</Text>
        </View>

        {/* Route */}
        <View style={styles.route}>
          <View style={styles.routeStop}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.primary }]} />
            <View>
              <Text style={styles.routeStopLabel}>Départ</Text>
              <Text style={styles.routeStopCity}>{item.ville_depart}</Text>
            </View>
          </View>

          <View style={styles.routeArrow}>
            <View style={styles.routeArrowLine} />
            <Ionicons name="arrow-forward" size={14} color={COLORS.textLight} />
          </View>

          <View style={styles.routeStop}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.accent }]} />
            <View>
              <Text style={styles.routeStopLabel}>Arrivée</Text>
              <Text style={styles.routeStopCity}>{item.ville_arrivee}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => navigation.navigate('Trajet', { demande: item })}
          >
            <Ionicons name="map-outline" size={14} color={COLORS.primary} />
            <Text style={styles.mapBtnText}>Voir la carte</Text>
          </TouchableOpacity>
          <Text style={styles.demandeId}>#{item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, '#2D6A4F']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mes Trajets</Text>
          <Text style={styles.headerSub}>{demandes.length} demande(s)</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} size="large" />
      ) : (
        <FlatList
          data={demandes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDemandes(); }} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="map-outline" size={56} color={COLORS.border} />
              <Text style={styles.emptyTitle}>Aucune demande</Text>
              <Text style={styles.emptySub}>Réservez votre premier trajet !</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Reservation')}>
                <Text style={styles.emptyBtnText}>Faire une réservation</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingTop: 55, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: FONTS.xl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FONTS.sm, color: 'rgba(255,255,255,0.7)' },

  list: { padding: SPACING.lg, gap: SPACING.md },

  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    overflow: 'hidden', ...SHADOW.md,
  },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    padding: SPACING.sm, paddingHorizontal: SPACING.md,
  },
  statusText: { fontSize: FONTS.xs, fontWeight: '800', flex: 1 },
  cardDate: { fontSize: FONTS.xs, color: COLORS.textLight },

  route: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.sm,
  },
  routeStop: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  routeDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  routeStopLabel: { fontSize: FONTS.xs, color: COLORS.textLight, fontWeight: '600', textTransform: 'uppercase' },
  routeStopCity: { fontSize: FONTS.md, fontWeight: '800', color: COLORS.text },
  routeArrow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  routeArrowLine: { width: 16, height: 1, backgroundColor: COLORS.border },

  cardActions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
  },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${COLORS.primary}12`, paddingHorizontal: SPACING.sm,
    paddingVertical: 4, borderRadius: RADIUS.full,
  },
  mapBtnText: { fontSize: FONTS.xs, fontWeight: '700', color: COLORS.primary },
  demandeId: { fontSize: FONTS.xs, color: COLORS.textLight },

  empty: { alignItems: 'center', marginTop: 80, gap: SPACING.sm },
  emptyTitle: { fontSize: FONTS.xl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.sm },
  emptySub: { fontSize: FONTS.sm, color: COLORS.textLight },
  emptyBtn: {
    marginTop: SPACING.md, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  emptyBtnText: { fontSize: FONTS.md, fontWeight: '700', color: '#fff' },
});
