const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() })
}
const db = admin.firestore()

async function deleteCollection(col) {
  const snap = await db.collection(col).get()
  await Promise.all(snap.docs.map(d => d.ref.delete()))
  console.log(`  🗑 ${col} borrado (${snap.docs.length} docs)`)
}

async function seed() {
  console.log('🌱 Iniciando seed de Firebase...')

  await deleteCollection('eventos')
  await deleteCollection('vasos')
  await deleteCollection('usuarios')
  await deleteCollection('estaciones')

  // ── ESTACIONES ──────────────────────────────────────────────
  const estaciones = [
    { id: 'est-001', nombre: 'Repsol Valdebebas',  direccion: 'Av. de los Andes 19, Madrid',       tipo: 'repsol' },
    { id: 'est-002', nombre: 'Repsol A-6 Norte',   direccion: 'Crta. A-6 km 14, Madrid',           tipo: 'repsol' },
    { id: 'est-003', nombre: 'Repsol Alcobendas',  direccion: 'Av. de la Industria 4, Alcobendas',  tipo: 'repsol' },
    { id: 'est-004', nombre: 'Moeve Getafe',        direccion: 'Av. de Madrid 12, Getafe',          tipo: 'moeve'  },
    { id: 'est-005', nombre: 'EcoWash Central',     direccion: 'C/ Logística 3, Madrid',            tipo: 'otro'   },
  ]
  for (const e of estaciones) {
    await db.collection('estaciones').doc(e.id).set(e)
    console.log(`  ✓ Estación: ${e.nombre}`)
  }

  // ── USUARIOS ────────────────────────────────────────────────
  const usuarios = [
    { id: 'usr-carlos',  nombre: 'Carlos Martínez', email: 'carlos@demo.com',  password: '1234',   rol: 'usuario',  puntos: 3840, vasos_devueltos: 23, estacion_id: null },
    { id: 'usr-ana',     nombre: 'Ana Pérez',        email: 'ana@demo.com',     password: '1234',   rol: 'usuario',  puntos: 1220, vasos_devueltos: 12, estacion_id: null },
    { id: 'usr-pedro',   nombre: 'Pedro Ruiz',       email: 'pedro@demo.com',   password: '1234',   rol: 'usuario',  puntos: 1680, vasos_devueltos: 12, estacion_id: null },
    { id: 'usr-repsol',  nombre: 'Repsol Valdebebas',email: 'repsol@demo.com',  password: 'repsol', rol: 'comercio', puntos:    0, vasos_devueltos:  0, estacion_id: 'est-001' },
    { id: 'usr-ecowash', nombre: 'EcoWash Madrid',   email: 'ecowash@demo.com', password: 'ecowash',rol: 'gestora',  puntos:    0, vasos_devueltos:  0, estacion_id: 'est-005' },
  ]
  for (const u of usuarios) {
    await db.collection('usuarios').doc(u.id).set({ ...u, created_at: new Date().toISOString() })
    console.log(`  ✓ Usuario: ${u.nombre}`)
  }

  // ── VASOS (30 vasos) ─────────────────────────────────────────
  const vasos = [
    // Repsol Valdebebas (est-001) — 8 vasos
    { id: 'vaso-001', codigo_qr: 'RTA-001', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados: 14, usuario_id: null },
    { id: 'vaso-002', codigo_qr: 'RTA-002', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados:  8, usuario_id: null },
    { id: 'vaso-003', codigo_qr: 'RTA-003', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados: 22, usuario_id: null },
    { id: 'vaso-004', codigo_qr: 'RTA-004', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados:  5, usuario_id: null },
    { id: 'vaso-005', codigo_qr: 'RTA-005', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados: 19, usuario_id: null },
    { id: 'vaso-006', codigo_qr: 'RTA-006', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados:  3, usuario_id: null },
    { id: 'vaso-007', codigo_qr: 'RTA-007', estado: 'lavado',     estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados: 11, usuario_id: null },
    { id: 'vaso-008', codigo_qr: 'RTA-008', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados:  7, usuario_id: null },
    // Repsol A-6 Norte (est-002) — 6 vasos
    { id: 'vaso-009', codigo_qr: 'RTA-009', estado: 'disponible', estacion_id: 'est-002', estacion_nombre: 'Repsol A-6 Norte',  lavados: 17, usuario_id: null },
    { id: 'vaso-010', codigo_qr: 'RTA-010', estado: 'disponible', estacion_id: 'est-002', estacion_nombre: 'Repsol A-6 Norte',  lavados:  9, usuario_id: null },
    { id: 'vaso-011', codigo_qr: 'RTA-011', estado: 'disponible', estacion_id: 'est-002', estacion_nombre: 'Repsol A-6 Norte',  lavados: 13, usuario_id: null },
    { id: 'vaso-012', codigo_qr: 'RTA-012', estado: 'lavado',     estacion_id: 'est-002', estacion_nombre: 'Repsol A-6 Norte',  lavados:  6, usuario_id: null },
    { id: 'vaso-013', codigo_qr: 'RTA-013', estado: 'disponible', estacion_id: 'est-002', estacion_nombre: 'Repsol A-6 Norte',  lavados: 21, usuario_id: null },
    { id: 'vaso-014', codigo_qr: 'RTA-014', estado: 'disponible', estacion_id: 'est-002', estacion_nombre: 'Repsol A-6 Norte',  lavados:  4, usuario_id: null },
    // Repsol Alcobendas (est-003) — 6 vasos
    { id: 'vaso-015', codigo_qr: 'RTA-015', estado: 'disponible', estacion_id: 'est-003', estacion_nombre: 'Repsol Alcobendas', lavados: 11, usuario_id: null },
    { id: 'vaso-016', codigo_qr: 'RTA-016', estado: 'disponible', estacion_id: 'est-003', estacion_nombre: 'Repsol Alcobendas', lavados: 16, usuario_id: null },
    { id: 'vaso-017', codigo_qr: 'RTA-017', estado: 'disponible', estacion_id: 'est-003', estacion_nombre: 'Repsol Alcobendas', lavados:  2, usuario_id: null },
    { id: 'vaso-018', codigo_qr: 'RTA-018', estado: 'lavado',     estacion_id: 'est-003', estacion_nombre: 'Repsol Alcobendas', lavados:  8, usuario_id: null },
    { id: 'vaso-019', codigo_qr: 'RTA-019', estado: 'disponible', estacion_id: 'est-003', estacion_nombre: 'Repsol Alcobendas', lavados: 14, usuario_id: null },
    { id: 'vaso-020', codigo_qr: 'RTA-020', estado: 'disponible', estacion_id: 'est-003', estacion_nombre: 'Repsol Alcobendas', lavados:  5, usuario_id: null },
    // Moeve Getafe (est-004) — 5 vasos
    { id: 'vaso-021', codigo_qr: 'RTA-021', estado: 'disponible', estacion_id: 'est-004', estacion_nombre: 'Moeve Getafe',      lavados:  3, usuario_id: null },
    { id: 'vaso-022', codigo_qr: 'RTA-022', estado: 'disponible', estacion_id: 'est-004', estacion_nombre: 'Moeve Getafe',      lavados: 10, usuario_id: null },
    { id: 'vaso-023', codigo_qr: 'RTA-023', estado: 'disponible', estacion_id: 'est-004', estacion_nombre: 'Moeve Getafe',      lavados:  7, usuario_id: null },
    { id: 'vaso-024', codigo_qr: 'RTA-024', estado: 'lavado',     estacion_id: 'est-004', estacion_nombre: 'Moeve Getafe',      lavados: 18, usuario_id: null },
    { id: 'vaso-025', codigo_qr: 'RTA-025', estado: 'disponible', estacion_id: 'est-004', estacion_nombre: 'Moeve Getafe',      lavados:  1, usuario_id: null },
    // EcoWash Central (est-005) — 5 vasos en lavado
    { id: 'vaso-026', codigo_qr: 'RTA-026', estado: 'lavado',     estacion_id: 'est-005', estacion_nombre: 'EcoWash Central',   lavados: 12, usuario_id: null },
    { id: 'vaso-027', codigo_qr: 'RTA-027', estado: 'lavado',     estacion_id: 'est-005', estacion_nombre: 'EcoWash Central',   lavados:  9, usuario_id: null },
    { id: 'vaso-028', codigo_qr: 'RTA-028', estado: 'lavado',     estacion_id: 'est-005', estacion_nombre: 'EcoWash Central',   lavados: 15, usuario_id: null },
    { id: 'vaso-029', codigo_qr: 'RTA-029', estado: 'lavado',     estacion_id: 'est-005', estacion_nombre: 'EcoWash Central',   lavados:  6, usuario_id: null },
    { id: 'vaso-030', codigo_qr: 'RTA-030', estado: 'lavado',     estacion_id: 'est-005', estacion_nombre: 'EcoWash Central',   lavados: 20, usuario_id: null },
  ]
  for (const v of vasos) {
    await db.collection('vasos').doc(v.id).set({ ...v, updated_at: new Date().toISOString() })
    console.log(`  ✓ Vaso: ${v.codigo_qr}`)
  }

  // ── EVENTOS HISTÓRICOS ──────────────────────────────────────
  const hace = (dias, hora = '08:00') => {
    const d = new Date()
    d.setDate(d.getDate() - dias)
    const [h, m] = hora.split(':')
    d.setHours(parseInt(h), parseInt(m), 0, 0)
    return d.toISOString()
  }

  const eventos = [
    // Carlos Martínez
    { tipo:'recogida',   vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(1, '07:45') },
    { tipo:'devolucion', vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(1, '18:30') },
    { tipo:'recogida',   vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(2, '07:50') },
    { tipo:'devolucion', vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta: 50, created_at: hace(2, '19:10') },
    { tipo:'recogida',   vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(3, '08:05') },
    { tipo:'devolucion', vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(3, '17:55') },
    { tipo:'recogida',   vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(5, '07:40') },
    { tipo:'devolucion', vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(5, '18:20') },
    { tipo:'recogida',   vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(7, '07:55') },
    { tipo:'devolucion', vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(7, '18:45') },
    { tipo:'recogida',   vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(12, '08:00') },
    { tipo:'devolucion', vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(12, '19:00') },
    { tipo:'recogida',   vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(15, '07:50') },
    { tipo:'devolucion', vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta: 50, created_at: hace(15, '18:30') },
    { tipo:'recogida',   vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(20, '08:10') },
    { tipo:'devolucion', vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(20, '17:40') },
    { tipo:'recogida',   vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte',  puntos_delta:-50, created_at: hace(25, '07:30') },
    { tipo:'devolucion', vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte',  puntos_delta: 50, created_at: hace(25, '19:15') },
    { tipo:'recogida',   vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(30, '08:00') },
    { tipo:'devolucion', vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(30, '18:00') },
    { tipo:'recogida',   vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(45, '07:45') },
    { tipo:'devolucion', vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(45, '18:30') },
    { tipo:'recogida',   vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(60, '08:00') },
    { tipo:'devolucion', vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(60, '19:00') },
    // Ana Pérez
    { tipo:'recogida',   vaso_id:'vaso-021', vaso_codigo:'RTA-021', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta:-50, created_at: hace(2, '09:15') },
    { tipo:'devolucion', vaso_id:'vaso-021', vaso_codigo:'RTA-021', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta: 50, created_at: hace(2, '14:30') },
    { tipo:'recogida',   vaso_id:'vaso-022', vaso_codigo:'RTA-022', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta:-50, created_at: hace(9, '10:00') },
    { tipo:'devolucion', vaso_id:'vaso-022', vaso_codigo:'RTA-022', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta: 50, created_at: hace(9, '15:45') },
    { tipo:'recogida',   vaso_id:'vaso-021', vaso_codigo:'RTA-021', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta:-50, created_at: hace(16, '09:30') },
    { tipo:'devolucion', vaso_id:'vaso-021', vaso_codigo:'RTA-021', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta: 50, created_at: hace(16, '13:00') },
    { tipo:'recogida',   vaso_id:'vaso-023', vaso_codigo:'RTA-023', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta:-50, created_at: hace(30, '11:00') },
    { tipo:'devolucion', vaso_id:'vaso-023', vaso_codigo:'RTA-023', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta: 50, created_at: hace(30, '16:20') },
    { tipo:'recogida',   vaso_id:'vaso-022', vaso_codigo:'RTA-022', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta:-50, created_at: hace(44, '10:30') },
    { tipo:'devolucion', vaso_id:'vaso-022', vaso_codigo:'RTA-022', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta: 50, created_at: hace(44, '14:00') },
    { tipo:'recogida',   vaso_id:'vaso-021', vaso_codigo:'RTA-021', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta:-50, created_at: hace(58, '09:00') },
    { tipo:'devolucion', vaso_id:'vaso-021', vaso_codigo:'RTA-021', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta: 50, created_at: hace(58, '15:30') },
    // Pedro Ruiz
    { tipo:'recogida',   vaso_id:'vaso-009', vaso_codigo:'RTA-009', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(1, '06:45') },
    { tipo:'devolucion', vaso_id:'vaso-009', vaso_codigo:'RTA-009', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(1, '20:10') },
    { tipo:'recogida',   vaso_id:'vaso-010', vaso_codigo:'RTA-010', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(4, '07:00') },
    { tipo:'devolucion', vaso_id:'vaso-010', vaso_codigo:'RTA-010', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta: 50, created_at: hace(4, '19:30') },
    { tipo:'recogida',   vaso_id:'vaso-011', vaso_codigo:'RTA-011', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(8, '06:50') },
    { tipo:'devolucion', vaso_id:'vaso-011', vaso_codigo:'RTA-011', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(8, '20:00') },
    { tipo:'recogida',   vaso_id:'vaso-009', vaso_codigo:'RTA-009', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(14, '07:10') },
    { tipo:'devolucion', vaso_id:'vaso-009', vaso_codigo:'RTA-009', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(14, '19:45') },
    { tipo:'recogida',   vaso_id:'vaso-010', vaso_codigo:'RTA-010', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(22, '06:55') },
    { tipo:'devolucion', vaso_id:'vaso-010', vaso_codigo:'RTA-010', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(22, '20:20') },
    { tipo:'recogida',   vaso_id:'vaso-011', vaso_codigo:'RTA-011', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(35, '07:00') },
    { tipo:'devolucion', vaso_id:'vaso-011', vaso_codigo:'RTA-011', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(35, '19:50') },
    // Lavados EcoWash
    { tipo:'lavado', vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(6,  '06:00') },
    { tipo:'lavado', vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(6,  '06:10') },
    { tipo:'lavado', vaso_id:'vaso-009', vaso_codigo:'RTA-009', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(13, '06:00') },
    { tipo:'lavado', vaso_id:'vaso-015', vaso_codigo:'RTA-015', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(13, '06:15') },
    { tipo:'lavado', vaso_id:'vaso-021', vaso_codigo:'RTA-021', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(20, '06:00') },
  ]

  for (const ev of eventos) {
    await db.collection('eventos').add(ev)
  }
  console.log(`  ✓ ${eventos.length} eventos históricos`)

  console.log('\n✅ Seed completado. Firebase tiene 30 vasos y datos reales.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
