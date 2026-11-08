// src/components/WebMap.js
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function WebMap({ depart, arrivee, distance, estimatedPrice, estimatedDuration }) {
  
  // Génère un rendu Leaflet avec calcul d'itinéraire routier réel (OSRM)
  const getMapHtmlContent = () => {
    if (!depart || !arrivee) return '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- Styles & Scripts Leaflet Base -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        
        <!-- Plugin Leaflet Routing Machine pour tracer la vraie route -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
        <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
        
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; background: #f8fafc; }
          .leaflet-attribution-flag { display: none !important; }
          /* Masquer le panneau textuel d'instructions de feuille de route Leaflet pour garder la carte propre */
          .leaflet-routing-container { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var latA = ${depart.latitude};
          var lonA = ${depart.longitude};
          var latB = ${arrivee.latitude};
          var lonB = ${arrivee.longitude};

          // Initialisation de la carte
          var map = L.map('map', { zoomControl: false });
          
          // Fond de carte moderne et épuré
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
          }).addTo(map);

          // Icônes personnalisées pour le Départ (Vert) et l'Arrivée (Rouge)
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

          // Configuration du moteur de routage (Tracé de la vraie route)
          var routingControl = L.Routing.control({
            waypoints: [
              L.latLng(latA, lonA),
              L.latLng(latB, lonB)
            ],
            router: L.Routing.osrmv1({
              serviceUrl: 'https://router.project-osrm.org/route/v1' // Serveur de routage OpenStreetMap gratuit
            }),
            // Personnalisation des marqueurs créés par le moteur de calcul de route
            createMarker: function(i, waypoint, n) {
              if (i === 0) {
                return L.marker(waypoint.latLng, { icon: iconA }).bindPopup("<b>Départ</b><br>${depart.nom || 'Point A'}");
              }
              if (i === n - 1) {
                return L.marker(waypoint.latLng, { icon: iconB }).bindPopup("<b>Arrivée</b><br>${arrivee.nom || 'Point B'}");
              }
              return null;
            },
            // Style de la ligne de route
            lineOptions: {
              styles: [{ color: '${COLORS.primary || '#0F172A'}', opacity: 0.85, weight: 5 }]
            },
            addWaypoints: false, // Empêche l'utilisateur d'ajouter des étapes en glissant la ligne
            fitSelectedRoutes: true // Cadrage et zoom automatique immédiat sur le trajet calculé
          }).addTo(map);
        </script>
      </body>
      </html>
    `;
  };

  const hasRoute = depart && arrivee;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="navigate-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.title}>Itinéraire routier</Text>
      </View>
      
      <View style={styles.mapContainer}>
        {hasRoute && Platform.OS === 'web' ? (
          <iframe
            title="Carte interactive du trajet"
            srcDoc={getMapHtmlContent()}
            style={styles.iframe}
            frameBorder="0"
          />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.iconCircle}>
              <Ionicons name="map-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.placeholderText}>
              Sélectionnez vos points de ralliement pour générer l'itinéraire.
            </Text>
          </View>
        )}
      </View>
      
      {hasRoute && (
        <View style={styles.infoPanel}>
          <View style={styles.routeRow}>
            <View style={styles.timelineIndicators}>
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              <View style={styles.lineConnector} />
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            </View>
            
            <View style={styles.routeDetails}>
              <Text style={styles.infoText} numberOfLines={1}>
                <Text style={styles.routeLabel}>Départ :</Text> {depart.nom || 'Point A'}
              </Text>
              <Text style={[styles.infoText, { marginTop: 12 }]} numberOfLines={1}>
                <Text style={styles.routeLabel}>Arrivée :</Text> {arrivee.nom || 'Point B'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{distance || '--'} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {estimatedPrice ? `${estimatedPrice.toLocaleString()} Ar` : '-- Ar'}
              </Text>
              <Text style={styles.statLabel}>Prix estimé</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {estimatedDuration ? `~ ${estimatedDuration}` : '--'}
              </Text>
              <Text style={styles.statLabel}>Durée</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    margin: SPACING.md,
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  mapContainer: { height: 340, backgroundColor: '#FAFAFA' },
  iframe: { width: '100%', height: '100%', border: 'none' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 14 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#64748B', textAlign: 'center', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  infoPanel: { padding: 16, backgroundColor: '#FFFFFF' },
  routeRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  timelineIndicators: { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  lineConnector: { flex: 1, width: 2, backgroundColor: '#E2E8F0', marginVertical: 4 },
  routeDetails: { flex: 1, justifyContent: 'center' },
  infoText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  routeLabel: { color: '#94A3B8', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  statValue: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
});