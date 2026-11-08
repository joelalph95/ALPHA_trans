import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // État pour la modale

  // Vérifier si on est sur la landing page
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutClick = () => {
    setShowConfirmModal(true); // Ouvrir la modale de confirmation
  };

  const handleConfirmLogout = () => {
    logout();
    setShowConfirmModal(false);
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowConfirmModal(false);
  };

  // Ne pas afficher la navbar sur la landing page (elle a sa propre navbar)
  if (isLandingPage) {
    return null;
  }

  if (!currentUser) return null;

  const getDashboardLink = () => {
    switch (currentUser.role) {
      case 'passager': return '/dashboard-passager';
      case 'chauffeur': return '/dashboard-chauffeur';
      case 'cooperative': return '/dashboard-cooperative';
      case 'admin': return '/dashboard-admin';
      default: return '/';
    }
  };

  return (
    <>
      <nav className={`navbar-custom ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-navbar">
          <Link className="logo" to={getDashboardLink()}>
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-main">ALPHA</span>
              <span className="logo-sub">trans</span>
            </div>
          </Link>
          
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
          </button>
          
          <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="user-section">
              <div className="user-avatar">
                {currentUser.nom?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{currentUser.nom}</div>
                <div className="user-role">{currentUser.role === 'passager' ? t('register.passenger') : 
                  currentUser.role === 'chauffeur' ? t('register.driver') : 
                  currentUser.role === 'cooperative' ? t('register.cooperative') : 'Admin'}</div>
              </div>
            </div>
            
            <div className="nav-actions">
              <LanguageSwitcher />
              <button className="logout-btn" onClick={handleLogoutClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MODALE DE CONFIRMATION DE DÉCONNEXION */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancelLogout}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <h3 className="modal-title">{t('logout.title') || 'Déconnexion'}</h3>
            <p className="modal-message">{t('logout.confirm') || 'Êtes-vous sûr de vouloir vous déconnecter ?'}</p>
            <div className="modal-buttons">
              <button className="modal-btn-cancel" onClick={handleCancelLogout}>
                {t('common.cancel') || 'Annuler'}
              </button>
              <button className="modal-btn-confirm" onClick={handleConfirmLogout}>
                {t('logout.confirmButton') || 'Se déconnecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .navbar-custom {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 12px 0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .navbar-custom.scrolled {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 8px 0;
        }

        .container-navbar {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.02);
        }

        .logo-icon {
          color: white;
          background: rgba(255, 255, 255, 0.15);
          padding: 8px;
          border-radius: 12px;
          transition: all 0.3s ease;
          animation: rotateLogo 10s linear infinite;
        }

        @keyframes rotateLogo {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .logo:hover .logo-icon {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.05);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-main {
          font-size: 1.2rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }

        .logo-sub {
          font-size: 0.65rem;
          color: #c4b5fd;
          letter-spacing: 1px;
          margin-top: -2px;
        }

        /* Menu mobile button */
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .menu-icon {
          width: 22px;
          height: 2px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Navigation menu */
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 16px 6px 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .user-section:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #fff, #e0d4ff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #667eea;
          font-size: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          50% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .user-role {
          color: #c4b5fd;
          font-size: 0.65rem;
          text-transform: capitalize;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          color: white;
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        /* MODALE DE CONFIRMATION */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
 backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: white;
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-icon {
          margin-bottom: 20px;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1f2937;
        }

        .modal-message {
          color: #6b7280;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        .modal-buttons {
          display: flex;
          gap: 12px;
        }

        .modal-btn-cancel {
          flex: 1;
          padding: 12px 24px;
          background: #f3f4f6;
          border: none;
          border-radius: 40px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-btn-cancel:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        .modal-btn-confirm {
          flex: 1;
          padding: 12px 24px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          border-radius: 40px;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-btn-confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .container-navbar {
            padding: 0 16px;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .nav-menu {
            position: fixed;
            top: 65px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 65px);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            flex-direction: column;
            justify-content: flex-start;
            padding: 30px 20px;
            transition: left 0.3s ease;
            z-index: 999;
            gap: 20px;
          }

          .nav-menu.open {
            left: 0;
          }

          .user-section {
            width: 100%;
            justify-content: center;
            padding: 12px 20px;
          }

          .nav-actions {
            width: 100%;
            flex-direction: column;
          }

          .language-switcher {
            width: 100%;
            margin-left: 0 !important;
          }

          .logout-btn {
            width: 100%;
            justify-content: center;
            padding: 12px;
          }

          .modal-container {
            padding: 24px;
            width: 85%;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-buttons {
            flex-direction: column;
          }
        }

        /* Animation d'entrée */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar-custom {
          animation: fadeInDown 0.5s ease;
        }
      `}</style>
    </>
  );
};

export default Navbar;