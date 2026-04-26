'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import UsuarioView from './UsuarioView'
import ComercioView from './ComercioView'
import GestoraView from './GestoraView'
import TrazabilidadView from './TrazabilidadView'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser]   = useState<any>(null)
  const [view, setView]   = useState<string>('')

  useEffect(() => {
    const stored = localStorage.getItem('rta_user')
    if (!stored) { router.replace('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    setView(u.rol === 'comercio' ? 'comercio' : u.rol === 'gestora' ? 'gestora' : 'dashboard')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('rta_user')
    router.replace('/login')
  }

  const refreshUser = async () => {
    if (!user) return
    const res = await fetch(`/api/auth?id=${user.id}`)
    if (res.ok) {
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        localStorage.setItem('rta_user', JSON.stringify(data.user))
      }
    }
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F7F4' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #2E7D52', borderTopColor: 'transparent', borderRadius: '50%' }} className="spin" />
    </div>
  )

  const viewProps = { user, refreshUser }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#F2F7F4', position: 'relative' }}>
      <TopBar usuario={user} onLogout={handleLogout} />
      <div style={{ paddingBottom: 90 }}>
        {view === 'dashboard'     && <UsuarioView     {...viewProps} />}
        {view === 'comercio'      && <ComercioView    {...viewProps} />}
        {view === 'gestora'       && <GestoraView     {...viewProps} />}
        {view === 'trazabilidad'  && <TrazabilidadView {...viewProps} />}
      </div>
      <BottomNav rol={user.rol} active={view} onChange={setView} />
    </div>
  )
}
