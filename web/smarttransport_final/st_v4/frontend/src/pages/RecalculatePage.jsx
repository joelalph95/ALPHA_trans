import { useState, useEffect } from "react";
import { api } from "../utils/api";
import LogoIcon from "../components/LogoIcon";
import { getMyReservations, getVehicles, optimizeVehicleKnapsack } from "../utils/api";

export default function RecalculatePage({ user, cities, routes }) {
  const [localUser, setLocalUser] = useState(user);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [closedRoutes, setClosedRoutes] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [knapsackResult, setKnapsackResult] = useState(null);
  const [disruptions, setDisruptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [knapsackLoading, setKnapsackLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

// Fetch user if not provided
  useEffect(() => {
    if (!localUser) {
      api.getMe().then(setLocalUser).catch(() => {});
    }
  }, [localUser]);

  // Passenger: Fetch real data
  useEffect(() => {
    if (localUser?.role === "passenger") {
      const fetchPassengerData = async () => {
        setRefreshing(true);
        try {
          const [closedData, reservations] = await Promise.all([
            api.getClosedRoutes(),
            api.getMyReservations()
          ]);
          setClosedRoutes(closedData.closed);
          setMyReservations(reservations || []);

          // Compute personal disruptions
          const personalImpacts = reservations.map(res => {
            const isAffected = closedData.closed.some(cr =>
              (cr.from === res.from && cr.to === res.to) || (cr.from === res.to && cr.to === res.from)
            );
            return { ...res, affected: isAffected, severity: isAffected ? 'high' : 'none' };
          }).filter(r => r.affected);
          setDisruptions(personalImpacts);
        } catch (e) {
          setError("Erreur chargement disruptions: " + e.message);
        } finally {
          setRefreshing(false);
        }
      };
      fetchPassengerData();
      const interval = setInterval(fetchPassengerData, 30000); // Auto-refresh 30s
      return () => clearInterval(interval);
    }
  }, [localUser]);

  // Driver-only full UI
  if (!localUser || localUser.role !== "driver") {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-dim)" }}>
        <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>🚐</span>
        <h2 style={{ margin: "1rem 0 0.5rem", fontSize: "1.5rem" }}>Outils recalcul réservés aux chauffeurs</h2>
        <p style={{ maxWidth: "400px", margin: "0 auto", fontSize: "0.95rem" }}>
          Les chauffeurs accèdent aux outils de recalcul d'itinéraire en cas de coupure de route. 
          <br />Les passagers reçoivent uniquement des notifications.
        </p>

        {/* Enhanced Passager dashboard */}
        {localUser?.role === "passenger" && (
          <div style={{ marginTop: "2rem", display: "grid", gap: "1rem", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            {/* Header + Refresh */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                  <LogoIcon variant="orange" /> Statut réseau en temps réel
                </div>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => window.location.reload()}
                  disabled={refreshing}
                >
                  {refreshing ? <><span className="spinner" style={{ width: "1rem", height: "1rem" }} /> </> : "🔄"} Rafraîchir
                </button>
              </div>
              <div className="metrics-row" style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
                <div className="metric">
                  <div className="metric-val">{closedRoutes.length}</div>
                  <div className="metric-name">Routes fermées</div>
                </div>
                <div className="metric">
                  <div className="metric-val">{disruptions.length}</div>
                  <div className="metric-name">Mes trajets impactés</div>
                </div>
              </div>
              {refreshing && <div className="alert alert-info" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Mise à jour en cours... (auto toutes 30s)</div>}
            </div>

            {/* Personal disruptions */}
            {disruptions.length > 0 ? (
              <div className="card">
                <div className="card-title">
                  <LogoIcon variant="red" /> Vos réservations impactées 🚨
                </div>
                {disruptions.map((dis, i) => (
                  <div key={i} className="alert alert-error" style={{ marginBottom: "0.75rem", padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <strong>{cities.find(c => c.id === dis.from)?.name || dis.from} → {cities.find(c => c.id === dis.to)?.name || dis.to}</strong>
                        <br />
                        <small>Réf: #{dis.reference} | {new Date(dis.date).toLocaleDateString('fr-MG')}</small>
                      </div>
                      <span className="tag tag-red" style={{ fontSize: "0.8rem" }}>Délai estimé +2h</span>
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => window.location.href = '/#tab=reservation'}>
                  📝 Gérer mes réservations
                </button>
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-dim)" }}>
                <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>✅</span>
                <div style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Aucune disruption sur vos trajets</div>
                <div style={{ fontSize: "0.9rem" }}>Toutes vos réservations sont à l'heure</div>
              </div>
            )}

            {/* Network-wide closed routes */}
            {closedRoutes.length > 0 && (
              <div className="card">
                <div className="card-title">
                  <LogoIcon variant="orange" /> Réseau - Routes fermées ({closedRoutes.length})
                </div>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {closedRoutes.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", borderBottom: "1px solid var(--border)", fontSize: "0.9rem" }}>
                      <span>{cities.find(c => c.id === r.from)?.name || r.from} → {cities.find(c => c.id === r.to)?.name || r.to}</span>
                      <span className="tag tag-orange">Fermée</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        <button className="btn btn-secondary" onClick={() => window.history.back() || window.location.reload()} style={{ marginTop: "1rem" }}>
          ← Retour
        </button>
      </div>
    );
  }

  // Load initial data for drivers
  useEffect(() => {
    const initDriverData = async () => {
      try {
        const closedData = await api.getClosedRoutes();
        setClosedRoutes(closedData.closed);
        const vehicles = await api.getVehicles();
        setMyVehicles(vehicles);
      } catch {}
    };
    if (localUser?.role === "driver") initDriverData();
  }, [localUser]);

  // Load knapsack for first vehicle
  useEffect(() => {
    if (localUser?.role === "driver" && myVehicles.length > 0) {
      setKnapsackLoading(true);
      api.optimizeVehicleKnapsack(myVehicles[0].id, new Date().toISOString().split('T')[0], myVehicles[0].capacity)
        .then(setKnapsackResult)
        .catch(() => {})
        .finally(() => setKnapsackLoading(false));
    }
  }, [myVehicles, localUser]);

  // Driver full UI (enhanced)
  const cityName = (id) => cities.find((c) => c.id === id)?.name || id;

  const toggleRoute = (route) => {
    const key = `${route.from}-${route.to}`;
    setClosedRoutes((prev) => {
      const exists = prev.find((r) => `${r.from}-${r.to}` === key);
      if (exists) return prev.filter((r) => `${r.from}-${r.to}` !== key);
      return [...prev, { from: route.from, to: route.to }];
    });
  };

  const isClosed = (route) =>
    closedRoutes.some((r) => r.from === route.from && r.to === route.to);

  const handleRecalculate = async () => {
    if (!from || !to) return setError("Sélectionnez un trajet de référence.");
    setError("");
    setLoading(true);
    try {
      const data = await api.recalculateRoute(from, to, closedRoutes);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-title"><LogoIcon variant="orange" /> Recalcul dynamique</div>
      <p className="section-sub">
        Itinéraires A* + Optimisation knapsack pour taxi-brousse
      </p>

      <div className="two-col">
        <div>
          {localUser?.role === "driver" && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <div className="card-title"><LogoIcon variant="primary" /> Optimisation chargement</div>
              {knapsackLoading ? (
                <div className="alert alert-info">Calcul knapsack...</div>
              ) : knapsackResult ? (
                <>
                  <div>Véhicule: {myVehicles[0]?.plate} | Gain: +{knapsackResult.gainPercent}%</div>
                  <div className="metrics-row">
                    <div className="metric">
                      <div className="metric-val">{knapsackResult.totalValue} Ar</div>
                      <div className="metric-name">Revenu optimal</div>
                    </div>
                    <div className="metric">
                      <div className="metric-val">{knapsackResult.passengers}</div>
                      <div className="metric-name">Passagers</div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="card-title"><LogoIcon variant="green" /> Trajet de référence</div>

            <div className="form-group">
              <label>Départ</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">— Sélectionner —</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Arrivée</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">— Sélectionner —</option>
                {cities.filter((c) => c.id !== from).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {closedRoutes.length > 0 && (
              <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                <LogoIcon variant="red" size="1.1rem" /> {closedRoutes.length} route(s) coupée(s) sélectionnée(s)
              </div>
            )}

            {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}><LogoIcon variant="red" /> {error}</div>}

            <button className="btn btn-primary" onClick={handleRecalculate} disabled={loading || !from || !to}>
              {loading ? <><span className="spinner" /> Recalcul…</> : <><LogoIcon variant="orange" /> Recalculer l'itinéraire</>}
            </button>
            {closedRoutes.length > 0 && (
              <button 
                className="btn btn-danger btn-sm" 
                style={{ marginLeft: "0.5rem" }}
                onClick={async () => {
                  for (const cr of closedRoutes) {
                    try {
                      await api.updateRouteStatus(cr.from, cr.to, 'closed');
                    } catch {}
                  }
                  alert(`${closedRoutes.length} routes fermées persistées au backend`);
                }}
              >
                💾 Appliquer fermetures
              </button>
            )}
          </div>

          {result && (
            <div className="card">
              <div className="card-title"><LogoIcon variant="primary" /> Itinéraire de secours</div>
              <div className="path-display">
                {result.result.pathNames.map((name, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="path-city">{name}</span>
                    {i < result.result.pathNames.length - 1 && <span className="path-arrow">→</span>}
                  </span>
                ))}
              </div>
              <div className="metrics-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="metric">
                  <div className="metric-val">{result.result.totalDistance} km</div>
                  <div className="metric-name">Distance</div>
                </div>
                <div className="metric">
                  <div className="metric-val">{result.result.totalTime} h</div>
                  <div className="metric-name">Temps estimé</div>
                </div>
              </div>
              <div className="alert alert-success" style={{ marginTop: "0.75rem" }}>
                <LogoIcon variant="green" /> Itinéraire alternatif calculé en {result.result.executionTime} ms
              </div>
            </div>
          )}
        </div>

        {/* Liste des routes à fermer */}
        <div className="card">
          <div className="card-title"><LogoIcon variant="red" /> Sélectionner les routes à couper</div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Cliquez sur une route pour la marquer comme coupée/impraticable.
          </p>
          <div className="route-list">
            {routes.map((r, idx) => {
              const closed = isClosed(r);
              return (
                <div key={idx} className={`route-item ${closed ? "closed" : ""}`}>
                  <div className="route-item-info">
                    <span style={{ fontWeight: 700 }}>
                      {cityName(r.from)} ↔ {cityName(r.to)}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                      {r.distance} km · {r.time}h
                    </span>
                    {closed && <span className="tag tag-red"><LogoIcon variant="red" size="0.9rem" /> Coupée</span>}
                  </div>
                  <button
                    className={`btn btn-sm ${closed ? "btn-secondary" : "btn-danger"}`}
                    onClick={() => toggleRoute(r)}
                  >
                    {closed ? "Rouvrir" : "Couper"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

