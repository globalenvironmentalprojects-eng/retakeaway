'use client'
import { useState, useEffect } from 'react'

const G = { dark:'#1E4D35', brand:'#2E7D52', bg:'#F2F7F4', bgDeep:'#E6F0EB', surface:'#FFFFFF', border:'#C8E0D2', text:'#1A2E22', textMid:'#3D5A48', textMuted:'#7A9E8A', amber:'#D4860A', blue:'#2563EB', red:'#C0392B', greenLight:'#E6F5EE', amberLight:'#FEF6E4' }

export default function TrazabilidadView({ user }: { user: any; refreshUser?: () => void }) {
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadEventos() }, [])

  const loadEventos = async () => {
    setLoading(true)
    const param = user.rol === 'usuario'
      ? `usuario_id=${user.id}`
      : user.rol === 'comercio' && user.estacion_id
        ? `estacion_id=${user.estacion_id}`
        : 'limit=50'
    const res = await fetch(`/api/eventos?${param}`)
    if (res.ok) { const d = await res.json(); setEventos(d.eventos || []) }
    setLoading(false)
  }

  const formatFecha = (iso: string) => {
    const d = new Date(iso)
    const hoy = new Date()
    const ayer = new Date(hoy); ayer.setDate(hoy.getDate()-1)
    const h = d.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })
    if (d.toDateString() === hoy.toDateString())  return `Hoy · ${h}`
    if (d.toDateString() === ayer.toDateString()) return `Ayer · ${h}`
    return `${d.toLocaleDateString('es-ES', { day:'numeric', month:'short' })} · ${h}`
  }

  const tipoConfig: Record<string,any> = {
    recogida:   { emoji:'🥤', label:'Recogida',   bg:G.amberLight, c:G.amber },
    devolucion: { emoji:'♻️', label:'Devolución', bg:G.greenLight, c:G.brand },
    lavado:     { emoji:'🧼', label:'Lavado',      bg:'#EFF6FF',   c:G.blue  },
    perdida:    { emoji:'❌', label:'Pérdida',      bg:'#FEF2F2',   c:G.red   },
  }

  return (
    <div className="fade-in">
      <div style={{ background: G.surface, padding: '24px 20px 16px', borderBottom: `3px solid ${G.brand}` }}>
        <h2 style={{ color: G.text, margin: 0, fontSize: 18, fontWeight: 900 }}>Trazabilidad QR</h2>
        <p style={{ color: G.textMuted, margin: '4px 0 0', fontSize: 12 }}>
          {user.rol === 'usuario' ? 'Tu historial completo' : user.rol === 'comercio' ? `Eventos de ${user.nombre}` : 'Todos los eventos de la red'}
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Ciclo de vida */}
        <div style={{ background: G.surface, borderRadius: 16, padding: '18px', border: `1px solid ${G.border}`, marginBottom: 16 }}>
          <h3 style={{ color: G.text, margin: '0 0 16px', fontSize: 14, fontWeight: 800 }}>Ciclo de vida del vaso</h3>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            {[
              { e:'⛽', l:'Estación',   c:G.dark  },
              { e:'📲', l:'Escaneo',    c:G.amber },
              { e:'🥤', l:'Usuario',    c:G.textMid },
              { e:'♻️', l:'Devolución', c:G.brand },
              { e:'🧼', l:'Lavado',     c:G.blue  },
            ].map((s, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${s.c}12`, border: `2px solid ${s.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 16 }}>{s.e}</div>
                  <div style={{ color: G.textMuted, fontSize: 9, marginTop: 5, fontWeight: 700 }}>{s.l}</div>
                </div>
                {i < arr.length-1 && <div style={{ width: 10, height: 1.5, background: G.border, margin: '0 1px 14px' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Log de eventos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ color: G.text, fontSize: 14, fontWeight: 800, margin: 0 }}>
            Eventos{eventos.length > 0 ? ` (${eventos.length})` : ''}
          </h3>
          <button onClick={loadEventos} style={{ background: 'transparent', border: `1px solid ${G.border}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: G.textMuted, fontSize: 11 }}>
            🔄 Actualizar
          </button>
        </div>

        {loading ? (
          <p style={{ color: G.textMuted, textAlign: 'center', padding: 24 }}>⏳ Cargando eventos...</p>
        ) : eventos.length === 0 ? (
          <p style={{ color: G.textMuted, textAlign: 'center', padding: 24 }}>Sin eventos registrados aún</p>
        ) : eventos.map((ev, i) => {
          const cfg = tipoConfig[ev.tipo] || tipoConfig.lavado
          return (
            <div key={ev.id} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.bg, border: `1.5px solid ${cfg.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                  {cfg.emoji}
                </div>
                {i < eventos.length-1 && <div style={{ width: 1.5, flex: 1, background: G.border, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ color: G.text, fontSize: 13, fontWeight: 700 }}>{ev.vaso_codigo}</span>
                    <span style={{ color: cfg.c, fontSize: 11, fontWeight: 700, marginLeft: 8, background: cfg.bg, padding: '1px 7px', borderRadius: 10 }}>{cfg.label}</span>
                  </div>
                  <span style={{ color: G.textMuted, fontSize: 11 }}>{formatFecha(ev.created_at)}</span>
                </div>
                <div style={{ color: G.textMid, fontSize: 12, marginTop: 3 }}>
                  {ev.usuario_nombre && `${ev.tipo === 'recogida' ? '↗' : '↙'} ${ev.usuario_nombre}`}
                  {ev.estacion_nombre && ` · ${ev.estacion_nombre}`}
                  {!ev.usuario_nombre && ev.estacion_nombre && `🧼 ${ev.estacion_nombre}`}
                </div>
                {ev.puntos_delta !== 0 && (
                  <span style={{ color: ev.puntos_delta > 0 ? G.brand : G.red, fontSize: 12, fontWeight: 800 }}>
                    {ev.puntos_delta > 0 ? '+' : ''}{ev.puntos_delta} pts
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
