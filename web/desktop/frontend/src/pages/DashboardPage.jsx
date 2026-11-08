import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services/api'
import { StatCard, Card, PageHeader, Badge, Alert } from '../components/UI'
import { Map, Truck, Route, Navigation, ArrowRight, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

const roleDefinitions = {
  passager: {
    label: 'Passager',
    message: 'Recherchez un trajet, consultez votre itinéraire et suivez vos réservations.',
    actions: [
      {
        label: 'Rechercher un trajet',
        desc: 'Trouvez votre itinéraire optimal avec A*',
        to: '/trajets',
        gradient: 'var(--gradient-main)',
        icon: Navigation,
      },
      {
        label: 'Mon profil',
        desc: 'Mettez à jour vos informations personnelles',
        to: '/profil',
        gradient: 'var(--gradient-green)',
        icon: Activity,
      },
    ],
    stats: [
      { label: 'Trajets recherchés', value: '—', icon: Map },
      { label: 'Réservations actives', value: '—', icon: Truck },
      { label: 'Historique', value: '—', icon: Activity },
    ],
  },
  chauffeur: {
    label: 'Chauffeur',
    message: 'Consultez vos prochains trajets, suivez vos itinéraires et gérez vos disponibilités.',
    actions: [
      {
        label: 'Espace Chauffeur',
        desc: 'Voir votre tableau de bord chauffeur dédié',
        to: '/chauffeur',
        gradient: 'var(--gradient-main)',
        icon: Navigation,
      },
      {
        label: 'Mon profil chauffeur',
        desc: 'Mettre à jour vos informations',
        to: '/profil',
        gradient: 'var(--gradient-green)',
        icon: Activity,
      },
    ],
    stats: [
      { label: 'Trajets prévus', value: '—', icon: Truck },
      { label: 'Capacité', value: '—', icon: Route },
      { label: 'Statut', value: 'Actif', icon: Activity },
    ],
  },
  cooperative: {
    label: 'Coopérative',
    message: 'Planifiez et optimisez les trajets ainsi que les capacités des véhicules.',
    actions: [
      {
        label: 'Espace Coopérative',
        desc: 'Voir votre tableau de bord coopérative dédié',
        to: '/cooperative',
        gradient: 'var(--gradient-main)',
        icon: Navigation,
      },
      {
        label: 'Optimisation',
        desc: 'Gérer le remplissage des véhicules',
        to: '/optimisation',
        gradient: 'var(--gradient-green)',
        icon: Truck,
      },
    ],
    stats: [
      { label: 'Routes gérées', value: '—', icon: Route },
      { label: 'Trajets planifiés', value: '—', icon: Navigation },
      { label: 'Demandes', value: '—', icon: Activity },
    ],
  },
  admin: {
    label: 'Administrateur',
    message: 'Gérez le système, les routes, le trafic et consultez les statistiques globales.',
    actions: [
      {
        label: 'Administration',
        desc: 'Gérer routes et trafic',
        to: '/admin',
        gradient: 'var(--gradient-orange)',
        icon: Route,
      },
      {
        label: 'Optimisation',
        desc: 'Gérer le remplissage des véhicules',
        to: '/optimisation',
        gradient: 'var(--gradient-green)',
        icon: Truck,
      },
    ],
    stats: [
      { label: 'Villes', value: '—', icon: Map },
      { label: 'Routes', value: '—', icon: Route },
      { label: 'Véhicules', value: '—', icon: Truck },
    ],
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoadingStats(true)
      adminService.obtenirStatistiques()
        .then(res => { if (res.data.success) setStats(res.data.stats) })
        .catch(() => {})
        .finally(() => setLoadingStats(false))
    }
  }, [user])

  const role = user?.role || 'passager'
  const roleInfo = roleDefinitions[role] || roleDefinitions.passager
  const actions = roleInfo.actions
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const roleLabel = roleInfo.label
  const userMessage = roleInfo.message

  return (
    <div style={{ backgroundColor: '#060a0f', minHeight: '100vh', color: '#e8f4fd' }}>
      <div style={{
        padding: '32px 28px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid #1a2d45'
        }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '32px',
            fontWeight: 800,
            margin: 0,
            color: '#e8f4fd',
            letterSpacing: '-0.02em'
          }}>
            {`${greeting}, ${user?.nom?.split(' ')[0]} 👋`}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#7aa3c8',
            marginTop: '8px'
          }}>
            Votre tableau de bord personnel SmartTransport
          </p>
        </div>

