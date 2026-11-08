import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import { Button, Input, Alert } from '../components/UI'
import { Bus } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Gestionnaire unique pour tous les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await authService.login(form.email, form.password)
      if (res.data.success) {
        login(res.data.user, res.data.token)
        navigate('/dashboard')
      } else {
        setError(res.data.message)
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#060a0f', // bg-deep
      position: 'relative'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo & Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '36px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)', // gradient-main
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(0,212,255,0.3)'
          }}>
            <Bus size={28} />
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '6px',
            color: '#e8f4fd' // text-primary
          }}>
            SmartTransport
          </h1>
          <p style={{
            color: '#7aa3c8', // text-secondary
            fontSize: '14px'
          }}>
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#0d1520', // bg-card
          border: '1px solid #1a2d45', // border
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 32px rgba(0, 212, 255, 0.06)' // shadow-card
        }}>
          {error && (
            <div style={{ marginBottom: '20px' }}>
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Input
              label="Adresse email"
              name="email"
              type="email"
              placeholder="vous@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Mot de passe"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              loading={loading}
              size="lg"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #00d4ff, #0066ff)', // gradient-main
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          color: '#7aa3c8', // text-secondary
          fontSize: '14px'
        }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{
            color: '#00d4ff', // accent-primary
            fontWeight: 500,
            textDecoration: 'none'
          }}>
            Créer un compte
          </Link>
        </p>
      </div>
</div>
  )
}
