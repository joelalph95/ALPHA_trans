import { useState } from "react";
import { api } from "../utils/api";

const TRAFFIC_LABELS = ["Normal", "Modéré (+30%)", "Dense (+70%)"];
const TRAFFIC_COLORS = ["#4ade80", "#facc15", "#f87171"];

export default function RouteSearch({ cities }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trafficLevel, setTrafficLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!from || !to) return setError("Sélectionnez les villes de départ et d'arrivée.");
    if (from === to) return setError("La ville de départ et d'arrivée doivent être différentes.");
    setError("");
    setLoading(true);
    try {
      const data = await api.optimizeRoute(from, to, trafficLevel);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cityName = (id) => cities.find((c) => c.id === id)?.name || id;

  return (
    <div>
      <div className="section-title">🗺️ Recherche d'itinéraire optimal</div>
      <p className="section-sub">
        Algorithme <strong>A*</strong> avec heuristique haversine — calcul en temps réel
      </p>

      <div className="two-col">
        {/* Formulaire */}
        <div className="card">
          <div className="card-title">⚙️ Paramètres du trajet</div>

          <div className="form-group">
            <label>Ville de départ</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ville d'arrivée</label>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {cities.filter((c) => c.id !== from).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Niveau de trafic —{" "}
              <span style={{ color: TRAFFIC_COLORS[trafficLevel], fontWeight: 700 }}>
                {TRAFFIC_LABELS[trafficLevel]}
              </span>
            </label>
            <div className="traffic-levels" style={{ marginBottom: "0.5rem" }}>
              {[0, 1, 2].map((l) => (
                <div
                  key={l}
                  className={`traffic-dot ${trafficLevel === l ? `active-${l}` : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setTrafficLevel(l)}
                />
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={2}
              value={trafficLevel}
              onChange={(e) => setTrafficLevel(Number(e.target.value))}
            />
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}

          <button className="btn btn-primary" onClick={handleSearch} disabled={loading || !from || !to}>
            {loading ? <><span className="spinner" /> Calcul en cours…</> : "🚐 Trouver le meilleur trajet"}
          </button>
        </div>

        {/* Résultat */}
        {result ? (
          <div>
            <ResultPanel result={result} cityName={cityName} />
            <ComparePanel comparison={result.comparison} optimized={result.optimized} baseline={result.baseline} />
          </div>
        ) : (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, color: "var(--text-dim)", flexDirection: "column", gap: "0.75rem" }}>
            <span style={{ fontSize: "3rem" }}>🛣️</span>
            <span style={{ fontSize: "0.85rem" }}>Le résultat du trajet apparaîtra ici</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultPanel({ result, cityName }) {
  const { optimized } = result;
  return (
    <div className="result-panel">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className="tag tag-orange">A* Optimal</span>
          <span className="tag tag-cyan">{optimized.nodesExplored} nœuds explorés</span>
          <span className="tag tag-green">{optimized.executionTime} ms</span>
        </div>
      </div>

      <div className="path-display">
        {optimized.pathNames.map((name, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="path-city">{name}</span>
            {i < optimized.pathNames.length - 1 && <span className="path-arrow">→</span>}
          </span>
        ))}
      </div>

      <div className="metrics-row">
        <div className="metric">
          <div className="metric-val">{optimized.totalDistance} km</div>
          <div className="metric-name">Distance totale</div>
        </div>
        <div className="metric">
          <div className="metric-val">{optimized.totalTime} h</div>
          <div className="metric-name">Temps estimé</div>
        </div>
        <div className="metric">
          <div className="metric-val">{optimized.totalFuel} L</div>
          <div className="metric-name">Carburant</div>
        </div>
      </div>
    </div>
  );
}

function ComparePanel({ comparison, optimized, baseline }) {
  const better = (val) => val > 0;

  return (
    <div className="result-panel" style={{ marginTop: "1rem" }}>
      <div className="card-title">📊 Comparaison : Baseline vs A*</div>
      <table className="compare-table">
        <thead>
          <tr>
            <th>Métrique</th>
            <th>Baseline (BFS)</th>
            <th>A* Optimisé</th>
            <th>Gain</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Distance</td>
            <td className="worse">{baseline.totalDistance} km</td>
            <td className="better">{optimized.totalDistance} km</td>
            <td className={better(comparison.distanceSaved) ? "better" : "neutral"}>
              {better(comparison.distanceSaved) ? "−" : "+"}{Math.abs(comparison.distanceSaved)} km
            </td>
          </tr>
          <tr>
            <td>Temps</td>
            <td className="worse">{baseline.totalTime} h</td>
            <td className="better">{optimized.totalTime} h</td>
            <td className={better(comparison.timeSaved) ? "better" : "neutral"}>
              {better(comparison.timeSaved) ? "−" : "+"}{Math.abs(comparison.timeSaved)} h
            </td>
          </tr>
          <tr>
            <td>Carburant</td>
            <td className="worse">{baseline.totalFuel} L</td>
            <td className="better">{optimized.totalFuel} L</td>
            <td className={better(comparison.fuelSaved) ? "better" : "neutral"}>
              {better(comparison.fuelSaved) ? "−" : "+"}{Math.abs(comparison.fuelSaved)} L
            </td>
          </tr>
          <tr>
            <td>Vitesse algo</td>
            <td className="worse">{baseline.executionTime} ms</td>
            <td className="better">{optimized.executionTime} ms</td>
            <td className="better">×{comparison.speedup}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
