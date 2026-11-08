import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Search, Truck, ShieldCheck, User, LogOut,
  Bus, Menu, X, ChevronRight, Boxes
} from 'lucide-react'
import styles from './Layout.module.css'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/trajets', icon: Search, label: 'Rechercher trajet' },
  { to: '/chauffeur', icon: Truck, label: 'Espace Chauffeur', roles: ['chauffeur'] },
  { to: '/cooperative', icon: Boxes, label: 'Espace Coopérative', roles: ['cooperative'] },
  { to: '/optimisation', icon: Truck, label: 'Optimisation', roles: ['admin', 'cooperative'] },
  { to: '/admin', icon: ShieldCheck, label: 'Administration', roles: ['admin'] },
  { to: '/profil', icon: User, label: 'Mon profil' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items = navItems.filter(item => !item.roles || item.roles.includes(user?.role))

  return (
    <div className={styles.root}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Bus size={20} />
          </div>
          <div>
            <div className={styles.logoTitle}>SmartTransport</div>
            <div className={styles.logoSub}>v2.0</div>
          </div>
          <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.userBadge}>
          <div className={styles.avatar}>{user?.nom?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div className={styles.userName}>{user?.nom}</div>
            <div className={`${styles.userRole} ${user?.role === 'admin' ? styles.roleAdmin : ''}`}>
              {user?.role}
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className={styles.navArrow} />
            </NavLink>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className={styles.topbarRight}>
            <div className={styles.topbarUser}>
              <div className={styles.avatarSm}>{user?.nom?.[0]?.toUpperCase() || 'U'}</div>
              <span>{user?.nom}</span>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
