import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getAllDemandes, accepterDemande, refuserDemande } from '../api/client';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function MesPassagersScreen({ navigation }) {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDemandes = async () => {
    try {
      const data = await getAllDemandes();
      setDemandes(data);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDemandes(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === 'accepter') await accepterDemande(id);
      else await refuserDemande(id);
      fetchDemandes();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.date_demande);
    const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        {/* Header de la carte */}
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
               <LinearGradient 
                colors={[COLORS.primary, '#4C669F']} 
                style={styles.passagerAvatar}
              >
                <Text style={styles.avatarText}>{item.passager?.charAt(0)?.toUpperCase()}</Text>
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.passagerName}>{item.passager}</Text>
              <Text style={styles.timeTag}>{dateStr} • {timeStr}</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>EN ATTENTE</Text>
          </View>
        </View>

        {/* Trajet Style Timeline */}
        <View style={styles.routeContainer}>
          <View style={styles.timeline}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <View style={styles.line} />
            <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
          </View>
          <View style={styles.routeDetails}>
            <Text style={styles.cityText}>{item.ville_depart}</Text>
            <Text style={styles.cityText}>{item.ville_arrivee}</Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => handleAction(item.id, 'refuser')}
            disabled={!!actionLoading}
            activeOpacity={0.7}
          >
            {actionLoading === item.id + 'refuser' ? (
              <ActivityIndicator color={COLORS.error} size="small" />
            ) : (
              <Text style={styles.btnTextSecondary}>Refuser</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => handleAction(item.id, 'accepter')}
            disabled={!!actionLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00B4D8', COLORS.primary]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {actionLoading === item.id + 'accepter' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.btnTextPrimary}>Accepter</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Passagers</Text>
          <Text style={styles.headerSub}>{demandes.length} demandes à traiter</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loader}>
            <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
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
              <View style={styles.emptyIconCircle}>
                <Ionicons name="mail-open-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Tout est à jour !</Text>
              <Text style={styles.emptySub}>Vous n'avez aucune demande de passager pour le moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  
  // Header
  header: {
    paddingTop: 60, paddingBottom: 25, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 15,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 45, height: 45, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#94A3B8', marginTop: 2 },

  // List & Cards
  list: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 24,
    marginBottom: 20, padding: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    ...SHADOW.md, // Assurez-vous que SHADOW.md est bien défini ou utilisez shadowColor: '#000', shadowOpacity: 0.05 etc.
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 20,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { elevation: 4, shadowColor: COLORS.primary, shadowOpacity: 0.3 },
  passagerAvatar: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  passagerName: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  timeTag: { fontSize: 13, color: '#64748B', marginTop: 3 },
  
  statusBadge: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },

  // Route Timeline
  routeContainer: {
    flexDirection: 'row', paddingHorizontal: 10, marginBottom: 20, gap: 15,
  },
  timeline: { alignItems: 'center', width: 20, paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, flex: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  routeDetails: { flex: 1, justifyContent: 'space-between', height: 50 },
  cityText: { fontSize: 15, fontWeight: '600', color: '#334155' },

  // Actions
  actions: { flexDirection: 'row', gap: 12 },
  btnSecondary: {
    flex: 1, height: 50, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FEE2E2',
  },
  btnTextSecondary: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  
  btnPrimary: { flex: 2, borderRadius: 16, overflow: 'hidden' },
  btnGradient: {
    height: 50, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'center', gap: 8,
  },
  btnTextPrimary: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Empty State
  loader: { flex: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  emptySub: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 10, lineHeight: 22 },
});