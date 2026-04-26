'use client'
import { G } from '@/lib/types'

const ICONS: Record<string, JSX.Element> = {
  user:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  store:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a1 1 0 0 0 1 1h4v-4h6v4h4a1 1 0 0 0 1-1v-8"/><path d="M2 7h20"/></svg>,
  recycle: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.8a1.8 1.8 0 0 1-1.57-.88 1.78 1.78 0 0 1 0-1.78L7.2 9.5"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.56-.89 1.78 1.78 0 0 0 0-1.77l-1.23-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.3 13.6 7.2 9.5 3.1 10.6"/><path d="m9.34 5.81 1.1-1.89A1.83 1.83 0 0 1 12 3a1.78 1.78 0 0 1 1.55.89l3.94 6.84"/><path d="m13.38 9.63 4.1 1.1 1.09-4.1"/></svg>,
  chart:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
}

const TABS_BY_ROL: Record<string, { id: string; icon: string; label: string }[]> = {
  usuario:  [{ id: 'dashboard', icon: 'user',    label: 'Inicio' },  { id: 'trazabilidad', icon: 'chart',   label: 'Historial' }],
  comercio: [{ id: 'comercio',  icon: 'store',   label: 'Estación' },{ id: 'trazabilidad', icon: 'chart',   label: 'Datos' }],
  gestora:  [{ id: 'gestora',   icon: 'recycle', label: 'Central' }, { id: 'trazabilidad', icon: 'chart',   label: 'Datos' }],
}

interface BottomNavProps {
  rol: string
  active: string
  onChange: (view: string) => void
}

export default function BottomNav({ rol, active, onChange }: BottomNavProps) {
  const tabs = TABS_BY_ROL[rol] || TABS_BY_ROL.usuario
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: G.surface, borderTop: `1px solid ${G.border}`,
      display: 'flex', paddingBottom: 16, paddingTop: 6, zIndex: 500,
      boxShadow: '0 -4px 20px rgba(30,77,53,0.08)'
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0'
        }}>
          <div style={{
            width: 40, height: 28, borderRadius: 8,
            background: active === t.id ? '#E6F5EE' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: active === t.id ? G.brand : G.textMuted,
            transition: 'background 0.2s'
          }}>{ICONS[t.icon]}</div>
          <span style={{ fontSize: 10, fontWeight: active === t.id ? 800 : 500, color: active === t.id ? G.brand : G.textMuted }}>
            {t.label}
          </span>
          {active === t.id && <div style={{ width: 20, height: 2.5, background: G.brand, borderRadius: 2 }} />}
        </button>
      ))}
    </div>
  )
}
