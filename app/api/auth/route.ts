import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 })
    }

    const loginInput = email.trim() // Respeta mayúsculas, ñ, espacios

    // Buscar por campo "login" (exacto, tal como se escribió)
    let snap = await adminDb
      .collection('usuarios')
      .where('login', '==', loginInput)
      .limit(1)
      .get()

    // Fallback: buscar por email (compatibilidad con usuarios demo)
    if (snap.empty) {
      snap = await adminDb
        .collection('usuarios')
        .where('email', '==', loginInput.toLowerCase())
        .limit(1)
        .get()
    }

    if (snap.empty) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    const doc = snap.docs[0]
    const userData = doc.data() as any
    const user = { id: doc.id, ...userData }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const { password: _pw, ...safeUser } = user
    return NextResponse.json({ user: safeUser })
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}