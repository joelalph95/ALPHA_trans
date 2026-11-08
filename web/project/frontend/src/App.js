import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';  // ← Vérifiez que c'est bien importé
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPassager from './pages/DashboardPassager';
import DashboardChauffeur from './pages/DashboardChauffeur';
import DashboardCooperative from './pages/DashboardCooperative';
import DashboardAdmin from './pages/DashboardAdmin';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="container-fluid p-0">
            <Routes>
              {/* ⚠️ La route "/" doit être AVANT les autres */}
              <Route path="/" element={<LandingPage />} />
              
              <Route path="/login" element={<div className="page-style page-style--login"><Login /></div>} />
              <Route path="/register" element={<div className="page-style page-style--register"><Register /></div>} />
              
              <Route path="/dashboard-passager" element={
                <div className="page-style page-style--dashboard-passager">
                  <ProtectedRoute roles={['passager']}><DashboardPassager /></ProtectedRoute>
                </div>
              } />
              <Route path="/dashboard-chauffeur" element={
                <div className="page-style page-style--dashboard-chauffeur">
                  <ProtectedRoute roles={['chauffeur']}><DashboardChauffeur /></ProtectedRoute>
                </div>
              } />
              <Route path="/dashboard-cooperative" element={
                <div className="page-style page-style--dashboard-cooperative">
                  <ProtectedRoute roles={['cooperative']}><DashboardCooperative /></ProtectedRoute>
                </div>
              } />
              <Route path="/dashboard-admin" element={
                <div className="page-style page-style--dashboard-admin">
                  <ProtectedRoute roles={['admin']}><DashboardAdmin /></ProtectedRoute>
                </div>
              } />
              
              {/* Redirection pour les routes inconnues */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;