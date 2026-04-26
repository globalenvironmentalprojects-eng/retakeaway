import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
 
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const usuarioId  = searchParams.get('usuario_id')
  const estacionId = searchParams.get('estacion_id')
  const limit      = parseInt(searchParams.get('limit') || '30')
 
  try {
    let query: any
 
    if (usuarioId) {
      // Sin orderBy para evitar índice compuesto — ordenamos en memoria
      query = adminDb.collection('eventos').where('usuario_id', '==', usuarioId)
    } else if (estacionId) {
      query = adminDb.collection('eventos').where('estacion_id', '==', estacionId)
    } else {
      // Sin filtro (gestora) — solo aquí usamos orderBy simple que no requiere índice
      query = adminDb.collection('eventos').orderBy('created_at', 'desc').limit(limit)
    }
 
    const snap = await query.get()
    let eventos = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
 
    // Ordenar por fecha descendente en memoria y aplicar límite
    eventos = eventos
      .sort((a: any, b: any) => {
        const da = new Date(a.created_at).getTime()
        const db2 = new Date(b.created_at).getTime()
        return db2 - da
      })
      .slice(0, limit)
 
    return NextResponse.json({ eventos })
  } catch (err) {
    console.error('[eventos GET]', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}