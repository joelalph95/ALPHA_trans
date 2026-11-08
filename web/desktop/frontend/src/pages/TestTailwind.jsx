import React from 'react'

export default function TestTailwind() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ff0000', // Rouge vif
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff', // Blanc
        border: '4px solid #0000ff', // Bordure bleue
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#0000ff', // Bleu
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Test Couleurs CSS
        </h1>
        <p style={{
          color: '#000000', // Noir
          marginBottom: '24px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          Si vous voyez ces couleurs, les styles fonctionnent !
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button style={{
            width: '100%',
            backgroundColor: '#0000ff', // Bleu
            color: 'white',
            fontWeight: 'bold',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Bouton Bleu
          </button>

          <button style={{
            width: '100%',
            backgroundColor: '#00ffff', // Cyan
            color: 'black',
            fontWeight: 'bold',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Bouton Cyan
          </button>

          <button style={{
            width: '100%',
            backgroundColor: '#00ff00', // Vert
            color: 'black',
            fontWeight: 'bold',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Bouton Vert
          </button>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#ffff00', // Jaune
            border: '2px solid #ff8800', // Orange
            borderRadius: '8px'
          }}>
            <p style={{
              color: '#000000',
              fontWeight: '600',
              margin: 0
            }}>
              Zone jaune pour tester
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}