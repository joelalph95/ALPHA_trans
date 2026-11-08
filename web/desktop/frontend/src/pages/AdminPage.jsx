import React, { useState } from 'react'
import { adminService } from '../services/api'
import { Card, Button, Input, Select, Alert, PageHeader } from '../components/UI'
import { Route, AlertTriangle, PlusCircle, BarChart2 } from 'lucide-react'

export default function AdminPage() {
  // Trafic
  const [traficForm, setTraficForm] = useState({ routeId: '', trafic: 'normal', etat: 'ouvert' })
  const [loadingTrafic, setLoadingTrafic] = useState(false)
  const [resTrafic, setResTrafic] = useState(null)
  const [errTrafic, setErrTrafic] = useState('')

  // Ajouter route
  const [routeForm, setRouteForm] = useState({ villeDepart: '', villeArrivee: '', distanceKm: '', tempsMoyen: '' })
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [resRoute, setResRoute] = useState(null)
  const [errRoute, setErrRoute] = useState('')

  const handleTrafic = async (e) => {
    e.preventDefault()
    setLoadingTrafic(true)
    setErrTrafic('')
    setResTrafic(null)
    try {
      const res = await adminService.mettreAJourTrafic(traficForm.routeId, traficForm.trafic, traficForm.etat)
      if (res.data.success) setResTrafic(res.data.message)
      else setErrTrafic(res.data.message)
    } catch {
      setErrTrafic('Erreur lors de la mise à jour')
    } finally {
      setLoadingTrafic(false)
    }
  }

  const handleRoute = async (e) => {
    e.preventDefault()
    setLoadingRoute(true)
    setErrRoute('')
    setResRoute(null)
    try {
      const res = await adminService.ajouterRoute({
        villeDepart: parseInt(routeForm.villeDepart),
        villeArrivee: parseInt(routeForm.villeArrivee),
        distanceKm: parseFloat(routeForm.distanceKm),
        tempsMoyen: parseFloat(routeForm.tempsMoyen),
      })
      if (res.data.success) {
        setResRoute(`Route ajoutée (ID: ${res.data.routeId})`)
        setRouteForm({ villeDepart: '', villeArrivee: '', distanceKm: '', tempsMoyen: '' })
      } else {
        setErrRoute(res.data.message)
      }
    } catch {
      setErrRoute('Erreur lors de l\'ajout')
    } finally {
      setLoadingRoute(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Administration"
        subtitle="Gérez les routes, le trafic et la configuration du réseau"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Mise à jour trafic */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="white" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Mettre à jour le trafic</h2>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Modifier l'état d'une route</p>
            </div>
          </div>

          <form onSubmit={handleTrafic} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="ID de la route"
              type="number"
              placeholder="Ex: 1"
              value={traficForm.routeId}
              onChange={e => setTraficForm(p => ({ ...p, routeId: e.target.value }))}
              required
            />
            <Select
              label="Niveau de trafic"
              value={traficForm.trafic}
              onChange={e => setTraficForm(p => ({ ...p, trafic: e.target.value }))}
            >
              <option value="fluide">Fluide</option>
              <option value="normal">Normal</option>
              <option value="dense">Dense</option>
              <option value="bloqué">Bloqué</option>
            </Select>
            <Select
              label="État de la route"
              value={traficForm.etat}
              onChange={e => setTraficForm(p => ({ ...p, etat: e.target.value }))}
            >
              <option value="ouvert">Ouverte</option>
              <option value="travaux">Travaux</option>
              <option value="fermé">Fermée</option>
            </Select>

            {errTrafic && <Alert type="error">{errTrafic}</Alert>}
            {resTrafic && <Alert type="success">{resTrafic}</Alert>}

            <Button type="submit" loading={loadingTrafic}>
              <AlertTriangle size={15} /> Mettre à jour
            </Button>
          </form>
        </Card>

        {/* Ajouter route */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlusCircle size={16} color="white" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Ajouter une route</h2>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Créer un nouveau lien entre villes</p>
            </div>
          </div>

          <form onSubmit={handleRoute} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="ID ville départ"
                type="number"
                placeholder="Ex: 1"
                value={routeForm.villeDepart}
                onChange={e => setRouteForm(p => ({ ...p, villeDepart: e.target.value }))}
                required
              />
              <Input
                label="ID ville arrivée"
                type="number"
                placeholder="Ex: 2"
                value={routeForm.villeArrivee}
                onChange={e => setRouteForm(p => ({ ...p, villeArrivee: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Distance (km)"
                type="number"
                step="0.1"
                placeholder="Ex: 350"
                value={routeForm.distanceKm}
                onChange={e => setRouteForm(p => ({ ...p, distanceKm: e.target.value }))}
                required
              />
              <Input
                label="Temps moyen (min)"
                type="number"
                placeholder="Ex: 240"
                value={routeForm.tempsMoyen}
                onChange={e => setRouteForm(p => ({ ...p, tempsMoyen: e.target.value }))}
                required
              />
            </div>

            {errRoute && <Alert type="error">{errRoute}</Alert>}
            {resRoute && <Alert type="success">{resRoute}</Alert>}

            <Button type="submit" loading={loadingRoute}>
              <PlusCircle size={15} /> Ajouter la route
            </Button>
          </form>
        </Card>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 24 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <BarChart2 size={16} color="#94a3b8" />
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#94a3b8' }}>
              Guide des états
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {[
              { label: 'Fluide', color: '#10b981', desc: 'Circulation normale' },
              { label: 'Normal', color: '#00d4ff', desc: 'Quelques ralentissements' },
              { label: 'Dense', color: '#f59e0b', desc: 'Trafic important' },
              { label: 'Bloqué', color: '#ef4444', desc: 'Route inaccessible' },
            ].map(({ label, color, desc }) => (
              <div key={label} style={{ background: '#0f172a', border: '1px solid #1a2d45', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
