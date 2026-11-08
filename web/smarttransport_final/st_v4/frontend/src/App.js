import { useState, useEffect } from "react";
import "./App.css";
import { api } from "./utils/api";
import LogoIcon from "./components/LogoIcon";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/auth/ProfilePage";
import WelcomePage from "./pages/auth/WelcomePage";
import Dashboard from "./pages/Dashboard";
import RouteSearch from "./pages/RouteSearch";
import KnapsackPage from "./pages/KnapsackPage";
import RecalculatePage from "./pages/RecalculatePage";
import ReservationPage from "./pages/ReservationPage";
import ChauffeurPage from "./pages/chauffeur/ChauffeurPage";
import Info from "./pages/Info";
import CooperativeDashboard from "./pages/cooperative/CooperativeDashboard";


function getStored(k) {
  try { return JSON.parse(localStorage.getItem(k)); } catch { return null; }
}

/* Onglets selon le rôle */
function getTabs(role) {
  // Role utilisateur (passager) : consultation uniquement (réservation + consulter l'état via Dashboard/Info)
  const base = [
    { id: "dashboard", label: "Dashboard" },
    { id: "info", label: "Info" },
  ];

  if (role === "passenger") {
    base.splice(1, 0, { id: "reservation", label: "Réservation" });
    return base; // <-- pas d’itinéraire, pas de remplissage, pas de recalcul côté passager
  }

  // Driver/Admin (outils)
  base.push({ id: "route", label: "Itinéraire" });

  if (role === "driver") base.splice(1, 0, { id: "chauffeur", label: "Mon espace" });
  if (role === "cooperative") base.splice(1, 0, { id: "cooperative", label: "🏢 Coopérative" });
  if (role === "admin") base.splice(1, 0, { id: "chauffeur", label: "Gestion" }, { id: "reservation", label: "Réservations" });

  base.push({ id: "knapsack", label: "Remplissage" }, { id: "recalculate", label: "Recalcul" });
  return base;
}

