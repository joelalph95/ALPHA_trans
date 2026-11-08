import React, { useState } from 'react'
import { optimisationService } from '../services/api'
import { Card, Button, Input, Alert, PageHeader, Badge } from '../components/UI'
import { Truck, Plus, Trash2, Zap, Calendar } from 'lucide-react'

export default function OptimisationPage() {
  // Remplissage véhicule
  const [vehiculeId, setVehiculeId] = useState('')
  const [demandes, setDemandes] = useState([{ passagerId: '', places: 1, priorite: 1 }])
  const [loadingOpt, setLoadingOpt] = useState(false)
  const [resultOpt, setResultOpt] = useState(null)
  const [errorOpt, setErrorOpt] = useState('')

  // Planification
  const [planVehiculeId, setPlanVehiculeId] = useState('')
  const [departures, setDepartures] = useState([{ date: '', heure: '', places: 1 }])
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [resultPlan, setResultPlan] = useState(null)
  const [errorPlan, setErrorPlan] = useState('')

  const addDemande = () => setDemandes(d => [...d, { passagerId: '', places: 1, priorite: 1 }])
  const removeDemande = (i) => setDemandes(d => d.filter((_, idx) => idx !== i))
  const updateDemande = (i, field, val) => setDemandes(d => d.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const handleOptimiser = async (e) => {
    e.preventDefault()
    setLoadingOpt(true)
    setErrorOpt('')
    setResultOpt(null)
    try {
      const res = await optimisationService.optimiserRemplissage(vehiculeId, demandes)
      if (res.data.success) setResultOpt(res.data.optimisation)
      else setErrorOpt(res.data.message)
    } catch {
      setErrorOpt('Erreur lors de l\'optimisation')
    } finally {
      setLoadingOpt(false)
    }
  }

  const addDeparture = () => setDepartures(d => [...d, { date: '', heure: '', places: 1 }])
  const removeDeparture = (i) => setDepartures(d => d.filter((_, idx) => idx !== i))
  const updateDeparture = (i, field, val) => setDepartures(d => d.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const handlePlanifier = async (e) => {
    e.preventDefault()
    setLoadingPlan(true)
    setErrorPlan('')
    setResultPlan(null)
    try {
      const res = await optimisationService.planifierTrajets(planVehiculeId, departures)
      if (res.data.success) setResultPlan(res.data)
      else setErrorPlan(res.data.message)
    } catch {
      setErrorPlan('Erreur lors de la planification')
    } finally {
      setLoadingPlan(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Optimisation"
        subtitle="Gestion intelligente du remplissage et planification des trajets"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Optimisation remplissage */}
        <div>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="white" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Remplissage véhicule</h2>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Algorithme knapsack 0/1</p>
              </div>
            </div>

            <form onSubmit={handleOptimiser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="ID du véhicule"
                type="number"
                placeholder="Ex: 1"
                value={vehiculeId}
                onChange={e => setVehiculeId(e.target.value)}
                required
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                    Demandes ({demandes.length})
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={addDemande}>
                    <Plus size={14} /> Ajouter
                  </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {demandes.map((d, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 60px 60px auto',
                      gap: 8,
                      alignItems: 'center',
                      background: '#0f172a',
                      border: '1px solid #1a2d45',
                      borderRadius: 10,
                      padding: '10px 12px'
                    }}>
                      <input
                        placeholder="ID passager"
                        value={d.passagerId}
                        onChange={e => updateDemande(i, 'passagerId', e.target.value)}
                        style={{ background: 'none', border: 'none', color: '#e8f4fd', fontSize: 13, outline: 'none' }}
                      />
                      <input
                        type="number" min="1" max="10"
                        title="Places"
                        value={d.places}
                        onChange={e => updateDemande(i, 'places', parseInt(e.target.value))}
                        style={{ background: 'none', border: 'none', color: '#00d4ff', fontSize: 13, outline: 'none', textAlign: 'center' }}
                      />
                      <input
                        type="number" min="1" max="10"
                        title="Priorité"
                        value={d.priorite}
                        onChange={e => updateDemande(i, 'priorite', parseInt(e.target.value))}
                        style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 13, outline: 'none', textAlign: 'center' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeDemande(i)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11, color: '#64748b' }}>
                  <span>Passager · Places · Priorité</span>
                </div>
              </div>

              {errorOpt && <Alert type="error">{errorOpt}</Alert>}

              {resultOpt && (
                <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10, padding: 16 }}>
                  <div style={{ color: '#10b981', fontFamily: 'Syne', fontWeight: 700, marginBottom: 8 }}>
                    ✓ Optimisation réussie
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <div style={{ color: '#94a3b8' }}>Places occupées</div>
                    <div style={{ color: '#e8f4fd', fontWeight: 600 }}>{resultOpt.placesOccupees}</div>
                    <div style={{ color: '#94a3b8' }}>Score</div>
                    <div style={{ color: '#00d4ff', fontWeight: 600 }}>{resultOpt.score}</div>
                    <div style={{ color: '#94a3b8' }}>Passagers admis</div>
                    <div style={{ color: '#e8f4fd', fontWeight: 600 }}>{resultOpt.passagersAcceptes?.length || 0}</div>
                  </div>
                </div>
              )}

              <Button type="submit" loading={loadingOpt} variant="primary">
                <Zap size={15} /> Optimiser
              </Button>
            </form>
          </Card>
        </div>

        {/* Planification trajets */}
        <div>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={16} color="white" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Planifier des trajets</h2>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Créer plusieurs départs</p>
              </div>
            </div>

            <form onSubmit={handlePlanifier} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="ID du véhicule"
                type="number"
                placeholder="Ex: 1"
                value={planVehiculeId}
                onChange={e => setPlanVehiculeId(e.target.value)}
                required
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                    Départs ({departures.length})
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={addDeparture}>
                    <Plus size={14} /> Ajouter
                  </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {departures.map((dep, i) => (
                    <div key={i} style={{
                      background: '#0f172a',
                      border: '1px solid #1a2d45',
                      borderRadius: 10,
                      padding: 12,
                      display: 'flex', flexDirection: 'column', gap: 8
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                        <input type="date"
                          value={dep.date}
                          onChange={e => updateDeparture(i, 'date', e.target.value)}
                          required
                          style={{ background: 'none', border: 'none', color: '#e8f4fd', fontSize: 13, outline: 'none', cursor: 'pointer' }}
                        />
                        <input type="time"
                          value={dep.heure}
                          onChange={e => updateDeparture(i, 'heure', e.target.value)}
                          required
                          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, outline: 'none', cursor: 'pointer' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeDeparture(i)}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input type="number" min="1" placeholder="Nombre de places"
                        value={dep.places}
                        onChange={e => updateDeparture(i, 'places', parseInt(e.target.value))}
                        required
                        style={{ background: 'none', border: 'none', borderTop: '1px solid #1a2d45', paddingTop: 8, color: '#00d4ff', fontSize: 13, outline: 'none', width: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {errorPlan && <Alert type="error">{errorPlan}</Alert>}

              {resultPlan && (
                <Alert type="success">
                  {resultPlan.message} — IDs: {resultPlan.trajetIds?.join(', ')}
                </Alert>
              )}

              <Button type="submit" loading={loadingPlan} variant="primary">
                <Calendar size={15} /> Planifier
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
