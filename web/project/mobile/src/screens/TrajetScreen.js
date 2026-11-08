import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform, StatusBar, Alert,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '../utils/theme';
import { isWeb } from '../utils/platform';

// Composant carte Web (Leaflet + Routing Engine)
const WebMapComponent = ({ depart, arrivee }) => {
  if (!depart || !arrivee) {
    return (
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={48} color={(COLORS && COLORS.primary) || '#0F172A'} />
        <Text style={styles.mapPlaceholderText}>Sélectionnez un trajet pour voir la carte</Text>
      </View>
    );
  }

  const nomDepart = (depart.nom || 'Point A').replace(/['"`]/g, ' ');
  const nomArrivee = (arrivee.nom || 'Point B').replace(/['"`]/g, ' ');
  const colorRoute = (COLORS && COLORS.primary) || '#0F172A';

  const mapHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
      <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background: #f8fafc; }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-routing-container { display: none !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        try {
          var latA = ${depart.latitude || -18.9137};
          var lonA = ${depart.longitude || 47.5361};
          var latB = ${arrivee.latitude || -20.2894};
          var lonB = ${arrivee.longitude || 44.2948};

          var map = L.map('map', { zoomControl: false });
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
          }).addTo(map);

          var iconA = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          });

          var iconB = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          });

          L.Routing.control({
            waypoints: [L.latLng(latA, lonA), L.latLng(latB, lonB)],
            router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
            createMarker: function(i, waypoint, n) {
              if (i === 0) return L.marker(waypoint.latLng, { icon: iconA }).bindPopup("<b>Départ</b><br>${nomDepart}");
              if (i === n - 1) return L.marker(waypoint.latLng, { icon: iconB }).bindPopup("<b>Arrivée</b><br>${nomArrivee}");
              return null;
            },
            lineOptions: { styles: [{ color: '${colorRoute}', opacity: 0.85, weight: 5 }] },
            addWaypoints: false,
            fitSelectedRoutes: true
          }).addTo(map);
        } catch (e) {
          console.error("Erreur d'initialisation de la carte:", e);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.webMapContainer}>
      <iframe
        title="Carte interactive du trajet"
        srcDoc={mapHtmlContent}
        style={styles.webMapIframe}
        frameBorder="0"
      />
    </View>
  );
};

