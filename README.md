# ReTakeAway · Guía de despliegue

## Qué es esto
App web completa para gestionar vasos reutilizables en gasolineras.
Stack: **Next.js 14 + Firebase Firestore + Vercel**

---

## PASO 1 · Crear proyecto en Firebase (10 min)

1. Ve a https://console.firebase.google.com
2. Clic en **"Crear proyecto"** → nombre: `retakeaway`
3. Desactiva Google Analytics (no lo necesitas) → **Crear proyecto**
4. En el menú lateral: **Firestore Database** → **Crear base de datos**
   - Modo: **Modo de prueba** (para empezar)
   - Ubicación: `europe-west1` (España)
5. En el menú lateral: **Configuración ⚙️** → **General** → desplázate hasta **"Tus apps"**
   - Clic en `</>` (web) → nombre: `retakeaway-web` → **Registrar app**
   - Copia el objeto `firebaseConfig` que aparece — lo necesitas en el paso 3

---

## PASO 2 · Poblar la base de datos con datos demo

1. En Firebase Console → **Configuración ⚙️** → **Cuentas de servicio**
2. Clic en **"Generar nueva clave privada"** → descarga el JSON
3. Renómbralo `serviceAccount.json` y colócalo en la raíz del proyecto
4. Instala dependencias: `npm install`
5. Ejecuta el seed:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/seed-firebase.js
   ```
6. Verifica en Firebase Console → Firestore → verás las colecciones:
   `estaciones`, `usuarios`, `vasos`, `eventos`

> ⚠️ No subas `serviceAccount.json` a GitHub. Ya está en `.gitignore`.

---

## PASO 3 · Configurar variables de entorno

1. Copia el fichero de ejemplo:
   ```
   cp .env.example .env.local
   ```
2. Edita `.env.local` y rellena con tus valores:
   - `NEXT_PUBLIC_FIREBASE_*` → los del objeto `firebaseConfig` del paso 1
   - `FIREBASE_ADMIN_*` → los del JSON descargado en el paso 2

---

## PASO 4 · Probar en local

```bash
npm install
npm run dev
```
Abre http://localhost:3000

Usuarios de prueba:
| Email | Contraseña | Rol |
|---|---|---|
| carlos@demo.com | 1234 | Usuario |
| ana@demo.com | 1234 | Usuario |
| pedro@demo.com | 1234 | Usuario |
| repsol@demo.com | repsol | Comercio |
| ecowash@demo.com | ecowash | Gestora |

---

## PASO 5 · Subir a Vercel (5 min)

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "ReTakeAway initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/retakeaway.git
   git push -u origin main
   ```
   (Crea el repo en github.com primero, sin README)

2. Ve a https://vercel.com → **Add New Project** → importa tu repo de GitHub

3. En **Environment Variables** añade todas las variables de `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (el contenido completo con los `\n`)

4. Clic en **Deploy** → en 2 minutos tendrás tu URL pública: `https://retakeaway.vercel.app`

---

## PASO 6 · Asegurar Firebase para producción

En Firebase Console → Firestore → **Reglas**, pega esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // El servidor (Admin SDK) siempre tiene acceso total
    // Solo lectura pública en estaciones y vasos
    match /estaciones/{id} { allow read: if true; }
    match /vasos/{id}      { allow read: if true; }
    match /eventos/{id}    { allow read: if true; }
    match /usuarios/{id}   { allow read: if true; }
    // Escritura solo desde el servidor (API routes de Next.js)
    match /{document=**}   { allow write: if false; }
  }
}
```

---

## Estructura de ficheros

```
retakeaway/
├── app/
│   ├── api/
│   │   ├── auth/route.ts      ← Login con Firestore
│   │   ├── vasos/route.ts     ← CRUD vasos + lógica QR/puntos
│   │   └── eventos/route.ts   ← Historial y trazabilidad
│   ├── login/page.tsx         ← Pantalla de login
│   ├── dashboard/
│   │   ├── page.tsx           ← Shell principal (router por rol)
│   │   ├── UsuarioView.tsx    ← Vista usuario (coger/devolver)
│   │   ├── ComercioView.tsx   ← Vista gasolinera
│   │   ├── GestoraView.tsx    ← Vista gestora EcoWash
│   │   └── TrazabilidadView.tsx ← Log de eventos QR
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── RTALogo.tsx            ← Logo SVG fiel al original
│   ├── TopBar.tsx             ← Barra superior
│   └── BottomNav.tsx          ← Navegación inferior
├── lib/
│   ├── firebase.ts            ← Cliente Firebase
│   ├── firebase-admin.ts      ← Admin SDK (solo servidor)
│   └── types.ts               ← Tipos + tokens de diseño
├── scripts/
│   └── seed-firebase.js       ← Poblar base de datos
├── .env.example               ← Plantilla de variables
└── README.md
```

---

## Próximos pasos (v2)

- [ ] Añadir cámara real para escanear QR (html5-qrcode)
- [ ] Generar QR imprimibles para pegar en los vasos
- [ ] Panel de administración para añadir vasos nuevos
- [ ] Notificaciones push cuando llevan >24h sin devolver
- [ ] PWA (instalar como app en el móvil sin App Store)
