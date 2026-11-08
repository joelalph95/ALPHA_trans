import React from 'react'
import { PageHeader, Card } from '../components/UI'
import { Truck, Route, Activity } from 'lucide-react'

export default function CooperativePage() {
  return (
    <div>
      <PageHeader
        title="Espace Coopérative"
        subtitle="Pilotez l’optimisation et la planification des trajets"
      />

      <div style={{ display: 'grid', gap: 24 }}>
        <Card>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Gestion des trajets</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
            Créez des trajets, optimisez le remplissage et suivez les capacités de vos véhicules.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'Optimisation disponible', value: 'Oui', icon: Truck },
              { label: 'Routes actives', value: 'Non configuré', icon: Route },
              { label: 'Demandes', value: 'Aucune donnée', icon: Activity },
            ].map(item => (
              <div key={item.label} style={{ background: '#0f172a', border: '1px solid #1a2d45', borderRadius: 14, padding: 16 }}>
                <div style={{ marginBottom: 8, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e8f4fd' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Actions utiles</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#e8f4fd', fontSize: 14, lineHeight: 1.7 }}>
            <li>Planifier des départs</li>
            <li>Optimiser le remplissage des véhicules</li>
            <li>Gérer les routes et le trafic</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