export default function TrajetScreen({ navigation, route }) {
  const demande = route && route.params ? route.params.demande : null;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const depart = demande ? { 
    latitude: parseFloat(demande.lat_dep) || -18.9137, 
    longitude: parseFloat(demande.lon_dep) || 47.5361,
    nom: demande.ville_depart || 'Départ'
  } : null;
  
  const arrivee = demande ? { 
    latitude: parseFloat(demande.lat_arr) || -20.2894, 
    longitude: parseFloat(demande.lon_arr) || 44.2948,
    nom: demande.ville_arrivee || 'Arrivée'
  } : null;

  // Extraction directe des coordonnées du Chauffeur depuis l'objet demande
  const nomChauffeur = demande?.nom_chauffeur || demande?.chauffeur?.nom || 'Chauffeur ALPHA';
  const phoneChauffeur = demande?.telephone_chauffeur || demande?.chauffeur?.telephone || demande?.telephone;

  const handleContact = () => {
    if (!phoneChauffeur) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible pour ce chauffeur.');
      return;
    }

    const url = `tel:${phoneChauffeur}`;

    if (Platform.OS === 'web') {
      window.location.href = url;
    } else {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            Alert.alert("Numéro du Chauffeur", `${nomChauffeur} : ${phoneChauffeur}`);
          }
        })
        .catch((err) => console.error("Erreur Linking :", err));
    }
  };

  const getStatusInfo = () => {
    const warningColor = (COLORS && COLORS.warning) || '#D97706';
    if (!demande) return { text: 'Inconnu', color: '#64748B', bg: '#F1F5F9' };
    switch(demande.statut) {
      case 'acceptee': return { text: '✓ Trajet accepté par le chauffeur', color: '#10B981', bg: '#DCFCE7' };
      case 'refusee': return { text: '✗ Trajet refusé', color: '#EF4444', bg: '#FEE2E2' };
      default: return { text: '⏳ En attente du chauffeur', color: warningColor, bg: '#FEF3C7' };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={(COLORS && COLORS.primary) || '#0F172A'} />
      </View>
    );
  }

  const primaryColorDark = (COLORS && COLORS.primaryDark) || '#020617';
  const primaryColor = (COLORS && COLORS.primary) || '#0F172A';
  const paddingHeader = (SPACING && SPACING.lg) || 16;
  const marginCard = (SPACING && SPACING.md) || 12;
  const paddingCard = (SPACING && SPACING.lg) || 16;
  const radiusCard = (RADIUS && RADIUS.lg) || 12;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={[primaryColorDark, primaryColor]} style={[styles.header, { paddingHorizontal: paddingHeader, paddingBottom: paddingHeader }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suivi du trajet</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isWeb ? (
          <WebMapComponent depart={depart} arrivee={arrivee} />
        ) : (
          <View style={[styles.mobileMapPlaceholder, { margin: marginCard, borderRadius: radiusCard }]}>
            <Ionicons name="map-outline" size={48} color={primaryColor} />
            <Text style={styles.placeholderText}>La carte est disponible sur la version Web</Text>
          </View>
        )}

        {demande ? (
          <View style={[styles.infoCard, { margin: marginCard, padding: paddingCard, borderRadius: radiusCard }]}>
            <Text style={styles.cardTitle}>Détails du trajet</Text>
            
            <View style={styles.routeInfo}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeLabel}>Départ</Text>
                  <Text style={styles.routeCity}>{demande.ville_depart || 'Non spécifié'}</Text>
                </View>
              </View>
              
              <View style={styles.routeLine}>
                <View style={styles.routeLineInner} />
                <Ionicons name="car" size={16} color={primaryColor} />
                <View style={styles.routeLineInner} />
              </View>
              
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeLabel}>Arrivée</Text>
                  <Text style={styles.routeCity}>{demande.ville_arrivee || 'Non spécifié'}</Text>
                </View>
              </View>
            </View>

            {/* Infos écrites du chauffeur */}
            {phoneChauffeur && (
              <View style={styles.contactInfoRow}>
                <Ionicons name="person-badge-outline" size={18} color="#64748B" />
                <Text style={styles.contactInfoText}>
                  Chauffeur : <Text style={styles.contactInfoName}>{nomChauffeur}</Text> ({phoneChauffeur})
                </Text>
              </View>
            )}

            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg, marginTop: 12, borderRadius: (RADIUS && RADIUS.md) || 8 }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.noTrajetCard, { margin: marginCard, borderRadius: radiusCard }]}>
            <Ionicons name="car-sport-outline" size={48} color={primaryColor} />
            <Text style={styles.noTrajetTitle}>Aucun trajet actif</Text>
          </View>
        )}

        {/* Bouton d'appel direct dédié au chauffeur */}
        {demande && phoneChauffeur && (
          <View style={[styles.actionsContainer, { margin: marginCard }]}>
            <TouchableOpacity style={[styles.callButton, { backgroundColor: primaryColor, borderRadius: (RADIUS && RADIUS.md) || 8 }]} onPress={handleContact}>
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.callButtonText}> Contacter le Chauffeur</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.noteContainer, { margin: marginCard, borderRadius: (RADIUS && RADIUS.md) || 8 }]}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          <Text style={styles.noteText}>
            Une fois validé, vous pouvez appeler directement votre chauffeur pour convenir du lieu exact de ralliement.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: Platform.OS === 'ios' ? 55 : 45 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  content: { flex: 1 },
  
  webMapContainer: { height: 350, margin: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  webMapIframe: { width: '100%', height: '100%', border: 'none' },
  mapPlaceholder: { height: 350, margin: 12, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', gap: 12 },
  mapPlaceholderText: { color: '#64748B', textAlign: 'center', fontSize: 14, paddingHorizontal: 16 },
  mobileMapPlaceholder: { height: 200, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', gap: 12 },
  placeholderText: { color: '#64748B', textAlign: 'center', fontSize: 14, paddingHorizontal: 16 },
  
  infoCard: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  routeInfo: { marginBottom: 16 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeTextContainer: { flex: 1 },
  routeLabel: { fontSize: 11, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  routeCity: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  routeLine: { flexDirection: 'row', alignItems: 'center', paddingLeft: 5, marginVertical: 4, gap: 8 },
  routeLineInner: { flex: 1, height: 2, backgroundColor: '#F1F5F9' },
  
  contactInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 4 },
  contactInfoText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  contactInfoName: { fontWeight: '700', color: '#0F172A' },

  statusBadge: { padding: 12, alignItems: 'center' },
  statusText: { fontSize: 14, fontWeight: '700' },
  
  noTrajetCard: { backgroundColor: '#fff', padding: 24, alignItems: 'center', gap: 12 },
  noTrajetTitle: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  
  actionsContainer: { marginBottom: 12 },
  callButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  callButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  
  noteContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#F1F5F9', marginBottom: 30 },
  noteText: { flex: 1, fontSize: 12, color: '#64748B' },
});