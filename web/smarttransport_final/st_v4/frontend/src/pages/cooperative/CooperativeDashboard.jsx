import { useState, useEffect, useCallback } from "react";
import { api } from "../../utils/api";
import LogoIcon from "../../components/LogoIcon";
import CooperativeVehicles from "./CooperativeVehicles";
import CooperativeDrivers from "./CooperativeDrivers";

const ar = (n) => n ? `${parseInt(n).toLocaleString("fr-FR")} Ar` : "—";

export default function CooperativeDashboard({ user }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    reservations: 0,
    revenue: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with real endpoints later
      const [vehiclesRes, driversRes, reservationsRes] = await Promise.all([
        api.getCoopVehicles(),
        api.getCoopDrivers(),
        api.getCoopReservations()
      ]);
      
      const vehicles = vehiclesRes.vehicles || [];
      const drivers = driversRes.drivers || [];
      const reservations = reservationsRes.reservations || [];
      
      setStats({
        vehicles: vehicles.length,
        drivers: drivers.length,
        reservations: reservations.length,
        revenue: reservations.reduce((sum, r) => sum + (r.tarif_total || 0), 0),
        pending: reservations.filter(r => r.statut === "en_attente").length
      });
    } catch (e) {
      console.error("Stats load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (!user || user.role !== "cooperative") return (
    <div className="card" style={{maxWidth:420,margin:"4rem auto",textAlign:"center",padding:"3rem"}}>
      <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🚫</div>
      <div style={{fontWeight:700}}>Accès coopérative requis</div>
    </div>
  );

  return (
    <div>
      <div style={{marginBottom:"2rem"}}>
        <h1 style={{fontSize:"1.6rem",fontWeight:800,letterSpacing:"-0.03em",background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"0.25rem"}}>
          🏢 Tableau de bord Coopérative
        </h1>
        <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>Gérez votre flotte de véhicules et chauffeurs</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1rem",marginBottom:"2rem"}}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card" style={{height:80,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-muted)"}}>
              Chargement...
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid" style={{marginBottom:"2rem"}}>
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--accent)"}}>{stats.vehicles}</div>
            <div className="stat-label">Véhicules</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--green)"}}>{stats.drivers}</div>
            <div className="stat-label">Chauffeurs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--yellow)"}}>{stats.pending}</div>
            <div className="stat-label">À confirmer</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--accent2)",fontSize:"1rem"}}>{ar(stats.revenue)}</div>
            <div className="stat-label">Chiffre d'affaires</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--accent)"}}>{stats.reservations}</div>
            <div className="stat-label">Réservations total</div>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div style={{display:"flex",gap:"0.25rem",marginBottom:"1.75rem",background:"var(--bg-input)",padding:"0.3rem",borderRadius:40,width:"fit-content",border:"1px solid var(--border)"}}>
        {[
          ["overview", "📊 Aperçu"],
          ["vehicles", "🚐 Véhicules"],
          ["drivers", "👥 Chauffeurs"]
        ].map(([v, l]) => (
          <button 
            key={v} 
            onClick={() => setTab(v)} 
            style={{
              position: "relative",
              background: tab === v ? "var(--accent)" : "none",
              color: tab === v ? "#fff" : "var(--text-muted)",
              border: "none",
              borderRadius: 40,
              padding: "0.45rem 1.1rem",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.82rem",
              transition: "all 0.2s",
              boxShadow: tab === v ? "0 2px 8px rgba(249,115,22,0.3)" : "none"
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {tab === "overview" && (
        <div className="card" style={{padding:"2rem",textAlign:"center"}}>
          <LogoIcon variant="primary" size="4rem" style={{marginBottom:"1rem",opacity:0.8}}/>
          <h2 style={{fontSize:"1.2rem",fontWeight:700,marginBottom:"1rem"}}>Bienvenue dans votre espace coopérative</h2>
          <p style={{color:"var(--text-muted)",fontSize:"0.9rem",maxWidth:"500px",margin:"0 auto"}}>
            Gérez efficacement votre flotte de taxi-brousse, vos chauffeurs et suivez vos réservations en temps réel.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:"1.5rem",marginTop:"2rem"}}>
            <div className="hover-lift" style={{textAlign:"left"}}>
              <div style={{fontSize:"1.5rem",color:"var(--green)",marginBottom:"0.5rem"}}>🚐</div>
              <div style={{fontWeight:700}}>Flotte centralisée</div>
              <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>Toutes vos voitures au même endroit</p>
            </div>
            <div className="hover-lift" style={{textAlign:"left"}}>
              <div style={{fontSize:"1.5rem",color:"var(--accent)",marginBottom:"0.5rem"}}>👥</div>
              <div style={{fontWeight:700}}>Gestion chauffeurs</div>
              <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>Recrutez et suivez vos conducteurs</p>
            </div>
            <div className="hover-lift" style={{textAlign:"left"}}>
              <div style={{fontSize:"1.5rem",color:"var(--accent2)",marginBottom:"0.5rem"}}>💰</div>
              <div style={{fontWeight:700}}>Suivi financier</div>
              <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>Recettes et réservations en temps réel</p>
            </div>
          </div>
        </div>
      )}

      {tab === "vehicles" && <CooperativeVehicles user={user} />}
      {tab === "drivers" && <CooperativeDrivers user={user} />}
    </div>
  );
}
