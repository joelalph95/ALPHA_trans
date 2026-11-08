import React from 'react'
import { PageHeader, Card } from '../components/UI'
import { Truck, Route, Activity } from 'lucide-react'

export default function ChauffeurPage() {
  return (
    <div>
      <PageHeader
        title="Espace Chauffeur"
        subtitle="Accédez à vos trajets, itinéraires et disponibilités"
      />

      <div style={{ display: 'grid', gap: 24 }}>
        <Card>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Vos prochaines missions</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
            Consultez vos itinéraires planifiés et préparez votre journée.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'Trajets prévus', value: 'Aucune donnée', icon: Truck },
              { label: 'Capacité véhicule', value: 'Non configurée', icon: Route },
              { label: 'Statut', value: 'Actif', icon: Activity },
            ].map(item => (
              <div key={item.label} style={{ background: '#0f172a', border: '1px solid #1a2d45', borderRadius: 14, padding: 16 }}>
                <div style={{ marginBottom: 8, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e8f4fd' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Informations pratiques</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>
            Utilisez ce tableau de bord pour vérifier votre disponibilité, suivre l’état des trajets et garder vos informations à jour.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#e8f4fd', fontSize: 14, lineHeight: 1.7 }}>
            <li>Vérifiez vos trajets assignés</li>
            <li>Mettez à jour votre profil chauffeur</li>
            <li>Surveillez la capacité et les horaires</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
