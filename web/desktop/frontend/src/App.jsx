import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RechercherTrajetPage from './pages/RechercherTrajetPage'
import OptimisationPage from './pages/OptimisationPage'
import AdminPage from './pages/AdminPage'
import ChauffeurPage from './pages/ChauffeurPage'
import CooperativePage from './pages/CooperativePage'
import ProfilPage from './pages/ProfilPage'
import TestTailwind from './pages/TestTailwind'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--accent-primary)', fontFamily: 'Syne' }}>Chargement…</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/test-tailwind" element={<TestTailwind />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="trajets" element={<RechercherTrajetPage />} />
        <Route path="chauffeur" element={<ProtectedRoute allowedRoles={['chauffeur']}><ChauffeurPage /></ProtectedRoute>} />
        <Route path="cooperative" element={<ProtectedRoute allowedRoles={['cooperative']}><CooperativePage /></ProtectedRoute>} />
        <Route path="optimisation" element={<ProtectedRoute allowedRoles={['admin', 'cooperative']}><OptimisationPage /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
