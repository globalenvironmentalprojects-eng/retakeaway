// lib/email.ts
// Envío de emails con Resend (resend.com — gratis hasta 3.000/mes)

interface EmailParams {
  to: string
  nombre: string
  accion: 'recogida' | 'devolucion'
  vaso_codigo: string
  estacion_nombre: string
  puntos_restantes: number
  fecha: string
}

export async function enviarEmailAccion(params: EmailParams) {
  const { to, nombre, accion, vaso_codigo, estacion_nombre, puntos_restantes, fecha } = params

  const esRecogida = accion === 'recogida'
  const asunto = esRecogida
    ? `🥤 Vaso ${vaso_codigo} recogido · ReTakeAway`
    : `♻️ Vaso ${vaso_codigo} devuelto · ReTakeAway`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${asunto}</title>
</head>
<body style="margin:0;padding:0;background:#F2F7F4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F7F4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,77,53,0.10);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1E4D35,#2E7D52);padding:28px 32px;text-align:center;">
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:4px;letter-spacing:2px;text-transform:uppercase;">ReTakeAway</div>
            <div style="font-size:32px;margin:8px 0;">${esRecogida ? '🥤' : '♻️'}</div>
            <h1 style="color:white;margin:0;font-size:22px;font-weight:900;">
              ${esRecogida ? '¡Vaso recogido!' : '¡Vaso devuelto!'}
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="color:#3D5A48;font-size:15px;margin:0 0 20px;">
              Hola, <strong>${nombre}</strong>. Te confirmamos que has 
              <strong>${esRecogida ? 'recogido' : 'devuelto'}</strong> el siguiente vaso:
            </p>

            <!-- Vaso info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F7F4;border-radius:12px;padding:0;margin-bottom:20px;">
              <tr>
                <td style="padding:16px 20px;">
                  ${[
                    ['🏷️ Código del vaso', vaso_codigo],
                    ['📍 Estación', estacion_nombre],
                    ['🕐 Fecha y hora', fecha],
                  ].map(([icon_label, value]) => `
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                    <tr>
                      <td style="color:#7A9E8A;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">${icon_label}</td>
                    </tr>
                    <tr>
                      <td style="color:#1A2E22;font-size:15px;font-weight:700;padding-top:2px;">${value}</td>
                    </tr>
                  </table>
                  `).join('')}
                </td>
              </tr>
            </table>

            <!-- Puntos -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${esRecogida ? '#FEF6E4' : '#E6F5EE'};border-radius:12px;margin-bottom:20px;">
              <tr>
                <td style="padding:16px 20px;text-align:center;">
                  <div style="color:${esRecogida ? '#D4860A' : '#2E7D52'};font-size:13px;margin-bottom:6px;">
                    ${esRecogida ? '🔒 Puntos bloqueados' : '🔓 Puntos liberados'}
                  </div>
                  <div style="color:${esRecogida ? '#D4860A' : '#2E7D52'};font-size:28px;font-weight:900;">
                    ${esRecogida ? '-50' : '+50'} pts
                  </div>
                  <div style="color:#7A9E8A;font-size:13px;margin-top:8px;">
                    Saldo actual: <strong style="color:#1A2E22;">${puntos_restantes.toLocaleString('es-ES')} puntos</strong>
                  </div>
                </td>
              </tr>
            </table>

            ${esRecogida ? `
            <p style="color:#7A9E8A;font-size:13px;text-align:center;margin:0;line-height:1.6;">
              Recuerda devolver el vaso en cualquier punto ReTakeAway<br/>
              para recuperar tus 50 puntos.
            </p>
            ` : `
            <p style="color:#7A9E8A;font-size:13px;text-align:center;margin:0;line-height:1.6;">
              ¡Gracias por contribuir a reducir residuos plásticos! 🌍<br/>
              Cada vaso devuelto cuenta.
            </p>
            `}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F2F7F4;padding:16px 32px;text-align:center;border-top:1px solid #C8E0D2;">
            <p style="color:#7A9E8A;font-size:11px;margin:0;">
              ReTakeAway · Sistema de reutilización de vasos para Take Away<br/>
              Este es un mensaje automático, no respondas a este correo.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ReTakeAway <noreply@retakeaway.app>',
        to: [to],
        subject: asunto,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[email] Error Resend:', err)
    } else {
      console.log(`[email] Enviado a ${to} (${accion})`)
    }
  } catch (err) {
    console.error('[email] Error de red:', err)
  }
}
