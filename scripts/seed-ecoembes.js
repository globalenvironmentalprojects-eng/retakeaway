const admin = require('firebase-admin')
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() })
}
const db = admin.firestore()

const ESTACIONES = [
  'Repsol Valdebebas (Av. de los Andes, 4)',
  'Cepsa Alcobendas (Av. de la Industria, 32)',
  'BP Atocha (Paseo de la Infanta Isabel, 2)',
  'Repsol Chamartín (C/ Agustín de Foxá, 29)',
  'Shell Pozuelo (Ctra. de La Coruña, km 12)',
  'Galp Getafe (Av. del Ejército, 14)',
  'Repsol Las Rozas (Av. Europa, 3)',
  'Cepsa Majadahonda (C/ Gavilanes, 1)',
  'BP Barajas (Av. de Logroño, 110)',
  'Repsol Alcorcón (Av. de Móstoles, 22)',
  'Shell Leganés (Av. de la Hispanidad, 8)',
  'Galp Torrejón (Av. de la Constitución, 55)',
  'Repsol Hortaleza (C/ Arturo Soria, 340)',
  'Cepsa Vallecas (Av. de la Albufera, 72)',
  'BP Fuenlabrada (C/ de las Flores, 18)',
]

const VASOS = [
  { id: 'vaso-001', codigo_qr: 'RTA-001' },
  { id: 'vaso-002', codigo_qr: 'RTA-002' },
  { id: 'vaso-003', codigo_qr: 'RTA-003' },
  { id: 'vaso-004', codigo_qr: 'RTA-004' },
  { id: 'vaso-005', codigo_qr: 'RTA-005' },
  { id: 'vaso-006', codigo_qr: 'RTA-006' },
  { id: 'vaso-007', codigo_qr: 'RTA-007' },
  { id: 'vaso-008', codigo_qr: 'RTA-008' },
  { id: 'vaso-009', codigo_qr: 'RTA-009' },
  { id: 'vaso-010', codigo_qr: 'RTA-010' },
]

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const padH = (n) => n.toString().padStart(2, '0')
const randHora = (base) => `${padH(base + Math.floor(Math.random() * 2))}:${padH(Math.floor(Math.random() * 60))}`
const NUSOS = [4,7,2,11,5,9,3,14,6,8,2,10,5,7,3,12,4,6,9,2,8,3,11,5,7,13,4,6,2,10]

function hace(dias, hora) {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  const [h, m] = hora.split(':')
  d.setHours(parseInt(h), parseInt(m), 0, 0)
  return d.toISOString()
}

async function seed() {
  console.log('🌱 Creando 30 usuarios Ecoembes...\n')
  for (let i = 1; i <= 30; i++) {
    const id = `usr-ecoembes-${i}`
    const nombre = `Usuario ${i}`
    const nusos = NUSOS[i - 1]
    const estacionesFavoritas = [rand(ESTACIONES), rand(ESTACIONES)]

    await db.collection('usuarios').doc(id).set({
      id, nombre,
      email: `${i}@ecoembes.com`,
      login: `${i}`,
      password: 'ecoembes',
      rol: 'usuario',
      puntos: 500,
      vasos_devueltos: 0,
      estacion_id: null,
      created_at: new Date().toISOString()
    })

    for (let j = 0; j < nusos; j++) {
      const diasAtras = Math.floor(Math.random() * 80) + 1
      const vaso = rand(VASOS)
      const estacion = Math.random() < 0.7 ? rand(estacionesFavoritas) : rand(ESTACIONES)
      const base = { vaso_id: vaso.id, vaso_codigo: vaso.codigo_qr,
        usuario_id: id, usuario_nombre: nombre,
        estacion_id: 'est-001', estacion_nombre: estacion }

      await db.collection('eventos').add({ ...base, tipo: 'recogida',
        puntos_delta: -50, created_at: hace(diasAtras, randHora(7 + Math.floor(Math.random() * 4))) })
      await db.collection('eventos').add({ ...base, tipo: 'devolucion',
        puntos_delta: 50,  created_at: hace(diasAtras, randHora(14 + Math.floor(Math.random() * 5))) })
    }

    await db.collection('usuarios').doc(id).update({ vasos_devueltos: nusos })
    console.log(`  ✓ ${i}@ecoembes.com — ${nusos} usos`)
  }
  console.log('\n✅ Hecho.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })