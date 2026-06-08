import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { enviarEmailAccion } from '@/lib/email'

// Nombre de ubicación que aparece en todos los eventos nuevos
const UBICACION = 'Ecoembes'

// GET /api/vasos?estacion_id=xxx  → vasos de una estación
// GET /api/vasos?usuario_id=xxx   → vasos de un usuario
// GET /api/vasos?qr=RTA-001       → vaso por QR
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const estacionId = searchParams.get('estacion_id')
  const usuarioId  = searchParams.get('usuario_id')
  const qr         = searchParams.get('qr')

  try {
    if (qr) {
      const snap = await adminDb.collection('vasos').where('codigo_qr', '==', qr.trim().toUpperCase()).limit(1).get()
      if (snap.empty) return NextResponse.json({ error: 'Vaso no encontrado' }, { status: 404 })
      const doc = snap.docs[0]
      return NextResponse.json({ vaso: { id: doc.id, ...doc.data() } })
    }
    if (usuarioId) {
      const snap = await adminDb.collection('vasos').where('usuario_id', '==', usuarioId).get()
      const vasos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return NextResponse.json({ vasos })
    }
    if (estacionId) {
      const snap = await adminDb.collection('vasos').where('estacion_id', '==', estacionId).get()
      const vasos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return NextResponse.json({ vasos })
    }
    // Sin filtro → todos (gestora)
    const snap = await adminDb.collection('vasos').get()
    const vasos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ vasos })
  } catch (err) {
    console.error('[vasos GET]', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { accion, vaso_id, usuario_id, estacion_id, nuevo_estado } = await req.json()

    if (!accion || !vaso_id) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const vasoRef  = adminDb.collection('vasos').doc(vaso_id)
    const vasoSnap = await vasoRef.get()

    if (!vasoSnap.exists) {
      return NextResponse.json({ error: 'Vaso no encontrado' }, { status: 404 })
    }

    const vaso = vasoSnap.data()!
    const now  = new Date().toISOString()
    const batch = adminDb.batch()

    // ── RECOGER ─────────────────────────────────────────────
    if (accion === 'recoger') {
      if (vaso.estado !== 'disponible') {
        return NextResponse.json({ error: `El vaso está ${vaso.estado}` }, { status: 409 })
      }

      const usuarioSnap = await adminDb.collection('usuarios').doc(usuario_id).get()
      if (!usuarioSnap.exists) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      const usuario = usuarioSnap.data()!

      if (usuario.puntos < 50) {
        return NextResponse.json({ error: 'Puntos insuficientes (necesitas al menos 50)' }, { status: 400 })
      }

      batch.update(vasoRef, {
        estado: 'en_uso',
        usuario_id,
        usuario_nombre: usuario.nombre,
        updated_at: now,
      })

      batch.update(adminDb.collection('usuarios').doc(usuario_id), {
        puntos: FieldValue.increment(-50)
      })

      const eventoRef = adminDb.collection('eventos').doc()
      batch.set(eventoRef, {
        tipo: 'recogida',
        vaso_id,
        vaso_codigo:    vaso.codigo_qr,
        usuario_id,
        usuario_nombre: usuario.nombre,
        estacion_id:    vaso.estacion_id,
        estacion_nombre: UBICACION,
        puntos_delta: -50,
        created_at: now,
      })

      await batch.commit()

      // Email sin bloquear la respuesta
      const fechaStr = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
      enviarEmailAccion({
        to: 'jcarranzsualdea@gmail.com',
        nombre: usuario.nombre,
        accion: 'recogida',
        vaso_codigo: vaso.codigo_qr,
        estacion_nombre: UBICACION,
        puntos_restantes: usuario.puntos - 50,
        fecha: fechaStr,
      })

      return NextResponse.json({ ok: true, puntos_nuevos: usuario.puntos - 50 })
    }

    // ── DEVOLVER ─────────────────────────────────────────────
    if (accion === 'devolver') {
      if (vaso.estado !== 'en_uso') {
        return NextResponse.json({ error: 'El vaso no está en uso' }, { status: 409 })
      }

      const titular_id     = vaso.usuario_id
      const titular_nombre = vaso.usuario_nombre

      let puntos_nuevos = 0
      if (titular_id) {
        const titularSnap = await adminDb.collection('usuarios').doc(titular_id).get()
        if (titularSnap.exists) puntos_nuevos = (titularSnap.data()!.puntos || 0) + 50
      }

      batch.update(vasoRef, {
        estado: 'disponible',
        usuario_id: null,
        usuario_nombre: null,
        updated_at: now,
      })

      if (titular_id) {
        batch.update(adminDb.collection('usuarios').doc(titular_id), {
          puntos: FieldValue.increment(50),
          vasos_devueltos: FieldValue.increment(1),
        })
      }

      const eventoRef = adminDb.collection('eventos').doc()
      batch.set(eventoRef, {
        tipo: 'devolucion',
        vaso_id,
        vaso_codigo:    vaso.codigo_qr,
        usuario_id:     titular_id || null,
        usuario_nombre: titular_nombre || null,
        estacion_id:    vaso.estacion_id,
        estacion_nombre: UBICACION,
        puntos_delta: 50,
        created_at: now,
      })

      await batch.commit()

      if (titular_id) {
        const fechaStr = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
        enviarEmailAccion({
          to: 'jcarranzsualdea@gmail.com',
          nombre: titular_nombre || 'Usuario',
          accion: 'devolucion',
          vaso_codigo: vaso.codigo_qr,
          estacion_nombre: UBICACION,
          puntos_restantes: puntos_nuevos,
          fecha: fechaStr,
        })
      }

      return NextResponse.json({ ok: true, puntos_nuevos })
    }

    // ── MARCAR LAVADO ─────────────────────────────────────────
    if (accion === 'marcar_lavado') {
      batch.update(vasoRef, {
        estado: 'lavado',
        usuario_id: null,
        usuario_nombre: null,
        lavados: FieldValue.increment(1),
        updated_at: now,
      })

      const eventoRef = adminDb.collection('eventos').doc()
      batch.set(eventoRef, {
        tipo: 'lavado',
        vaso_id,
        vaso_codigo:    vaso.codigo_qr,
        usuario_id: null,
        usuario_nombre: null,
        estacion_id,
        estacion_nombre: UBICACION,
        puntos_delta: 0,
        created_at: now,
      })

      await batch.commit()
      return NextResponse.json({ ok: true })
    }

    // ── CAMBIAR ESTADO (gestora) ──────────────────────────────
    if (accion === 'cambiar_estado') {
      if (!['disponible', 'lavado', 'perdido'].includes(nuevo_estado)) {
        return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
      }
      if (vaso.estado === 'en_uso') {
        return NextResponse.json({ error: 'No se puede cambiar un vaso en uso' }, { status: 409 })
      }

      const updateData: any = { estado: nuevo_estado, updated_at: now }
      if (vaso.estado === 'lavado' && nuevo_estado === 'disponible') {
        updateData.lavados = FieldValue.increment(1)
      }

      batch.update(vasoRef, updateData)

      if (nuevo_estado === 'disponible' && vaso.estado === 'lavado') {
        const eventoRef = adminDb.collection('eventos').doc()
        batch.set(eventoRef, {
          tipo: 'lavado', vaso_id, vaso_codigo: vaso.codigo_qr,
          usuario_id: null, usuario_nombre: null,
          estacion_id: vaso.estacion_id, estacion_nombre: UBICACION,
          puntos_delta: 0, created_at: now,
        })
      }

      await batch.commit()
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (err) {
    console.error('[vasos POST]', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}