import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import { Card, Button, Input, Alert, PageHeader, Badge } from '../components/UI'
import { User, Save, Shield } from 'lucide-react'

export default function ProfilPage() {
  const { user, login, token } = useAuth()
  const [form, setForm] = useState({ nom: user?.nom || '', email: user?.email || '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await authService.updateProfile(user.id, form)
      if (res.data.success) {
        login({ ...user, nom: form.nom, email: form.email }, token)
        setSuccess('Profil mis à jour avec succès !')
      } else {
        setError(res.data.message)
      }
    } catch {
      setError('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const roleConfig = {
    admin: { color: 'primary', label: 'Administrateur' },
    chauffeur: { color: 'green', label: 'Chauffeur' },
    cooperative: { color: 'orange', label: 'Coopérative' },
    passager: { color: 'primary', label: 'Passager' },
  }
  const rc = roleConfig[user?.role] || roleConfig.passager

  return (
    <div>
      <PageHeader title="Mon profil" subtitle="Gérez vos informations personnelles" />

      <div style={{ maxWidth: 540 }}>
        {/* Avatar card */}
        <Card style={{ marginBottom: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72,
              background: 'var(--gradient-main)',
              borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne',
              fontWeight: 800,
              fontSize: 28,
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,212,255,0.3)',
              flexShrink: 0
            }}>
              {user?.nom?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
                {user?.nom}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge color={rc.color}>{rc.label}</Badge>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID #{user?.id}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit form */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: 'var(--gradient-main)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="white" />
            </div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Modifier mes informations</h3>
          </div>

          {success && <div style={{ marginBottom: 16 }}><Alert type="success">{success}</Alert></div>}
          {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nom complet"
              value={form.nom}
              onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
              required
            />
            <Input
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />

            {/* Read-only role */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={12} /> Rôle (non modifiable)
              </label>
              <div style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <Badge color={rc.color}>{rc.label}</Badge>
              </div>
            </div>

            <Button type="submit" loading={loading} size="lg">
              <Save size={15} />
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