/* ── Cloche notifications ──────────────────────────── */
function Cloche({ user }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [load, setLoad] = useState(false);

  const charger = async () => {
    try {
      const d = await api.getNotifications();
      setCount(d.nonLues);
      setNotifs(d.notifications);
    } catch {}
  };

  useEffect(() => {
    if (user) {
      charger();
      const iv = setInterval(charger,15000);
      return ()=>clearInterval(iv);
    }
  }, [user]);

  const lire = async (id) => { try { await api.marquerLue(id); charger(); } catch {} };
  const toutLire = async () => { setLoad(true); try { await api.toutMarquerLu(); charger(); } catch {} finally { setLoad(false); } };

  const ago = (iso) => {
    const m = Math.floor((Date.now()-new Date(iso).getTime())/60000);
    if(m<1) return "À l'instant";
    if(m<60) return `${m}min`;
    if(m<1440) return `${Math.floor(m/60)}h`;
    return new Date(iso).toLocaleDateString("fr-FR");
  };

  // SVG pour notifications
  const ICONS = {
    nouvelle_reservation: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
        <path d="M12 2C8.13 2 5 5.13 5 9v5l-2 2v1h16v-1l-2-2V9c0-3.87-3.13-7-7-7zm0 20c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2z"/>
      </svg>
    ),
    reservation_envoyee: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#f97316">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    ),
    reservation_confirmee: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e">
        <path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 20.3 7.71l-1.41-1.41z"/>
      </svg>
    ),
    reservation_refusee: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444">
        <path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L10.59 13.41 4.29 19.71 2.87 18.29 9.17 12 2.87 5.71 4.29 4.29 10.59 10.59 16.88 4.29z"/>
      </svg>
    ),
    reservation_annulee: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
      </svg>
    )
  };

  return (
    <>
      <button
        onClick={()=>setOpen(v=>!v)}
        style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:"0.35rem",borderRadius:"var(--radius)",transition:"background 0.15s"}}
        title="Notifications"
        onMouseEnter={e=>e.currentTarget.style.background="var(--bg-input)"}
        onMouseLeave={e=>e.currentTarget.style.background="none"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#facc15">
          <path d="M12 2C8.13 2 5 5.13 5 9v5l-2 2v1h16v-1l-2-2V9c0-3.87-3.13-7-7-7zm0 20c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2z"/>
        </svg>
        {count>0 &&
          <span style={{position:"absolute",top:-3,right:-3,background:"var(--red)",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:"0.6rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-mono)"}}>
            {count>9?"9+":count}
          </span>
        }
      </button>

      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:199}}/>
          <div style={{position:"fixed",top:"calc(var(--header-height) + 8px)",right:"1.5rem",width:360,background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:200,maxHeight:480,display:"flex",flexDirection:"column"}}>
            <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:700,fontSize:"0.88rem",display:"flex",alignItems:"center"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#facc15" style={{marginRight:"0.25rem"}}>
                  <path d="M12 2C8.13 2 5 5.13 5 9v5l-2 2v1h16v-1l-2-2V9c0-3.87-3.13-7-7-7zm0 20c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2z"/>
                </svg>
                Notifications
                {count>0 &&
                  <span style={{background:"var(--red)",color:"#fff",borderRadius:"50%",width:20,height:20,fontSize:"0.62rem",fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",marginLeft:"0.35rem"}}>
                    {count}
                  </span>
                }
              </span>
              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                {count>0 &&
                  <button onClick={toutLire} disabled={load} style={{background:"var(--bg-input)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:4,padding:"0.2rem 0.6rem",cursor:"pointer",fontSize:"0.7rem",fontFamily:"var(--font-display)"}}>
                    Tout lire
                  </button>
                }
                <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:"1rem",padding:"0.2rem"}}>✕</button>
              </div>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {notifs.length===0 ? (
                <div style={{textAlign:"center",padding:"2.5rem 1rem",color:"var(--text-muted)"}}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#9ca3af" style={{marginBottom:"0.5rem"}}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  </svg>
                  <div style={{fontSize:"0.82rem"}}>Aucune notification</div>
                </div>
              ) : notifs.map(n => (
                <div key={n.id} onClick={()=>!n.lue&&lire(n.id)} style={{padding:"0.85rem 1.25rem",borderBottom:"1px solid var(--border)",cursor:"pointer",borderLeft:n.lue?"none":"3px solid var(--accent)",opacity:n.lue?0.6:1,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-input)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <div style={{fontWeight:700,fontSize:"0.82rem",marginBottom:"0.2rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                    {ICONS[n.type] || <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280"><circle cx="12" cy="12" r="10"/></svg>}
                    {n.titre}
                    {!n.lue && <span style={{width:7,height:7,background:"var(--accent)",borderRadius:"50%",display:"inline-block",flexShrink:0}}/>}
                  </div>
                  <div style={{fontSize:"0.75rem",color:"var(--text-muted)",lineHeight:1.4}}>{n.message}</div>
                  <div style={{fontSize:"0.65rem",color:"var(--text-dim)",marginTop:"0.3rem",fontFamily:"var(--font-mono)"}}>{ago(n.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [cities, setCities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [apiOk, setApiOk] = useState(null);
  const [user, setUser] = useState(()=>getStored("st_user"));
  const [authView, setAuth] = useState(null);
  const [welcomeView, setWelcomeView] = useState(localStorage.getItem("st_firstLogin") === "true");
  const [booting, setBoot] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(()=>{
    const tk=localStorage.getItem("st_token"); const u=getStored("st_user");
    if(tk&&u){ setUser(u); setAuth(null); } else { setAuth("login"); }
    setBoot(false);
    Promise.all([api.getCities(),api.getRoutes()]).then(([c,r])=>{ setCities(c.cities); setRoutes(r.routes); setApiOk(true); }).catch(()=>setApiOk(false));
  },[]);

  const onLogin = (u) => { 
    setUser(u); 
    setAuth(null); 
    if (localStorage.getItem("st_firstLogin") === "true") {
      setWelcomeView(true);
    } else {
      if(u.role==="driver") setTab("chauffeur"); 
      else setTab("dashboard"); 
    }
  };
  const onLogout = () => { localStorage.removeItem("st_token"); localStorage.removeItem("st_user"); setUser(null); setTab("dashboard"); setAuth("login"); };
  const onUpdate = (u) => { setUser(u); localStorage.setItem("st_user",JSON.stringify(u)); };

  if(booting) return (
    <div className="app" style={{justifyContent:"center",alignItems:"center",minHeight:"100vh"}}>
      <div style={{textAlign:"center"}}>
        <LogoIcon variant="primary" size="2.5rem" style={{display:"block",margin:"0 auto 0.75rem"}}/>
        <div style={{color:"var(--text-muted)"}}>Chargement…</div>
      </div>
    </div>
  );

  if(authView==="register") return <div className="app" style={{position:"fixed",inset:0,display:"flex",justifyContent:"center",alignItems:"center"}}><RegisterPage onSuccess={onLogin} onGoLogin={()=>setAuth("login")}/></div>;
  if(authView==="login")    return <div className="app" style={{position:"fixed",inset:0,display:"flex",justifyContent:"center",alignItems:"center"}}><LoginPage onSuccess={onLogin} onGoRegister={()=>setAuth("register")}/></div>;
  if(welcomeView && user)   return <div className="app" style={{position:"fixed",inset:0,display:"flex",justifyContent:"center",alignItems:"center"}}><WelcomePage user={user} onContinue={() => {
    localStorage.removeItem("st_firstLogin");
    setWelcomeView(false);
    if(user.role==="driver") setTab("chauffeur");
    else setTab("dashboard");
  }} /></div>;

  const tabs = getTabs(user?.role);
  const init = user?.username?.charAt(0).toUpperCase() || "?";
  const roleLabel = {passenger:"Passager",driver:"Chauffeur",admin:"Admin"}[user?.role]||"";

  return (
    <div className="app">
      <header className="header" role="banner" aria-label="Navigation principale">
        <div className="header-inner">
          <div className="logo-section">
            <div className="logo" onClick={()=>setTab("dashboard")}>
              <span className="logo-text">ULTRA TRANS </span>
            </div>
          </div>

          <button className={`hamburger ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" aria-expanded={mobileOpen}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`nav ${mobileOpen ? 'mobile-open' : ''}`}>
            {tabs.map(t=>(
              <button key={t.id} className={`nav-btn${tab===t.id?" active":""}`} onClick={() => {setTab(t.id); setMobileOpen(false);}}>
                {t.label}
              </button>
            ))}
          </nav>

          <div className="user-section">
            {user && <Cloche user={user}/>}
            {user?(
              <div className="user-menu">
                <div className="user-avatar" onClick={()=>setTab("profile")} style={{cursor:"pointer"}}>{init}</div>
                <div className="user-info" onClick={()=>setTab("profile")} style={{cursor:"pointer"}}>
                  <span className="user-name">{user.username}</span>
                  <span className="user-role">{roleLabel}</span>
                </div>
              </div>
            ):(
              <div className="auth-buttons">
                <button className="btn-auth btn-login" onClick={()=>setAuth("login")}><LogoIcon variant="orange" size="1.2rem"/> Connexion</button>
                <button className="btn-auth btn-register" onClick={()=>setAuth("register")}><LogoIcon variant="green" size="1.2rem"/> Inscription</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        {tab==="dashboard" && <Dashboard user={user} cities={cities} routes={routes}/>}
        {tab==="route" && <RouteSearch cities={cities} routes={routes}/>}
        {tab==="knapsack" && <KnapsackPage cities={cities} routes={routes}/>}
        {tab==="recalculate" && <RecalculatePage cities={cities} routes={routes}/>}
        {tab==="reservation" && <ReservationPage user={user}/>}
        {tab==="chauffeur" && <ChauffeurPage user={user}/>}
        {tab==="info" && <Info/>}
{tab==="profile" && <ProfilePage user={user} onUpdate={onUpdate} onLogout={onLogout}/>}
        {tab==="cooperative" && <CooperativeDashboard user={user} />}
      </main>
    </div>
  );
}