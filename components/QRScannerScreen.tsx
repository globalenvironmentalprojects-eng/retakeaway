'use client'
import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

const G = {
  brand: '#2E7D52', bright: '#3A9E65', pale: '#A8D8BB',
  dark: '#1E4D35', red: '#C0392B'
}

interface Props {
  modo: 'recoger' | 'devolver'
  onCancel: () => void
  onResult: (codigo: string) => void
  loading?: boolean
  error?: string
}

export default function QRScannerScreen({ modo, onCancel, onResult, loading, error }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const rafRef      = useRef<number>(0)
  const [metodo, setMetodo]       = useState<'camara' | 'manual'>('camara')
  const [camaraOk, setCamaraOk]   = useState<boolean | null>(null) // null=cargando
  const [manual, setManual]       = useState('')
  const [escaneado, setEscaneado] = useState(false)

  // ── Arrancar cámara ──────────────────────────────────────
  useEffect(() => {
    if (metodo !== 'camara') return
    let active = true

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setCamaraOk(true)
          scanLoop()
        }
      } catch {
        setCamaraOk(false) // sin permiso o sin cámara → mostrar manual
      }
    }

    startCamera()
    return () => {
      active = false
      stopCamera()
    }
  }, [metodo])

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  // ── Loop de detección con jsQR ───────────────────────────
  const scanLoop = () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop)
      return
    }
    const ctx = canvas.getContext('2d')!
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    })
    if (code?.data) {
        setEscaneado(true)
        stopCamera()
        setTimeout(() => onResult(code.data), 400)
        return
    }
    rafRef.current = requestAnimationFrame(scanLoop)
  }

  const handleManual = () => {
    if (!manual.trim()) return
    stopCamera()
    onResult(manual.trim().toUpperCase())
  }

  // Si no hay cámara, ir directo a manual
  useEffect(() => {
    if (camaraOk === false) setMetodo('manual')
  }, [camaraOk])

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: '#0A1A0F', zIndex: 900,
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', flexShrink: 0 }}>
          <button onClick={() => { stopCamera(); onCancel() }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
            {modo === 'recoger' ? '📲 Escanear para recoger' : '♻️ Escanear para devolver'}
          </span>
        </div>

        {/* Tabs cámara / manual */}
        <div style={{ display: 'flex', margin: '0 20px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, flexShrink: 0 }}>
          {(['camara', 'manual'] as const).map(m => (
            <button key={m} onClick={() => setMetodo(m)} style={{
              flex: 1, border: 'none', borderRadius: 9, padding: '9px 0', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: metodo === m ? G.brand : 'transparent',
              color: metodo === m ? 'white' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s'
            }}>
              {m === 'camara' ? '📷 Cámara' : '⌨️ Manual'}
            </button>
          ))}
        </div>

        {/* ── CÁMARA ── */}
        {metodo === 'camara' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 20px' }}>
            {camaraOk === null && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                Solicitando permiso de cámara...
              </div>
            )}

            {/* Visor de vídeo */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 340, borderRadius: 16, overflow: 'hidden', display: camaraOk ? 'block' : 'none' }}>
              <video ref={videoRef} playsInline muted style={{ width: '100%', display: 'block', borderRadius: 16 }} />
              {/* Overlay con esquinas */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: 220, height: 220 }}>
                  {/* Línea de escaneo animada */}
                  {!escaneado && (
                    <div style={{
                      position: 'absolute', left: 0, right: 0, height: 2,
                      background: `linear-gradient(90deg, transparent, ${G.bright}, transparent)`,
                      animation: 'scanline 2s linear infinite',
                      boxShadow: `0 0 8px ${G.bright}`
                    }} />
                  )}
                  {/* Esquinas */}
                  {[[0,0],[0,1],[1,0],[1,1]].map(([r,c],i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      top: r ? 'auto' : 0, bottom: r ? 0 : 'auto',
                      left: c ? 'auto' : 0, right: c ? 0 : 'auto',
                      width: 28, height: 28,
                      borderTop:    r ? 'none'                        : `3px solid ${escaneado ? '#4CAF50' : G.bright}`,
                      borderBottom: r ? `3px solid ${escaneado ? '#4CAF50' : G.bright}` : 'none',
                      borderLeft:   c ? 'none'                        : `3px solid ${escaneado ? '#4CAF50' : G.bright}`,
                      borderRight:  c ? `3px solid ${escaneado ? '#4CAF50' : G.bright}` : 'none',
                      transition: 'border-color 0.3s'
                    }} />
                  ))}
                  {escaneado && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>✓</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {camaraOk && !escaneado && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
                Centra el código QR del vaso dentro del recuadro
              </p>
            )}
            {escaneado && <p style={{ color: '#4CAF50', fontSize: 14, fontWeight: 700, marginTop: 16 }}>✓ QR detectado, procesando...</p>}
            {loading && <p style={{ color: G.pale, fontSize: 13, marginTop: 12 }}>⏳ Buscando vaso...</p>}
            {error && <p style={{ color: '#ff7777', fontSize: 13, marginTop: 12 }}>⚠ {error}</p>}
          </div>
        )}

        {/* ── MANUAL ── */}
        {metodo === 'manual' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 40px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🥤</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24, textAlign: 'center', lineHeight: 1.5 }}>
              Introduce el código que aparece<br/>impreso en el vaso
            </p>
            <input
              value={manual}
              onChange={e => setManual(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleManual()}
              placeholder="RTA-001"
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.1)', border: `2px solid ${G.brand}`,
                borderRadius: 14, padding: '16px 20px', color: 'white', fontSize: 22,
                fontWeight: 800, textAlign: 'center', width: '100%', maxWidth: 260,
                outline: 'none', letterSpacing: 3
              }}
            />
            {error && <p style={{ color: '#ff7777', fontSize: 13, marginTop: 10 }}>⚠ {error}</p>}
            <button
              onClick={handleManual}
              disabled={loading || !manual.trim()}
              style={{
                marginTop: 20, background: manual.trim() ? G.brand : 'rgba(255,255,255,0.1)',
                border: 'none', color: 'white', padding: '15px 48px', borderRadius: 14,
                cursor: manual.trim() ? 'pointer' : 'not-allowed', fontSize: 15, fontWeight: 800,
                transition: 'background 0.2s'
              }}>
              {loading ? '⏳ Buscando...' : 'BUSCAR VASO'}
            </button>
          </div>
        )}

        {/* Canvas oculto para procesamiento QR */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 0%; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0%; }
        }
      `}</style>
    </>
  )
}
