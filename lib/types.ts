export type Rol = 'usuario' | 'comercio' | 'gestora'
export type EstadoVaso = 'disponible' | 'en_uso' | 'lavado' | 'perdido'
export type TipoEvento = 'recogida' | 'devolucion' | 'lavado' | 'perdida'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  puntos: number
  estacion_id?: string
  created_at: string
}

export interface Vaso {
  id: string
  codigo_qr: string
  estado: EstadoVaso
  estacion_id: string
  estacion_nombre?: string
  lavados: number
  usuario_id?: string | null
  usuario_nombre?: string | null
  updated_at: string
}

export interface Estacion {
  id: string
  nombre: string
  direccion: string
  tipo: 'repsol' | 'moeve' | 'otro'
}

export interface Evento {
  id: string
  tipo: TipoEvento
  vaso_id: string
  vaso_codigo?: string
  usuario_id?: string | null
  usuario_nombre?: string | null
  estacion_id?: string | null
  estacion_nombre?: string | null
  puntos_delta: number
  created_at: string
}

// ─── DESIGN TOKENS ────────────────────────────────────────────
export const G = {
  darkest:    '#1A3A2A',
  dark:       '#1E4D35',
  mid:        '#2D6B4A',
  brand:      '#2E7D52',
  bright:     '#3A9E65',
  light:      '#6BBF8E',
  pale:       '#A8D8BB',
  bg:         '#F2F7F4',
  bgDeep:     '#E6F0EB',
  surface:    '#FFFFFF',
  border:     '#C8E0D2',
  text:       '#1A2E22',
  textMid:    '#3D5A48',
  textMuted:  '#7A9E8A',
  white:      '#FFFFFF',
  amber:      '#D4860A',
  amberLight: '#FEF6E4',
  red:        '#C0392B',
  redLight:   '#FDECEA',
  blue:       '#2563EB',
  blueLight:  '#EFF6FF',
  greenLight: '#E6F5EE',
}