{/* Welcome Card */}
        <div style={{
          backgroundColor: '#0d1520',
          border: '1px solid #1a2d45',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 4px 32px rgba(0, 212, 255, 0.06)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div>
              <div style={{
                fontSize: '13px',
                color: '#3d6080',
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                marginBottom: '8px'
              }}>
                Mon espace
              </div>
              <h2 style={{
                fontFamily: 'Syne',
                fontWeight: 700,
                fontSize: '20px',
                margin: 0,
                color: '#e8f4fd'
              }}>
                {user?.nom || 'Utilisateur'}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#7aa3c8',
                marginTop: '8px'
              }}>
                {userMessage}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div style={{
              backgroundColor: '#111d2e',
              border: '1px solid #1a2d45',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#3d6080',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px'
              }}>
                Rôle
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#e8f4fd'
              }}>
                {roleLabel}
              </div>
            </div>
            <div style={{
              backgroundColor: '#111d2e',
              border: '1px solid #1a2d45',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#3d6080',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px'
              }}>
                Email
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#e8f4fd'
              }}>
                {user?.email || '-'}
              </div>
            </div>
            <div style={{
              backgroundColor: '#111d2e',
              border: '1px solid #1a2d45',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#3d6080',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px'
              }}>
                Tableau de bord
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#e8f4fd'
              }}>
                {user?.role === 'admin' ? 'Administrateur global' : 'Personnalisé'}
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '28px',
          backgroundColor: 'rgba(0,229,160,0.06)',
          border: '1px solid rgba(0,229,160,0.15)',
          borderRadius: '10px',
          padding: '10px 16px',
          fontSize: '13px',
          color: '#00e5a0'
        }}>
          <Activity size={14} />
          <span>Système opérationnel</span>
          <span style={{
            backgroundColor: '#00e5a0',
            color: '#060a0f',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600
          }}>
            En ligne
          </span>
        </div>

        {/* Role-specific indicators */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'Syne',
            fontWeight: 700,
            marginBottom: '16px',
            color: '#7aa3c8',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '12px'
          }}>
            Indicateurs {roleLabel.toLowerCase()}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            {roleInfo.stats.map(({ label, value, icon: Icon }) => (
              <div key={label} style={{
                backgroundColor: '#0d1520',
                border: '1px solid #1a2d45',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                  opacity: 0.04,
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)'
                }} />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#7aa3c8',
                    fontWeight: 500
                  }}>
                    {label}
                  </span>
                  {Icon && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Icon size={16} />
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: '32px',
                  fontFamily: 'Syne',
                  fontWeight: 800,
                  color: '#e8f4fd',
                  letterSpacing: '-0.03em'
                }}>
                  {value ?? '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats (admin only) */}
        {user?.role === 'admin' && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'Syne',
              fontWeight: 700,
              marginBottom: '16px',
              color: '#7aa3c8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: '12px'
            }}>
              Statistiques système
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {[
                { label: 'Villes', value: loadingStats ? '…' : stats?.villes, icon: Map, gradient: 'linear-gradient(135deg, #00d4ff, #0066ff)' },
                { label: 'Routes', value: loadingStats ? '…' : stats?.routes, icon: Route, gradient: 'linear-gradient(135deg, #00d4ff, #0066ff)' },
                { label: 'Véhicules', value: loadingStats ? '…' : stats?.vehicules, icon: Truck, gradient: 'linear-gradient(135deg, #00e5a0, #00b377)' },
                { label: 'Trajets', value: loadingStats ? '…' : stats?.trajets, icon: Navigation, gradient: 'linear-gradient(135deg, #ff6b35, #ff3b5c)' }
              ].map(({ label, value, icon: Icon, gradient }) => (
                <div key={label} style={{
                  backgroundColor: '#0d1520',
                  border: '1px solid #1a2d45',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: gradient,
                    opacity: 0.04,
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)'
                  }} />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#7aa3c8',
                      fontWeight: 500
                    }}>
                      {label}
                    </span>
                    {Icon && (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: gradient,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <Icon size={16} />
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontFamily: 'Syne',
                    fontWeight: 800,
                    color: '#e8f4fd',
                    letterSpacing: '-0.03em'
                  }}>
                    {value ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h2 style={{
            fontFamily: 'Syne',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px',
            color: '#7aa3c8',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Actions rapides
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {actions.map(({ label, desc, to, gradient, icon: Icon }) => (
              <Link key={to} to={to} style={{
                display: 'block',
                backgroundColor: '#0d1520',
                border: '1px solid #1a2d45',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                color: '#e8f4fd'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#22395a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 32px rgba(0, 212, 255, 0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1a2d45'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: gradient || 'linear-gradient(135deg, #00d4ff, #0066ff)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  marginBottom: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}>
                  <Icon size={20} />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px'
                }}>
                  <h3 style={{
                    fontFamily: 'Syne',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#e8f4fd'
                  }}>
                    {label}
                  </h3>
                  <ArrowRight size={16} color="#3d6080" />
                </div>
                <p style={{
                  fontSize: '13px',
                  color: '#7aa3c8'
                }}>
                  {desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

{/* Info section */}
        <div style={{ marginTop: '32px' }}>
          <Alert type="info">
            <strong>SmartTransport v2.0</strong> - Système d'optimisation de trajets en temps réel avec algorithmes A* avancés.
          </Alert>
        </div>

        {/* System info Card */}
        <div style={{ marginTop: '24px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: 'var(--gradient-main)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={14} color="white" />
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>À propos du système</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'Algorithme de routage', value: 'A* (A-Star)' },
                { label: "Optimisation remplissage", value: 'Knapsack 0/1' },
                { label: 'Authentification', value: 'JWT Bearer' },
                { label: 'Base de données', value: 'MySQL' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 16px',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--accent-primary)' }}>{value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
