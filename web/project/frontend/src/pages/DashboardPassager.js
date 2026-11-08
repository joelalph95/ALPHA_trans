// DashboardPassager.js - Version complète avec traduction

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Search, MapPin, Navigation, Clock, 
  Banknote, CheckCircle2, Timer, AlertCircle, ArrowRight,
  History, Trash2, Calendar, XCircle
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CarteItineraire from '../components/CarteItineraire';
import HistoriqueReservations from './HistoriqueReservations';

const DashboardPassager = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [ongletActif, setOngletActif] = useState('accueil');
  const [villes, setVilles] = useState([]);
  const [villesCoords, setVillesCoords] = useState({});
  const [departId, setDepartId] = useState('');
  const [arriveeId, setArriveeId] = useState('');
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [demandes, setDemandes] = useState([]);

  const backgroundImages = [
    '/img/anosy.jpg', '/img/img8.jpg', '/img/img2.jpg', '/img/img3.jpg',
    '/img/img4.jpg', '/img/img5.jpg', '/img/img6.jpg', '/img/img7.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  useEffect(() => {
    api.get('/villes')
      .then(res => {
        setVilles(res.data);
        const coords = {};
        res.data.forEach(v => {
          coords[v.id] = { lat: v.latitude, lon: v.longitude, nom: v.nom };
        });
        setVillesCoords(coords);
      })
      .catch(err => console.error('Erreur chargement villes:', err));
    loadMesDemandes();
  }, []);

  const loadMesDemandes = () => {
    api.get('/demandes/mes-demandes')
      .then(res => setDemandes(res.data))
      .catch(err => console.error('Erreur chargement demandes:', err));
  };

  const handleAddDemand = async () => {
    if (!departId || !arriveeId) {
      alert(t('passenger.selectRouteFirst') || "Veuillez d'abord rechercher un trajet.");
      return;
    }
    setReserving(true);
    try {
      await api.post('/demandes', {
        ville_depart_id: parseInt(departId),
        ville_arrivee_id: parseInt(arriveeId),
      });
      alert(t('msg.requestSent'));
      loadMesDemandes();
    } catch (err) {
      alert(err.response?.data?.error || t('common.error'));
    } finally {
      setReserving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setResultat(null);
    setLoading(true);
    if (!departId || !arriveeId || departId === arriveeId) {
      setErreur(t('passenger.selectDifferentCities') || "Sélectionnez deux villes différentes.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/itinerary', {
        departId: parseInt(departId),
        arriveeId: parseInt(arriveeId)
      });
      if (res.data) {
        const cheminAvecCoords = (res.data.chemin_ids || []).map(id => villesCoords[id] || null).filter(c => c !== null);
        setResultat({ ...res.data, cheminCoords: cheminAvecCoords });
      }
    } catch (err) {
      setErreur(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const formaterTemps = () => {
    if (!resultat) return '--';
    const h = resultat.temps_estime?.heures ?? (resultat.temps_estime_minutes ? Math.floor(resultat.temps_estime_minutes / 60) : 0);
    const m = resultat.temps_estime?.minutes ?? (resultat.temps_estime_minutes ? resultat.temps_estime_minutes % 60 : 0);
    return `${h}h ${String(m).padStart(2, '0')}min`;
  };

  const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}
      className="bg-white p-4 rounded-4 shadow-sm border border-gray-100 d-flex align-items-center gap-3">
      <div className={`p-3 rounded-3 ${colorClass}`}><Icon size={24} /></div>
      <div><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fs-4 fw-bold">{value}</motion.div>
      <div className="text-muted small">{label}</div></div>
    </motion.div>
  );

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      {/* Slideshow background */}
      <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
        {backgroundImages.map((img, index) => (
          <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }} className="position-absolute w-100 h-100"
            style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="position-absolute w-100 h-100" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)' }}></div>
          </motion.div>
        ))}
      </div>

      <div className="position-relative" style={{ zIndex: 1 }}>
        <div className="container" style={{ maxWidth: '1200px', paddingTop: '2rem', paddingBottom: '2rem' }}>
          
          <header className="mb-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
              <div className="text-center text-lg-start">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                  className="d-inline-flex align-items-center gap-2 bg-gradient-success px-3 py-1 rounded-pill mb-3">
                  <div className="pulse-dot"></div>
                  <span className="text-white small fw-semibold">{t('passenger.welcome')}</span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                  className="display-5 fw-bold mb-2 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  {t('passenger.welcome')}, <span className="position-relative">{currentUser?.nom?.split(' ')[0] || 'Passager'}
                    <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="position-absolute bottom-0 start-0 w-100 bg-gradient" style={{ height: '4px', borderRadius: '2px' }}></motion.span>
                  </span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                  className="fs-5 mb-0 text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)', fontWeight: '500' }}>
                  {t('passenger.ready') || "Prêt pour votre prochain voyage à Madagascar ?"}
                </motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 d-flex gap-2 justify-content-center justify-content-lg-start">
                  {backgroundImages.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)} className="border-0 p-0 rounded-circle transition-all"
                      style={{ width: '8px', height: '8px', backgroundColor: currentSlide === idx ? '#10b981' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s ease' }} />
                  ))}
                </motion.div>
              </div>
            </div>

            <motion.nav initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="glass-effect p-1 rounded-pill d-inline-flex gap-1 w-100 w-lg-auto">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setOngletActif('accueil')}
                  className={`btn rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2 border-0 transition-all ${ongletActif === 'accueil' ? 'btn-gradient text-white shadow-lg' : 'text-white bg-transparent'}`}>
                  <LayoutDashboard size={18} /> <span className="fw-medium">{t('passenger.home')}</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setOngletActif('recherche')}
                  className={`btn rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2 border-0 transition-all ${ongletActif === 'recherche' ? 'btn-gradient text-white shadow-lg' : 'text-white bg-transparent'}`}>
                  <Search size={18} /> <span className="fw-medium">{t('passenger.search')}</span>
                </motion.button>
                {/* ONGLET HISTORIQUE AVEC TRADUCTION */}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setOngletActif('historique')}
                  className={`btn rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2 border-0 transition-all ${ongletActif === 'historique' ? 'btn-gradient text-white shadow-lg' : 'text-white bg-transparent'}`}>
                  <History size={18} /> <span className="fw-medium">{t('history.tab')}</span>
                </motion.button>
              </div>
            </motion.nav>
          </header>

          <AnimatePresence mode="wait">
            {ongletActif === 'accueil' ? (
              <motion.div key="accueil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="row g-4 mb-5">
                  <div className="col-md-4">
                    <StatCard icon={CheckCircle2} label={t('passenger.accepted')} value={demandes.filter(d => d.statut === 'acceptee').length} colorClass="bg-success-subtle text-success" />
                  </div>
                  <div className="col-md-4">
                    <StatCard icon={Timer} label={t('passenger.pending')} value={demandes.filter(d => d.statut === 'en_attente').length} colorClass="bg-warning-subtle text-warning" />
                  </div>
                  <div className="col-md-4">
                    <StatCard icon={AlertCircle} label={t('passenger.refused')} value={demandes.filter(d => d.statut === 'refusee').length} colorClass="bg-danger-subtle text-danger" />
                  </div>
                </div>

                <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden">
                  <div className="px-4 py-4 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">{t('passenger.myTrips')}</h5>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="btn btn-light btn-sm rounded-3" onClick={() => setOngletActif('recherche')}>
                      + {t('passenger.newRequest')}
                    </motion.button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light text-muted small text-uppercase">
                        <tr><th className="px-4 py-3">{t('passenger.route')}</th><th className="py-3">{t('passenger.date')}</th><th className="py-3 text-end px-4">{t('driver.status')}</th></tr>
                      </thead>
                      <tbody>
                        {demandes.length === 0 ? (
                          <tr><td colSpan="3" className="text-center py-5 text-muted">{t('passenger.noTrips')}</td></tr>
                        ) : demandes.map((d) => (
                          <motion.tr key={d.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <td className="px-4 py-3"><div className="d-flex align-items-center gap-2">
                              <span className="fw-bold">{d.ville_depart}</span><ArrowRight size={14} className="text-muted" /><span className="fw-bold text-success">{d.ville_arrivee}</span>
                            </div></td>
                            <td className="text-muted small">{d.date_demande ? new Date(d.date_demande).toLocaleDateString('fr-FR') : '--'}</td>
                            <td className="text-end px-4">
                              <span className={`badge rounded-pill px-3 py-2 ${d.statut === 'acceptee' ? 'bg-success' : d.statut === 'en_attente' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                {d.statut === 'acceptee' ? t('status.accepted') : d.statut === 'en_attente' ? t('status.waiting') : t('status.refused')}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : ongletActif === 'recherche' ? (
              <motion.div key="recherche" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                  <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-5">
                      <label className="form-label small fw-bold text-muted">{t('passenger.departure')}</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><MapPin size={18} className="text-success"/></span>
                        <select className="form-select bg-light border-start-0" value={departId} onChange={(e) => setDepartId(e.target.value)}>
                          <option value="">{t('passenger.selectCity') || "Choisir la ville..."}</option>
                          {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-bold text-muted">{t('passenger.arrival')}</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><Navigation size={18} className="text-primary"/></span>
                        <select className="form-select bg-light border-start-0" value={arriveeId} onChange={(e) => setArriveeId(e.target.value)}>
                          <option value="">{t('passenger.selectCity') || "Choisir la ville..."}</option>
                          {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="btn btn-success w-100 py-2 rounded-3 fw-bold" disabled={loading}>
                        {loading ? t('common.loading') : t('passenger.searchButton')}
                      </motion.button>
                    </div>
                  </form>
                  {erreur && (<div className="alert alert-danger mt-3 mb-0 py-2"><AlertCircle size={16} className="me-2" />{erreur}</div>)}
                </div>

                {resultat && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card border-0 shadow-lg rounded-4 overflow-hidden mb-5">
                    <div className="card-body p-0">
                      <div className="row g-0">
                        <div className="col-lg-5 p-4 p-md-5 bg-white">
                          <div className="mb-4">
                            <span className="badge bg-success-subtle text-success mb-2 px-3">🚗 {t('passenger.route')}</span>
                            <h4 className="fw-bold mb-4">{t('passenger.routeDetails') || "Détails du voyage"}</h4>
                            <div className="d-flex flex-column gap-3">
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                <span className="text-muted"><Clock size={18} className="me-2"/> {t('passenger.time')}</span>
                                <span className="fw-bold text-dark">{formaterTemps()}</span>
                              </div>
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                <span className="text-muted"><Navigation size={18} className="me-2"/> {t('passenger.distance')}</span>
                                <span className="fw-bold text-dark">{resultat.distance_totale_km} km</span>
                              </div>
                              <div className="d-flex justify-content-between py-2">
                                <span className="text-muted"><Banknote size={18} className="me-2"/> {t('passenger.cost')}</span>
                                <span className="fw-bold text-success fs-5">{resultat.cout_estime_Ar?.toLocaleString()} Ar</span>
                              </div>
                            </div>
                          </div>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="btn btn-success btn-lg w-100 rounded-4 py-3 shadow-sm mb-3" onClick={handleAddDemand} disabled={reserving}>
                            {reserving ? (<><span className="spinner-border spinner-border-sm me-2"></span>{t('common.loading')}</>) : (<> {t('passenger.book')}</>)}
                          </motion.button>
                        </div>
                        <div className="col-lg-7 bg-light border-start" style={{ minHeight: '450px' }}>
                          <CarteItineraire cheminCoords={resultat.cheminCoords || []} cheminNoms={resultat.chemin || []} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="historique" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <HistoriqueReservations />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        :root { --bs-success: #10b981; --bs-success-rgb: 16,185,129; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em; overflow-x: hidden; }
        .pulse-dot { width: 8px; height: 8px; background-color: white; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } }
        .bg-gradient-success { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 15px rgba(16,185,129,0.3); }
        .gradient-text { background: linear-gradient(135deg, #10b981, #059669, #047857); background-clip: text; -webkit-background-clip: text; color: transparent; }
        .bg-gradient { background: linear-gradient(90deg, #10b981, #059669, #10b981); background-size: 200% 100%; animation: gradientMove 2s ease-in-out infinite; }
        @keyframes gradientMove { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .glass-effect { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.2); }
        .btn-gradient { background: linear-gradient(135deg, #10b981, #059669); border: none; position: relative; overflow: hidden; }
        .btn-gradient::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transition: left 0.5s ease; }
        .btn-gradient:hover::before { left: 100%; }
        .btn-success { background-color: #10b981; border-color: #10b981; }
        .rounded-4 { border-radius: 1.25rem !important; }
        .rounded-3 { border-radius: 1rem !important; }
        .bg-success-subtle { background-color: rgba(16,185,129,0.1); }
        .bg-warning-subtle { background-color: rgba(245,158,11,0.1); }
        .bg-danger-subtle { background-color: rgba(239,68,68,0.1); }
        .bg-white { background-color: rgba(255,255,255,0.95) !important; backdrop-filter: blur(5px); }
        .transition-all { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        header::after { content: ''; position: absolute; bottom: -20px; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #10b981, #059669, #10b981, transparent); opacity: 0; transition: opacity 0.3s ease; }
        header:hover::after { opacity: 1; }
        @media (max-width: 992px) {
          .glass-effect { width: 100%; display: flex; justify-content: center; }
          .btn-gradient, .btn { flex: 1; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPassager;