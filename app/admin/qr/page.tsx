'use client'
import { useEffect, useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const G = { dark:'#1E4D35', brand:'#2E7D52', bright:'#3A9E65', bg:'#F2F7F4', surface:'#FFFFFF', border:'#C8E0D2', text:'#1A2E22', textMuted:'#7A9E8A' }

export default function AdminQRPage() {
  const [vasos, setVasos]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [auth, setAuth]     = useState(false)
  const [clave, setClave]   = useState('')
  const printRef            = useRef<HTMLDivElement>(null)

  // Protección mínima con clave
  const handleAuth = () => {
    if (clave === 'retakeaway2024') setAuth(true)
    else alert('Clave incorrecta')
  }

  useEffect(() => {
    if (!auth) return
    fetch('/api/vasos')
      .then(r => r.json())
      .then(d => { setVasos(d.vasos || []); setLoading(false) })
  }, [auth])

  const imprimir = () => window.print()

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2 style={{ color: G.text, fontWeight: 800, margin: 0 }}>Zona de administración</h2>
      <p style={{ color: G.textMuted, fontSize: 13 }}>Introduce la clave para generar los QR</p>
      <input
        type="password" value={clave} onChange={e => setClave(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAuth()}
        placeholder="Clave de administrador"
        style={{ padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 15, outline: 'none', width: 260 }}
      />
      <button onClick={handleAuth} style={{ background: G.brand, border: 'none', color: 'white', padding: '13px 40px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 800 }}>
        ENTRAR
      </button>
      <p style={{ color: G.textMuted, fontSize: 11 }}>Clave por defecto: retakeaway2024</p>
    </div>
  )

  return (
    <div style={{ background: G.bg, minHeight: '100vh', padding: 24, fontFamily: "'Outfit', sans-serif" }}>
      {/* Header — se oculta al imprimir */}
      <div className="no-print" style={{ maxWidth: 800, margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: G.text, fontWeight: 900, fontSize: 24, margin: 0 }}>Códigos QR · ReTakeAway</h1>
          <p style={{ color: G.textMuted, fontSize: 13, margin: '4px 0 0' }}>
            {vasos.length} vasos registrados · Imprime, recorta y pega en cada vaso
          </p>
        </div>
        <button onClick={imprimir} style={{ background: G.brand, border: 'none', color: 'white', padding: '12px 24px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          🖨️ Imprimir todos
        </button>
      </div>

      {loading
        ? <p style={{ textAlign: 'center', color: G.textMuted, padding: 40 }}>⏳ Cargando vasos...</p>
        : (
        <div ref={printRef} style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {vasos.map(v => (
            <div key={v.id} className="qr-card" style={{
              background: G.surface, borderRadius: 16, padding: '16px 12px',
              border: `1px solid ${G.border}`, textAlign: 'center',
              pageBreakInside: 'avoid', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 10
            }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <svg width={16} height={19} viewBox="0 0 189 228" fill="none">
                  <g fill={G.dark} transform="scale(0.1,-0.1) translate(0,-2280)">
                    <path d="M257 2133 c-8 -10 -26 -63 -39 -118 l-23 -100 -70 -5 -70 -5 -28 -95 c-16 -54 -26 -112 -25 -135 l3 -40 927 -3 c906 -2 927 -2 933 17 6 19 -38 209 -56 243 -8 15 -22 18 -79 18 l-68 0 -22 98 c-12 53 -28 107 -36 120 l-14 22 -659 0 c-614 0 -659 -1 -674 -17z"/>
                    <path d="M775 1295 c-131 -36 -262 -128 -347 -243 -115 -156 -148 -365 -85 -549 36 -105 70 -158 157 -244 133 -132 273 -185 465 -176 175 8 287 57 411 181 106 106 174 257 174 386 0 47 -18 62 -67 58 l-38 -3 -17 -85 c-42 -201 -168 -346 -350 -401 -97 -30 -235 -23 -327 14 -127 53 -235 162 -281 285 -27 71 -37 197 -21 275 32 149 141 285 288 355 77 36 80 37 198 37 102 0 129 -4 177 -23 62 -25 149 -88 193 -140 l28 -33 -64 3 c-61 3 -63 2 -73 -25 -7 -19 -7 -33 0 -45 13 -21 252 -83 304 -80 32 3 35 6 42 43 4 22 7 97 7 167 1 117 -1 128 -19 138 -11 6 -31 8 -45 4 -23 -6 -25 -10 -25 -70 0 -35 -2 -64 -5 -64 -3 0 -35 30 -72 68 -129 128 -265 183 -452 181 -58 0 -128 -7 -156 -14z"/>
                  </g>
                </svg>
                <span style={{ fontWeight: 900, fontSize: 10, color: G.dark, letterSpacing: 0.3 }}>ReTakeAway</span>
              </div>

              {/* QR Code */}
              <QRCodeSVG
                value={v.codigo_qr}
                size={130}
                fgColor={G.dark}
                bgColor="white"
                level="M"
              />

              {/* Solo el código del vaso */}
              <div style={{ background: G.bg, borderRadius: 8, padding: '7px 14px', border: `1px solid ${G.border}` }}>
                <span style={{ fontWeight: 900, fontSize: 17, color: G.dark, letterSpacing: 2, fontFamily: 'monospace' }}>
                  {v.codigo_qr}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .qr-card {
            border: 1px solid #ccc !important;
            break-inside: avoid;
          }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  )
}
