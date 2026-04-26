'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RTALogo from '@/components/RTALogo'

const G = {
  darkest: '#1A3A2A', dark: '#1E4D35', mid: '#2D6B4A', brand: '#2E7D52', bright: '#3A9E65',
  pale: '#A8D8BB', bg: '#F2F7F4', surface: '#FFFFFF', border: '#C8E0D2',
  text: '#1A2E22', textMid: '#3D5A48', textMuted: '#7A9E8A',
  amber: '#D4860A', amberLight: '#FEF6E4', red: '#C0392B'
}

const DEMOS = [
  { email: 'carlos@demo.com',  password: '1234',   nombre: 'Carlos Martínez', rol: 'Usuario'  },
  { email: 'ana@demo.com',     password: '1234',   nombre: 'Ana Pérez',       rol: 'Usuario'  },
  { email: 'pedro@demo.com',   password: '1234',   nombre: 'Pedro Ruiz',      rol: 'Usuario'  },
  { email: 'repsol@demo.com',  password: 'repsol', nombre: 'Repsol Valdebebas',rol: 'Comercio'},
  { email: 'ecowash@demo.com', password: 'ecowash',nombre: 'EcoWash Madrid',  rol: 'Gestora'  },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return }

      // Guardar sesión en localStorage
      localStorage.setItem('rta_user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (d: typeof DEMOS[0]) => {
    setEmail(d.email)
    setPassword(d.password)
    setError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${G.darkest} 0%, ${G.dark} 40%, ${G.mid} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px 20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative circles */}
      {[['-80px','-80px','260px'],['-100px','auto','-60px','300px'],['30%','-40px','auto','120px']].map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: i===0?'-80px':i===1?'auto':'30%', bottom: i===1?'-100px':'auto', right: i===0?'-80px':'auto', left: i===2?'-40px':i===1?'-60px':'auto', width: i===1?'300px':i===0?'260px':'120px', height: i===1?'300px':i===0?'260px':'120px', borderRadius: '50%', background: `rgba(58,158,101,${i===0?'0.12':i===1?'0.10':'0.07'})`, pointerEvents: 'none' }} />
      ))}

      {/* Logo + nombre horizontal */}
      <div style={{ marginBottom: 36, display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
        <div style={{
          width: 72, height: 88, borderRadius: 22,
          background: 'rgba(255,255,255,0.10)', border: '1.5px solid rgba(255,255,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)', flexShrink: 0
        }}>
          <RTALogo size={52} white />
        </div>
        <div>
          <h1 style={{ color: 'white', margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1 }}>
            Re<span style={{ color: G.pale }}>Take</span><br/>Away
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.50)', margin: '8px 0 0', fontSize: 12, lineHeight: 1.4 }}>
            Sistema de reutilización<br/>de vasos para Take Away
          </p>
        </div>
      </div>

      {/* Card */}
      <div style={{ background: G.surface, borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <h2 style={{ color: G.text, margin: '0 0 20px', fontSize: 20, fontWeight: 800 }}>Iniciar sesión</h2>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: G.textMid, fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com" autoComplete="email"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 15, outline: 'none', background: G.bg, color: G.text }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 6 }}>
          <label style={{ color: G.textMid, fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="contraseña" autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '13px 44px 13px 14px', borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 15, outline: 'none', background: G.bg, color: G.text }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: G.textMuted, fontSize: 18 }}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {error && <p style={{ color: G.red, fontSize: 13, margin: '8px 0 0', fontWeight: 600 }}>⚠ {error}</p>}

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', marginTop: 20,
          background: loading ? G.pale : `linear-gradient(135deg, ${G.dark}, ${G.brand})`,
          border: 'none', color: 'white', padding: 15, borderRadius: 14,
          fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(30,77,53,0.40)'
        }}>
          {loading ? '⏳ Verificando...' : 'ENTRAR'}
        </button>

        {/* Accesos demo */}
        <div style={{ marginTop: 24, borderTop: `1px solid ${G.border}`, paddingTop: 18 }}>
          <p style={{ color: G.textMuted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px', textAlign: 'center' }}>
            Acceso rápido demo
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {DEMOS.map(d => (
              <button key={d.email} onClick={() => quickFill(d)} style={{
                background: email === d.email ? `${G.brand}15` : G.bg,
                border: `1.5px solid ${email === d.email ? G.brand : G.border}`,
                borderRadius: 10, padding: '9px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: G.text, fontSize: 13, fontWeight: 700 }}>{d.nombre}</div>
                  <div style={{ color: G.textMuted, fontSize: 11 }}>{d.email}</div>
                </div>
                <span style={{
                  background: d.rol === 'Usuario' ? `${G.brand}15` : d.rol === 'Comercio' ? `${G.amber}15` : '#2563EB15',
                  color: d.rol === 'Usuario' ? G.brand : d.rol === 'Comercio' ? G.amber : '#2563EB',
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20
                }}>{d.rol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
