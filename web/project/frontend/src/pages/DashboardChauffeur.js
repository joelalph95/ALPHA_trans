import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Truck, CheckCircle2, XCircle, Zap, Users, AlertCircle, RefreshCw, ChevronRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const DashboardChauffeur = () => {
  const { t } = useLanguage();
  const [plannings, setPlannings] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [selectedVehicule, setSelectedVehicule] = useState('');
  const [optimResult, setOptimResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {

    setLoading(true);
    setError(null);
    try {
      const [resP, resD, resV] = await Promise.all([
        api.get('/plannings'),
        api.get('/demandes'),
        api.get('/vehicules')
      ]);
      setPlannings(Array.isArray(resP.data) ? resP.data : (resP.data?.plannings || []));
      setDemandes(Array.isArray(resD.data) ? resD.data : (resD.data?.demandes || []));
      setVehicules(Array.isArray(resV.data) ? resV.data : (resV.data?.vehicules || []));
    } catch (err) {
      console.error('Erreur API:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [t]);


  const handleAction = async (id, action) => {
    try {
      await api.patch(`/demandes/${id}/${action}`);
      setMessage({ text: action === 'accepter' ? t('msg.requestAccepted') : t('msg.requestRefused'), type: 'success' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: t('common.error'), type: "error" });
    }
  };

  const handleStatutChange = async (id, newStatut) => {
    try {
      await api.patch(`/plannings/${id}/statut`, { statut: newStatut });
      fetchData();
    } catch (err) {
      setMessage({ text: t('common.error'), type: "error" });
    }
  };

  const handleOptimize = async () => {
    if (!selectedVehicule) {
      setMessage({ text: t('driver.selectVehicleFirst') || "Veuillez choisir un véhicule", type: "error" });
      return;
    }
    const demandeIds = demandes.filter(d => d.statut?.toLowerCase().trim() === 'en_attente').map(d => d.id);
    if (demandeIds.length === 0) {
      setMessage({ text: t('driver.noRequests') || "Aucune demande en attente", type: "error" });
      return;
    }
    try {
      const res = await api.post('/reservations/optimize', {
        vehicule_id: parseInt(selectedVehicule),
        demande_ids: demandeIds,
      });
      setOptimResult(res.data);
      fetchData();
      setMessage({ text: t('msg.optimizationDone'), type: "success" });
    } catch (err) {
      setMessage({ text: t('common.error'), type: "error" });
    }
  };

  const getField = (obj, fields) => {
    for (const f of fields) {
      if (obj[f] !== undefined && obj[f] !== null) return obj[f];
    }
    return '--';
  };

  if (loading) {
    return (<div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center"><Loader2 size={40} className="text-success mb-3 spin" /><p className="text-muted">{t('common.loading')}</p></div>
    </div>);
  }

  return (
    <div className="min-vh-100 bg-light pb-5">
      <div className="bg-white border-bottom mb-4 pt-4 pb-3 shadow-sm">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div><h2 className="fw-bold m-0 d-flex align-items-center gap-2"><Truck className="text-primary" size={28} /> {t('nav.dashboard')}</h2>
            <p className="text-muted small mb-0">{t('driver.subtitle') || "Gérez vos trajets et optimisez vos places"}</p></div>
            <button onClick={fetchData} className="btn btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-2" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'rotate' : ''} /> {t('common.refresh') || "Actualiser"}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <AnimatePresence>
          {message && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`alert border-0 shadow-sm rounded-4 d-flex align-items-center gap-3 mb-4 ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
            {message.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
            <span className="fw-medium">{message.text}</span>
          </motion.div>)}
        </AnimatePresence>

        {error && (<div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4"><AlertCircle size={20} className="me-2" /> {error}</div>)}

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white py-3 border-light d-flex align-items-center gap-2">
                <Calendar className="text-primary" size={20} /><h5 className="mb-0 fw-bold">{t('driver.myTrips')}</h5>
                <span className="badge bg-primary ms-2">{plannings.length}</span>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="bg-light text-muted small text-uppercase">
                    <tr><th className="px-4 py-3">{t('coop.route') || "Trajet"}</th><th className="py-3">{t('driver.vehicle')}</th><th className="py-3">{t('driver.date')}</th><th className="py-3">{t('driver.status')}</th><th className="text-end px-4 py-3">{t('driver.actions')}</th></tr>
                  </thead>
                  <tbody>
                    {plannings.length > 0 ? plannings.map(p => (
                      <tr key={p.id} className="border-light">
                        <td className="px-4 py-3"><div className="d-flex align-items-center gap-2">
                          <span className="fw-bold">{getField(p, ['ville_dep', 'ville_depart', 'depart'])}</span>
                          <ChevronRight size={14} className="text-muted" />
                          <span className="fw-bold text-primary">{getField(p, ['ville_arr', 'ville_arrivee', 'arrivee'])}</span>
                        </div></td>
                        <td><span className="badge bg-light text-dark border">{getField(p, ['immatriculation', 'vehicule', 'matricule'])}</span></td>
                        <td className="text-muted small">{p.date_depart ? new Date(p.date_depart).toLocaleString('fr-FR') : '--'}</td>
                        <td><span className={`badge rounded-pill ${p.statut === 'planifie' ? 'bg-info-subtle text-info' : p.statut === 'en_cours' ? 'bg-warning-subtle text-warning pulse' : 'bg-success-subtle text-success'}`}>
                          {p.statut === 'planifie' ? t('status.planned') : p.statut === 'en_cours' ? t('status.inProgress') : t('status.completed')}
                        </span></td>
                        <td className="text-end px-4">
                          {p.statut === 'planifie' && (<button onClick={() => handleStatutChange(p.id, 'en_cours')} className="btn btn-primary btn-sm rounded-3">▶ {t('driver.start')}</button>)}
                          {p.statut === 'en_cours' && (<button onClick={() => handleStatutChange(p.id, 'termine')} className="btn btn-success btn-sm rounded-3">✓ {t('driver.finish')}</button>)}
                        </td>
                      </tr>
                    )) : (<tr><td colSpan="5" className="text-center py-5 text-muted"><Calendar size={32} className="mb-2 opacity-25" /><p className="mb-0">{t('driver.noTrips') || "Aucun trajet assigné pour le moment."}</p></td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-dark text-white">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-3"><div className="p-2 bg-primary rounded-3"><Zap size={20}/></div><h5 className="mb-0 fw-bold">{t('driver.optimization')}</h5></div>
                <label className="small text-white-50 mb-2">{t('driver.selectVehicle')}</label>
                <select className="form-select form-select-sm mb-3 bg-secondary border-0 text-white" value={selectedVehicule} onChange={e => setSelectedVehicule(e.target.value)}>
                  <option value="">{t('common.select') || "Sélectionner..."}</option>
                  {vehicules.map(v => (<option key={v.id} value={v.id} className="text-dark">{getField(v, ['immatriculation', 'matricule'])} ({v.capacite || '?'} pl.)</option>))}
                </select>
                <button onClick={handleOptimize} className="btn btn-primary w-100 rounded-3 fw-bold py-2 mb-2">{t('driver.optimize')}</button>
                {optimResult && (<div className="mt-3 p-3 bg-white-10 rounded-3 text-center border border-secondary">
                  <div className="small text-white-50">{t('driver.optimized')}</div>
                  <div className="h4 mb-0 fw-bold text-success">{optimResult.places_attribuees || 0} / {optimResult.capacite_max || '?'}</div>
                </div>)}
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white py-3 border-light d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2"><Users size={18} className="text-warning"/> {t('driver.waitingRequests')}</h6>
                <span className="badge bg-warning rounded-pill">{demandes.filter(d => d.statut === 'en_attente').length}</span>
              </div>
              <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {demandes.filter(d => d.statut === 'en_attente').length > 0 ? demandes.filter(d => d.statut === 'en_attente').map(d => (
                  <div key={d.id} className="list-group-item border-light py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div><div className="fw-bold small">{getField(d, ['passager', 'nom', 'utilisateur'])}</div>
                      <div className="text-muted extra-small">{getField(d, ['ville_depart', 'depart'])} → {getField(d, ['ville_arrivee', 'arrivee'])}</div></div>
                      <div className="d-flex gap-1">
                        <button onClick={() => handleAction(d.id, 'accepter')} className="btn btn-sm btn-success p-1 rounded-2" title={t('driver.accept')}><CheckCircle2 size={18}/></button>
                        <button onClick={() => handleAction(d.id, 'refuser')} className="btn btn-sm btn-danger p-1 rounded-2" title={t('driver.reject')}><XCircle size={18}/></button>
                      </div>
                    </div>
                  </div>
                )) : (<div className="p-4 text-center text-muted small"><CheckCircle2 size={24} className="mb-2 opacity-25" /><p className="mb-0">{t('driver.noRequests') || "Aucune demande en attente"}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .extra-small { font-size: 0.75rem; }
        .rounded-4 { border-radius: 1rem !important; }
        .bg-white-10 { background: rgba(255,255,255,0.1); }
        .bg-success-subtle { background-color: #d1e7dd !important; }
        .bg-warning-subtle { background-color: #fff3cd !important; }
        .bg-danger-subtle { background-color: #f8d7da !important; }
        .bg-info-subtle { background-color: #cff4fc !important; }
        body { font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif; }
        .pulse { animation: pulse-yellow 2s infinite; }
        @keyframes pulse-yellow { 0% { box-shadow: 0 0 0 0px rgba(255,193,7,0.4); } 70% { box-shadow: 0 0 0 10px rgba(255,193,7,0); } 100% { box-shadow: 0 0 0 0px rgba(255,193,7,0); } }
        .rotate { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default DashboardChauffeur;