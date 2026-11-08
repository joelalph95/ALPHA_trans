import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getVilles, createDemande } from '../api/client';
import { COLORS, SPACING, RADIUS, SHADOW } from '../utils/theme';
import WebMap from '../components/WebMap';

const { width, height } = Dimensions.get('window');

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export default function ReservationScreen({ navigation }) {
  const [villes, setVilles] = useState([]);
  const [depart, setDepart] = useState(null);
  const [arrivee, setArrivee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalTarget, setModalTarget] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadVilles();
    
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
  }, []);

  const loadVilles = async () => {
    try {
      const data = await getVilles();
      setVilles(data);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const distance = depart && arrivee
    ? haversine(
        parseFloat(depart.latitude), 
        parseFloat(depart.longitude), 
        parseFloat(arrivee.latitude), 
        parseFloat(arrivee.longitude)
      )
    : null;

  const estimatedPrice = distance ? distance * 150 : 0;
  const estimatedDuration = distance ? Math.ceil(distance / 60) : 0;

  const handleReserver = async () => {
    if (!depart || !arrivee) {
      Alert.alert('Incomplet', 'Choisissez la ville de départ et d\'arrivée.');
      return;
    }
    if (depart.id === arrivee.id) {
      Alert.alert('Erreur', 'Le départ et l\'arrivée doivent être différents.');
      return;
    }
    
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setSubmitting(true);
    try {
      await createDemande(depart.id, arrivee.id);
      Alert.alert(
        '✅ Réservation envoyée !',
        'Votre demande est en cours de traitement.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const clearSelection = () => {
    Alert.alert(
      'Effacer la sélection',
      'Voulez-vous effacer les villes sélectionnées ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', onPress: () => { 
          setDepart(null); 
          setArrivee(null);
        }}
      ]
    );
  };

  const swapDirections = () => {
    if (depart && arrivee) {
      const temp = depart;
      setDepart(arrivee);
      setArrivee(temp);
    }
  };

  const VilleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.villeItem}
      onPress={() => {
        if (modalTarget === 'depart') {
          setDepart(item);
        } else {
          setArrivee(item);
        }
        setModalTarget(null);
      }}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(249,115,22,0.1)', 'rgba(249,115,22,0.05)']}
        style={styles.villeItemIcon}
      >
        <Ionicons
          name="location-outline"
          size={20}
          color={modalTarget === 'depart' ? COLORS.primary : COLORS.accent}
        />
      </LinearGradient>
      <Text style={styles.villeItemText}>{item.nom}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, '#2D6A4F']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Réservation</Text>
            <Text style={styles.headerSub}>Choisissez votre trajet</Text>
          </View>
          {depart && arrivee && (
            <TouchableOpacity onPress={clearSelection} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <Animated.ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* City selectors */}
        <Animated.View style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.cardIcon}
            >
              <Ionicons name="map-outline" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Sélectionnez votre trajet</Text>
          </View>

          {/* Depart */}
          <View style={styles.cityRow}>
            <View style={styles.cityBadge}>
              <View style={[styles.cityDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.cityBadgeText}>DÉPART</Text>
            </View>
            <TouchableOpacity
              style={styles.citySelector}
              onPress={() => setModalTarget('depart')}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={22} color={COLORS.primary} />
              <Text style={[styles.citySelectorText, !depart && styles.placeholder]}>
                {depart ? depart.nom : 'Choisir la ville de départ'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* Route line with swap button */}
          <View style={styles.routeLine}>
            <View style={styles.routeLineInner} />
            {depart && arrivee && (
              <TouchableOpacity style={styles.routeIcon} onPress={swapDirections}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  style={styles.swapButton}
                >
                  <Ionicons name="swap-vertical" size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
            {(!depart || !arrivee) && (
              <View style={styles.routeIcon}>
                <View style={styles.swapButtonDisabled}>
                  <Ionicons name="swap-vertical" size={16} color="#CBD5E1" />
                </View>
              </View>
            )}
          </View>

          {/* Arrivée */}
          <View style={styles.cityRow}>
            <View style={styles.cityBadge}>
              <View style={[styles.cityDot, { backgroundColor: COLORS.accent }]} />
              <Text style={styles.cityBadgeText}>ARRIVÉE</Text>
            </View>
            <TouchableOpacity
              style={styles.citySelector}
              onPress={() => setModalTarget('arrivee')}
              activeOpacity={0.8}
            >
              <Ionicons name="flag-outline" size={22} color={COLORS.accent} />
              <Text style={[styles.citySelectorText, !arrivee && styles.placeholder]}>
                {arrivee ? arrivee.nom : 'Choisir la ville d\'arrivée'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Trip Details */}
        {depart && arrivee && distance && (
          <Animated.View 
            style={[
              styles.detailsCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <Text style={styles.detailsTitle}>Détails du voyage</Text>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <LinearGradient
                  colors={['rgba(34,197,94,0.1)', 'rgba(34,197,94,0.05)']}
                  style={styles.detailIcon}
                >
                  <Ionicons name="location" size={20} color={COLORS.primary} />
                </LinearGradient>
                <Text style={styles.detailValue}>{distance} km</Text>
                <Text style={styles.detailLabel}>Distance</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <LinearGradient
                  colors={['rgba(249,115,22,0.1)', 'rgba(249,115,22,0.05)']}
                  style={styles.detailIcon}
                >
                  <Ionicons name="cash-outline" size={20} color={COLORS.accent} />
                </LinearGradient>
                <Text style={styles.detailValue}>{estimatedPrice.toLocaleString()} Ar</Text>
                <Text style={styles.detailLabel}>Tarif estimé</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <LinearGradient
                  colors={['rgba(124,58,237,0.1)', 'rgba(124,58,237,0.05)']}
                  style={styles.detailIcon}
                >
                  <Ionicons name="time-outline" size={20} color="#7C3AED" />
                </LinearGradient>
                <Text style={styles.detailValue}>~{estimatedDuration}h</Text>
                <Text style={styles.detailLabel}>Durée estimée</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* WebMap Component - CORRECTION: Utilisation du composant WebMap */}
        {Platform.OS === 'web' ? (
          <WebMap 
            depart={depart}
            arrivee={arrivee}
            distance={distance}
            estimatedPrice={estimatedPrice}
            estimatedDuration={estimatedDuration}
          />
        ) : (
          <Animated.View 
            style={[
              styles.mobileMapContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
            ]}
          >
            <View style={styles.mobileMapHeader}>
              <Ionicons name="map-outline" size={18} color={COLORS.primary} />
              <Text style={styles.mobileMapTitle}>Récapitulatif du trajet</Text>
            </View>
            
            <View style={styles.mobileMapPlaceholder}>
              <Ionicons name="map-outline" size={48} color="#94A3B8" />
              <Text style={styles.mobileMapPlaceholderText}>
                📱 La carte interactive est disponible sur la version Web
              </Text>
              {depart && arrivee && (
                <View style={styles.mobileRouteSummary}>
                  <Text style={styles.mobileRouteSummaryTitle}>Récapitulatif :</Text>
                  <Text style={styles.mobileRouteSummaryText}>
                    <Ionicons name="location" size={14} color={COLORS.primary} /> Départ : {depart.nom}
                  </Text>
                  <Text style={styles.mobileRouteSummaryText}>
                    <Ionicons name="flag" size={14} color={COLORS.accent} /> Arrivée : {arrivee.nom}
                  </Text>
                  <Text style={styles.mobileRouteSummaryDistance}>
                    📏 Distance : {distance} km
                  </Text>
                  <Text style={styles.mobileRouteSummaryDuration}>
                    ⏱️ Durée estimée : ~{estimatedDuration} heures
                  </Text>
                  <Text style={styles.mobileRouteSummaryPrice}>
                    💰 Prix estimé : {estimatedPrice.toLocaleString()} Ar
                  </Text>
                </View>
              )}
              <Text style={styles.mobileMapHint}>
                💡 Utilisez la version Web pour voir la carte interactive
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Reserve Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.reserveBtn, (!depart || !arrivee) && styles.reserveBtnDisabled]}
            onPress={handleReserver}
            disabled={submitting || !depart || !arrivee}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={depart && arrivee ? [COLORS.accent, '#EA580C'] : ['#CBD5E1', '#CBD5E1']}
              style={styles.reserveGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                  <Text style={styles.reserveBtnText}>Confirmer la réservation</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: SPACING.xl }} />
      </Animated.ScrollView>

      {/* City Picker Modal */}
      <Modal
        visible={!!modalTarget}
        animationType="slide"
        transparent
        onRequestClose={() => setModalTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <LinearGradient
              colors={['rgba(34,197,94,0.05)', 'rgba(249,115,22,0.05)']}
              style={styles.modalHeader}
            >
              <Ionicons 
                name={modalTarget === 'depart' ? 'location-outline' : 'flag-outline'} 
                size={24} 
                color={modalTarget === 'depart' ? COLORS.primary : COLORS.accent} 
              />
              <Text style={styles.modalTitle}>
                {modalTarget === 'depart' ? 'Ville de départ' : "Ville d'arrivée"}
              </Text>
            </LinearGradient>
            
            <FlatList
              data={villes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <VilleItem item={item} />}
              ItemSeparatorComponent={() => <View style={styles.villeItemSep} />}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity 
              style={styles.modalClose} 
              onPress={() => setModalTarget(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#fff',
    letterSpacing: -0.5,
  },
  
  headerSub: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.8)' 
  },

  content: { 
    flex: 1 
  },
  
  scrollContent: {
    paddingBottom: SPACING.lg,
  },

  card: {
    margin: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: SPACING.lg,
    ...SHADOW.md,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  
  cityRow: {
    marginBottom: SPACING.md,
  },
  
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  
  cityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  
  cityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  
  citySelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  
  placeholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },

  routeLine: {
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  
  routeLineInner: {
    width: 2,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  
  routeIcon: {
    position: 'absolute',
    top: '50%',
    marginTop: -14,
  },
  
  swapButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.sm,
  },
  
  swapButtonDisabled: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: SPACING.md,
  },
  
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  detailValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  
  detailDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E2E8F0',
  },

  mobileMapContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOW.md,
    backgroundColor: '#fff',
  },
  
  mobileMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  
  mobileMapTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  
  mobileMapPlaceholder: {
    minHeight: 300,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  
  mobileMapPlaceholderText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  
  mobileRouteSummary: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    width: '100%',
  },
  
  mobileRouteSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  
  mobileRouteSummaryText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  
  mobileRouteSummaryDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  
  mobileRouteSummaryDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 4,
  },
  
  mobileRouteSummaryPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: 8,
  },
  
  mobileMapHint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },

  reserveBtn: {
    marginHorizontal: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  
  reserveBtnDisabled: {
    opacity: 0.6,
  },
  
  reserveGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  
  reserveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
  },
  
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  
  villeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 16,
  },
  
  villeItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  villeItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  
  villeItemSep: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: SPACING.lg,
  },
  
  modalClose: {
    margin: SPACING.lg,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
});