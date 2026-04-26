'use client'
import { useState, useEffect, useRef } from 'react'
import RTALogo from '@/components/RTALogo'
import QRScannerScreen from '@/components/QRScannerScreen'

const G = { dark:'#1E4D35', brand:'#2E7D52', bright:'#3A9E65', pale:'#A8D8BB', bg:'#F2F7F4', bgDeep:'#E6F0EB', surface:'#FFFFFF', border:'#C8E0D2', text:'#1A2E22', textMid:'#3D5A48', textMuted:'#7A9E8A', amber:'#D4860A', amberLight:'#FEF6E4', red:'#C0392B', redLight:'#FDECEA', greenLight:'#E6F5EE' }

type Step = 'home' | 'scan' | 'confirm' | 'ok_recogida' | 'ok_devolucion'

export default function UsuarioView({ user, refreshUser }: { user: any; refreshUser: () => void }) {
  const [step, setStep]       = useState<Step>('home')
  const [scanMode, setScanMode] = useState<'recoger'|'devolver'>('recoger')
  const [qrInput, setQrInput] = useState('')
  const [vaso, setVaso]       = useState<any>(null)
  const [vasosActivos, setVasosActivos] = useState<any[]>([])
  const [historial, setHistorial]       = useState<any[]>([])
  const [loadingVaso, setLoadingVaso]   = useState(false)
  const [error, setError]     = useState('')
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar vasos en uso del usuario y su historial
  useEffect(() => {
    loadVasosActivos()
    loadHistorial()
  }, [user.id])

  const loadVasosActivos = async () => {
    const res = await fetch(`/api/vasos?usuario_id=${user.id}`)
    if (res.ok) {
      const data = await res.json()
      setVasosActivos((data.vasos || []).filter((v: any) => v.estado === 'en_uso' && v.usuario_id === user.id))
    }
  }

  const loadHistorial = async () => {
    const res = await fetch(`/api/eventos?usuario_id=${user.id}&limit=20`)
    if (res.ok) {
      const data = await res.json()
      setHistorial(data.eventos || [])
    }
  }

  // Buscar vaso por código QR
  const buscarVaso = async () => {
    if (!qrInput.trim()) return
    setLoadingVaso(true)
    setError('')
    try {
      const res = await fetch(`/api/vasos?qr=${qrInput.trim().toUpperCase()}`)
      if (!res.ok) { setError('Vaso no encontrado'); return }
      const data = await res.json()
      setVaso(data.vaso)
      setStep('confirm')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoadingVaso(false)
    }
  }

  // Confirmar recogida
  const confirmarRecogida = async () => {
    setConfirming(true)
    setError('')
    try {
      const res = await fetch('/api/vasos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'recoger', vaso_id: vaso.id, usuario_id: user.id })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      await refreshUser()
      await loadVasosActivos()
      await loadHistorial()
      setStep('ok_recogida')
    } catch {
      setError('Error de conexión')
    } finally {
      setConfirming(false)
    }
  }

  // Confirmar devolución
  const confirmarDevolucion = async (vasoId: string) => {
    setConfirming(true)
    try {
      const res = await fetch('/api/vasos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'devolver', vaso_id: vasoId, estacion_id: user.estacion_id })
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      await refreshUser()
      await loadVasosActivos()
      await loadHistorial()
      setStep('ok_devolucion')
    } catch {
      setError('Error de conexión')
    } finally {
      setConfirming(false)
    }
  }

  const formatFecha = (iso: string) => {
    const d = new Date(iso)
    const hoy = new Date()
    const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1)
    const h = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    if (d.toDateString() === hoy.toDateString()) return `Hoy · ${h}`
    if (d.toDateString() === ayer.toDateString()) return `Ayer · ${h}`
    return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · ${h}`
  }

  // ── SCANNER (cámara real + manual) ───────────────────────
  if (step === 'scan') return (
    <QRScannerScreen
      modo={scanMode}
      onCancel={() => { setStep('home'); setError('') }}
      onResult={async (codigo) => {
        setLoadingVaso(true)
        setError('')
        try {
          const res = await fetch(`/api/vasos?qr=${codigo.trim().toUpperCase()}`)
          if (!res.ok) { setError('Vaso no encontrado'); setLoadingVaso(false); return }
          const data = await res.json()
          setVaso(data.vaso)
          setStep('confirm')
        } catch {
          setError('Error de conexión')
        } finally {
          setLoadingVaso(false)
        }
      }}
      loading={loadingVaso}
      error={error}
    />
  )

  // ── CONFIRM SHEET ─────────────────────────────────────────
  if (step === 'confirm' && vaso) return (
    <div style={{ background: G.bg, minHeight: '80vh' }}>
      {/* Header verde */}
      <div style={{ background: `linear-gradient(150deg, ${G.dark}, ${G.brand})`, padding: '28px 20px 32px' }}>
        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 22, margin: 0 }}>Confirmar recogida</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>Revisa los detalles del vaso</p>
      </div>
      <div style={{ padding: '20px 16px' }}>
        {/* Info vaso */}
        <div style={{ background: G.surface, borderRadius: 16, padding: 18, border: `1px solid ${G.border}`, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, background: G.dark, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RTALogo size={32} white />
            </div>
            <div>
              <div style={{ color: G.text, fontWeight: 800, fontSize: 18 }}>{vaso.codigo_qr}</div>
              <div style={{ color: G.textMuted, fontSize: 13 }}>{vaso.estacion_nombre}</div>
            </div>
          </div>
          {[['Estado', vaso.estado === 'disponible' ? '✅ Disponible' : '❌ No disponible'],['Ciclos de lavado', `${vaso.lavados} completados`]].map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1px solid ${G.border}` }}>
              <span style={{ color: G.textMuted, fontSize: 13 }}>{k}</span>
              <span style={{ color: G.text, fontSize: 13, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
        {/* Aviso puntos */}
        <div style={{ background: G.amberLight, border: `1px solid ${G.amber}40`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ color: G.text, fontSize: 13, fontWeight: 700 }}>Se bloquearán 50 puntos</div>
            <div style={{ color: G.textMuted, fontSize: 12 }}>Los recuperas al devolver el vaso en cualquier punto ReTakeAway</div>
          </div>
        </div>
        {error && <p style={{ color: G.red, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠ {error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setStep('home'); setVaso(null); setQrInput('') }} style={{ flex: 1, background: 'transparent', border: `1.5px solid ${G.border}`, color: G.textMid, padding: 14, borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Cancelar</button>
          <button onClick={confirmarRecogida} disabled={confirming || vaso.estado !== 'disponible'} style={{ flex: 2, background: G.brand, border: 'none', color: 'white', padding: 14, borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 800, opacity: confirming ? 0.7 : 1, boxShadow: '0 4px 14px rgba(46,125,82,0.4)' }}>
            {confirming ? '⏳ Procesando...' : 'CONFIRMAR RECOGIDA'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── SUCCESS SCREENS ───────────────────────────────────────
  if (step === 'ok_recogida' || step === 'ok_devolucion') return (
    <div style={{ minHeight: '80vh', background: step === 'ok_recogida' ? G.dark : G.brand, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <RTALogo size={72} white />
      <h2 style={{ color: 'white', fontSize: 30, fontWeight: 900, margin: '20px 0 10px', textAlign: 'center' }}>
        {step === 'ok_recogida' ? '¡Vaso recogido!' : '¡Gracias por devolver!'}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 28px', fontSize: 15 }}>
        {step === 'ok_recogida' ? '50 puntos bloqueados.\nDevuelve el vaso para recuperarlos.' : '50 puntos recuperados!\nGracias por cuidar el planeta 🌍'}
      </p>
      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>⭐</span>
        <span style={{ color: 'white', fontSize: 22, fontWeight: 900 }}>{user.puntos?.toLocaleString('es-ES')} pts</span>
      </div>
      <button onClick={() => setStep('home')} style={{ marginTop: 30, background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.35)', color: 'white', padding: '14px 48px', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>Continuar</button>
    </div>
  )

  // ── HOME ──────────────────────────────────────────────────
  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ background: `linear-gradient(150deg, ${G.dark}, ${G.brand})`, padding: '28px 20px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(107,191,142,0.08)' }} />
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0 }}>Hola, {user.nombre.split(' ')[0]} 👋</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
          <span style={{ color: 'white', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{(user.puntos || 0).toLocaleString('es-ES')}</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>pts</span>
        </div>
        {vasosActivos.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12 }}>🔒</span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{vasosActivos.length * 50} pts bloqueados</span>
          </div>
        )}
        <div style={{ marginTop: 18, background: 'rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🌿</span>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>
            {historial.filter(e => e.tipo === 'devolucion').length} vasos devueltos
          </span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>· contribuyes al planeta</span>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button onClick={() => { setScanMode('recoger'); setStep('scan'); setQrInput(''); setError('') }} style={{ flex: 1, background: `linear-gradient(135deg, ${G.dark}, ${G.brand})`, color: 'white', border: 'none', borderRadius: 16, padding: '16px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: '0 4px 18px rgba(30,77,53,0.40)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>
            <span style={{ fontWeight: 800, fontSize: 14 }}>COGER VASO</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>−50 pts bloqueados</span>
          </button>
          <button onClick={() => { setScanMode('devolver'); setStep('scan'); setQrInput(''); setError('') }} style={{ flex: 1, background: G.surface, color: G.dark, border: `2px solid ${G.brand}`, borderRadius: 16, padding: '16px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={G.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.8a1.8 1.8 0 0 1-1.57-.88 1.78 1.78 0 0 1 0-1.78L7.2 9.5"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.56-.89 1.78 1.78 0 0 0 0-1.77l-1.23-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.3 13.6 7.2 9.5 3.1 10.6"/><path d="m9.34 5.81 1.1-1.89A1.83 1.83 0 0 1 12 3a1.78 1.78 0 0 1 1.55.89l3.94 6.84"/><path d="m13.38 9.63 4.1 1.1 1.09-4.1"/></svg>
            <span style={{ fontWeight: 800, fontSize: 14 }}>DEVOLVER</span>
            <span style={{ fontSize: 10, color: G.textMuted }}>+50 pts recuperados</span>
          </button>
        </div>

        {/* Vasos activos */}
        {vasosActivos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: G.text, fontSize: 14, fontWeight: 800, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: G.amber, borderRadius: '50%', display: 'inline-block' }} />
              Vasos en tu poder ({vasosActivos.length})
            </h3>
            {vasosActivos.map((v: any) => (
              <div key={v.id} style={{ background: G.surface, borderRadius: 14, padding: '14px 16px', border: `1px solid ${G.amberLight}`, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: G.text, fontWeight: 700 }}>{v.codigo_qr}</div>
                  <div style={{ color: G.textMuted, fontSize: 12 }}>{v.estacion_nombre}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: G.amber, fontWeight: 800 }}>−50 pts 🔒</div>
                  <button onClick={() => confirmarDevolucion(v.id)} disabled={confirming} style={{ marginTop: 4, background: G.brand, border: 'none', color: 'white', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                    Devolver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Historial */}
        <h3 style={{ color: G.text, fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>Historial</h3>
        {historial.length === 0
          ? <p style={{ color: G.textMuted, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin actividad aún</p>
          : historial.map((ev: any) => (
          <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${G.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: ev.tipo === 'devolucion' ? G.greenLight : G.redLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {ev.tipo === 'devolucion' ? '♻️' : ev.tipo === 'recogida' ? '🥤' : '🧼'}
              </div>
              <div>
                <div style={{ color: G.text, fontSize: 13, fontWeight: 600 }}>
                  {ev.tipo === 'devolucion' ? 'Devuelto' : ev.tipo === 'recogida' ? 'Recogido' : 'Lavado'} · {ev.vaso_codigo}
                </div>
                <div style={{ color: G.textMuted, fontSize: 11 }}>{ev.estacion_nombre} · {formatFecha(ev.created_at)}</div>
              </div>
            </div>
            {ev.puntos_delta !== 0 && (
              <span style={{ color: ev.puntos_delta > 0 ? G.brand : G.red, fontWeight: 800, fontSize: 14 }}>
                {ev.puntos_delta > 0 ? '+' : ''}{ev.puntos_delta} pts
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
