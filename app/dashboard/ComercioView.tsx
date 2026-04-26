'use client'
import { useState, useEffect } from 'react'
import RTALogo from '@/components/RTALogo'

const G = { dark:'#1E4D35', brand:'#2E7D52', bg:'#F2F7F4', bgDeep:'#E6F0EB', surface:'#FFFFFF', border:'#C8E0D2', text:'#1A2E22', textMid:'#3D5A48', textMuted:'#7A9E8A', amber:'#D4860A', amberLight:'#FEF6E4', greenLight:'#E6F5EE', blueLight:'#EFF6FF', blue:'#2563EB', red:'#C0392B', redLight:'#FDECEA' }

export default function ComercioView({ user }: { user: any; refreshUser: () => void }) {
  const [vasos, setVasos]     = useState<any[]>([])
  const [eventos, setEventos] = useState<any[]>([])
  const [sel, setSel]         = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user.estacion_id) {
      loadVasos()
      loadEventos()
    }
  }, [user.estacion_id])

  const loadVasos = async () => {
    setLoading(true)
    const res = await fetch(`/api/vasos?estacion_id=${user.estacion_id}`)
    if (res.ok) { const d = await res.json(); setVasos(d.vasos || []) }
    setLoading(false)
  }

  const loadEventos = async () => {
    const res = await fetch(`/api/eventos?estacion_id=${user.estacion_id}&limit=10`)
    if (res.ok) { const d = await res.json(); setEventos(d.eventos || []) }
  }

  const disponibles = vasos.filter(v => v.estado === 'disponible').length
  const enUso       = vasos.filter(v => v.estado === 'en_uso').length
  const lavado      = vasos.filter(v => v.estado === 'lavado').length
  const recogidas   = eventos.filter(e => e.tipo === 'recogida').length
  const devoluciones= eventos.filter(e => e.tipo === 'devolucion').length
  const retorno     = recogidas > 0 ? Math.round(devoluciones / recogidas * 100) : 100

  const pill = (estado: string) => {
    const cfg: Record<string, any> = { disponible: { l:'Disponible', bg:G.greenLight, c:G.brand }, en_uso: { l:'En uso', bg:G.amberLight, c:G.amber }, lavado: { l:'Lavado', bg:G.blueLight, c:G.blue }, perdido: { l:'Perdido', bg:G.redLight, c:G.red } }
    const s = cfg[estado] || cfg.disponible
    return <span style={{ background: s.bg, color: s.c, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{s.l}</span>
  }

  const marcarLavado = async (vasoId: string) => {
    await fetch('/api/vasos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'marcar_lavado', vaso_id: vasoId, estacion_id: user.estacion_id }) })
    await loadVasos()
    setSel(null)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: G.textMuted }}>⏳ Cargando...</div>

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ background: G.surface, padding: '24px 20px 20px', borderBottom: `3px solid ${G.brand}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 42, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${G.dark}, ${G.brand})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RTALogo size={26} white />
          </div>
          <div>
            <h2 style={{ color: G.text, margin: 0, fontSize: 16, fontWeight: 800 }}>{user.nombre}</h2>
            <p style={{ color: G.textMuted, margin: 0, fontSize: 11 }}>Panel de estación · {new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long' })}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['Disponibles', disponibles, G.brand, G.greenLight], ['En uso', enUso, G.amber, G.amberLight], ['Lavado', lavado, G.blue, G.blueLight]].map(([l,v,c,bg]) => (
            <div key={String(l)} style={{ flex: 1, background: bg as string, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ color: c as string, fontSize: 26, fontWeight: 900 }}>{v as number}</div>
              <div style={{ color: G.textMuted, fontSize: 10, fontWeight: 700 }}>{String(l).toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* KPI hoy */}
        <div style={{ background: G.surface, borderRadius: 16, padding: '16px 18px', border: `1px solid ${G.border}`, marginBottom: 16 }}>
          <h3 style={{ color: G.text, margin: '0 0 12px', fontSize: 14, fontWeight: 800 }}>Actividad reciente</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[['Recogidas', recogidas, G.amber], ['Devueltos', devoluciones, G.brand], ['Retorno', `${retorno}%`, G.dark]].map(([l,v,c]) => (
              <div key={String(l)} style={{ textAlign: 'center' }}>
                <div style={{ color: c as string, fontSize: 28, fontWeight: 900 }}>{v as any}</div>
                <div style={{ color: G.textMuted, fontSize: 11, fontWeight: 600 }}>{l as string}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista vasos */}
        <h3 style={{ color: G.text, fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>Inventario de vasos</h3>
        {vasos.length === 0
          ? <p style={{ color: G.textMuted, textAlign: 'center', padding: '24px 0' }}>No hay vasos asignados a esta estación</p>
          : vasos.map(v => (
          <div key={v.id} onClick={() => setSel(sel?.id === v.id ? null : v)} style={{ background: G.surface, borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${sel?.id === v.id ? G.brand : G.border}`, marginBottom: 8, cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: G.text, fontWeight: 700, fontSize: 14 }}>{v.codigo_qr}</div>
                <div style={{ color: G.textMuted, fontSize: 11, marginTop: 1 }}>{v.lavados} ciclos</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {pill(v.estado)}
                <span style={{ color: G.textMuted }}>›</span>
              </div>
            </div>
            {sel?.id === v.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${G.border}` }}>
                {v.usuario_nombre && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: G.textMuted, fontSize: 12 }}>Usuario actual</span><span style={{ color: G.amber, fontSize: 12, fontWeight: 700 }}>{v.usuario_nombre}</span></div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => marcarLavado(v.id)} style={{ flex: 1, background: G.blueLight, border: 'none', color: G.blue, padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>🧼 Marcar lavado</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
