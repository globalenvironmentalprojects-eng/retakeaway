import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const password = body.password
    const loginInput = body.email?.trim()

    if (!loginInput || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 })
    }

    // Buscar por campo login (exacto)
    let snap = await adminDb.collection('usuarios').where('login', '==', loginInput).limit(1).get()

    // Fallback por email
    if (snap.empty) {
      snap = await adminDb.collection('usuarios').where('email', '==', loginInput.toLowerCase()).limit(1).get()
    }

    if (snap.empty) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    const doc = snap.docs[0]
    const user = { id: doc.id, ...doc.data() } as any

    if (user.password !== password) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const { password: _pw, ...safeUser } = user
    return NextResponse.json({ user: safeUser })
  } catch (err) {
    console.error('[auth]', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
  
}