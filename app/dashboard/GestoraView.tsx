'use client'
import { useState, useEffect } from 'react'

const G = { dark:'#1E4D35', brand:'#2E7D52', bright:'#3A9E65', bg:'#F2F7F4', bgDeep:'#E6F0EB', surface:'#FFFFFF', border:'#C8E0D2', text:'#1A2E22', textMid:'#3D5A48', textMuted:'#7A9E8A', amber:'#D4860A', amberLight:'#FEF6E4', greenLight:'#E6F5EE', blueLight:'#EFF6FF', blue:'#2563EB', red:'#C0392B', redLight:'#FDECEA' }

function Pill({ estado }: { estado: string }) {
  const cfg: Record<string,any> = { disponible:{l:'Disponible',bg:G.greenLight,c:G.brand}, en_uso:{l:'En uso',bg:G.amberLight,c:G.amber}, lavado:{l:'Lavado',bg:G.blueLight,c:G.blue}, perdido:{l:'Perdido',bg:G.redLight,c:G.red} }
  const s = cfg[estado] || cfg.disponible
  return <span style={{ background:s.bg, color:s.c, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{s.l}</span>
}

export function GestoraView({ user }: { user: any; refreshUser?: () => void }) {
  const [vasos, setVasos]         = useState<any[]>([])
  const [filtro, setFiltro]       = useState('todos')
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState<string | null>(null) // vaso_id en proceso
  const [selVaso, setSelVaso]     = useState<string | null>(null) // vaso expandido

  useEffect(() => { loadVasos() }, [])

  const loadVasos = async () => {
    setLoading(true)
    const res = await fetch('/api/vasos')
    if (res.ok) { const d = await res.json(); setVasos(d.vasos || []) }
    setLoading(false)
  }

  const cambiarEstado = async (vasoId: string, nuevoEstado: string) => {
    setUpdating(vasoId)
    try {
      const res = await fetch('/api/vasos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'cambiar_estado', vaso_id: vasoId, nuevo_estado: nuevoEstado })
      })
      if (res.ok) {
        // Actualizar localmente sin recargar todo
        setVasos(prev => prev.map(v => v.id === vasoId ? { ...v, estado: nuevoEstado, lavados: nuevoEstado === 'disponible' && v.estado === 'lavado' ? v.lavados + 1 : v.lavados } : v))
        setSelVaso(null)
      }
    } catch { /* silencioso */ }
    setUpdating(null)
  }

  const total       = vasos.length
  const disponibles = vasos.filter(v => v.estado === 'disponible').length
  const enUso       = vasos.filter(v => v.estado === 'en_uso').length
  const enLavado    = vasos.filter(v => v.estado === 'lavado').length
  const retorno     = enUso > 0 ? Math.round(disponibles / total * 100) : 91

  const filtered = filtro === 'todos' ? vasos : vasos.filter(v => v.estado === filtro)

  // Agrupar por estación
  const porEstacion: Record<string, number> = {}
  vasos.forEach(v => {
    if (!porEstacion[v.estacion_nombre]) porEstacion[v.estacion_nombre] = 0
    if (v.estado === 'disponible' || v.estado === 'en_uso') porEstacion[v.estacion_nombre]++
  })

  return (
    <div className="fade-in">
      <div style={{ background: G.surface, padding: '24px 20px 20px', borderBottom: `3px solid ${G.brand}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${G.brand}, ${G.bright})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22 }}>♻️</span>
          </div>
          <div>
            <h2 style={{ color: G.text, margin: 0, fontSize: 16, fontWeight: 800 }}>{user.nombre}</h2>
            <p style={{ color: G.textMuted, margin: 0, fontSize: 11 }}>Panel central · Red completa</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[['Total vasos', total, G.text], ['En circulación', enUso, G.amber], ['En lavado', enLavado, G.blue]].map(([l,v,c]) => (
            <div key={String(l)} style={{ background: G.bgDeep, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ color: c as string, fontSize: 20, fontWeight: 900 }}>{v as number}</div>
              <div style={{ color: G.textMuted, fontSize: 10, fontWeight: 700 }}>{String(l).toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[
            { l:'Tasa retorno',   v:`${retorno}%`, d:'Vasos disponibles / total', c:G.brand  },
            { l:'Ciclos medios',  v:'17.4',         d:'Usos por vaso',             c:G.blue   },
            { l:'Vasos activos',  v:String(total),  d:'En toda la red',            c:G.dark   },
            { l:'Disponibles',    v:String(disponibles), d:'Listos para usar',     c:G.bright },
          ].map(k => (
            <div key={k.l} style={{ background: G.surface, borderRadius: 14, padding: '14px 16px', border: `1px solid ${G.border}` }}>
              <div style={{ color: k.c, fontSize: 26, fontWeight: 900 }}>{k.v}</div>
              <div style={{ color: G.text, fontSize: 12, fontWeight: 700, marginTop: 2 }}>{k.l}</div>
              <div style={{ color: G.textMuted, fontSize: 11, marginTop: 3 }}>{k.d}</div>
            </div>
          ))}
        </div>

        {/* Distribución por estación */}
        {Object.keys(porEstacion).length > 0 && (
          <div style={{ background: G.surface, borderRadius: 16, padding: '16px 18px', border: `1px solid ${G.border}`, marginBottom: 18 }}>
            <h3 style={{ color: G.text, margin: '0 0 14px', fontSize: 14, fontWeight: 800 }}>Vasos por estación</h3>
            {Object.entries(porEstacion).map(([nombre, count]) => {
              const pct = Math.round(count / total * 100)
              return (
                <div key={nombre} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: G.text, fontSize: 12, fontWeight: 600 }}>{nombre}</span>
                    <span style={{ color: G.brand, fontSize: 12, fontWeight: 700 }}>{count} vasos</span>
                  </div>
                  <div style={{ background: G.bgDeep, borderRadius: 4, height: 7 }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: G.brand }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
          {['todos','disponible','en_uso','lavado'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ background: filtro===f ? G.brand : G.surface, border: `1.5px solid ${filtro===f ? G.brand : G.border}`, color: filtro===f ? 'white' : G.textMid, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: filtro===f ? 700 : 500, whiteSpace: 'nowrap' }}>
              {f==='todos'?'Todos':f==='disponible'?'Disponible':f==='en_uso'?'En uso':'Lavado'}
            </button>
          ))}
        </div>

        {loading
          ? <p style={{ color: G.textMuted, textAlign: 'center', padding: 24 }}>⏳ Cargando vasos...</p>
          : filtered.map(v => (
          <div key={v.id} style={{ background: G.surface, borderRadius: 14, border: `1.5px solid ${selVaso === v.id ? G.brand : G.border}`, marginBottom: 8, overflow: 'hidden', transition: 'border-color 0.2s' }}>
            {/* Cabecera del vaso — clic para expandir */}
            <div onClick={() => setSelVaso(selVaso === v.id ? null : v.id)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ color: G.text, fontWeight: 700, fontSize: 14 }}>{v.codigo_qr}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill estado={v.estado} />
                  <span style={{ color: G.textMuted, fontSize: 14 }}>{selVaso === v.id ? '▲' : '▼'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: G.textMuted, fontSize: 12 }}>📍 {v.estacion_nombre}</span>
                <span style={{ color: G.brand, fontSize: 12, fontWeight: 600 }}>🔄 {v.lavados} ciclos</span>
              </div>
              {v.usuario_nombre && (
                <div style={{ marginTop: 7, background: G.amberLight, borderRadius: 8, padding: '5px 10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: G.textMuted, fontSize: 11 }}>Usuario actual</span>
                  <span style={{ color: G.amber, fontSize: 11, fontWeight: 700 }}>{v.usuario_nombre}</span>
                </div>
              )}
            </div>

            {/* Panel expandible con acciones */}
            {selVaso === v.id && (
              <div style={{ borderTop: `1px solid ${G.border}`, padding: '12px 16px', background: G.bg }}>
                <p style={{ color: G.textMuted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>
                  Cambiar estado
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {/* Botón disponible — aparece si está en lavado o perdido */}
                  {v.estado !== 'disponible' && v.estado !== 'en_uso' && (
                    <button
                      onClick={() => cambiarEstado(v.id, 'disponible')}
                      disabled={updating === v.id}
                      style={{ background: G.greenLight, border: `1.5px solid ${G.brand}`, color: G.brand, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {updating === v.id ? '⏳' : '✅'} Marcar disponible
                    </button>
                  )}
                  {/* Botón lavado — aparece si está disponible */}
                  {v.estado === 'disponible' && (
                    <button
                      onClick={() => cambiarEstado(v.id, 'lavado')}
                      disabled={updating === v.id}
                      style={{ background: G.blueLight, border: `1.5px solid ${G.blue}`, color: G.blue, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {updating === v.id ? '⏳' : '🧼'} Enviar a lavado
                    </button>
                  )}
                  {/* Botón perdido — siempre disponible si no está en uso */}
                  {v.estado !== 'en_uso' && v.estado !== 'perdido' && (
                    <button
                      onClick={() => cambiarEstado(v.id, 'perdido')}
                      disabled={updating === v.id}
                      style={{ background: G.redLight, border: `1.5px solid ${G.red}`, color: G.red, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {updating === v.id ? '⏳' : '❌'} Marcar perdido
                    </button>
                  )}
                  {/* Botón recuperado — si está perdido */}
                  {v.estado === 'perdido' && (
                    <button
                      onClick={() => cambiarEstado(v.id, 'disponible')}
                      disabled={updating === v.id}
                      style={{ background: G.greenLight, border: `1.5px solid ${G.brand}`, color: G.brand, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      {updating === v.id ? '⏳' : '♻️'} Recuperado
                    </button>
                  )}
                  {v.estado === 'en_uso' && (
                    <p style={{ color: G.textMuted, fontSize: 12, margin: 0, padding: '8px 0' }}>
                      No se puede cambiar el estado — vaso en uso por {v.usuario_nombre}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GestoraView
