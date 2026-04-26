/**
 * SCRIPT DE DATOS INICIALES PARA FIREBASE
 * ────────────────────────────────────────
 * Ejecución: node scripts/seed-firebase.js
 * Necesita: GOOGLE_APPLICATION_CREDENTIALS apuntando a tu serviceAccount.json
 * O bien:   rellena las variables directamente abajo
 */

const admin = require('firebase-admin')

// Opción A: usa variable de entorno GOOGLE_APPLICATION_CREDENTIALS
// Opción B: descomenta y rellena con tu fichero descargado de Firebase
// const serviceAccount = require('../serviceAccount.json')
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() })
}

const db = admin.firestore()

async function seed() {
  console.log('🌱 Iniciando seed de Firebase...')

  // ── ESTACIONES ──────────────────────────────────────────────
  const estaciones = [
    { id: 'est-001', nombre: 'Repsol Valdebebas',  direccion: 'Av. de los Andes 19, Madrid',      tipo: 'repsol' },
    { id: 'est-002', nombre: 'Repsol A-6 Norte',   direccion: 'Crta. A-6 km 14, Madrid',          tipo: 'repsol' },
    { id: 'est-003', nombre: 'Repsol Alcobendas',  direccion: 'Av. de la Industria 4, Alcobendas', tipo: 'repsol' },
    { id: 'est-004', nombre: 'Moeve Getafe',        direccion: 'Av. de Madrid 12, Getafe',         tipo: 'moeve'  },
    { id: 'est-005', nombre: 'EcoWash Central',     direccion: 'C/ Logística 3, Madrid',           tipo: 'otro'   },
  ]
  for (const e of estaciones) {
    await db.collection('estaciones').doc(e.id).set(e)
    console.log(`  ✓ Estación: ${e.nombre}`)
  }

  // ── USUARIOS ────────────────────────────────────────────────
  // NOTA: en producción crea usuarios con Firebase Auth y guarda el UID como id
  // Para esta demo usamos email/password en Firestore directamente
  const usuarios = [
    { id: 'usr-carlos',  nombre: 'Carlos Martínez', email: 'carlos@demo.com',  password: '1234',   rol: 'usuario',  puntos: 3840, estacion_id: null },
    { id: 'usr-ana',     nombre: 'Ana Pérez',        email: 'ana@demo.com',     password: '1234',   rol: 'usuario',  puntos: 1220, estacion_id: null },
    { id: 'usr-pedro',   nombre: 'Pedro Ruiz',       email: 'pedro@demo.com',   password: '1234',   rol: 'usuario',  puntos: 1680, estacion_id: null },
    { id: 'usr-repsol',  nombre: 'Repsol Valdebebas',email: 'repsol@demo.com',  password: 'repsol', rol: 'comercio', puntos:    0, estacion_id: 'est-001' },
    { id: 'usr-ecowash', nombre: 'EcoWash Madrid',   email: 'ecowash@demo.com', password: 'ecowash',rol: 'gestora',  puntos:    0, estacion_id: 'est-005' },
  ]
  for (const u of usuarios) {
    await db.collection('usuarios').doc(u.id).set({
      ...u,
      created_at: new Date().toISOString()
    })
    console.log(`  ✓ Usuario: ${u.nombre}`)
  }

  // ── VASOS ────────────────────────────────────────────────────
  const vasos = [
    { id: 'vaso-001', codigo_qr: 'RTA-001', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados: 14, usuario_id: null },
    { id: 'vaso-002', codigo_qr: 'RTA-002', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados:  8, usuario_id: null },
    { id: 'vaso-003', codigo_qr: 'RTA-003', estado: 'lavado',     estacion_id: 'est-005', estacion_nombre: 'EcoWash Central',   lavados: 22, usuario_id: null },
    { id: 'vaso-004', codigo_qr: 'RTA-004', estado: 'disponible', estacion_id: 'est-001', estacion_nombre: 'Repsol Valdebebas', lavados:  5, usuario_id: null },
    { id: 'vaso-005', codigo_qr: 'RTA-005', estado: 'disponible', estacion_id: 'est-002', estacion_nombre: 'Repsol A-6 Norte',  lavados: 17, usuario_id: null },
    { id: 'vaso-006', codigo_qr: 'RTA-006', estado: 'disponible', estacion_id: 'est-003', estacion_nombre: 'Repsol Alcobendas', lavados: 11, usuario_id: null },
    { id: 'vaso-007', codigo_qr: 'RTA-007', estado: 'disponible', estacion_id: 'est-004', estacion_nombre: 'Moeve Getafe',      lavados:  3, usuario_id: null },
    { id: 'vaso-008', codigo_qr: 'RTA-008', estado: 'lavado',     estacion_id: 'est-005', estacion_nombre: 'EcoWash Central',   lavados:  9, usuario_id: null },
  ]
  for (const v of vasos) {
    await db.collection('vasos').doc(v.id).set({
      ...v,
      updated_at: new Date().toISOString()
    })
    console.log(`  ✓ Vaso: ${v.codigo_qr}`)
  }

  // ── EVENTOS HISTÓRICOS ──────────────────────────────────────
  // ── EVENTOS HISTÓRICOS (historial rico, ~90 días) ───────────
  // Función helper: fecha X días atrás + hora concreta
  const hace = (dias, hora = '08:00') => {
    const d = new Date()
    d.setDate(d.getDate() - dias)
    const [h, m] = hora.split(':')
    d.setHours(parseInt(h), parseInt(m), 0, 0)
    return d.toISOString()
  }

  const eventos = [
    // ── CARLOS MARTÍNEZ (usuario frecuente, va cada día a trabajar)
    // Semana pasada
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
    // Mes pasado
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
    // Hace 2 meses
    { tipo:'recogida',   vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(45, '07:45') },
    { tipo:'devolucion', vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(45, '18:30') },
    { tipo:'recogida',   vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta:-50, created_at: hace(60, '08:00') },
    { tipo:'devolucion', vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:'usr-carlos', usuario_nombre:'Carlos Martínez', estacion_id:'est-001', estacion_nombre:'Repsol Valdebebas', puntos_delta: 50, created_at: hace(60, '19:00') },

    // ── ANA PÉREZ (usuaria ocasional, fines de semana)
    { tipo:'recogida',   vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta:-50, created_at: hace(2, '09:15') },
    { tipo:'devolucion', vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta: 50, created_at: hace(2, '14:30') },
    { tipo:'recogida',   vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta:-50, created_at: hace(9, '10:00') },
    { tipo:'devolucion', vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta: 50, created_at: hace(9, '15:45') },
    { tipo:'recogida',   vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta:-50, created_at: hace(16, '09:30') },
    { tipo:'devolucion', vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta: 50, created_at: hace(16, '13:00') },
    { tipo:'recogida',   vaso_id:'vaso-007', vaso_codigo:'RTA-007', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta:-50, created_at: hace(30, '11:00') },
    { tipo:'devolucion', vaso_id:'vaso-007', vaso_codigo:'RTA-007', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta: 50, created_at: hace(30, '16:20') },
    { tipo:'recogida',   vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta:-50, created_at: hace(44, '10:30') },
    { tipo:'devolucion', vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta: 50, created_at: hace(44, '14:00') },
    { tipo:'recogida',   vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta:-50, created_at: hace(58, '09:00') },
    { tipo:'devolucion', vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-ana', usuario_nombre:'Ana Pérez', estacion_id:'est-004', estacion_nombre:'Moeve Getafe', puntos_delta: 50, created_at: hace(58, '15:30') },

    // ── PEDRO RUIZ (usuario habitual, viajero frecuente A-6)
    { tipo:'recogida',   vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(1, '06:45') },
    { tipo:'devolucion', vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(1, '20:10') },
    { tipo:'recogida',   vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(4, '07:00') },
    { tipo:'devolucion', vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-003', estacion_nombre:'Repsol Alcobendas', puntos_delta: 50, created_at: hace(4, '19:30') },
    { tipo:'recogida',   vaso_id:'vaso-007', vaso_codigo:'RTA-007', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(8, '06:50') },
    { tipo:'devolucion', vaso_id:'vaso-007', vaso_codigo:'RTA-007', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(8, '20:00') },
    { tipo:'recogida',   vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(14, '07:10') },
    { tipo:'devolucion', vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(14, '19:45') },
    { tipo:'recogida',   vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(22, '06:55') },
    { tipo:'devolucion', vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(22, '20:20') },
    { tipo:'recogida',   vaso_id:'vaso-007', vaso_codigo:'RTA-007', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta:-50, created_at: hace(35, '07:00') },
    { tipo:'devolucion', vaso_id:'vaso-007', vaso_codigo:'RTA-007', usuario_id:'usr-pedro', usuario_nombre:'Pedro Ruiz', estacion_id:'est-002', estacion_nombre:'Repsol A-6 Norte', puntos_delta: 50, created_at: hace(35, '19:50') },

    // ── LAVADOS EcoWash (trazabilidad de lavandería)
    { tipo:'lavado', vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(6,  '06:00') },
    { tipo:'lavado', vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(6,  '06:10') },
    { tipo:'lavado', vaso_id:'vaso-003', vaso_codigo:'RTA-003', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(6,  '06:20') },
    { tipo:'lavado', vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(13, '06:00') },
    { tipo:'lavado', vaso_id:'vaso-005', vaso_codigo:'RTA-005', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(13, '06:15') },
    { tipo:'lavado', vaso_id:'vaso-006', vaso_codigo:'RTA-006', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(13, '06:30') },
    { tipo:'lavado', vaso_id:'vaso-007', vaso_codigo:'RTA-007', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(20, '06:00') },
    { tipo:'lavado', vaso_id:'vaso-008', vaso_codigo:'RTA-008', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(20, '06:10') },
    { tipo:'lavado', vaso_id:'vaso-001', vaso_codigo:'RTA-001', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(27, '06:00') },
    { tipo:'lavado', vaso_id:'vaso-002', vaso_codigo:'RTA-002', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(27, '06:20') },
    { tipo:'lavado', vaso_id:'vaso-003', vaso_codigo:'RTA-003', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(34, '06:00') },
    { tipo:'lavado', vaso_id:'vaso-004', vaso_codigo:'RTA-004', usuario_id:null, usuario_nombre:null, estacion_id:'est-005', estacion_nombre:'EcoWash Central', puntos_delta:0, created_at: hace(34, '06:15') },
  ]

  // Borrar eventos anteriores y reinsertar
  const eventosSnap = await db.collection('eventos').get()
  const borrar = eventosSnap.docs.map(d => d.ref.delete())
  await Promise.all(borrar)

  for (const ev of eventos) {
    await db.collection('eventos').add(ev)
  }
  console.log(`  ✓ ${eventos.length} eventos históricos (últimos 90 días)`)

  console.log('\n✅ Seed completado. Tu Firebase tiene datos reales.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
