/**
 * Crea 30 usuarios 1@ecoembes.com ... 30@ecoembes.com
 * con historial de recogida/devolución variado
 * Ejecutar:
 *   set GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
 *   node scripts/seed-ecoembes.js
 */
const admin = require('firebase-admin')
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() })
}
const db = admin.firestore()

const UBICACION = 'Espacio Ventas (C/ Alcalá 182)'

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
  { id: 'vaso-015', codigo_qr: 'RTA-015' },
  { id: 'vaso-020', codigo_qr: 'RTA-020' },
]

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const padH = (n) => n.toString().padStart(2, '0')
const randHora = (base) => `${padH(base + Math.floor(Math.random() * 2))}:${padH(Math.floor(Math.random() * 60))}`

// Número de usos por usuario (variado entre 2 y 18)
const NUSOS = [4,7,2,11,5,9,3,14,6,8,2,10,5,7,3,12,4,6,9,2,8,3,11,5,7,13,4,6,2,10]

function hace(dias, hora) {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  const [h, m] = hora.split(':')
  d.setHours(parseInt(h), parseInt(m), 0, 0)
  return d.toISOString()
}

async function seed() {
  console.log('🌱 Creando 30 usuarios Ecoembes con historial...\n')

  for (let i = 1; i <= 30; i++) {
    const email = `${i}@ecoembes.com`
    const login = `${i}`
    const nombre = `Usuario ${i}`
    const id = `usr-ecoembes-${i}`
    const nusos = NUSOS[i - 1]

    await db.collection('usuarios').doc(id).set({
      id,
      nombre,
      email,
      login,
      password: 'ecoembes',
      rol: 'usuario',
      puntos: 500,
      vasos_devueltos: 0,
      estacion_id: null,
      created_at: new Date().toISOString()
    })

    let devueltos = 0
    for (let j = 0; j < nusos; j++) {
      const diasAtras = Math.floor(Math.random() * 80) + 1
      const vaso = rand(VASOS)
      const hRec = randHora(7 + Math.floor(Math.random() * 4))   // 7-10h recogida
      const hDev = randHora(14 + Math.floor(Math.random() * 5))  // 14-18h devolución

      await db.collection('eventos').add({
        tipo: 'recogida',
        vaso_id: vaso.id,
        vaso_codigo: vaso.codigo_qr,
        usuario_id: id,
        usuario_nombre: nombre,
        estacion_id: 'est-001',
        estacion_nombre: UBICACION,
        puntos_delta: -50,
        created_at: hace(diasAtras, hRec)
      })

      await db.collection('eventos').add({
        tipo: 'devolucion',
        vaso_id: vaso.id,
        vaso_codigo: vaso.codigo_qr,
        usuario_id: id,
        usuario_nombre: nombre,
        estacion_id: 'est-001',
        estacion_nombre: UBICACION,
        puntos_delta: 50,
        created_at: hace(diasAtras, hDev)
      })

      devueltos++
    }

    await db.collection('usuarios').doc(id).update({ vasos_devueltos: devueltos })
    console.log(`  ✓ ${email}  —  ${nusos} usos`)
  }

  console.log('\n✅ 30 usuarios Ecoembes creados con historial.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })