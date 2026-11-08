import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Map, Route, History, Check, X, 
  Plus, Trash2, ShieldCheck, MapPin, Activity 
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const DashboardAdmin = () => {
  const { t } = useLanguage();
  const [villes, setVilles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('demandes');
  const [newVille, setNewVille] = useState({ nom: '', latitude: '', longitude: '' });
  const [newRoute, setNewRoute] = useState({
    ville_depart_id: '',
    ville_arrivee_id: '',
    distance: '',
    etat: 'ouverte',
    trafic: 1,
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [v, r, l, d] = await Promise.all([
        api.get('/villes'),
        api.get('/routes'),
        api.get('/logs'),
        api.get('/demandes')
      ]);
      setVilles(v.data);
      setRoutes(r.data);
      setLogs(l.data);
      setDemandes(d.data);
    } catch (err) {
      console.error("Erreur de chargement", err);
    }
  };

  // Actions sur les demandes
  const handleAction = async (action, id) => {
    try {
      await api.patch(`/demandes/${id}/${action}`);
      setMessage(action === 'accepter' ? t('msg.requestAccepted') : t('msg.requestRefused'));
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(t('common.error'));
    }
  };

  // Suppression d'une ville
  const deleteVille = async (id) => {
    if (!window.confirm(t('admin.confirmDeleteCity') || "Supprimer cette ville ?")) return;
    try {
      await api.delete(`/villes/${id}`);
      fetchData();
      setMessage(t('admin.cityDeleted') || "Ville supprimée");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(t('common.error'));
    }
  };

  // Suppression d'une route
  const deleteRoute = async (id) => {
    if (!window.confirm(t('admin.confirmDeleteRoute') || "Supprimer cette route ?")) return;
    try {
      await api.delete(`/routes/${id}`);
      fetchData();
      setMessage(t('admin.routeDeleted') || "Route supprimée");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(t('common.error'));
    }
  };

  // Ajout d'une ville
  const addVille = async (e) => {
    e.preventDefault();
    try {
      await api.post('/villes', {
        nom: newVille.nom,
        latitude: parseFloat(newVille.latitude),
        longitude: parseFloat(newVille.longitude),
      });
      setNewVille({ nom: '', latitude: '', longitude: '' });
      fetchData();
      setMessage(t('admin.cityAdded') || "Ville ajoutée");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || t('common.error'));
    }
  };

  // Ajout d'une route
  const addRoute = async (e) => {
    e.preventDefault();
    try {
      await api.post('/routes', {
        ville_depart_id: parseInt(newRoute.ville_depart_id),
        ville_arrivee_id: parseInt(newRoute.ville_arrivee_id),
        distance: parseFloat(newRoute.distance),
        etat: newRoute.etat,
        trafic: parseInt(newRoute.trafic),
      });
      setNewRoute({
        ville_depart_id: '',
        ville_arrivee_id: '',
        distance: '',
        etat: 'ouverte',
        trafic: 1,
      });
      fetchData();
      setMessage(t('admin.routeAdded') || "Route ajoutée");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || t('common.error'));
    }
  };

  // Composant StatBadge
  const StatBadge = ({ icon: Icon, label, count, color }) => (
    <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3 flex-fill">
      <div className={`p-3 rounded-3 bg-${color}-subtle text-${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <h5 className="mb-0 fw-bold">{count}</h5>
        <small className="text-muted">{label}</small>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold d-flex align-items-center gap-2">
            <ShieldCheck className="text-primary" size={32} /> 
            {t('admin.console')}
          </h2>
          {message && <div className="badge bg-success p-2">{message}</div>}
        </div>

        {/* STATISTIQUES */}
        <div className="d-flex flex-wrap gap-3 mb-5">
          <StatBadge icon={Users} label={t('admin.requests')} count={demandes.filter(d => d.statut === 'en_attente').length} color="warning" />
          <StatBadge icon={MapPin} label={t('admin.cities')} count={villes.length} color="success" />
          <StatBadge icon={Route} label={t('admin.routes')} count={routes.length} color="info" />
          <StatBadge icon={Activity} label={t('admin.logs')} count={logs.length} color="secondary" />
        </div>

        {/* ONGLETS */}
        <div className="nav nav-pills bg-white p-2 rounded-4 shadow-sm mb-4 d-inline-flex border">
          {[
            { id: 'demandes', icon: History, label: t('admin.requests') },
            { id: 'infra', icon: Map, label: t('admin.infrastructure') },
            { id: 'logs', icon: Activity, label: t('admin.logs') }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link d-flex align-items-center gap-2 px-4 py-2 rounded-3 border-0 ${activeTab === tab.id ? 'active bg-primary' : 'text-secondary'}`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENU DYNAMIQUE */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ONGLET DEMANDES */}
            {activeTab === 'demandes' && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4">{t('driver.passenger')}</th>
                        <th>{t('coop.route')}</th>
                        <th>{t('passenger.date')}</th>
                        <th className="text-end px-4">{t('driver.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandes.filter(d => d.statut === 'en_attente').length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-5 text-muted">
                            {t('admin.noPendingRequests') || "Aucune demande en attente"}
                          </td>
                        </tr>
                      ) : (
                        demandes.filter(d => d.statut === 'en_attente').map(d => (
                          <tr key={d.id}>
                            <td className="px-4">
                              <div className="d-flex align-items-center gap-2">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: 32, height: 32, fontSize: 12}}>
                                  {d.passager?.charAt(0) || '?'}
                                </div>
                                <span className="fw-semibold">{d.passager}</span>
                              </div>
                            </td>
                            <td>
                              <small className="text-muted">{d.ville_depart}</small>
                              <span className="mx-2">→</span>
                              <span className="fw-bold text-dark">{d.ville_arrivee}</span>
                            </td>
                            <td className="text-muted small">
                              {d.date_demande ? new Date(d.date_demande).toLocaleDateString('fr-FR') : '--'}
                            </td>
                            <td className="text-end px-4">
                              <button 
                                onClick={() => handleAction('accepter', d.id)} 
                                className="btn btn-sm btn-success rounded-3 me-2" 
                                title={t('driver.accept')}
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => handleAction('refuser', d.id)} 
                                className="btn btn-sm btn-outline-danger rounded-3" 
                                title={t('driver.reject')}
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ONGLET INFRASTRUCTURE */}
            {activeTab === 'infra' && (
              <div className="row g-4">
                {/* GESTION VILLES */}
                <div className="col-md-5">
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                      <MapPin size={20}/> {t('admin.addCity')}
                    </h5>
                    <form onSubmit={addVille} className="d-flex flex-column gap-3">
                      <input 
                        className="form-control" 
                        placeholder={t('admin.cityName')}
                        value={newVille.nom}
                        onChange={(e) => setNewVille({...newVille, nom: e.target.value})}
                        required 
                      />
                      <div className="d-flex gap-2">
                        <input 
                          className="form-control" 
                          placeholder={t('admin.latitude')} 
                          type="number" 
                          step="any"
                          value={newVille.latitude}
                          onChange={(e) => setNewVille({...newVille, latitude: e.target.value})}
                          required 
                        />
                        <input 
                          className="form-control" 
                          placeholder={t('admin.longitude')} 
                          type="number" 
                          step="any"
                          value={newVille.longitude}
                          onChange={(e) => setNewVille({...newVille, longitude: e.target.value})}
                          required 
                        />
                      </div>
                      <button type="submit" className="btn btn-primary rounded-3 w-100">
                        <Plus size={18} className="me-2"/>{t('common.save')}
                      </button>
                    </form>
                    <hr className="my-4" />
                    <div className="list-group list-group-flush">
                      {villes.map(v => (
                        <div key={v.id} className="list-group-item d-flex justify-content-between align-items-center px-0 border-light">
                          <span>{v.nom}</span>
                          <button 
                            onClick={() => deleteVille(v.id)} 
                            className="btn btn-link text-danger p-0"
                            title={t('common.delete')}
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GESTION ROUTES */}
                <div className="col-md-7">
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                      <Route size={20}/> {t('admin.addRoute')}
                    </h5>
                    <form onSubmit={addRoute} className="row g-3 mb-4">
                      <div className="col-md-4">
                        <select 
                          className="form-select form-select-sm"
                          value={newRoute.ville_depart_id}
                          onChange={(e) => setNewRoute({...newRoute, ville_depart_id: e.target.value})}
                          required
                        >
                          <option value="">{t('coop.from')}</option>
                          {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <select 
                          className="form-select form-select-sm"
                          value={newRoute.ville_arrivee_id}
                          onChange={(e) => setNewRoute({...newRoute, ville_arrivee_id: e.target.value})}
                          required
                        >
                          <option value="">{t('coop.to')}</option>
                          {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <input 
                          type="number" 
                          step="any"
                          className="form-control form-control-sm"
                          placeholder="km"
                          value={newRoute.distance}
                          onChange={(e) => setNewRoute({...newRoute, distance: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <select 
                          className="form-select form-select-sm"
                          value={newRoute.etat}
                          onChange={(e) => setNewRoute({...newRoute, etat: e.target.value})}
                        >
                          <option value="ouverte">{t('admin.open')}</option>
                          <option value="degradee">{t('admin.degraded')}</option>
                          <option value="mauvaise">{t('admin.bad')}</option>
                          <option value="fermee">{t('admin.closed')}</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <input 
                          type="number" 
                          min="1" 
                          max="5"
                          className="form-control form-control-sm"
                          placeholder="Trafic"
                          value={newRoute.trafic}
                          onChange={(e) => setNewRoute({...newRoute, trafic: e.target.value})}
                        />
                      </div>
                      <div className="col-md-2">
                        <button type="submit" className="btn btn-sm btn-success w-100">
                          <Plus size={16} className="me-1"/> {t('common.add') || "Ajouter"}
                        </button>
                      </div>
                    </form>

                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr className="text-muted small">
                            <th>{t('coop.from')} / {t('coop.to')}</th>
                            <th>{t('coop.distance')}</th>
                            <th>{t('coop.state')}</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {routes.map(r => (
                            <tr key={r.id}>
                              <td className="small">
                                <strong>{r.ville_depart}</strong><br/>{r.ville_arrivee}
                              </td>
                              <td>{r.distance} km</td>
                              <td>
                                <span className={`badge rounded-pill ${
                                  r.etat === 'ouverte' ? 'bg-success-subtle text-success' : 
                                  r.etat === 'fermee' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'
                                }`}>
                                  {r.etat === 'ouverte' ? t('admin.open') : 
                                   r.etat === 'fermee' ? t('admin.closed') : t('admin.degraded')}
                                </span>
                              </td>
                              <td className="text-end">
                                <button 
                                  onClick={() => deleteRoute(r.id)} 
                                  className="btn btn-link text-danger p-0"
                                  title={t('common.delete')}
                                >
                                  <Trash2 size={16}/>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET LOGS */}
            {activeTab === 'logs' && (
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-4">{t('admin.logs')}</h5>
                <div className="d-flex flex-column gap-3">
                  {logs.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <Activity size={32} className="mb-2 opacity-25" />
                      <p className="mb-0">{t('admin.noLogs') || "Aucun log disponible"}</p>
                    </div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="d-flex gap-3 border-bottom pb-3 border-light">
                        <div className="p-2 bg-light rounded-3 h-100">
                          <Activity size={16} className="text-secondary"/>
                        </div>
                        <div>
                          <p className="mb-0 small">
                            <strong>{log.utilisateur}</strong> {t('logs.performed') || "a effectué"} : 
                            <span className="text-primary"> {log.action}</span>
                          </p>
                          <span className="text-muted" style={{fontSize: '11px'}}>
                            {new Date(log.date_modification).toLocaleString()} • {t('logs.table')}: {log.table_modifiee} #{log.id_enregistrement}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; }
        .card { border: none; }
        .rounded-4 { border-radius: 1rem !important; }
        .nav-pills .nav-link.active { box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2); }
        .table thead th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .form-control, .form-select { border-color: #e2e8f0; padding: 0.6rem 1rem; border-radius: 0.75rem; }
        .form-control:focus, .form-select:focus { box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1); border-color: #3b82f6; }
        .bg-success-subtle { background-color: #d1e7dd !important; }
        .bg-danger-subtle { background-color: #f8d7da !important; }
        .bg-warning-subtle { background-color: #fff3cd !important; }
        .btn-success { background-color: #10b981; border-color: #10b981; }
        .btn-outline-danger:hover { background-color: #ef4444; border-color: #ef4444; }
      `}</style>
    </div>
  );
};

export default DashboardAdmin;