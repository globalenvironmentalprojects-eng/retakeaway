'use client'
import RTALogo from './RTALogo'
import { G } from '@/lib/types'

interface TopBarProps {
  usuario: { nombre: string; rol: string }
  onLogout: () => void
}

export default function TopBar({ usuario, onLogout }: TopBarProps) {
  const initials = usuario.nombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{
      background: G.surface, borderBottom: `1px solid ${G.border}`,
      padding: '10px 18px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 1px 8px rgba(30,77,53,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <RTALogo size={26} />
        <span style={{ fontWeight: 900, fontSize: 15, color: G.dark }}>
          Re<span style={{ color: G.brand }}>Take</span>Away
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: `linear-gradient(135deg, ${G.dark}, ${G.brand})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: 'white'
        }}>{initials}</div>
        <span style={{ color: G.textMid, fontSize: 13, fontWeight: 600 }}>
          {usuario.nombre.split(' ')[0]}
        </span>
        <button onClick={onLogout} style={{
          background: 'transparent', border: `1px solid ${G.border}`,
          borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
          color: G.textMuted, fontSize: 12, fontWeight: 600
        }}>Salir</button>
      </div>
    </div>
  )
}
