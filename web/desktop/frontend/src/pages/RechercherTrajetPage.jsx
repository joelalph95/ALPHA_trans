import React, { useState } from 'react'
import { trajetService } from '../services/api'
import { Card, Button, Input, Alert, PageHeader, Badge } from '../components/UI'
import { Search, MapPin, Clock, Truck, ArrowRight, Navigation } from 'lucide-react'

export default function RechercherTrajetPage() {
  const [form, setForm] = useState({ villeDepart: '', villeArrivee: '', dateDepart: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await trajetService.rechercher(form.villeDepart, form.villeArrivee, form.dateDepart)
      if (res.data.success) {
        setResult(res.data.itineraire)
      } else {
        setError(res.data.message || 'Aucun itinéraire trouvé')
      }
    } catch (err) {
      setError('Erreur lors de la recherche. Vérifiez votre connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <PageHeader
        title="Rechercher un trajet"
        subtitle="Trouvez votre itinéraire optimal grâce à l'algorithme A*"
      />

      {/* Search form */}
      <Card style={{ marginBottom: 28 }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <Input
              label="Ville de départ"
              placeholder="Ex: Antananarivo"
              value={form.villeDepart}
              onChange={e => setForm(p => ({ ...p, villeDepart: e.target.value }))}
              required
            />
            <Input
              label="Ville d'arrivée"
              placeholder="Ex: Toamasina"
              value={form.villeArrivee}
              onChange={e => setForm(p => ({ ...p, villeArrivee: e.target.value }))}
              required
            />
            <Input
              label="Date de départ"
              type="date"
              min={today}
              value={form.dateDepart}
              onChange={e => setForm(p => ({ ...p, dateDepart: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" loading={loading} size="lg">
            <Search size={16} />
            {loading ? 'Calcul en cours…' : 'Rechercher'}
          </Button>
        </form>
      </Card>

      {/* Error */}
      {error && <Alert type="error">{error}</Alert>}

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Route summary */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: 'var(--gradient-main)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Navigation size={16} color="white" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17 }}>Itinéraire optimal</h2>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Calculé par algorithme A*</p>
              </div>
              <Badge color="green" style={{ marginLeft: 'auto' }}>Trouvé</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Distance totale
                </div>
                <div style={{ fontSize: 22, fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {result.distanceTotale?.toFixed(0)} <span style={{ fontSize: 13, fontWeight: 400 }}>km</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Durée estimée
                </div>
                <div style={{ fontSize: 22, fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent-green)' }}>
                  {result.dureeEstimee?.toFixed(0)} <span style={{ fontSize: 13, fontWeight: 400 }}>min</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Étapes
                </div>
                <div style={{ fontSize: 22, fontFamily: 'Syne', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {result.chemin?.length || 0}
                </div>
              </div>
            </div>

            {/* Path visualization */}
            {result.chemin && result.chemin.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Chemin parcouru
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                  {result.chemin.map((ville, i) => (
                    <React.Fragment key={ville.id || i}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: i === 0 || i === result.chemin.length - 1
                          ? 'rgba(0,212,255,0.1)'
                          : 'var(--bg-hover)',
                        border: `1px solid ${i === 0 || i === result.chemin.length - 1 ? 'rgba(0,212,255,0.3)' : 'var(--border)'}`,
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 13,
                        color: i === 0 || i === result.chemin.length - 1 ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: i === 0 || i === result.chemin.length - 1 ? 600 : 400
                      }}>
                        <MapPin size={12} />
                        {ville.nom || `Ville ${ville.id}`}
                      </div>
                      {i < result.chemin.length - 1 && (
                        <ArrowRight size={14} color="var(--text-muted)" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Available trips */}
          {result.trajetsDisponibles && result.trajetsDisponibles.length > 0 && (
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, marginBottom: 14 }}>
                Trajets disponibles ({result.trajetsDisponibles.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.trajetsDisponibles.map((trajet) => (
                  <Card key={trajet.id} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 40, height: 40, background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Truck size={18} color="var(--accent-primary)" />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>
                            {trajet.immatriculation}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <Clock size={12} />
                            <span>{trajet.heure_depart}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Places dispo.</div>
                          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'var(--accent-green)' }}>
                            {trajet.places_disponibles}
                          </div>
                        </div>
                        <Badge color={trajet.places_disponibles > 5 ? 'green' : 'orange'}>
                          {trajet.places_disponibles > 5 ? 'Disponible' : 'Presque plein'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {result.trajetsDisponibles && result.trajetsDisponibles.length === 0 && (
            <Alert type="warning">
              L'itinéraire a été calculé mais aucun trajet n'est disponible à cette date.
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
