const admin = require('firebase-admin')
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() })
}
const db = admin.firestore()

async function seed() {
  console.log('🌱 Añadiendo 23 usuarios nuevos...')

  const usuarios = [
    { nombre: 'Rosa Trigo',             email: 'rosa.trigo@retakeaway.com',          password: 'RT262' },
    { nombre: 'Isabel Agúndez',         email: 'isabel.agundez@retakeaway.com',       password: 'IA678' },
    { nombre: 'José Ramirez',           email: 'jose.ramirez@retakeaway.com',          password: 'JR877' },
    { nombre: 'Dorleta Vicente',        email: 'dorleta.vicente@retakeaway.com',       password: 'DV833' },
    { nombre: 'Silvia Ayerbe',          email: 'silvia.ayerbe@retakeaway.com',         password: 'SA898' },
    { nombre: 'Manuel de Arcocha',      email: 'manuel.arcocha@retakeaway.com',        password: 'MA887' },
    { nombre: 'Begoña de Benito',       email: 'begona.benito@retakeaway.com',         password: 'BB644' },
    { nombre: 'Teresa Gallastegui',     email: 'teresa.gallastegui@retakeaway.com',    password: 'TG478' },
    { nombre: 'Ángel Hervella',         email: 'angel.hervella@retakeaway.com',        password: 'AH825' },
    { nombre: 'Isabel Tennenbaum',      email: 'isabel.tennenbaum@retakeaway.com',     password: 'IT632' },
    { nombre: 'David Ceniceros',        email: 'david.ceniceros@retakeaway.com',       password: 'DC554' },
    { nombre: 'Cristina Serrano',       email: 'cristina.serrano@retakeaway.com',      password: 'CS349' },
    { nombre: 'Jose Luis Moreno',       email: 'joseluis.moreno@retakeaway.com',       password: 'JL557' },
    { nombre: 'Pachi Sainz de Murieta', email: 'pachi.sainz@retakeaway.com',           password: 'PS871' },
    { nombre: 'Iñaki Ortega',           email: 'inaki.ortega@retakeaway.com',          password: 'IO982' },
    { nombre: 'Juan Carlos Arranz',     email: 'juancarlos.arranz@retakeaway.com',     password: 'JC123' },
    { nombre: 'Laura Marín',            email: 'laura.marin@retakeaway.com',           password: 'LM123' },
    { nombre: 'Invitado 1',             email: 'invitado1@retakeaway.com',             password: 'I1'    },
    { nombre: 'Invitado 2',             email: 'invitado2@retakeaway.com',             password: 'I2'    },
    { nombre: 'Invitado 3',             email: 'invitado3@retakeaway.com',             password: 'I3'    },
    { nombre: 'Julio López',            email: 'julio.lopez@retakeaway.com',           password: 'JL222' },
    { nombre: 'Carlos Pelegrín',        email: 'carlos.pelegrin@retakeaway.com',       password: 'CP892' },
    { nombre: 'Carolina Martín',        email: 'carolina.martin@retakeaway.com',       password: 'CM397' },
  ]

  for (const u of usuarios) {
    const id = 'usr-' + u.nombre.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      .replace(/^-|-$/g, '').slice(0, 30)

    await db.collection('usuarios').doc(id).set({
      id, nombre: u.nombre, email: u.email, password: u.password,
      rol: 'usuario', puntos: 500, vasos_devueltos: 0,
      estacion_id: null, created_at: new Date().toISOString()
    })
    console.log(`  ✓ ${u.nombre} — ${u.password}`)
  }

  console.log('\n✅ 23 usuarios añadidos. Historial demo intacto.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })