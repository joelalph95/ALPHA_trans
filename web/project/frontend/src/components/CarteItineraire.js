import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Custom SVG markers (optimized) ─────────────────────────────────────────
const makeSvgIcon = (color, label) => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:32px;height:40px">
      <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="${color}"/>
        <circle cx="18" cy="18" r="7" fill="white" opacity="0.95"/>
      </svg>
      <span style="position:absolute;top:10px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700;color:${color};font-family:monospace">${label}</span>
    </div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -42],
});

const iconDepart  = makeSvgIcon('#16a34a', '●');
const iconArrivee = makeSvgIcon('#dc2626', '●');
const iconEtape   = makeSvgIcon('#2563eb', '●');

// ── Fit map bounds with debounce ───────────────────────────────────────────
const FitBounds = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions?.length > 0) {
      // Use setTimeout to avoid blocking render
      const timeoutId = setTimeout(() => {
        const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lon]));
        map.fitBounds(bounds, { padding: [40, 40], animate: false });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [positions, map]);
  
  return null;
};

// ── Route caching utility ──────────────────────────────────────────────────
const routeCache = new Map();

// ── Main component with performance optimizations ─────────────────────────
const CarteItineraire = ({ cheminCoords, cheminNoms }) => {
  const [routeInfo,    setRouteInfo]    = useState(null);
  const [roadGeometry, setRoadGeometry] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [mapReady,     setMapReady]     = useState(false);
  const abortControllerRef = useRef(null);

  // Generate cache key from coordinates
  const getCacheKey = useCallback((coords) => {
    return coords.map(c => `${c.lat.toFixed(4)},${c.lon.toFixed(4)}`).join('|');
  }, []);

  // ── Fetch REAL route geometry from OSRM with timeout and cache ───────────
  useEffect(() => {
    if (!cheminCoords || cheminCoords.length < 2) {
      setRoadGeometry([]);
      setRouteInfo(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchRoute = async () => {
      const cacheKey = getCacheKey(cheminCoords);
      
      // Check cache first
      if (routeCache.has(cacheKey)) {
        const cached = routeCache.get(cacheKey);
        setRoadGeometry(cached.geometry);
        setRouteInfo(cached.info);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Optimize coordinates precision (reduce to 4 decimals)
        const coords = cheminCoords
          .map(c => `${c.lon.toFixed(5)},${c.lat.toFixed(5)}`)
          .join(';');

        // Add timeout parameter and reduce geometry precision
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=simplified&geometries=geojson&steps=false&continue_straight=true`;
        
        // Set timeout to 10 seconds
        const timeoutId = setTimeout(() => abortController.abort(), 10000);
        
        const res = await fetch(url, { 
          signal: abortController.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();

        if (data.code === 'Ok' && data.routes?.[0]) {
          const route = data.routes[0];
          
          // Simplify geometry (reduce points for faster rendering)
          let geometry = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
          
          // Simplify path if too many points (every 2nd point for large routes)
          if (geometry.length > 200) {
            geometry = geometry.filter((_, idx) => idx % 2 === 0);
          }
          
          setRoadGeometry(geometry);

          const distKm   = (route.distance / 1000).toFixed(1);
          const totalMin = Math.round(route.duration / 60);
          const fuel     = (parseFloat(distKm) * 0.08).toFixed(1);
          const fuelCost = (parseFloat(fuel) * 1500).toLocaleString('fr-MG');

          const info = {
            distance: distKm,
            durationHours: Math.floor(totalMin / 60),
            durationMinutes: totalMin % 60,
            fuel,
            fuelCost,
          };
          
          setRouteInfo(info);
          
          // Store in cache
          routeCache.set(cacheKey, { geometry, info });
          
          // Limit cache size to 20 items
          if (routeCache.size > 20) {
            const firstKey = routeCache.keys().next().value;
            routeCache.delete(firstKey);
          }
        } else {
          setError('Itinéraire introuvable');
          // Set fallback straight line
          setRoadGeometry(cheminCoords.map(c => [c.lat, c.lon]));
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
          setError('Erreur de connexion');
          // Fallback to straight line
          setRoadGeometry(cheminCoords.map(c => [c.lat, c.lon]));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cheminCoords, getCacheKey]);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!cheminCoords || cheminCoords.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🗺️</div>
        <p style={styles.emptyText}>Recherchez un itinéraire pour voir la route</p>
      </div>
    );
  }

  const centre = cheminCoords[0] ? [cheminCoords[0].lat, cheminCoords[0].lon] : [-19.0, 46.5];
  const hasRoute = roadGeometry.length > 1;

  return (
    <div style={styles.wrapper}>
      {/* ── Map ── */}
      <div style={styles.mapContainer}>
        <MapContainer 
          key={`map-${cheminCoords.length}`}
          center={centre} 
          zoom={7} 
          style={styles.map} 
          scrollWheelZoom
          whenReady={() => setMapReady(true)}
        >
          {/* Use faster tile layer with lower detail for initial load */}
          <TileLayer
            attribution='&copy; OSM'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
            minZoom={4}
          />

          <FitBounds positions={cheminCoords} />

          {/* Real road geometry - simplified rendering */}
          {hasRoute && (
            <>
              <Polyline
                positions={roadGeometry}
                pathOptions={{ color: '#60a5fa', weight: 12, opacity: 0.3 }}
              />
              <Polyline
                positions={roadGeometry}
                pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.95 }}
              />
            </>
          )}

          {/* Fallback line while loading - only show after timeout */}
          {!hasRoute && !loading && cheminCoords.length >= 2 && (
            <Polyline
              positions={cheminCoords.map(c => [c.lat, c.lon])}
              pathOptions={{ color: '#94a3b8', weight: 3, dashArray: '8 6', opacity: 0.6 }}
            />
          )}

          {/* Markers - optimized with useMemo in parent would be better */}
          {cheminCoords.slice(0, 20).map((coord, i) => {
            const nom = cheminNoms?.[i] || `Étape ${i + 1}`;
            const isDepart = i === 0;
            const isEnd = i === cheminCoords.length - 1;
            const icon = isDepart ? iconDepart : isEnd ? iconArrivee : iconEtape;

            return (
              <Marker key={`marker-${i}`} position={[coord.lat, coord.lon]} icon={icon}>
                <Popup>
                  <div style={styles.popup}>
                    <span style={styles.popupTag(isDepart ? '#16a34a' : isEnd ? '#dc2626' : '#2563eb')}>
                      {isDepart ? '🚗 Départ' : isEnd ? '🏁 Arrivée' : `📍 Étape ${i}`}
                    </span>
                    <strong style={styles.popupName}>{nom}</strong>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Simplified loading indicator */}
        {loading && (
          <div style={styles.overlay}>
            <div style={styles.spinner} />
            <span style={styles.overlayText}>Chargement...</span>
          </div>
        )}

        {/* Error banner */}
        {error && !loading && (
          <div style={styles.errorBanner}>⚠️ {error}</div>
        )}

        {/* Simplified legend */}
        <div style={styles.legend}>
          <div style={styles.legendTitle}>Légende</div>
          <div style={styles.legendRow}>
            <div style={{ ...styles.legendDot, background: '#16a34a' }} />
            <span>Départ</span>
          </div>
          <div style={styles.legendRow}>
            <div style={{ ...styles.legendDot, background: '#dc2626' }} />
            <span>Arrivée</span>
          </div>
          <div style={styles.legendRow}>
            <div style={styles.legendLine} />
            <span>Trajet</span>
          </div>
        </div>
      </div>

    
    </div>
  );
};

// ── Optimized Styles ───────────────────────────────────────────────────────
const styles = {
  wrapper: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mapContainer: {
    position: 'relative',
    height: '450px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  map: { height: '100%', width: '100%' },

  emptyState: {
    height: '450px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px dashed #cbd5e1',
  },
  emptyIcon: { fontSize: '3rem', marginBottom: '8px' },
  emptyText: { color: '#64748b', fontSize: '14px', fontWeight: 500, margin: 0 },

  overlay: {
    position: 'absolute', inset: 0, zIndex: 1000,
    background: 'rgba(255,255,255,0.8)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '10px',
  },
  spinner: {
    width: '30px', height: '30px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  overlayText: { color: '#2563eb', fontWeight: 600, fontSize: '13px' },

  errorBanner: {
    position: 'absolute', bottom: '16px', left: '50%',
    transform: 'translateX(-50%)', zIndex: 1000,
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', padding: '6px 12px',
    borderRadius: '8px', fontSize: '12px', fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  legend: {
    position: 'absolute', top: '12px', right: '12px', zIndex: 999,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(4px)',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '11px',
    display: 'flex', flexDirection: 'column', gap: '4px',
    pointerEvents: 'none',
  },
  legendTitle: { fontWeight: 700, fontSize: '10px', color: '#6b7280', marginBottom: '2px' },
  legendRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendLine: {
    width: '20px', height: '3px',
    background: '#2563eb',
    borderRadius: '2px', flexShrink: 0,
  },

  popup: {
    display: 'flex', flexDirection: 'column', gap: '4px',
    minWidth: '140px', fontFamily: "'DM Sans', sans-serif",
  },
  popupTag: (color) => ({
    display: 'inline-block',
    background: color + '18',
    color,
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px', fontWeight: 700,
    width: 'fit-content',
  }),
  popupName: { fontSize: '13px', color: '#111827', marginTop: '2px' },

  infoBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  infoCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '10px 14px',
  },
  infoIcon: { fontSize: '20px' },
  infoLabel: { fontSize: '10px', color: '#64748b', fontWeight: 500 },
  infoValue: { fontSize: '14px', fontWeight: 700, color: '#0f172a' },
};

// Inject keyframe for spinner
if (typeof document !== 'undefined' && !document.getElementById('carte-spin-kf')) {
  const style = document.createElement('style');
  style.id = 'carte-spin-kf';
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export default CarteItineraire;