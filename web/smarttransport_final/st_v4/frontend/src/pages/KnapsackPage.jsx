import { useState } from "react";
import { api } from "../utils/api";

export default function KnapsackPage({ user }) {
  if (!user || user.role !== "driver") {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-dim)" }}>
        <span style={{ fontSize: "4rem" }}>🚐</span>
        <h2 style={{ margin: "1rem 0 0.5rem", fontSize: "1.5rem" }}>Accès chauffeur requis</h2>
        <p style={{ maxWidth: "400px", margin: "0 auto", fontSize: "0.95rem" }}>
          L'optimisation de remplissage est réservée aux chauffeurs de taxi-brousse. 
          Connectez-vous avec un compte chauffeur.
        </p>
      </div>
    );
  }
  const [vehicleType, setVehicleType] = useState("taxi-brousse");
  const [capacity, setCapacity] = useState(22);
  const [passengerCount, setPassengerCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const vehiclePresets = {
    "taxi-brousse": { capacity: 22, passengers: 25 },
    "minibus": { capacity: 15, passengers: 18 },
    "custom": { capacity, passengers: 30 },
  };

  const updateCapacityFromPreset = (type) => {
    const preset = vehiclePresets[type];
    setCapacity(preset.capacity);
    setPassengerCount(Math.min(preset.passengers, preset.capacity + 3));
  }; 

  const handleOptimize = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api.optimizeKnapsack(capacity, passengerCount, vehicleType);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLoading = () => {
    setResult(null); // Reset for new optimization, NO navigation
    // Could add print/save logic here
  }; 

  const selectedIds = result
    ? new Set(result.result.selected.map((p) => p.id))
    : new Set();

  const fillPercent = result
    ? Math.round((result.result.totalWeight / capacity) * 100)
    : 0;

  return (
    <div>
      <div className="section-title">🚐 Optimisation remplissage Taxi-Brousse</div>
      <p className="section-sub">
        Algorithme <strong>Knapsack 0/1</strong> — Max revenu pour votre taxi-brousse (capacité typique 20-25 places)
      </p> 

      <div className="two-col">
        {/* Paramètres */}
        <div className="card">
          <div className="card-title">⚙️ Paramètres Taxi-Brousse</div>

          <div className="form-group">
            <label>Type de véhicule</label>
            <select 
              value={vehicleType} 
              onChange={(e) => {
                setVehicleType(e.target.value);
                updateCapacityFromPreset(e.target.value);
              }}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}
            >
              <option value="taxi-brousse">🚐 Taxi-Brousse (22 places)</option>
              <option value="minibus">🚌 Minibus (15 places)</option>
              <option value="custom">⚙️ Personnalisé</option>
            </select>
          </div> 

          <div className="form-group">
            <label>Capacité du véhicule — <strong style={{ color: "var(--accent)" }}>{capacity} places</strong></label>
            <input
              type="range"
              min={8}
              max={30}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Passagers en attente — <strong style={{ color: "var(--accent)" }}>{passengerCount}</strong></label>
            <input
              type="range"
              min={capacity}
              max={30}
              value={passengerCount}
              onChange={(e) => setPassengerCount(Number(e.target.value))}
            />
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}

          <button className="btn btn-primary" onClick={handleOptimize} disabled={loading}>
            {loading ? <><span className="spinner" /> Optimisation…</> : "🚐 Optimiser remplissage"}
          </button>

          {result && (
            <button className="btn btn-success" onClick={handleConfirmLoading} style={{ marginTop: "0.5rem" }}>
              ✅ Confirmer chargement (rester sur page)
            </button>
          )} 

          {result && (
            <div style={{ marginTop: "1.25rem" }}>
              <div className="card-title">📊 Résumé</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div className="metric" style={{ textAlign: "left" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Revenu optimisé</span>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", color: "var(--green)", fontWeight: 700 }}>
                    {result.result.totalValue.toLocaleString()} Ar
                  </div>
                </div>
                <div className="metric" style={{ textAlign: "left" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Revenu baseline (1er arrivé)</span>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: "var(--yellow)", fontWeight: 700 }}>
                    {result.result.naiveValue.toLocaleString()} Ar
                  </div>
                </div>
                {result.result.savings > 0 && (
                  <div className="alert alert-success">
                    ✅ Gain : +{result.result.savings.toLocaleString()} Ar (+{result.result.gainPercent}%)
                  </div>
                )}
                <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  Algo : {result.result.algorithm} — {result.result.executionTime} ms
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visualisation passagers */}
        <div>
          {result ? (
            <>
              {/* Barre de remplissage */}
              <div className="card" style={{ marginBottom: "1rem" }}>
                <div className="card-title">📊 Taux de remplissage</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>
                    {result.result.totalWeight}/{capacity} places occupées
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>
                    {fillPercent}%
                  </span>
                </div>
                <div className="capacity-bar-wrap">
                  <div className="capacity-bar" style={{ width: `${fillPercent}%` }} />
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.78rem", flexWrap: "wrap" }}>
                  <span>
                    <span className="tag tag-green">✅ Sélectionnés</span>{" "}
                    {result.result.selected.length} passagers
                  </span>
                  <span>
                    <span className="tag tag-red">❌ Refusés</span>{" "}
                    {result.passengers.length - result.result.selected.length} passagers
                  </span>
                </div>
              </div>

              {/* Grille passagers */}
              <div className="card">
                <div className="card-title">👥 Liste des passagers</div>
                <div className="passenger-grid">
                  {result.passengers.map((p) => {
                    const isSelected = selectedIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`passenger-card ${isSelected ? "selected" : "rejected"}`}
                      >
                        <div className="passenger-name">{p.name}</div>
                        <div className="passenger-meta">
                          {p.baggages} · {p.weight === 2 ? "2 places" : "1 place"}
                        </div>
                        <div className="passenger-meta">{p.destination}</div>
                        <div className="passenger-value">{p.value.toLocaleString()} Ar</div>
                        {isSelected ? (
                          <span style={{ fontSize: "0.65rem", color: "var(--green)", marginTop: "0.2rem", display: "block" }}>✅ Embarqué</span>
                        ) : (
                          <span style={{ fontSize: "0.65rem", color: "var(--red)", marginTop: "0.2rem", display: "block" }}>❌ Refusé</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "var(--text-dim)", flexDirection: "column", gap: "0.75rem" }}>
              <span style={{ fontSize: "3rem" }}>🎒</span>
              <span style={{ fontSize: "0.85rem" }}>Lancez l'optimisation pour voir les résultats</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
