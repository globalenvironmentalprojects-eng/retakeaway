/**
 * Actualiza usuarios con nombres simples + historial ficticio
 * Login = exactamente el nombre de la tabla (mayúsculas y ñ incluidos)
 */
const admin = require('firebase-admin')
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() })
}
const db = admin.firestore()

const ESTACIONES = [
  'Repsol Alcorcón','Repsol Pozuelo','Repsol Las Rozas','Repsol Majadahonda',
  'Repsol Leganés','Repsol Getafe','Repsol Móstoles','BP Fuenlabrada',
  'Moeve Parla','Moeve Aranjuez',
]
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const hace = (dias, hora) => {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  const [h, m] = hora.split(':')
  d.setHours(parseInt(h), parseInt(m), 0, 0)
  return d.toISOString()
}
const VASOS = [
  { id: 'vaso-009', codigo_qr: 'RTA-009' },
  { id: 'vaso-010', codigo_qr: 'RTA-010' },
  { id: 'vaso-015', codigo_qr: 'RTA-015' },
  { id: 'vaso-016', codigo_qr: 'RTA-016' },
  { id: 'vaso-019', codigo_qr: 'RTA-019' },
  { id: 'vaso-021', codigo_qr: 'RTA-021' },
  { id: 'vaso-022', codigo_qr: 'RTA-022' },
]

// login = exactamente como en la tabla, respetando mayúsculas y ñ
const USUARIOS = [
  { oldId: 'usr-rosa-trigo',             nombre: 'Rosa',       login: 'Rosa',       password: 'RT262' },
  { oldId: 'usr-isabel-agundez',         nombre: 'Isabel',     login: 'Isabel',     password: 'IA678' },
  { oldId: 'usr-jose-ramirez',           nombre: 'Jose',       login: 'Jose',       password: 'JR877' },
  { oldId: 'usr-dorleta-vicente',        nombre: 'Dorleta',    login: 'Dorleta',    password: 'DV833' },
  { oldId: 'usr-silvia-ayerbe',          nombre: 'Silvia',     login: 'Silvia',     password: 'SA898' },
  { oldId: 'usr-manuel-de-arcocha',      nombre: 'Manuel',     login: 'Manuel',     password: 'MA887' },
  { oldId: 'usr-begona-de-benito',       nombre: 'Begoña',     login: 'Begoña',     password: 'BB644' },
  { oldId: 'usr-teresa-gallastegui',     nombre: 'Teresa',     login: 'Teresa',     password: 'TG478' },
  { oldId: 'usr-angel-hervella',         nombre: 'Angel',      login: 'Angel',      password: 'AH825' },
  { oldId: 'usr-isabel-tennenbaum',      nombre: 'Isabel',     login: 'Isabel',     password: 'IT632' },
  { oldId: 'usr-david-ceniceros',        nombre: 'David',      login: 'David',      password: 'DC554' },
  { oldId: 'usr-cristina-serrano',       nombre: 'Cristina',   login: 'Cristina',   password: 'CS349' },
  { oldId: 'usr-jose-luis-moreno',       nombre: 'Jose Luis',  login: 'Jose Luis',  password: 'JL557' },
  { oldId: 'usr-pachi-sainz-de-murieta', nombre: 'Pachi',      login: 'Pachi',      password: 'PS871' },
  { oldId: 'usr-inaki-ortega',           nombre: 'Iñaki',      login: 'Iñaki',      password: 'IO982' },
  { oldId: 'usr-juan-carlos-arranz',     nombre: 'JC',         login: 'JC',         password: 'JC123' },
  { oldId: 'usr-laura-marin',            nombre: 'Laura',      login: 'Laura',      password: 'LM123' },
  { oldId: 'usr-invitado-1',             nombre: 'Invitado 1', login: 'Invitado 1', password: 'I1'    },
  { oldId: 'usr-invitado-2',             nombre: 'Invitado 2', login: 'Invitado 2', password: 'I2'    },
  { oldId: 'usr-invitado-3',             nombre: 'Invitado 3', login: 'Invitado 3', password: 'I3'    },
  { oldId: 'usr-julio-lopez',            nombre: 'Julio',      login: 'Julio',      password: 'JL222' },
  { oldId: 'usr-carlos-pelegrin',        nombre: 'Carlos',     login: 'Carlos',     password: 'CP892' },
  { oldId: 'usr-carolina-martin',        nombre: 'Carolina',   login: 'Carolina',   password: 'CM397' },
]

const USOS = [8,5,12,3,7,10,6,4,9,5,11,3,8,6,4,15,7,2,1,2,5,9,6]

async function seed() {
  console.log('🌱 Actualizando usuarios y añadiendo historial...\n')

  for (let i = 0; i < USUARIOS.length; i++) {
    const u = USUARIOS[i]
    const nusos = USOS[i]

    try {
      await db.collection('usuarios').doc(u.oldId).update({
        nombre: u.nombre,
        login: u.login,
        password: u.password,
      })
      console.log(`  ✓ ${u.nombre} → login: "${u.login}" / pass: ${u.password}`)
    } catch (e) {
      console.log(`  ⚠ No encontrado: ${u.oldId}`)
      continue
    }

    // Añadir historial
    let devueltos = 0
    for (let j = 0; j < nusos; j++) {
      const diasAtras = Math.floor(Math.random() * 85) + 1
      const vaso = rand(VASOS)
      const estacion = rand(ESTACIONES)
      const hRec = `0${6 + Math.floor(Math.random()*4)}:${Math.floor(Math.random()*60).toString().padStart(2,'0')}`
      const hDev = `${18 + Math.floor(Math.random()*4)}:${Math.floor(Math.random()*60).toString().padStart(2,'0')}`

      await db.collection('eventos').add({
        tipo: 'recogida', vaso_id: vaso.id, vaso_codigo: vaso.codigo_qr,
        usuario_id: u.oldId, usuario_nombre: u.nombre,
        estacion_id: 'est-001', estacion_nombre: estacion,
        puntos_delta: -50, created_at: hace(diasAtras, hRec)
      })
      await db.collection('eventos').add({
        tipo: 'devolucion', vaso_id: vaso.id, vaso_codigo: vaso.codigo_qr,
        usuario_id: u.oldId, usuario_nombre: u.nombre,
        estacion_id: 'est-001', estacion_nombre: estacion,
        puntos_delta: 50, created_at: hace(diasAtras, hDev)
      })
      devueltos++
    }

    await db.collection('usuarios').doc(u.oldId).update({
      puntos: 500, vasos_devueltos: devueltos,
    })
    console.log(`     → ${nusos} usos añadidos\n`)
  }

  // Actualizar demos con campo login
  for (const d of [
    { id:'usr-carlos',  login:'carlos'  },
    { id:'usr-ana',     login:'ana'     },
    { id:'usr-pedro',   login:'pedro'   },
    { id:'usr-repsol',  login:'repsol'  },
    { id:'usr-ecowash', login:'ecowash' },
  ]) {
    await db.collection('usuarios').doc(d.id).update({ login: d.login })
  }
  console.log('  ✓ Usuarios demo actualizados\n')
  console.log('✅ Todo listo.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })