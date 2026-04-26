import * as admin from 'firebase-admin'

// Evita reinicializar en hot-reload de Next.js
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Vercel guarda el private key con \n escapados
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const adminDb   = admin.firestore()
export const adminAuth = admin.auth()
export default admin
