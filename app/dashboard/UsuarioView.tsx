'use client'
import { useState, useEffect } from 'react'
import RTALogo from '@/components/RTALogo'
import QRScannerScreen from '@/components/QRScannerScreen'

const G = { dark:'#1E4D35', brand:'#2E7D52', bright:'#3A9E65', pale:'#A8D8BB', bg:'#F2F7F4', bgDeep:'#E6F0EB', surface:'#FFFFFF', border:'#C8E0D2', text:'#1A2E22', textMid:'#3D5A48', textMuted:'#7A9E8A', amber:'#D4860A', amberLight:'#FEF6E4', red:'#C0392B', redLight:'#FDECEA', greenLight:'#E6F5EE' }

type Step = 'home' | 'scan_recoger' | 'scan_devolver' | 'confirm_recoger' | 'confirm_devolver' | 'ok_recogida' | 'ok_devolucion'

export default function UsuarioView({ user, refreshUser }: { user: any; refreshUser: () => void }) {
  const [step, setStep]           = useState<Step>('home')
  const [vaso, setVaso]           = useState<any>(null)
  const [vasoDevolver, setVasoDevolver] = useState<any>(null) // vaso activo que se va a devolver
  const [vasosActivos, setVasosActivos] = useState<any[]>([])
  const [historial, setHistorial] = useState<any[]>([])
  const [loadingVaso, setLoadingVaso] = useState(false)
  const [error, setError]         = useState('')
  const [confirming, setConfirming] = useState(false)
  const [puntosLocales, setPuntosLocales] = useState<number>(user.puntos || 0)
  const [vasosDevueltos, setVasosDevueltos] = useState<number>(user.vasos_devueltos || 0)

  useEffect(() => {
    setPuntosLocales(user.puntos || 0)
    setVasosDevueltos(user.vasos_devueltos || 0)
  }, [user.puntos, user.vasos_devueltos])

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
      // Actualizar puntos localmente de inmediato
      setPuntosLocales(data.puntos_nuevos ?? puntosLocales - 50)
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

  // Confirmar devolución — requiere escaneo del QR del vaso
  const confirmarDevolucion = async () => {
    if (!vasoDevolver) return
    setConfirming(true)
    setError('')
    try {
      const res = await fetch('/api/vasos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'devolver', vaso_id: vasoDevolver.id })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      // Actualizar puntos y contador localmente de inmediato
      setPuntosLocales(data.puntos_nuevos ?? puntosLocales + 50)
      setVasosDevueltos(v => v + 1)
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

  // ── SCANNER RECOGER ───────────────────────────────────────
  if (step === 'scan_recoger') return (
    <QRScannerScreen
      modo="recoger"
      onCancel={() => { setStep('home'); setError('') }}
      onResult={async (codigo) => {
        setLoadingVaso(true)
        setError('')
        try {
          const res = await fetch(`/api/vasos?qr=${codigo.trim().toUpperCase()}`)
          if (!res.ok) { setError('Vaso no encontrado'); setLoadingVaso(false); return }
          const data = await res.json()
          if (data.vaso.estado !== 'disponible') { setError('Este vaso no está disponible'); setLoadingVaso(false); return }
          setVaso(data.vaso)
          setStep('confirm_recoger')
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

  // ── SCANNER DEVOLVER — confirma que el vaso escaneado es el correcto ──
  if (step === 'scan_devolver') return (
    <QRScannerScreen
      modo="devolver"
      onCancel={() => { setStep('home'); setError(''); setVasoDevolver(null) }}
      onResult={async (codigo) => {
        setLoadingVaso(true)
        setError('')
        try {
          const res = await fetch(`/api/vasos?qr=${codigo.trim().toUpperCase()}`)
          if (!res.ok) { setError('Vaso no encontrado'); setLoadingVaso(false); return }
          const data = await res.json()
          const vasoEscaneado = data.vaso
          // Verificar que este vaso pertenece al usuario
          if (vasoEscaneado.usuario_id !== user.id) {
            setError('Este vaso no está registrado a tu nombre')
            setLoadingVaso(false)
            return
          }
          setVasoDevolver(vasoEscaneado)
          setStep('confirm_devolver')
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

  // ── CONFIRM RECOGER ───────────────────────────────────────
  if (step === 'confirm_recoger' && vaso) return (
    <div style={{ background: G.bg, minHeight: '80vh' }}>
      <div style={{ background: `linear-gradient(150deg, ${G.dark}, ${G.brand})`, padding: '28px 20px 32px' }}>
        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 22, margin: 0 }}>Confirmar recogida</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>Revisa los detalles del vaso</p>
      </div>
      <div style={{ padding: '20px 16px' }}>
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
          {[['Estado', '✅ Disponible'], ['Ciclos de lavado', `${vaso.lavados} completados`]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1px solid ${G.border}` }}>
              <span style={{ color: G.textMuted, fontSize: 13 }}>{k}</span>
              <span style={{ color: G.text, fontSize: 13, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: G.amberLight, border: `1px solid ${G.amber}40`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ color: G.text, fontSize: 13, fontWeight: 700 }}>Se bloquearán 50 puntos</div>
            <div style={{ color: G.textMuted, fontSize: 12 }}>Los recuperas al devolver el vaso en cualquier punto ReTakeAway</div>
          </div>
        </div>
        {error && <p style={{ color: G.red, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠ {error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setStep('home'); setVaso(null) }} style={{ flex: 1, background: 'transparent', border: `1.5px solid ${G.border}`, color: G.textMid, padding: 14, borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Cancelar</button>
          <button onClick={confirmarRecogida} disabled={confirming} style={{ flex: 2, background: G.brand, border: 'none', color: 'white', padding: 14, borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 800, opacity: confirming ? 0.7 : 1, boxShadow: '0 4px 14px rgba(46,125,82,0.4)' }}>
            {confirming ? '⏳ Procesando...' : 'CONFIRMAR RECOGIDA'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── CONFIRM DEVOLVER ──────────────────────────────────────
  if (step === 'confirm_devolver' && vasoDevolver) return (
    <div style={{ background: G.bg, minHeight: '80vh' }}>
      <div style={{ background: `linear-gradient(150deg, ${G.brand}, ${G.bright})`, padding: '28px 20px 32px' }}>
        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 22, margin: 0 }}>Confirmar devolución</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>QR verificado correctamente ✓</p>
      </div>
      <div style={{ padding: '20px 16px' }}>
        <div style={{ background: G.surface, borderRadius: 16, padding: 18, border: `1px solid ${G.border}`, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, background: G.brand, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RTALogo size={32} white />
            </div>
            <div>
              <div style={{ color: G.text, fontWeight: 800, fontSize: 18 }}>{vasoDevolver.codigo_qr}</div>
              <div style={{ color: G.textMuted, fontSize: 13 }}>{vasoDevolver.estacion_nombre}</div>
            </div>
          </div>
        </div>
        <div style={{ background: G.greenLight, border: `1px solid ${G.brand}40`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔓</span>
          <div>
            <div style={{ color: G.text, fontSize: 13, fontWeight: 700 }}>Se liberarán 50 puntos</div>
            <div style={{ color: G.textMuted, fontSize: 12 }}>Gracias por devolver el vaso 🌍</div>
          </div>
        </div>
        {error && <p style={{ color: G.red, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠ {error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setStep('home'); setVasoDevolver(null) }} style={{ flex: 1, background: 'transparent', border: `1.5px solid ${G.border}`, color: G.textMid, padding: 14, borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Cancelar</button>
          <button onClick={confirmarDevolucion} disabled={confirming} style={{ flex: 2, background: G.brand, border: 'none', color: 'white', padding: 14, borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 800, opacity: confirming ? 0.7 : 1, boxShadow: '0 4px 14px rgba(46,125,82,0.4)' }}>
            {confirming ? '⏳ Procesando...' : 'CONFIRMAR DEVOLUCIÓN'}
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
        <span style={{ color: 'white', fontSize: 22, fontWeight: 900 }}>{puntosLocales.toLocaleString('es-ES')} pts</span>
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
          <span style={{ color: 'white', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{puntosLocales.toLocaleString('es-ES')}</span>
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
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{vasosDevueltos} vasos devueltos</span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>· contribuyes al planeta</span>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Solo botón COGER VASO */}
        <button onClick={() => { setStep('scan_recoger'); setError('') }} style={{
          width: '100%', background: `linear-gradient(135deg, ${G.dark}, ${G.brand})`, color: 'white',
          border: 'none', borderRadius: 16, padding: '18px 12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          boxShadow: '0 4px 18px rgba(30,77,53,0.40)', marginBottom: 24
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>COGER VASO</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Escanea el QR del vaso · −50 pts bloqueados</div>
          </div>
        </button>

        {/* Vasos activos con botón devolver inline */}
        {vasosActivos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: G.text, fontSize: 14, fontWeight: 800, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: G.amber, borderRadius: '50%', display: 'inline-block' }} />
              Vasos en tu poder ({vasosActivos.length})
            </h3>
            {vasosActivos.map((v: any) => (
              <div key={v.id} style={{ background: G.surface, borderRadius: 14, padding: '14px 16px', border: `1px solid ${G.amberLight}`, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ color: G.text, fontWeight: 700, fontSize: 15 }}>{v.codigo_qr}</div>
                    <div style={{ color: G.textMuted, fontSize: 12, marginTop: 2 }}>{v.estacion_nombre}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: G.amber, fontWeight: 800, fontSize: 13 }}>−50 pts 🔒</div>
                  </div>
                </div>
                {/* Botón devolver que abre el escáner QR */}
                <button onClick={() => { setVasoDevolver(v); setStep('scan_devolver'); setError('') }} style={{
                  width: '100%', background: G.brand, border: 'none', color: 'white',
                  padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>
                  Escanear QR para devolver · +50 pts
                </button>
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
              <div style={{ width: 38, height: 38, borderRadius: 10, background: ev.tipo === 'devolucion' ? G.greenLight : G.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
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
              <span style={{ color: ev.puntos_delta > 0 ? G.brand : G.amber, fontWeight: 800, fontSize: 14 }}>
                {ev.puntos_delta > 0 ? '+' : ''}{ev.puntos_delta} pts
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
