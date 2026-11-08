// HistoriqueReservations.js - Version avec traductions complètes

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Calendar, MapPin, Clock, 
  AlertCircle, CheckCircle2, XCircle, Clock as ClockIcon,
  Search, Filter, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const HistoriqueReservations = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage(); // Utiliser la traduction
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [filtreStatut, searchTerm, reservations]);

  const loadReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/demandes/mes-demandes');
      setReservations(response.data);
      setFilteredReservations(response.data);
    } catch (err) {
      console.error('Erreur chargement réservations:', err);
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    if (filtreStatut !== 'tous') {
      filtered = filtered.filter(r => r.statut === filtreStatut);
    }

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.ville_depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ville_arrivee?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReservations(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!selectedReservation) return;
    
    setDeletingId(selectedReservation.id);
    setError('');
    
    try {
      await api.delete(`/demandes/${selectedReservation.id}`);
      await loadReservations();
      setSuccessMessage(t('msg.requestDeleted') || "Réservation supprimée avec succès");
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDeleteModal(false);
      setSelectedReservation(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setError(t('msg.sessionExpired') || "Session expirée. Veuillez vous reconnecter.");
      } else if (err.response?.status === 403) {
        setError(t('msg.noPermission') || "Vous n'avez pas l'autorisation de supprimer cette réservation.");
      } else if (err.response?.status === 404) {
        setError(t('msg.notFound') || "Réservation introuvable ou déjà supprimée.");
      } else {
        setError(err.response?.data?.error || t('common.error'));
      }
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowDeleteModal(true);
  };

  const getStatutBadge = (statut) => {
    const config = {
      acceptee: { icon: CheckCircle2, class: 'bg-success', text: t('status.accepted') || 'Acceptée' },
      en_attente: { icon: ClockIcon, class: 'bg-warning text-dark', text: t('status.waiting') || 'En attente' },
      refusee: { icon: XCircle, class: 'bg-danger', text: t('status.refused') || 'Refusée' }
    };
    const { icon: Icon, class: badgeClass, text } = config[statut] || config.en_attente;
    return (
      <span className={`badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 ${badgeClass}`}>
        <Icon size={14} /> {text}
      </span>
    );
  };

  const getStatutText = (statut) => {
    const texts = {
      acceptee: t('status.accepted') || 'Acceptée',
      en_attente: t('status.waiting') || 'En attente',
      refusee: t('status.refused') || 'Refusée'
    };
    return texts[statut] || statut;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString(
      t('locale') === 'mg' ? 'mg-MG' : 'fr-FR',
      { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: reservations.length,
    acceptees: reservations.filter(r => r.statut === 'acceptee').length,
    enAttente: reservations.filter(r => r.statut === 'en_attente').length,
    refusees: reservations.filter(r => r.statut === 'refusee').length
  };

  return (
    <div className="historique-container">
      {/* Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="alert-success-custom"
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="alert-error-custom"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="historique-header"
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h2 className="historique-title">
              📋 {t('history.title') || 'Historique des réservations'}
            </h2>
            <p className="historique-subtitle">
              {t('history.subtitle') || 'Gérez toutes vos demandes de transport en un seul endroit'}
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadReservations}
            className="btn-refresh"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
            {t('common.refresh') || 'Actualiser'}
          </motion.button>
        </div>
      </motion.div>

      {/* Statistiques */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="row g-3 mb-4"
      >
        <div className="col-md-3">
          <div className="stat-card-historique">
            <div className="stat-card-content">
              <div>
                <span className="stat-label">{t('history.total') || 'Total'}</span>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
              <div className="stat-icon-bg bg-primary-subtle">
                <Calendar size={24} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card-historique">
            <div className="stat-card-content">
              <div>
                <span className="stat-label">{t('status.accepted') || 'Acceptées'}</span>
                <h3 className="stat-value text-success">{stats.acceptees}</h3>
              </div>
              <div className="stat-icon-bg bg-success-subtle">
                <CheckCircle2 size={24} className="text-success" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card-historique">
            <div className="stat-card-content">
              <div>
                <span className="stat-label">{t('status.waiting') || 'En attente'}</span>
                <h3 className="stat-value text-warning">{stats.enAttente}</h3>
              </div>
              <div className="stat-icon-bg bg-warning-subtle">
                <ClockIcon size={24} className="text-warning" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card-historique">
            <div className="stat-card-content">
              <div>
                <span className="stat-label">{t('status.refused') || 'Refusées'}</span>
                <h3 className="stat-value text-danger">{stats.refusees}</h3>
              </div>
              <div className="stat-icon-bg bg-danger-subtle">
                <XCircle size={24} className="text-danger" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="filters-card"
      >
        <div className="row g-3">
          <div className="col-md-6">
            <div className="search-input-group">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={t('history.searchPlaceholder') || "Rechercher par ville..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="filter-buttons">
              <Filter size={18} className="filter-icon" />
              {[
                { value: 'tous', label: t('history.all') || 'Tous' },
                { value: 'en_attente', label: t('status.waiting') || 'En attente' },
                { value: 'acceptee', label: t('status.accepted') || 'Acceptés' },
                { value: 'refusee', label: t('status.refused') || 'Refusés' }
              ].map(statut => (
                <motion.button
                  key={statut.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFiltreStatut(statut.value)}
                  className={`filter-btn ${filtreStatut === statut.value ? 'active' : ''}`}
                >
                  {statut.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des réservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="reservations-card"
      >
        {loading ? (
          <div className="loading-state">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
            <p className="text-muted mt-3">{t('common.loading')}</p>
          </div>
        ) : paginatedReservations.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} className="empty-icon" />
            <h5>{t('history.noReservations') || 'Aucune réservation trouvée'}</h5>
            <p className="text-muted">
              {searchTerm || filtreStatut !== 'tous' 
                ? (t('history.noMatch') || "Aucune réservation ne correspond à vos critères")
                : (t('history.noReservationsYet') || "Vous n'avez pas encore effectué de réservation")}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="reservations-table">
                <thead>
                  <tr>
                    <th>{t('history.route') || 'Trajet'}</th>
                    <th>{t('history.date') || 'Date de demande'}</th>
                    <th>{t('driver.status') || 'Statut'}</th>
                    <th className="text-end">{t('driver.actions') || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedReservations.map((reservation, index) => (
                      <motion.tr
                        key={reservation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="route-cell">
                          <div className="route-info">
                            <div className="route-cities">
                              <MapPin size={16} className="text-success" />
                              <span className="city-name">{reservation.ville_depart}</span>
                              <span className="arrow">→</span>
                              <MapPin size={16} className="text-primary" />
                              <span className="city-name fw-bold">{reservation.ville_arrivee}</span>
                            </div>
                          </div>
                        </td>
                        <td className="date-cell">
                          <div className="date-info">
                            <Clock size={14} className="text-muted" />
                            <span>{formatDate(reservation.date_demande)}</span>
                          </div>
                        </td>
                        <td className="status-cell">
                          {getStatutBadge(reservation.statut)}
                        </td>
                        <td className="actions-cell">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(reservation)}
                            className="btn-delete"
                            disabled={deletingId === reservation.id}
                          >
                            {deletingId === reservation.id ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            <span>{t('common.delete') || 'Supprimer'}</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredReservations.length)} {t('history.of') || 'sur'} {filteredReservations.length}
                </div>
                <div className="pagination-buttons">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {showDeleteModal && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon">
                <AlertCircle size={48} className="text-danger" />
              </div>
              <h4 className="modal-title">{t('common.confirmDelete') || 'Confirmer la suppression'}</h4>
              <p className="modal-text">
                {t('history.deleteConfirm') || 'Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.'}
              </p>
              
              <div className="modal-details">
                <div className="detail-row">
                  <span className="detail-label">{t('history.id') || 'ID:'}</span>
                  <span className="detail-value">#{selectedReservation.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('history.route') || 'Trajet :'}</span>
                  <span className="detail-value">
                    {selectedReservation.ville_depart} → {selectedReservation.ville_arrivee}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('driver.status') || 'Statut :'}</span>
                  <span className="detail-value">{getStatutText(selectedReservation.statut)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('history.date') || 'Date :'}</span>
                  <span className="detail-value">{formatDate(selectedReservation.date_demande)}</span>
                </div>
              </div>

              <div className="modal-buttons">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="modal-btn-cancel"
                >
                  {t('common.cancel') || 'Annuler'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={deletingId === selectedReservation.id}
                  className="modal-btn-confirm"
                >
                  {deletingId === selectedReservation.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="me-2" />
                      {t('common.delete')}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .historique-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1.5rem;
          padding: 1.5rem;
          backdrop-filter: blur(5px);
        }

        .alert-success-custom {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1100;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          font-weight: 500;
        }

        .alert-error-custom {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1100;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          font-weight: 500;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .historique-header {
          margin-bottom: 1.5rem;
        }

        .historique-title {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #10b981, #059669);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          margin-bottom: 0.25rem;
        }

        .historique-subtitle {
          color: #6b7280;
          margin-bottom: 0;
        }

        .btn-refresh {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 40px;
          color: #374151;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-refresh:hover:not(:disabled) {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .stat-card-historique {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .stat-card-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
        }

        .stat-icon-bg {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-primary-subtle { background: rgba(59, 130, 246, 0.1); }
        .bg-success-subtle { background: rgba(16, 185, 129, 0.1); }
        .bg-warning-subtle { background: rgba(245, 158, 11, 0.1); }
        .bg-danger-subtle { background: rgba(239, 68, 68, 0.1); }

        .filters-card {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border-radius: 40px;
          padding: 0 1rem;
          border: 1px solid #e2e8f0;
        }

        .search-icon {
          color: #94a3b8;
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.6rem 0.75rem;
          outline: none;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-icon {
          color: #6b7280;
        }

        .filter-btn {
          padding: 6px 16px;
          border-radius: 40px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #4b5563;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .filter-btn.active {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .reservations-card {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .reservations-table {
          width: 100%;
          border-collapse: collapse;
        }

        .reservations-table thead th {
          background: #f8fafc;
          padding: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        .reservations-table tbody td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .route-cell .route-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .route-cities {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .city-name {
          font-weight: 500;
        }

        .arrow {
          color: #94a3b8;
        }

        .date-cell .date-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #4b5563;
        }

        .actions-cell {
          text-align: right;
        }

        .btn-delete {
          background: none;
          border: 1px solid #fee2e2;
          padding: 6px 14px;
          border-radius: 40px;
          color: #dc2626;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .btn-delete:hover:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }

        .btn-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 3rem;
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .pagination-info {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .pagination-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .pagination-btn, .pagination-page {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled), .pagination-page:hover:not(.active) {
          border-color: #10b981;
          color: #10b981;
        }

        .pagination-page.active {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-content {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          max-width: 450px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.3);
        }

        .modal-icon {
          margin-bottom: 1rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .modal-text {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .modal-details {
          background: #f8fafc;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .detail-row:first-child {
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-label {
          color: #6b7280;
          font-size: 0.85rem;
        }

        .detail-value {
          font-weight: 600;
          color: #1f2937;
        }

        .modal-buttons {
          display: flex;
          gap: 1rem;
        }

        .modal-btn-cancel, .modal-btn-confirm {
          flex: 1;
          padding: 0.75rem;
          border-radius: 40px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .modal-btn-cancel {
          background: #f1f5f9;
          border: none;
          color: #475569;
        }

        .modal-btn-cancel:hover {
          background: #e2e8f0;
        }

        .modal-btn-confirm {
          background: #dc2626;
          border: none;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .modal-btn-confirm:hover:not(:disabled) {
          background: #b91c1c;
        }

        .modal-btn-confirm:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .historique-container {
            padding: 1rem;
          }
          
          .reservations-table thead th,
          .reservations-table tbody td {
            padding: 0.75rem;
          }
          
          .route-cities {
            font-size: 0.85rem;
          }
          
          .filter-buttons {
            justify-content: flex-start;
          }
          
          .pagination-container {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HistoriqueReservations;