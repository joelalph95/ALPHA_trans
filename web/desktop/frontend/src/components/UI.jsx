import React from 'react'

/* ---- Card ---- */
export function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`card ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        ...style
      }}
    >
      {children}
    </div>
  )
}

/* ---- Button ---- */
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, onClick, type = 'button', style = {} }) {
  const variants = {
    primary: {
      background: 'var(--gradient-main)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 20px rgba(0, 212, 255, 0.25)',
    },
    secondary: {
      background: 'var(--bg-hover)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-light)',
    },
    danger: {
      background: 'rgba(255, 59, 92, 0.1)',
      color: 'var(--accent-red)',
      border: '1px solid rgba(255, 59, 92, 0.25)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    }
  }

  const sizes = {
    sm: { padding: '7px 16px', fontSize: '13px', borderRadius: '8px' },
    md: { padding: '10px 22px', fontSize: '14px', borderRadius: '10px' },
    lg: { padding: '14px 28px', fontSize: '15px', borderRadius: '12px' },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 500,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.6 : 1,
        transition: 'all 0.2s ease',
        outline: 'none',
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {loading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> : null}
      {children}
    </button>
  )
}

/* ---- Input ---- */
export function Input({ label, error, type = 'text', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <input
        type={type}
        {...props}
        style={{
          background: 'var(--bg-hover)',
          border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border-light)'}`,
          borderRadius: 10,
          padding: '10px 14px',
          color: 'var(--text-primary)',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.2s',
          width: '100%',
          ...props.style
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--accent-red)' : 'var(--border-light)' }}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  )
}

/* ---- Select ---- */
export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <select
        {...props}
        style={{
          background: 'var(--bg-hover)',
          border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border-light)'}`,
          borderRadius: 10,
          padding: '10px 14px',
          color: 'var(--text-primary)',
          fontSize: 14,
          outline: 'none',
          width: '100%',
          cursor: 'pointer',
          ...props.style
        }}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  )
}

/* ---- Stat Card ---- */
export function StatCard({ label, value, icon: Icon, gradient, trend }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: 100, height: 100,
        background: gradient || 'var(--gradient-main)',
        opacity: 0.04,
        borderRadius: '50%',
        transform: 'translate(30%, -30%)'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        {Icon && (
          <div style={{
            width: 36, height: 36,
            background: gradient || 'var(--gradient-main)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white'
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 32, fontFamily: 'Syne', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
        {value ?? '—'}
      </div>
      {trend && <div style={{ fontSize: 12, color: 'var(--accent-green)' }}>{trend}</div>}
    </div>
  )
}

/* ---- Alert ---- */
export function Alert({ type = 'info', children }) {
  const config = {
    info: { color: 'var(--accent-primary)', bg: 'rgba(0,212,255,0.06)', border: 'rgba(0,212,255,0.2)' },
    success: { color: 'var(--accent-green)', bg: 'rgba(0,229,160,0.06)', border: 'rgba(0,229,160,0.2)' },
    error: { color: 'var(--accent-red)', bg: 'rgba(255,59,92,0.06)', border: 'rgba(255,59,92,0.2)' },
    warning: { color: 'var(--accent-orange)', bg: 'rgba(255,107,53,0.06)', border: 'rgba(255,107,53,0.2)' },
  }
  const c = config[type]
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      padding: '12px 16px',
      color: c.color,
      fontSize: 14,
    }}>
      {children}
    </div>
  )
}

/* ---- Badge ---- */
export function Badge({ children, color = 'primary' }) {
  const colors = {
    primary: { bg: 'rgba(0,212,255,0.1)', color: 'var(--accent-primary)', border: 'rgba(0,212,255,0.2)' },
    green: { bg: 'rgba(0,229,160,0.1)', color: 'var(--accent-green)', border: 'rgba(0,229,160,0.2)' },
    orange: { bg: 'rgba(255,107,53,0.1)', color: 'var(--accent-orange)', border: 'rgba(255,107,53,0.2)' },
    red: { bg: 'rgba(255,59,92,0.1)', color: 'var(--accent-red)', border: 'rgba(255,59,92,0.2)' },
  }
  const c = colors[color]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      {children}
    </span>
  )
}

/* ---- Page Header ---- */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 26, fontFamily: 'Syne', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ---- Spinner ---- */
export function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--accent-primary)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      display: 'inline-block'
    }} />
  )
}

/* ---- Global spin keyframe ---- */
const style = document.createElement('style')
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
document.head.appendChild(style)
