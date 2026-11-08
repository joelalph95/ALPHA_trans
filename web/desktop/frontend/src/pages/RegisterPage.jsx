import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { Button, Input, Select, Alert } from '../components/UI'
import { Bus } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'passager' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authService.register(form.nom, form.email, form.password, form.role)
      if (res.data.success) {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 1800)
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
      background: '#060a0f',
    }}>
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(0,212,255,0.3)'
          }}>
            <Bus size={28} />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
            Créer un compte
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Rejoignez SmartTransport</p>
        </div>

        <div style={{
          background: '#0d1520',
          border: '1px solid #1a2d45',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          {error && <div style={{ marginBottom: 20 }}><Alert type="error">{error}</Alert></div>}
          {success && <div style={{ marginBottom: 20 }}><Alert type="success">Compte créé ! Redirection…</Alert></div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nom complet"
              placeholder="Jean Dupont"
              value={form.nom}
              onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
              required
            />
            <Input
              label="Adresse email"
              type="email"
              placeholder="vous@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
            <Select
              label="Rôle"
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            >
              <option value="passager">Passager</option>
              <option value="chauffeur">Chauffeur</option>
              <option value="cooperative">Coopérative</option>
              <option value="admin">Administrateur</option>
            </Select>
            <Button type="submit" loading={loading} size="lg" style={{ marginTop: 8, width: '100%' }}>
              {loading ? 'Création…' : "Créer mon compte"}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#94a3b8', fontSize: 14 }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#00d4ff', fontWeight: 500 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
