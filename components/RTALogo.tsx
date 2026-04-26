'use client'

interface RTALogoProps {
  size?: number
  white?: boolean
  color?: string
}

// Logo original trazado del SVG real subido por el usuario
// ViewBox original: 0 0 189 228 con transform scale(0.1,-0.1) translate(0,-2280)
export default function RTALogo({ size = 48, white = false, color }: RTALogoProps) {
  const c = color || (white ? '#FFFFFF' : '#1E4D35')
  const h = Math.round(size * (228 / 189))
  return (
    <svg width={size} height={h} viewBox="0 0 189 228" fill="none">
      <g fill={c} transform="scale(0.1,-0.1) translate(0,-2280)">
        {/* Tapa del vaso */}
        <path d="M257 2133 c-8 -10 -26 -63 -39 -118 l-23 -100 -70 -5 -70 -5 -28 -95 c-16 -54 -26 -112 -25 -135 l3 -40 927 -3 c906 -2 927 -2 933 17 6 19 -38 209 -56 243 -8 15 -22 18 -79 18 l-68 0 -22 98 c-12 53 -28 107 -36 120 l-14 22 -659 0 c-614 0 -659 -1 -674 -17z"/>
        {/* Flecha circular */}
        <path d="M775 1295 c-131 -36 -262 -128 -347 -243 -115 -156 -148 -365 -85 -549 36 -105 70 -158 157 -244 133 -132 273 -185 465 -176 175 8 287 57 411 181 106 106 174 257 174 386 0 47 -18 62 -67 58 l-38 -3 -17 -85 c-42 -201 -168 -346 -350 -401 -97 -30 -235 -23 -327 14 -127 53 -235 162 -281 285 -27 71 -37 197 -21 275 32 149 141 285 288 355 77 36 80 37 198 37 102 0 129 -4 177 -23 62 -25 149 -88 193 -140 l28 -33 -64 3 c-61 3 -63 2 -73 -25 -7 -19 -7 -33 0 -45 13 -21 252 -83 304 -80 32 3 35 6 42 43 4 22 7 97 7 167 1 117 -1 128 -19 138 -11 6 -31 8 -45 4 -23 -6 -25 -10 -25 -70 0 -35 -2 -64 -5 -64 -3 0 -35 30 -72 68 -129 128 -265 183 -452 181 -58 0 -128 -7 -156 -14z"/>
      </g>
    </svg>
  )
}
