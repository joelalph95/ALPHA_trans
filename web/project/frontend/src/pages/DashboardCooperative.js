import { useState, useEffect } from 'react';
import { Calendar, Users, Activity, CheckCircle, XCircle, RefreshCcw, PlusCircle } from 'lucide-react';

import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const DashboardCooperative = () => {
  const { t } = useLanguage();
  const [data, setData] = useState({ plannings: [], vehicules: [], villes: [], routes: [], demandes: [] });
  const [loading, setLoading] = useState(true);
  const [traficInput, setTraficInput] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newPlanning, setNewPlanning] = useState({
    vehicule_id: '', chauffeur_id: '', ville_depart_id: '', ville_arrivee_id: '', date_depart: '',
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [p, v, vi, r, d] = await Promise.all([
        api.get('/plannings'), api.get('/vehicules'), api.get('/villes'), api.get('/routes'), api.get('/demandes')
      ]);
      setData({ plannings: p.data, vehicules: v.data, villes: vi.data, routes: r.data, demandes: d.data });
    } catch (err) {
      showToast(t('common.error'), "danger");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAllData(); }, [t]);


  const showToast = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleActionDemande = async (id, action) => {
    try {
      await api.patch(`/demandes/${id}/${action}`);
      showToast(action === 'accepter' ? t('msg.requestAccepted') : t('msg.requestRefused'), action === 'accepter' ? 'success' : 'warning');
      fetchAllData();
    } catch (err) { showToast(t('common.error'), "danger"); }
  };

  const handleCreatePlanning = async (e) => {
    e.preventDefault();
    try {
      await api.post('/plannings', {
        cooperative_id: 1, ...newPlanning,
        chauffeur_id: parseInt(newPlanning.chauffeur_id),
        vehicule_id: parseInt(newPlanning.vehicule_id),
        ville_depart_id: parseInt(newPlanning.ville_depart_id),
        ville_arrivee_id: parseInt(newPlanning.ville_arrivee_id),
      });
      showToast(t('msg.planningCreated') || "Trajet planifié avec succès", "success");
      setNewPlanning({ vehicule_id: '', chauffeur_id: '', ville_depart_id: '', ville_arrivee_id: '', date_depart: '' });
      fetchAllData();
    } catch (err) { showToast(err.response?.data?.error || t('common.error'), "danger"); }
  };

  const handleTraficUpdate = async (routeId) => {
    try {
      await api.put(`/traffic/${routeId}`, { niveau_trafic: traficInput[routeId] });
      showToast(t('msg.trafficUpdated'), "info");
      fetchAllData();
    } catch (err) { showToast(t('common.error'), "danger"); }
  };

  if (loading) return (<div className="d-flex justify-content-center align-items-center vh-100 text-primary"><RefreshCcw className="rotate" size={48} /></div>);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark m-0">{t('coop.planning')}</h2>
        <button onClick={fetchAllData} className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2"><RefreshCcw size={18} /> {t('common.refresh') || "Actualiser"}</button>
      </div>

      {message.text && (<div className={`alert alert-${message.type} border-0 shadow-sm alert-dismissible fade show`} role="alert">
        {message.text}<button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
      </div>)}

      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-light"><h5 className="mb-0 fw-bold d-flex align-items-center gap-2"><PlusCircle className="text-primary" /> {t('coop.createTrip')}</h5></div>
            <div className="card-body bg-light-subtle">
              <form onSubmit={handleCreatePlanning} className="row g-3">
                <div className="col-md-2"><label className="form-label small fw-bold">{t('driver.vehicle')}</label>
                  <select name="vehicule_id" className="form-select border-0 shadow-sm" value={newPlanning.vehicule_id} onChange={(e) => setNewPlanning({...newPlanning, vehicule_id: e.target.value})} required>
                    <option value="">{t('common.select') || "Sélectionner"}</option>
                    {data.vehicules.map(v => <option key={v.id} value={v.id}>{v.immatriculation}</option>)}
                  </select>
                </div>
                <div className="col-md-2"><label className="form-label small fw-bold">{t('coop.driverId') || "ID Chauffeur"}</label>
                  <input type="number" name="chauffeur_id" className="form-control border-0 shadow-sm" value={newPlanning.chauffeur_id} onChange={(e) => setNewPlanning({...newPlanning, chauffeur_id: e.target.value})} required />
                </div>
                <div className="col-md-2"><label className="form-label small fw-bold">{t('coop.from')}</label>
                  <select name="ville_depart_id" className="form-select border-0 shadow-sm" value={newPlanning.ville_depart_id} onChange={(e) => setNewPlanning({...newPlanning, ville_depart_id: e.target.value})} required>
                    <option value="">{t('common.select')}</option>
                    {data.villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                  </select>
                </div>
                <div className="col-md-2"><label className="form-label small fw-bold">{t('coop.to')}</label>
                  <select name="ville_arrivee_id" className="form-select border-0 shadow-sm" value={newPlanning.ville_arrivee_id} onChange={(e) => setNewPlanning({...newPlanning, ville_arrivee_id: e.target.value})} required>
                    <option value="">{t('common.select')}</option>
                    {data.villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                  </select>
                </div>
                <div className="col-md-3"><label className="form-label small fw-bold">{t('driver.date')}</label>
                  <input type="datetime-local" name="date_depart" className="form-control border-0 shadow-sm" value={newPlanning.date_depart} onChange={(e) => setNewPlanning({...newPlanning, date_depart: e.target.value})} required />
                </div>
                <div className="col-md-1 d-flex align-items-end"><button type="submit" className="btn btn-primary w-100 py-2 shadow-sm">{t('common.save')}</button></div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white py-3 border-light d-flex align-items-center gap-2"><Calendar className="text-primary" size={20}/><h5 className="mb-0 fw-bold">{t('coop.existingTrips')}</h5></div>
            <div className="table-responsive">
              <table className="table align-middle table-hover mb-0">
                <thead className="table-light"><tr className="text-muted small"><th className="px-4">{t('coop.route')}</th><th>{t('driver.vehicle')}</th><th>{t('driver.date')}</th><th>{t('driver.status')}</th></tr></thead>
                <tbody>
                  {data.plannings.map(p => (
                    <tr key={p.id}><td className="px-4 py-3"><div className="fw-bold">{p.ville_dep} → {p.ville_arr}</div><div className="text-muted small">{t('coop.driverId')}: {p.chauffeur}</div></td>
                    <td><span className="badge bg-light text-dark border font-monospace">{p.immatriculation}</span></td>
                    <td className="small">{new Date(p.date_depart).toLocaleString('fr-FR')}</td>
                    <td><span className={`badge rounded-pill ${p.statut === 'planifie' ? 'bg-primary-subtle text-primary' : p.statut === 'en_cours' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                      {p.statut === 'planifie' ? t('status.planned') : p.statut === 'en_cours' ? t('status.inProgress') : t('status.completed')}
                    </span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white py-3 border-light"><h5 className="mb-0 fw-bold d-flex align-items-center gap-2"><Activity className="text-info" /> {t('coop.traffic')}</h5></div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {data.routes.map(r => (
                  <div key={r.id} className="list-group-item border-light p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-bold">{r.ville_depart} → {r.ville_arrivee}</span>
                      <span className={`badge ${r.trafic >= 4 ? 'bg-danger' : r.trafic >= 3 ? 'bg-warning' : 'bg-success'}`}>{r.trafic}/5</span>
                    </div>
                    <div className="d-flex gap-2">
                      <input type="range" className="form-range flex-grow-1" min="1" max="5" value={traficInput[r.id] || r.trafic} onChange={e => setTraficInput({...traficInput, [r.id]: parseInt(e.target.value)})}/>
                      <button onClick={() => handleTraficUpdate(r.id)} className="btn btn-sm btn-outline-info">{t('coop.update')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2"><Users className="text-warning" /> {t('driver.waitingRequests')}</h5>
              <span className="badge bg-warning rounded-circle">{data.demandes.filter(d => d.statut === 'en_attente').length}</span>
            </div>
            <div className="list-group list-group-flush" style={{maxHeight: '400px', overflowY: 'auto'}}>
              {data.demandes.filter(d => d.statut === 'en_attente').map(d => (
                <div key={d.id} className="list-group-item border-light p-3">
                  <div className="fw-bold small">{d.passager}</div>
                  <div className="text-muted extra-small mb-2">{d.ville_depart} → {d.ville_arrivee}</div>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleActionDemande(d.id, 'accepter')} className="btn btn-sm btn-success flex-grow-1"><CheckCircle size={14} /></button>
                    <button onClick={() => handleActionDemande(d.id, 'refuser')} className="btn btn-sm btn-outline-danger flex-grow-1"><XCircle size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rounded-4 { border-radius: 1rem !important; }
        .extra-small { font-size: 0.7rem; }
        .rotate { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .bg-primary-subtle { background-color: #e7f1ff; }
        .bg-success-subtle { background-color: #d1e7dd; }
        .bg-warning-subtle { background-color: #fff3cd; }
      `}</style>
    </div>
  );
};

export default DashboardCooperative;