import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const snap = await adminDb
      .collection('usuarios')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get()

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