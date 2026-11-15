import type { ReactNode } from 'react'

/**
 * Ilustraciones propias de Plantitas. Todas comparten paleta, trazo redondeado
 * y las mismas piezas (maceta con carita, hojas, sol, gota...), así se ven de una misma familia.
 * Lienzo: 240 x 180.
 */
const C = {
  hoja: '#2f7d4a',
  hojaClara: '#8fd16a',
  hojaOsc: '#1f5a36',
  palida: '#b9cf95',
  amarilla: '#e3cf58',
  seca: '#c8a865',
  marron: '#8a5a2b',
  terra: '#c9603a',
  terraClara: '#e8946a',
  tierra: '#5b3a26',
  sol: '#f2b33d',
  solClaro: '#fde9b0',
  agua: '#3d8fb8',
  aguaClara: '#bfe0ef',
  crema: '#fbf6ea',
  arena: '#f1e7d0',
  pared: '#efe3c8',
  cielo: '#cfe8f3',
  sombra: '#cdbf9f',
  gato: '#e09a4f',
  perro: '#b98352',
  rosa: '#f6d9c8',
}

type Animo = 'feliz' | 'triste' | 'neutro'

function Cara({ animo = 'feliz' }: { animo?: Animo }) {
  const boca =
    animo === 'feliz' ? 'M-6 33q6 6 12 0' : animo === 'triste' ? 'M-6 38q6-6 12 0' : 'M-5 35h10'
  return (
    <g>
      <circle cx="-9" cy="26" r="2.6" fill={C.tierra} />
      <circle cx="9" cy="26" r="2.6" fill={C.tierra} />
      <path d={boca} stroke={C.tierra} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {animo === 'feliz' && (
        <>
          <circle cx="-15" cy="32" r="3" fill="#f3a585" opacity=".7" />
          <circle cx="15" cy="32" r="3" fill="#f3a585" opacity=".7" />
        </>
      )}
    </g>
  )
}

function Maceta({
  x,
  y,
  s = 1,
  cara,
  color = C.terra,
  claro = C.terraClara,
}: {
  x: number
  y: number
  s?: number
  cara?: Animo
  color?: string
  claro?: string
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-25 8h50l-6 38a7 7 0 0 1-7 6h-24a7 7 0 0 1-7-6z" fill={color} />
      <rect x="-30" y="0" width="60" height="13" rx="6" fill={claro} />
      {cara && <Cara animo={cara} />}
    </g>
  )
}

function Hoja({
  x = 0,
  y = 0,
  rot = 0,
  l = 1,
  color = C.hoja,
  mancha,
}: {
  x?: number
  y?: number
  rot?: number
  l?: number
  color?: string
  mancha?: boolean
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${l})`}>
      <path d="M0 0C-13-10-13-30 0-42 13-30 13-10 0 0z" fill={color} />
      <path d="M0-4v-30" stroke="#fff" strokeOpacity=".28" strokeWidth="2" strokeLinecap="round" />
      {mancha && (
        <>
          <circle cx="-4" cy="-30" r="5" fill={C.marron} />
          <circle cx="5" cy="-17" r="3.5" fill={C.marron} />
        </>
      )}
    </g>
  )
}

type Estado = 'feliz' | 'triste' | 'seca' | 'ahogada' | 'quemada' | 'estirada'

/** Planta en maceta. (x, y) = centro del borde superior de la maceta */
function Planta({ x, y, s = 1, estado = 'feliz', cara = true }: { x: number; y: number; s?: number; estado?: Estado; cara?: boolean }) {
  const animo: Animo = estado === 'feliz' ? 'feliz' : 'triste'
  let hojas: ReactNode
  let tallo = 'M0 2V-26'
  switch (estado) {
    case 'feliz':
      hojas = (
        <>
          <Hoja y={-4} rot={-62} color={C.hoja} />
          <Hoja y={-4} rot={62} color={C.hoja} />
          <Hoja y={-16} rot={-30} color={C.hojaClara} />
          <Hoja y={-16} rot={30} color={C.hojaClara} />
          <Hoja y={-24} l={1.1} color={C.hoja} />
        </>
      )
      break
    case 'quemada':
      hojas = (
        <>
          <Hoja y={-4} rot={-62} color={C.palida} mancha />
          <Hoja y={-4} rot={62} color={C.hoja} />
          <Hoja y={-16} rot={-30} color={C.hojaClara} />
          <Hoja y={-16} rot={30} color={C.palida} mancha />
          <Hoja y={-24} l={1.1} color={C.palida} mancha />
        </>
      )
      break
    case 'triste':
      hojas = (
        <>
          <Hoja y={-8} rot={-118} color={C.palida} />
          <Hoja y={-8} rot={118} color={C.palida} />
          <Hoja y={-18} rot={-86} l={0.9} color={C.palida} />
          <Hoja y={-18} rot={96} l={0.9} color={C.amarilla} />
        </>
      )
      break
    case 'seca':
      hojas = (
        <>
          <Hoja y={-8} rot={-128} color={C.seca} />
          <Hoja y={-8} rot={124} color={C.seca} />
          <Hoja y={-18} rot={-98} l={0.85} color={C.palida} />
          <Hoja y={-18} rot={102} l={0.85} color={C.seca} mancha />
        </>
      )
      break
    case 'ahogada':
      hojas = (
        <>
          <Hoja y={-8} rot={-112} color={C.amarilla} />
          <Hoja y={-8} rot={114} color={C.amarilla} />
          <Hoja y={-18} rot={-76} l={0.9} color={C.palida} />
          <Hoja y={-18} rot={84} l={0.9} color={C.amarilla} />
        </>
      )
      break
    case 'estirada':
      tallo = 'M0 2C0-30 8-50 34-66'
      hojas = (
        <>
          <Hoja x={3} y={-26} rot={70} l={0.5} color={C.palida} />
          <Hoja x={12} y={-46} rot={-20} l={0.5} color={C.palida} />
          <Hoja x={34} y={-66} rot={58} l={0.7} color={C.palida} />
        </>
      )
      break
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {estado === 'ahogada' && <ellipse cx="0" cy="54" rx="42" ry="6" fill={C.agua} opacity=".55" />}
      <path d={tallo} stroke={estado === 'feliz' || estado === 'quemada' ? C.hojaOsc : '#8aa35f'} strokeWidth="4" strokeLinecap="round" fill="none" />
      {hojas}
      <ellipse cx="0" cy="3" rx="24" ry="4" fill={estado === 'ahogada' ? '#2e1c12' : estado === 'seca' ? '#a98a68' : C.tierra} />
      <Maceta x={0} y={0} cara={cara ? animo : undefined} />
      {estado === 'seca' && <path d="M-12 3l4 2-3 2M8 2l-3 3 4 1" stroke={C.tierra} strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      {estado === 'ahogada' && (
        <>
          <Gota x={-40} y={20} s={0.6} />
          <Gota x={40} y={30} s={0.5} />
        </>
      )}
    </g>
  )
}

function Gota({ x, y, s = 1, color = C.agua }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0-12C6-3 9 2 9 7a9 9 0 0 1-18 0c0-5 3-10 9-19z"
      fill={color}
    />
  )
}

function Sol({ x, y, r = 16, suave }: { x: number; y: number; r?: number; suave?: boolean }) {
  const rayos = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <g transform={`translate(${x} ${y})`} opacity={suave ? 0.75 : 1}>
      {rayos.map((a) => (
        <path key={a} d={`M0 ${-r - 5}v${-r * 0.45}`} transform={`rotate(${a})`} stroke={C.sol} strokeWidth="4" strokeLinecap="round" />
      ))}
      <circle r={r} fill={C.sol} />
    </g>
  )
}

function Ventana({ x, y, w = 70, h = 92, sol, oscuro }: { x: number; y: number; w?: number; h?: number; sol?: boolean; oscuro?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="10" fill={oscuro ? '#b9cdd6' : C.cielo} stroke="#fff" strokeWidth="6" />
      {sol && <Sol x={w * 0.5} y={h * 0.36} r={11} />}
      <path d={`M${w / 2} 3v${h - 6}M3 ${h / 2}h${w - 6}`} stroke="#fff" strokeWidth="5" />
      <rect x="-6" y={h - 2} width={w + 12} height="8" rx="4" fill="#fff" />
    </g>
  )
}

function Piso({ color = C.sombra }: { color?: string }) {
  return <rect x="0" y="150" width="240" height="30" fill={color} opacity=".55" />
}

function Destello({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0-8l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill={C.sol} />
}

function Gato({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M22 0c18 0 20-22 8-26" stroke={C.gato} strokeWidth="7" strokeLinecap="round" fill="none" />
      <ellipse cx="0" cy="-12" rx="24" ry="20" fill={C.gato} />
      <path d="M-30-46l4-17 13 10zM-11-53l13-10 4 17z" fill={C.gato} />
      <circle cx="-12" cy="-40" r="17" fill={C.gato} />
      <circle cx="-18" cy="-42" r="2.4" fill={C.tierra} />
      <circle cx="-6" cy="-42" r="2.4" fill={C.tierra} />
      <path d="M-14-36l2 2 2-2" stroke={C.tierra} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="-6" cy="-6" rx="10" ry="12" fill="#f3c592" />
    </g>
  )
}

function Perro({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M24-18c10-4 12-14 8-20" stroke={C.perro} strokeWidth="7" strokeLinecap="round" fill="none" />
      <rect x="-22" y="-34" width="48" height="34" rx="16" fill={C.perro} />
      <circle cx="-16" cy="-48" r="18" fill={C.perro} />
      <ellipse cx="-32" cy="-46" rx="7" ry="14" fill="#8a5c36" transform="rotate(14 -32 -46)" />
      <ellipse cx="0" cy="-46" rx="7" ry="14" fill="#8a5c36" transform="rotate(-14 0 -46)" />
      <ellipse cx="-16" cy="-41" rx="9" ry="7" fill="#e8c9a3" />
      <circle cx="-22" cy="-52" r="2.4" fill={C.tierra} />
      <circle cx="-10" cy="-52" r="2.4" fill={C.tierra} />
      <ellipse cx="-16" cy="-44" rx="3" ry="2.2" fill={C.tierra} />
      <path d="M-16-41c0 3-2 4-4 4M-16-41c0 3 2 4 4 4" stroke={C.tierra} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  )
}


function Mano({ x, y, s = 1, color = '#eab98d', opacity = 1, filter }: { x: number; y: number; s?: number; color?: string; opacity?: number; filter?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color} opacity={opacity} filter={filter}>
      <rect x="-16" y="-6" width="32" height="34" rx="10" />
      <rect x="-16" y="-34" width="7" height="36" rx="3.5" />
      <rect x="-7.500" y="-41" width="7" height="42" rx="3.5" />
      <rect x="1" y="-39" width="7" height="40" rx="3.5" />
      <rect x="9.500" y="-31" width="6.5" height="32" rx="3.2" />
      <rect x="-30" y="0" width="20" height="8" rx="4" transform="rotate(-28 -16 6)" />
      <rect x="-9" y="22" width="18" height="30" rx="6" />
    </g>
  )
}

/** Maceta en corte, con las raíces a la vista */
function RaicesEnCorte({ sanas }: { sanas: boolean }) {
  const raiz = sanas ? '#f6ead0' : '#3a281c'
  return (
    <>
      {sanas ? (
        <>
          <path d="M120 62V34" stroke={C.hojaOsc} strokeWidth="6" strokeLinecap="round" />
          <Hoja x={120} y={56} rot={-58} color={C.hoja} />
          <Hoja x={120} y={56} rot={58} color={C.hoja} />
          <Hoja x={120} y={40} rot={-24} color={C.hojaClara} />
          <Hoja x={120} y={40} rot={24} color={C.hojaClara} />
        </>
      ) : (
        <>
          <path d="M120 62V36" stroke="#8aa35f" strokeWidth="6" strokeLinecap="round" />
          <Hoja x={120} y={42} rot={-108} color={C.amarilla} />
          <Hoja x={120} y={42} rot={106} color={C.amarilla} />
          <Hoja x={120} y={38} rot={-70} l={0.8} color={C.palida} />
        </>
      )}
      <rect x="66" y="60" width="108" height="18" rx="9" fill={C.terraClara} />
      <path d="M74 76h92l-9 76a10 10 0 0 1-10 9H93a10 10 0 0 1-10-9z" fill={C.terra} />
      <path d="M84 84h72l-7 64a7 7 0 0 1-7 6H98a7 7 0 0 1-7-6z" fill={sanas ? C.tierra : '#2e1c12'} />
      {!sanas && <path d="M88.500 126h63l-2.400 22a7 7 0 0 1-7 6H98a7 7 0 0 1-7-6z" fill={C.agua} opacity=".55" />}
      {sanas ? (
        <path
          d="M120 84v52M120 92c-12 6-20 16-22 34M120 96c12 6 19 14 21 32M120 108c-7 5-10 12-11 28M120 112c7 5 10 12 11 26M104 110c-5 4-7 9-8 16M136 112c5 4 6 9 7 14"
          stroke={raiz}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path d="M120 84v30M120 92c-9 5-14 12-15 22M120 96c9 5 13 11 14 20" stroke={raiz} strokeWidth="6" strokeLinecap="round" fill="none" />
      )}
      {!sanas && (
        <>
          <circle cx="104" cy="118" r="5" fill={raiz} />
          <circle cx="135" cy="120" r="5" fill={raiz} />
          <circle cx="120" cy="118" r="6" fill={raiz} />
        </>
      )}
    </>
  )
}

/** Flor simple de cinco pétalos */
function Flor({ x, y, s = 1, color = '#f6c1d0', centro = C.sol }: { x: number; y: number; s?: number; color?: string; centro?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-9" rx="6" ry="9" fill={color} transform={`rotate(${a})`} />
      ))}
      <circle r="4.500" fill={centro} />
    </g>
  )
}

/** Fronda de helecho: un nervio con hojitas a los lados */
function Fronda({ d }: { d: string }) {
  return (
    <>
      <path d={d} stroke={C.hojaClara} strokeWidth="13" strokeDasharray="3 4" fill="none" />
      <path d={d} stroke={C.hoja} strokeWidth="2.500" strokeLinecap="round" fill="none" />
    </>
  )
}

const PIEDRAS: [number, number, number][] = [
  [98, 146, 6],
  [110, 149, 5],
  [121, 146, 6],
  [133, 149, 5],
  [143, 146, 5],
  [104, 138, 5],
  [116, 139, 5],
  [128, 139, 5],
  [139, 138, 5],
]

/** Hoja grande en primer plano, para mostrar bichos y manchas de cerca */
function HojaGrande({ color = C.hoja, nervio = '#fff' }: { color?: string; nervio?: string }) {
  return (
    <g>
      <path d="M26 128C58 44 164 22 218 54c-18 82-118 112-192 74z" fill={color} />
      <path d="M26 128C92 104 160 80 218 54" stroke={nervio} strokeOpacity=".3" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M84 107l-8-30M122 92l-6-34M160 76l-2-30M96 103l26 22M134 88l28 16" stroke={nervio} strokeOpacity=".2" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  )
}

/** Frasco de vidrio con agua. (x, y) = centro de la base */
function Frasco({ x, y, w = 56, h = 84, nivel = 0.62 }: { x: number; y: number; w?: number; h?: number; nivel?: number }) {
  const a = h * nivel
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-a} width={w} height={a} rx="9" fill={C.aguaClara} />
      <rect x={-w / 2} y={-h} width={w} height={h} rx="10" fill="#fff" fillOpacity=".28" stroke="#7fb4cc" strokeWidth="3.5" />
      <path d={`M${-w / 2 + 8} ${-h + 14}v${h * 0.4}`} stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".8" />
    </g>
  )
}

function Raicitas({ x, y, s = 1, color = '#f3ead2' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 0c-2 10-10 14-12 26M0 0c1 12 0 20 2 32M0 0c4 9 11 13 13 24M-5 12c-5 3-9 3-13 7M5 14c5 2 9 5 14 5"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      fill="none"
    />
  )
}

function Tijera({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0L-40-9" stroke="#9aa7ad" strokeWidth="7" strokeLinecap="round" />
      <path d="M0 0L-40 9" stroke="#b8c3c8" strokeWidth="7" strokeLinecap="round" />
      <circle cx="0" cy="0" r="4" fill="#6c787e" />
      <path d="M0 0l22 10" stroke={C.terra} strokeWidth="6" strokeLinecap="round" />
      <path d="M0 0l22-10" stroke={C.terra} strokeWidth="6" strokeLinecap="round" />
      <circle cx="31" cy="14" r="10" fill="none" stroke={C.terra} strokeWidth="6" />
      <circle cx="31" cy="-14" r="10" fill="none" stroke={C.terra} strokeWidth="6" />
    </g>
  )
}

function Escena({ fondo = C.arena, children }: { fondo?: string; children: ReactNode }) {
  return (
    <>
      <rect width="240" height="180" rx="28" fill={fondo} />
      {children}
    </>
  )
}

const ESCENAS: Record<string, () => ReactNode> = {
  'planta-feliz': () => (
    <Escena fondo="#e4f2d6">
      <Piso color="#c5dcae" />
      <Destello x={62} y={52} />
      <Destello x={184} y={70} s={0.7} />
      <Planta x={120} y={98} s={1.25} />
    </Escena>
  ),
  'planta-triste': () => (
    <Escena fondo="#ece6d8">
      <Piso />
      <Planta x={120} y={98} s={1.25} estado="triste" />
    </Escena>
  ),
  'planta-seca': () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <Sol x={196} y={40} r={13} />
      <Planta x={120} y={98} s={1.25} estado="seca" />
    </Escena>
  ),
  'planta-ahogada': () => (
    <Escena fondo="#dcebf1">
      <Piso color="#b5cfda" />
      <Gota x={60} y={46} />
      <Gota x={186} y={58} s={0.8} />
      <Planta x={120} y={94} s={1.25} estado="ahogada" />
    </Escena>
  ),
  'planta-quemada': () => (
    <Escena fondo="#fbe7b6">
      <Piso color="#e6c98a" />
      <Sol x={190} y={44} r={20} />
      <path d="M170 60L128 96" stroke={C.sol} strokeWidth="5" strokeLinecap="round" strokeDasharray="2 10" />
      <Planta x={112} y={100} s={1.25} estado="quemada" />
    </Escena>
  ),
  'planta-estirada': () => (
    <Escena fondo="#e6e2d6">
      <Piso />
      <Ventana x={166} y={22} w={56} h={78} />
      <Planta x={86} y={100} s={1.25} estado="estirada" />
    </Escena>
  ),
  necesidades: () => (
    <Escena fondo="#e4f2d6">
      <Piso color="#c5dcae" />
      <Sol x={44} y={42} r={13} />
      <Gota x={198} y={46} s={1.2} />
      <path d="M22 104c14-8 22 8 36 0M22 118c14-8 22 8 36 0" stroke="#9fb8c4" strokeWidth="4" strokeLinecap="round" fill="none" />
      <g transform="translate(198 112)">
        <ellipse rx="20" ry="9" fill={C.tierra} />
        <circle cx="-7" cy="-2" r="2" fill="#8a6a4c" />
        <circle cx="6" cy="2" r="2" fill="#8a6a4c" />
      </g>
      <Planta x={120} y={98} s={1.2} />
    </Escena>
  ),
  'ventana-sol': () => (
    <Escena fondo={C.pared}>
      <Piso />
      <Ventana x={30} y={22} w={84} h={100} sol />
      <path d="M114 40l80 110H96z" fill={C.solClaro} opacity=".7" />
      <Planta x={158} y={98} s={1.05} />
    </Escena>
  ),
  'luz-directa': () => (
    <Escena fondo={C.pared}>
      <Piso />
      <Ventana x={22} y={22} w={76} h={100} sol />
      <path d="M98 30l110 120H70z" fill={C.sol} opacity=".38" />
      <Planta x={136} y={100} s={1.1} />
    </Escena>
  ),
  'luz-indirecta': () => (
    <Escena fondo={C.pared}>
      <Piso />
      <Ventana x={18} y={22} w={70} h={100} sol />
      <path d="M88 30l52 120H60z" fill={C.sol} opacity=".3" />
      <Planta x={180} y={100} s={1.1} />
    </Escena>
  ),
  'luz-poca': () => (
    <Escena fondo="#cfc7b6">
      <Piso color="#a89e88" />
      <Ventana x={14} y={30} w={40} h={58} oscuro />
      <rect x="96" y="0" width="144" height="180" rx="28" fill="#3b3a36" opacity=".28" />
      <Planta x={176} y={100} s={1.1} estado="triste" />
    </Escena>
  ),
  'mapa-sol': () => (
    <Escena fondo={C.cielo}>
      <rect x="0" y="132" width="240" height="48" fill="#c5dcae" />
      <path d="M30 132C60 20 180 20 210 132" stroke={C.sol} strokeWidth="4" strokeDasharray="3 9" strokeLinecap="round" fill="none" />
      <Sol x={46} y={96} r={9} suave />
      <Sol x={120} y={46} r={14} />
      <Sol x={194} y={96} r={9} suave />
      <path d="M92 132V98l28-22 28 22v34z" fill={C.crema} />
      <path d="M86 100l34-27 34 27" stroke={C.terra} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="111" y="106" width="18" height="26" rx="4" fill={C.terraClara} />
    </Escena>
  ),
  riego: () => (
    <Escena fondo="#dcebf1">
      <Piso color="#b5cfda" />
      <g transform="translate(64 62) rotate(18)">
        <rect x="-26" y="-14" width="48" height="38" rx="10" fill={C.agua} />
        <path d="M22-2l34-14" stroke={C.agua} strokeWidth="9" strokeLinecap="round" />
        <path d="M-26-4c-18 0-18 22 0 22" stroke="#2a6a8c" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <Gota x={136} y={60} s={0.55} />
      <Gota x={146} y={78} s={0.55} />
      <Gota x={130} y={84} s={0.45} />
      <Planta x={160} y={104} s={1.05} />
    </Escena>
  ),
  dedo: () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <g transform="translate(120 96) scale(1.5)">
        <ellipse cx="0" cy="3" rx="24" ry="4" fill={C.tierra} />
        <Maceta x={0} y={0} cara="neutro" />
        <Hoja x={-14} y={0} rot={-40} l={0.7} color={C.hoja} />
      </g>
      <g transform="translate(140 30)">
        <rect x="-10" y="-40" width="20" height="78" rx="10" fill="#eab98d" />
        <rect x="-6" y="24" width="12" height="9" rx="4" fill="#f6d9c0" />
      </g>
    </Escena>
  ),
  'maceta-drenaje': () => (
    <Escena fondo="#e4f2d6">
      <Piso color="#c5dcae" />
      <g transform="translate(120 58) scale(1.7)">
        <Hoja y={0} rot={-40} l={0.7} color={C.hoja} />
        <Hoja y={0} rot={40} l={0.7} color={C.hojaClara} />
        <ellipse cx="0" cy="3" rx="24" ry="4" fill={C.tierra} />
        <Maceta x={0} y={0} cara="feliz" />
        <rect x="-4" y="48" width="8" height="5" rx="2" fill={C.tierra} />
      </g>
      <Gota x={120} y={162} s={0.5} />
      <Gota x={108} y={170} s={0.35} />
      <Gota x={133} y={171} s={0.35} />
    </Escena>
  ),
  'maceta-sin-drenaje': () => (
    <Escena fondo="#dcebf1">
      <Piso color="#b5cfda" />
      <g transform="translate(120 58) scale(1.7)">
        <Hoja y={0} rot={-112} l={0.7} color={C.amarilla} />
        <Hoja y={0} rot={112} l={0.7} color={C.palida} />
        <ellipse cx="0" cy="3" rx="24" ry="4" fill="#2e1c12" />
        <Maceta x={0} y={0} cara="triste" />
        <path d="M-20.500 40l-1.200 6a7 7 0 0 0 7 6h29.400a7 7 0 0 0 7-6l-1.200-6z" fill={C.agua} opacity=".8" />
      </g>
    </Escena>
  ),
  sustrato: () => (
    <Escena fondo="#f4e6c6">
      <path d="M40 150c0-50 36-84 80-84s80 34 80 84z" fill={C.tierra} />
      {[
        [84, 120, 6, '#8a6a4c'],
        [110, 96, 5, '#e9dcc0'],
        [136, 118, 7, '#8a6a4c'],
        [158, 100, 5, '#e9dcc0'],
        [120, 134, 5, '#e9dcc0'],
        [96, 140, 4, '#a98a68'],
        [166, 134, 6, '#a98a68'],
        [70, 138, 4, '#e9dcc0'],
      ].map(([cx, cy, r, f], i) => (
        <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={f as string} />
      ))}
      <Hoja x={120} y={70} rot={-30} l={0.8} color={C.hoja} />
      <Hoja x={120} y={70} rot={30} l={0.8} color={C.hojaClara} />
      <Piso color="#dcc699" />
    </Escena>
  ),
  trasplante: () => (
    <Escena fondo="#f1e7d0">
      <Piso />
      <Planta x={66} y={112} s={0.75} cara={false} />
      <path d="M100 110h30m-10-9l10 9-10 9" stroke={C.hojaOsc} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Planta x={178} y={94} s={1.1} />
    </Escena>
  ),
  casa: () => (
    <Escena fondo={C.cielo}>
      <rect x="0" y="140" width="240" height="40" fill="#c5dcae" />
      <Sol x={40} y={40} r={13} />
      <Gota x={78} y={66} s={0.5} />
      <Gota x={94} y={84} s={0.5} />
      <path d="M112 150V78l50-38 50 38v72z" fill={C.crema} />
      <path d="M104 82l58-45 58 45" stroke={C.terra} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Planta x={162} y={104} s={0.8} />
      <Hoja x={48} y={146} rot={-20} l={0.9} color={C.hoja} />
      <Hoja x={48} y={146} rot={24} l={0.8} color={C.hojaClara} />
    </Escena>
  ),
  calefaccion: () => (
    <Escena fondo="#f6e2d4">
      <Piso color="#dcc0ab" />
      <g transform="translate(34 92)">
        {[0, 16, 32, 48].map((dx) => (
          <rect key={dx} x={dx} width="12" height="56" rx="6" fill="#fff" />
        ))}
        <rect x="-4" y="6" width="68" height="6" rx="3" fill="#e9dcd0" />
      </g>
      {[44, 66, 88].map((dx) => (
        <path key={dx} d={`M${dx} 80c-8-10 8-16 0-28s8-16 0-26`} stroke={C.terra} strokeWidth="4" strokeLinecap="round" fill="none" opacity=".75" />
      ))}
      <Planta x={174} y={100} s={1.1} estado="triste" />
    </Escena>
  ),
  estaciones: () => (
    <Escena fondo="#fbe7b6">
      <path d="M120 0h92a28 28 0 0 1 28 28v124a28 28 0 0 1-28 28h-92z" fill="#d6e6ee" />
      <Sol x={60} y={52} r={15} />
      <Planta x={60} y={112} s={0.8} />
      <g transform="translate(180 52)" stroke="#7fa9bd" strokeWidth="4" strokeLinecap="round">
        {[0, 60, 120].map((a) => (
          <path key={a} d="M0-17v34M-5-12l5 5 5-5M-5 12l5-5 5 5" transform={`rotate(${a})`} fill="none" />
        ))}
      </g>
      <Planta x={180} y={112} s={0.8} cara={false} estado="triste" />
    </Escena>
  ),
  gato: () => (
    <Escena fondo="#f3e0ea">
      <Piso color="#d9bccb" />
      <Planta x={164} y={100} s={1.05} />
      <Gato x={74} y={152} s={1.15} />
    </Escena>
  ),
  perro: () => (
    <Escena fondo="#f1e7d0">
      <Piso />
      <Planta x={168} y={100} s={1.05} />
      <Perro x={72} y={152} s={1.15} />
    </Escena>
  ),
  veterinario: () => (
    <Escena fondo="#dcebf1">
      <Piso color="#b5cfda" />
      <rect x="62" y="30" width="62" height="112" rx="14" fill={C.hojaOsc} />
      <rect x="68" y="40" width="50" height="86" rx="6" fill="#fff" />
      <path d="M93 66v34M76 83h34" stroke="#c2412d" strokeWidth="10" strokeLinecap="round" />
      <path d="M140 60c8 6 8 18 0 24M152 50c14 12 14 34 0 46" stroke={C.agua} strokeWidth="5" strokeLinecap="round" fill="none" />
      <Gato x={186} y={152} s={0.8} />
    </Escena>
  ),
  altura: () => (
    <Escena fondo="#f3e0ea">
      <Piso color="#d9bccb" />
      <rect x="110" y="84" width="110" height="9" rx="4" fill={C.marron} />
      <path d="M126 93v18M204 93v18" stroke={C.marron} strokeWidth="5" strokeLinecap="round" />
      <Planta x={166} y={32} s={0.95} />
      <Gato x={66} y={152} s={1.05} />
    </Escena>
  ),
  'planta-partes': () => (
    <Escena fondo="#e4f2d6">
      <Piso color="#c5dcae" />
      <path d="M120 100V56" stroke={C.hojaOsc} strokeWidth="6" strokeLinecap="round" />
      <Hoja x={120} y={84} rot={-64} l={1.1} color={C.hoja} />
      <Hoja x={120} y={84} rot={64} l={1.1} color={C.hoja} />
      <Hoja x={120} y={66} rot={-32} l={1.1} color={C.hojaClara} />
      <Hoja x={120} y={66} rot={32} l={1.1} color={C.hojaClara} />
      <Hoja x={120} y={56} l={1.2} color={C.hoja} />
      <ellipse cx="120" cy="104" rx="33" ry="5" fill={C.tierra} />
      <Maceta x={120} y={100} s={1.4} />
      <path d="M96 122h48l-5 38a8 8 0 0 1-8 7h-22a8 8 0 0 1-8-7z" fill={C.tierra} />
      <path d="M120 122v30M120 130c-8 6-12 12-12 22M120 134c8 6 12 10 13 20M120 142c-4 4-5 8-5 14" stroke="#f1e2c4" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Escena>
  ),
  'sombra-nitida': () => (
    <Escena fondo="#fdf0cd">
      <Sol x={38} y={36} r={15} />
      <path d="M52 50l96 96H44z" fill={C.sol} opacity=".22" />
      <Mano x={104} y={128} s={1.1} color={C.tierra} opacity={0.7} />
      <Mano x={170} y={84} s={1.25} />
    </Escena>
  ),
  'sombra-difusa': () => (
    <Escena fondo="#e9e6dc">
      <defs>
        <filter id="ilu-desenfoque" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <Ventana x={16} y={16} w={46} h={62} />
      <Mano x={104} y={128} s={1.1} color={C.tierra} opacity={0.32} filter="url(#ilu-desenfoque)" />
      <Mano x={170} y={84} s={1.25} />
    </Escena>
  ),
  'raices-sanas': () => (
    <Escena fondo="#e4f2d6">
      <Piso color="#c5dcae" />
      <Destello x={52} y={48} />
      <Destello x={194} y={96} s={0.7} />
      <RaicesEnCorte sanas />
    </Escena>
  ),
  'raices-podridas': () => (
    <Escena fondo="#dcebf1">
      <Piso color="#b5cfda" />
      <Gota x={50} y={54} />
      <Gota x={196} y={70} s={0.8} />
      <RaicesEnCorte sanas={false} />
    </Escena>
  ),
  'sol-manana': () => (
    <Escena fondo="#eaf3e2">
      <Piso color="#c9dcb6" />
      <rect x="26" y="20" width="84" height="100" rx="10" fill="#d9eef6" stroke="#fff" strokeWidth="6" />
      <Sol x={52} y={92} r={10} suave />
      <path d="M68 23v94M29 70h78" stroke="#fff" strokeWidth="5" />
      <rect x="20" y="118" width="96" height="8" rx="4" fill="#fff" />
      <path d="M110 60l92 90H100z" fill={C.solClaro} opacity=".75" />
      <Planta x={160} y={98} s={1.05} />
    </Escena>
  ),
  'sol-tarde': () => (
    <Escena fondo="#fbdcb8">
      <Piso color="#e6b98a" />
      <rect x="26" y="20" width="84" height="100" rx="10" fill="#f9c98a" stroke="#fff" strokeWidth="6" />
      <circle cx="74" cy="78" r="22" fill="#f08a3c" />
      <path d="M68 23v94M29 70h78" stroke="#fff" strokeWidth="5" />
      <rect x="20" y="118" width="96" height="8" rx="4" fill="#fff" />
      <path d="M110 30l104 120H96z" fill="#f08a3c" opacity=".4" />
      {[188, 204, 220].map((dx) => (
        <path key={dx} d={`M${dx} 62c-6-8 6-12 0-21s6-12 0-20`} stroke={C.terra} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".7" />
      ))}
      <Planta x={158} y={100} s={1.05} estado="quemada" />
    </Escena>
  ),
  'plato-agua': () => (
    <Escena fondo="#dcebf1">
      <Piso color="#b5cfda" />
      <ellipse cx="120" cy="150" rx="80" ry="16" fill="#fff" />
      <ellipse cx="120" cy="148" rx="68" ry="11" fill={C.agua} opacity=".7" />
      <Planta x={120} y={84} s={1.2} />
    </Escena>
  ),
  ducha: () => (
    <Escena fondo="#e3eef2">
      <path d="M0 60h240M0 120h240M80 0v180M160 0v180" stroke="#fff" strokeWidth="3" opacity=".8" />
      <path d="M200 0v8c0 10-8 14-20 14h-30" stroke="#9fb3bd" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M126 20h44l10 16h-64z" fill="#8aa0ab" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Gota x={126 + i * 15} y={52 + (i % 2) * 12} s={0.42} />
          <Gota x={120 + i * 17} y={80 - (i % 2) * 8} s={0.38} />
        </g>
      ))}
      <Planta x={148} y={126} s={0.9} />
    </Escena>
  ),
  autorriego: () => (
    <Escena fondo="#e4f2d6">
      <Piso color="#c5dcae" />
      <path d="M36 88h52v52a10 10 0 0 1-10 10H46a10 10 0 0 1-10-10z" fill="#fff" opacity=".9" />
      <path d="M36 108h52v32a10 10 0 0 1-10 10H46a10 10 0 0 1-10-10z" fill={C.agua} opacity=".75" />
      <path d="M62 138C62 60 130 70 156 100" stroke="#f6ead0" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M62 138C62 60 130 70 156 100" stroke={C.marron} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" fill="none" />
      <Planta x={168} y={98} s={1.1} />
    </Escena>
  ),
  rociador: () => (
    <Escena fondo="#e9f1e4">
      <Piso color="#c9dcb6" />
      <g transform="translate(52 96)">
        <rect x="-18" y="0" width="36" height="52" rx="10" fill={C.agua} />
        <rect x="-8" y="-16" width="16" height="18" rx="4" fill="#2a6a8c" />
        <path d="M-8-22h34v12H-8z" fill="#2a6a8c" />
        <path d="M2-10v16c0 6 14 6 14 0" stroke="#2a6a8c" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      {[
        [96, 70, 3],
        [108, 60, 2.4],
        [112, 78, 3],
        [124, 66, 2.2],
        [128, 86, 2.6],
        [138, 74, 2],
        [104, 90, 2.2],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={C.agua} opacity=".6" />
      ))}
      <Planta x={176} y={100} s={1.05} />
    </Escena>
  ),
  palito: () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <g transform="translate(120 96) scale(1.5)">
        <Hoja x={-12} y={0} rot={-44} l={0.7} color={C.hoja} />
        <Hoja x={-12} y={0} rot={-4} l={0.6} color={C.hojaClara} />
        <ellipse cx="0" cy="3" rx="24" ry="4" fill={C.tierra} />
        <Maceta x={0} y={0} cara="neutro" />
      </g>
      <path d="M150 22L136 98" stroke="#e2c08d" strokeWidth="6" strokeLinecap="round" />
      <path d="M140 76l-4 22" stroke={C.marron} strokeWidth="6" strokeLinecap="round" />
    </Escena>
  ),
  'macetas-materiales': () => (
    <Escena fondo="#f1e7d0">
      <Piso />
      <g transform="translate(74 92) scale(1.25)">
        <Hoja y={0} rot={-34} l={0.7} color={C.hoja} />
        <Hoja y={0} rot={34} l={0.7} color={C.hojaClara} />
        <ellipse cx="0" cy="3" rx="24" ry="4" fill={C.tierra} />
        <Maceta x={0} y={0} />
        {[-12, 0, 12].map((dx) => (
          <circle key={dx} cx={dx} cy={30 + (dx ? 6 : 0)} r="1.800" fill={C.terraClara} />
        ))}
      </g>
      {[28, 120].map((dx) => (
        <path key={dx} d={`M${dx} 128c-5-6 5-9 0-15s5-9 0-15`} stroke={C.agua} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" />
      ))}
      <g transform="translate(170 92) scale(1.25)">
        <Hoja y={0} rot={-34} l={0.7} color={C.hoja} />
        <Hoja y={0} rot={34} l={0.7} color={C.hojaClara} />
        <ellipse cx="0" cy="3" rx="24" ry="4" fill={C.tierra} />
        <Maceta x={0} y={0} color="#3d8fb8" claro="#7fbbe0" />
        <path d="M-17 20l-3 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".55" />
      </g>
    </Escena>
  ),
  cachepot: () => (
    <Escena fondo="#e9f1e4">
      <Piso color="#c9dcb6" />
      <Planta x={120} y={66} s={1.05} cara={false} />
      <rect x="70" y="84" width="100" height="16" rx="8" fill="#3aa39a" />
      <path d="M78 98h84l-9 54a9 9 0 0 1-9 8H96a9 9 0 0 1-9-8z" fill="#27766f" />
      <path d="M92 110l-3 30" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".35" />
    </Escena>
  ),
  'piedras-fondo': () => (
    <Escena fondo="#dcebf1">
      <Piso color="#b5cfda" />
      <Hoja x={120} y={62} rot={-50} color={C.palida} />
      <Hoja x={120} y={62} rot={50} color={C.hojaClara} />
      <rect x="66" y="60" width="108" height="18" rx="9" fill={C.terraClara} />
      <path d="M74 76h92l-9 76a10 10 0 0 1-10 9H93a10 10 0 0 1-10-9z" fill={C.terra} />
      <path d="M84 84h72l-7 64a7 7 0 0 1-7 6H98a7 7 0 0 1-7-6z" fill={C.tierra} />
      <path d="M86.500 112h67l-2.200 20h-62.600z" fill={C.agua} opacity=".6" />
      {PIEDRAS.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? '#b9b3a6' : '#9a9486'} />
      ))}
    </Escena>
  ),
  'piedras-arriba': () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <g transform="translate(120 84) scale(1.5)">
        {[-60, -20, 20, 60].map((a) => (
          <Hoja key={a} y={-2} rot={a} l={0.6} color={a % 40 ? '#7fc0a8' : '#5fa88e'} />
        ))}
        <ellipse cx="0" cy="3" rx="24" ry="4" fill={C.tierra} />
        {[-18, -10, -2, 6, 14, 20].map((dx, i) => (
          <circle key={dx} cx={dx} cy={2 + (i % 2)} r="3.200" fill={i % 2 ? '#b9b3a6' : '#9a9486'} />
        ))}
        <Maceta x={0} y={0} cara="feliz" />
      </g>
    </Escena>
  ),
  'raices-apretadas': () => (
    <Escena fondo="#f1e7d0">
      <Piso />
      <Maceta x={182} y={104} s={1.1} />
      <path d="M96 66V40" stroke={C.hojaOsc} strokeWidth="6" strokeLinecap="round" />
      <Hoja x={96} y={60} rot={-58} color={C.hoja} />
      <Hoja x={96} y={60} rot={58} color={C.hoja} />
      <Hoja x={96} y={46} l={1.05} color={C.hojaClara} />
      <path d="M64 70h64l-8 62a8 8 0 0 1-8 7H80a8 8 0 0 1-8-7z" fill={C.tierra} />
      <path d="M68 84c18 8 38 8 56 0M70 100c16 8 36 8 52 0M72 116c14 7 34 7 48 0M76 130c12 5 28 5 40 0M84 72c-6 20-6 44 2 64M108 72c6 20 6 44-2 64" stroke="#f6ead0" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Escena>
  ),
  'abono-npk': () => (
    <Escena fondo="#e9f1e4">
      {(
        [
          [48, 'N', C.hoja],
          [120, 'P', C.terra],
          [192, 'K', '#b0567d'],
        ] as const
      ).map(([x, letra, color]) => (
        <g key={letra}>
          <circle cx={x} cy="58" r="30" fill={color} />
          <text x={x} y="72" textAnchor="middle" fontSize="40" fontWeight="800" fontFamily="system-ui, sans-serif" fill="#fff">
            {letra}
          </text>
        </g>
      ))}
      <Hoja x={48} y={156} l={1.1} color={C.hoja} />
      <path d="M120 106v20M120 114c-10 6-14 14-15 30M120 114c10 6 14 14 15 30M120 124c-4 6-5 12-5 24M120 124c4 6 5 12 5 22" stroke={C.marron} strokeWidth="4" strokeLinecap="round" fill="none" />
      <Flor x={192} y={132} s={1.5} />
    </Escena>
  ),
  'abono-tipos': () => (
    <Escena fondo="#f1e7d0">
      <Piso />
      <g transform="translate(52 78)">
        <rect x="-8" y="-22" width="16" height="16" rx="4" fill={C.hojaOsc} />
        <rect x="-20" y="-8" width="40" height="78" rx="12" fill={C.hoja} />
        <rect x="-14" y="18" width="28" height="26" rx="5" fill="#fff" opacity=".85" />
        <Gota x={0} y={34} s={0.7} />
      </g>
      {[
        [108, 140, 5],
        [120, 132, 5],
        [132, 140, 5],
        [114, 148, 5],
        [126, 148, 5],
        [120, 122, 5],
        [138, 149, 4],
        [102, 149, 4],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? C.sol : '#e2c08d'} />
      ))}
      <path d="M160 152c0-26 14-42 30-42s30 16 30 42z" fill={C.tierra} />
      <path d="M176 132c4-5 10-5 14 0M188 144c4-5 10-5 14 0" stroke="#e8a48a" strokeWidth="4" strokeLinecap="round" fill="none" />
    </Escena>
  ),
  'abono-exceso': () => (
    <Escena fondo="#f6e2d4">
      <Piso color="#dcc0ab" />
      <g transform="translate(64 138) rotate(-70)">
        <rect x="-8" y="-22" width="16" height="16" rx="4" fill={C.hojaOsc} />
        <rect x="-20" y="-8" width="40" height="64" rx="12" fill={C.hoja} />
      </g>
      <ellipse cx="42" cy="156" rx="26" ry="5" fill={C.hoja} opacity=".45" />
      <Planta x={160} y={98} s={1.15} estado="quemada" />
    </Escena>
  ),
  suculenta: () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <Sol x={40} y={38} r={12} />
      <g transform="translate(120 88)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <Hoja key={a} rot={a} l={0.95} color="#5fa88e" />
        ))}
        {[22, 82, 142, 202, 262, 322].map((a) => (
          <Hoja key={a} rot={a} l={0.68} color="#7fc0a8" />
        ))}
        {[0, 90, 180, 270].map((a) => (
          <Hoja key={a} rot={a} l={0.4} color="#a8d9c4" />
        ))}
      </g>
      <Maceta x={120} y={116} s={1.1} cara="feliz" />
    </Escena>
  ),
  cactus: () => (
    <Escena fondo="#fbe7b6">
      <Piso color="#e6c98a" />
      <Sol x={196} y={40} r={14} />
      <path d="M92 78v20c0 8 8 12 16 12M148 62v22c0 8-8 12-16 12" stroke={C.hoja} strokeWidth="16" strokeLinecap="round" fill="none" />
      <rect x="104" y="32" width="32" height="86" rx="16" fill={C.hoja} />
      <path d="M112 46v60M120 40v70M128 46v60" stroke={C.hojaOsc} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 9" />
      <Flor x={120} y={30} s={0.8} color="#f08a8a" />
      <ellipse cx="120" cy="119" rx="26" ry="4" fill={C.tierra} />
      <Maceta x={120} y={116} s={1.1} cara="feliz" />
    </Escena>
  ),
  helecho: () => (
    <Escena fondo="#dcebe4">
      <Piso color="#b9d3c6" />
      <Fronda d="M120 112C104 80 76 62 44 66" />
      <Fronda d="M120 112C136 80 164 62 196 66" />
      <Fronda d="M120 112C110 76 92 46 70 30" />
      <Fronda d="M120 112C130 76 148 46 170 30" />
      <Fronda d="M120 112C120 80 120 50 120 22" />
      <ellipse cx="120" cy="117" rx="26" ry="4" fill={C.tierra} />
      <Maceta x={120} y={114} s={1.1} cara="feliz" />
    </Escena>
  ),
  orquidea: () => (
    <Escena fondo="#efe6f1">
      <Piso color="#d6c6da" />
      <path d="M118 116C112 70 128 40 172 34" stroke={C.hojaOsc} strokeWidth="4" strokeLinecap="round" fill="none" />
      <Flor x={128} y={62} s={1.25} color="#fff" centro="#d86aa0" />
      <Flor x={152} y={42} s={1.15} color="#fff" centro="#d86aa0" />
      <Flor x={180} y={36} s={0.9} color="#fff" centro="#d86aa0" />
      <path d="M118 116C92 112 70 100 56 84c26-2 48 10 62 32zM122 116c20-6 36-18 46-34-22 0-38 12-46 34z" fill={C.hoja} />
      <ellipse cx="120" cy="119" rx="26" ry="4" fill="#8a6a4c" />
      <Maceta x={120} y={116} s={1.1} cara="feliz" />
    </Escena>
  ),
  'monstera-hoja': () => (
    <Escena fondo="#e4f2d6">
      <path d="M120 164V112" stroke={C.hojaOsc} strokeWidth="6" strokeLinecap="round" />
      <path d="M120 126C70 126 40 96 44 58c2-20 18-36 40-36 16 0 28 8 36 20 8-12 20-20 36-20 22 0 38 16 40 36 4 38-26 68-76 68z" fill={C.hoja} />
      <path d="M120 42v80" stroke={C.hojaOsc} strokeWidth="3" strokeLinecap="round" />
      {[
        [84, 62, -30],
        [80, 90, -10],
        [156, 62, 30],
        [160, 90, 10],
      ].map(([cx, cy, r], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="6" ry="13" fill="#e4f2d6" transform={`rotate(${r} ${cx} ${cy})`} />
      ))}
      <path d="M44 74l22 4M52 100l20-6M196 74l-22 4M188 100l-20-6" stroke="#e4f2d6" strokeWidth="7" strokeLinecap="round" />
    </Escena>
  ),
  helada: () => (
    <Escena fondo="#d6e6ee">
      <rect x="0" y="150" width="240" height="30" fill="#b9cdd6" />
      <path d="M0 96h240M20 96v54M60 96v54M100 96v54M140 96v54M180 96v54M220 96v54" stroke="#8fa6b3" strokeWidth="5" strokeLinecap="round" />
      {[
        [40, 40],
        [200, 52],
        [150, 28],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`} stroke="#fff" strokeWidth="3.500" strokeLinecap="round">
          {[0, 60, 120].map((a) => (
            <path key={a} d="M0-12v24M-4-8l4 4 4-4M-4 8l4-4 4 4" transform={`rotate(${a})`} fill="none" />
          ))}
        </g>
      ))}
      <Planta x={120} y={98} s={1.15} estado="triste" />
      <path d="M92 100c8-5 14 5 22 0s14 5 22 0 12 4 14 2" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
    </Escena>
  ),
  'hojas-caidas': () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <path d="M120 98V52" stroke="#8aa35f" strokeWidth="5" strokeLinecap="round" />
      <Hoja x={120} y={62} rot={-34} color={C.hojaClara} />
      <Hoja x={120} y={56} rot={24} color={C.hoja} />
      <Hoja x={120} y={84} rot={96} l={0.8} color={C.amarilla} />
      <ellipse cx="120" cy="101" rx="29" ry="5" fill={C.tierra} />
      <Maceta x={120} y={98} s={1.2} cara="neutro" />
      <Hoja x={44} y={160} rot={70} l={0.8} color={C.amarilla} />
      <Hoja x={196} y={158} rot={-62} l={0.8} color={C.seca} />
      <Hoja x={178} y={166} rot={100} l={0.7} color={C.amarilla} />
    </Escena>
  ),
  valija: () => (
    <Escena fondo="#e9f1e4">
      <Piso color="#c9dcb6" />
      <path d="M52 70V58a10 10 0 0 1 10-10h16a10 10 0 0 1 10 10v12" stroke="#9a4526" strokeWidth="7" fill="none" />
      <rect x="26" y="68" width="88" height="84" rx="14" fill={C.terra} />
      <path d="M26 96h88" stroke="#9a4526" strokeWidth="5" />
      <rect x="62" y="88" width="16" height="16" rx="4" fill={C.sol} />
      <Planta x={160} y={106} s={0.85} />
      <Planta x={204} y={116} s={0.65} cara={false} />
    </Escena>
  ),
  'pano-hoja': () => (
    <Escena fondo="#e9f1e4">
      <HojaGrande />
      <path d="M40 124C70 78 112 56 150 50" stroke="#fff" strokeOpacity=".35" strokeWidth="16" strokeLinecap="round" fill="none" />
      <g transform="translate(160 74) rotate(-20)">
        <rect x="-34" y="-20" width="68" height="44" rx="12" fill={C.aguaClara} />
        <path d="M-22-8h44M-22 4h44M-22 16h30" stroke="#8fc3da" strokeWidth="3" strokeLinecap="round" />
      </g>
      <Mano x={178} y={96} s={0.9} />
      <Destello x={62} y={86} s={1.2} />
      <Destello x={98} y={62} />
      <Gota x={206} y={40} s={0.7} />
    </Escena>
  ),
  'tijera-poda': () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <path d="M92 102V50" stroke="#8aa35f" strokeWidth="5" strokeLinecap="round" />
      <Hoja x={92} y={62} rot={-30} color={C.hojaClara} />
      <Hoja x={92} y={56} rot={8} color={C.hoja} />
      <path d="M92 86c16-4 28-2 40 4" stroke="#b79a5c" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Hoja x={130} y={90} rot={110} l={0.9} color={C.seca} />
      <ellipse cx="92" cy="105" rx="29" ry="5" fill={C.tierra} />
      <Maceta x={92} y={102} s={1.2} cara="feliz" />
      <Tijera x={150} y={62} rot={118} s={0.9} />
      <path d="M104 78l10 12" stroke={C.terra} strokeWidth="3" strokeDasharray="3 5" strokeLinecap="round" />
    </Escena>
  ),
  'rotar-maceta': () => (
    <Escena fondo={C.cielo}>
      <Piso color="#a9cfdf" />
      <Sol x={34} y={34} r={15} />
      <path d="M120 100c-4-22-14-38-34-50" stroke="#8aa35f" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Hoja x={88} y={52} rot={-66} color={C.hojaClara} />
      <Hoja x={100} y={62} rot={-30} color={C.hoja} />
      <Hoja x={112} y={80} rot={-52} l={0.8} color={C.hoja} />
      <ellipse cx="120" cy="103" rx="29" ry="5" fill={C.tierra} />
      <Maceta x={120} y={100} s={1.2} cara="feliz" />
      <path d="M70 160c20 16 80 16 100 0" stroke={C.terra} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M178 150l-6 12-10-8z" fill={C.terra} />
    </Escena>
  ),
  'lupa-hoja': () => (
    <Escena fondo="#e9f1e4">
      <HojaGrande color="#4d9a62" />
      <circle cx="128" cy="84" r="44" fill="#fff" fillOpacity=".45" stroke={C.tierra} strokeWidth="7" />
      <path d="M160 116l34 36" stroke={C.tierra} strokeWidth="11" strokeLinecap="round" />
      {[
        [112, 78],
        [128, 92],
        [142, 72],
        [122, 64],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="5" ry="3.4" fill={C.hojaOsc} />
          <path d={`M${cx - 4} ${cy - 3}l-3-4M${cx + 4} ${cy - 3}l3-4`} stroke={C.hojaOsc} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      <path d="M100 62a34 34 0 0 1 22-14" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".8" />
    </Escena>
  ),
  cuarentena: () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <Planta x={48} y={112} s={0.8} />
      <Planta x={96} y={120} s={0.65} cara={false} />
      <path d="M134 34v128" stroke={C.terra} strokeWidth="4" strokeDasharray="4 9" strokeLinecap="round" />
      <Planta x={188} y={108} s={0.95} />
      <g transform="translate(214 96) rotate(14)">
        <path d="M0 0l8 12" stroke={C.tierra} strokeWidth="2" />
        <rect x="2" y="10" width="20" height="13" rx="3" fill={C.sol} />
      </g>
    </Escena>
  ),
  vivero: () => (
    <Escena fondo="#e9f1e4">
      <Piso color="#c9dcb6" />
      <rect x="18" y="84" width="204" height="8" rx="4" fill={C.marron} />
      <rect x="18" y="150" width="204" height="8" rx="4" fill={C.marron} />
      <path d="M28 40v118M212 40v118" stroke={C.marron} strokeWidth="7" strokeLinecap="round" />
      <Planta x={62} y={52} s={0.62} cara={false} />
      <Planta x={120} y={52} s={0.62} estado="triste" cara={false} />
      <Planta x={178} y={52} s={0.62} cara={false} />
      <Planta x={90} y={116} s={0.66} />
      <Planta x={152} y={116} s={0.66} cara={false} />
    </Escena>
  ),
  'planta-nueva': () => (
    <Escena fondo={C.pared}>
      <Piso />
      <path d="M150 62c0-16 28-16 28 0" stroke="#b08a4f" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M132 62h64l8 92h-80z" fill="#e2c48f" />
      <path d="M132 62h64l2 16h-68z" fill="#d3b074" />
      <Planta x={84} y={100} s={1.1} />
      <g transform="translate(112 82) rotate(18)">
        <path d="M-6-8l6 8" stroke={C.tierra} strokeWidth="2" />
        <rect x="-2" y="-2" width="26" height="16" rx="4" fill={C.sol} />
        <path d="M4 6h14" stroke={C.tierra} strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <Destello x={40} y={48} s={1.2} />
      <Destello x={58} y={30} s={0.8} />
    </Escena>
  ),
  cochinilla: () => (
    <Escena fondo="#e9f1e4">
      <path d="M36 168C70 120 150 60 214 26" stroke="#5f9a52" strokeWidth="14" strokeLinecap="round" fill="none" />
      <Hoja x={96} y={112} rot={-70} l={1.5} color={C.hoja} />
      <Hoja x={150} y={70} rot={150} l={1.5} color={C.hojaClara} />
      {[
        [84, 124, 10],
        [100, 108, 12],
        [118, 96, 9],
        [134, 84, 11],
        [150, 70, 8],
        [108, 122, 7],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#fff" />
          <circle cx={cx - r * 0.5} cy={cy + r * 0.5} r={r * 0.6} fill="#fff" />
          <circle cx={cx + r * 0.6} cy={cy - r * 0.3} r={r * 0.55} fill="#f3f0e6" />
          <ellipse cx={cx} cy={cy} rx={r * 0.42} ry={r * 0.3} fill="#e7c9c0" />
        </g>
      ))}
    </Escena>
  ),
  pulgon: () => (
    <Escena fondo={C.cielo}>
      <path d="M120 176C118 130 122 90 120 40" stroke="#8fd16a" strokeWidth="12" strokeLinecap="round" fill="none" />
      <Hoja x={120} y={56} rot={-36} l={1.3} color={C.hojaClara} />
      <Hoja x={120} y={50} rot={32} l={1.3} color="#a6dd84" />
      <Hoja x={120} y={130} rot={-80} l={1.4} color={C.hoja} />
      {[
        [114, 70],
        [126, 82],
        [115, 94],
        [127, 106],
        [116, 118],
        [106, 52],
        [134, 46],
        [124, 60],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="5.5" ry="7" fill="#4c8f2f" />
          <circle cx={cx} cy={cy - 7} r="2.6" fill="#3b7424" />
          <path d={`M${cx - 5} ${cy - 2}l-5-2M${cx - 5} ${cy + 2}l-5 2M${cx + 5} ${cy - 2}l5-2M${cx + 5} ${cy + 2}l5 2`} stroke="#3b7424" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}
    </Escena>
  ),
  aranuela: () => (
    <Escena fondo="#f4e6c6">
      <HojaGrande color="#7fae62" />
      {Array.from({ length: 46 }, (_, i) => (
        <circle key={i} cx={48 + ((i * 37) % 150)} cy={64 + ((i * 23) % 62) - ((i * 37) % 150) * 0.22} r="1.8" fill="#f1e9b8" />
      ))}
      <path d="M150 44l62 6M150 44l52 26M150 44l34 40M168 46c4 10 0 18-6 24M188 48c4 12-2 24-12 32M204 50c2 10-2 18-8 24" stroke="#fff" strokeWidth="1.6" fill="none" opacity=".9" />
      {[
        [176, 56],
        [192, 66],
        [168, 70],
        [200, 54],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="3.4" fill="#c2452d" />
          <path d={`M${cx - 3} ${cy}l-4-3M${cx - 3} ${cy}l-4 3M${cx + 3} ${cy}l4-3M${cx + 3} ${cy}l4 3`} stroke="#c2452d" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
    </Escena>
  ),
  trips: () => (
    <Escena fondo="#e9f1e4">
      <HojaGrande />
      <path d="M70 110c10-12 26-18 40-20M110 100c12-14 30-20 46-22M92 84c8-8 18-12 28-14M150 92c10-6 22-8 32-8" stroke="#dfe7e2" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".85" />
      {[
        [84, 100],
        [124, 86],
        [160, 82],
        [104, 76],
        [176, 70],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.6" fill="#22201c" />
      ))}
      {[
        [96, 94, -30],
        [140, 78, -20],
        [118, 106, 10],
        [170, 92, -40],
      ].map(([cx, cy, r], i) => (
        <g key={i} transform={`translate(${cx} ${cy}) rotate(${r})`}>
          <rect x="-8" y="-2" width="16" height="4" rx="2" fill="#3a2f1c" />
          <path d="M8 0h4" stroke="#3a2f1c" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}
    </Escena>
  ),
  mosquitas: () => (
    <Escena fondo={C.pared}>
      <Piso />
      <Planta x={120} y={104} s={1.2} estado="triste" />
      {[
        [58, 66],
        [84, 92],
        [164, 84],
        [190, 58],
        [72, 40],
        [176, 112],
        [148, 44],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy}) rotate(${i * 40})`}>
          <ellipse cx="-4" cy="-4" rx="5" ry="2.6" fill="#fff" opacity=".85" transform="rotate(-30 -4 -4)" />
          <ellipse cx="4" cy="-4" rx="5" ry="2.6" fill="#fff" opacity=".85" transform="rotate(30 4 -4)" />
          <ellipse cx="0" cy="0" rx="2.4" ry="4.4" fill="#2c2a26" />
        </g>
      ))}
    </Escena>
  ),
  'trampa-amarilla': () => (
    <Escena fondo="#e9f1e4">
      <Piso color="#c9dcb6" />
      <Planta x={96} y={104} s={1.15} />
      <path d="M150 106V52" stroke={C.marron} strokeWidth="4" strokeLinecap="round" />
      <rect x="132" y="22" width="52" height="62" rx="7" fill="#f6d532" />
      {[
        [144, 36],
        [168, 44],
        [152, 58],
        [172, 68],
        [142, 72],
        [160, 30],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="2" ry="3.4" fill="#2c2a26" />
          <path d={`M${cx - 2} ${cy - 1}l-4-2M${cx + 2} ${cy - 1}l4-2`} stroke="#2c2a26" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
    </Escena>
  ),
  hisopo: () => (
    <Escena fondo={C.cielo}>
      <path d="M20 150C70 120 140 100 226 96" stroke="#5f9a52" strokeWidth="16" strokeLinecap="round" fill="none" />
      <Hoja x={70} y={126} rot={-30} l={1.5} color={C.hoja} />
      {[
        [104, 112, 11],
        [128, 104, 9],
        [152, 100, 10],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#fff" />
          <circle cx={cx - r * 0.5} cy={cy + r * 0.4} r={r * 0.6} fill="#fff" />
          <circle cx={cx + r * 0.6} cy={cy - r * 0.3} r={r * 0.55} fill="#f3f0e6" />
        </g>
      ))}
      <path d="M164 92l48-62" stroke="#f3ead2" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="161" cy="95" rx="8" ry="10" fill="#fff" transform="rotate(38 161 95)" />
      <g transform="translate(40 60)">
        <rect x="-15" y="-10" width="30" height="44" rx="7" fill="#fff" fillOpacity=".6" stroke="#7fb4cc" strokeWidth="3" />
        <rect x="-8" y="-22" width="16" height="13" rx="3" fill={C.agua} />
        <rect x="-13" y="8" width="26" height="14" fill={C.aguaClara} />
      </g>
    </Escena>
  ),
  'manchas-hoja': () => (
    <Escena fondo="#f4e6c6">
      <HojaGrande color="#5f9a52" />
      {[
        [84, 104, 12],
        [128, 78, 15],
        [168, 68, 9],
        [110, 112, 7],
        [156, 96, 8],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r + 4} fill={C.amarilla} opacity=".85" />
          <circle cx={cx} cy={cy} r={r} fill={C.marron} />
          <circle cx={cx + 1} cy={cy - 1} r={r * 0.45} fill="#6b4320" />
        </g>
      ))}
    </Escena>
  ),
  'moho-tierra': () => (
    <Escena fondo={C.pared}>
      <Piso />
      <path d="M120 88V44" stroke="#8aa35f" strokeWidth="5" strokeLinecap="round" />
      <Hoja x={120} y={56} rot={-32} color={C.hoja} />
      <Hoja x={120} y={50} rot={26} color={C.hojaClara} />
      <g transform="translate(120 88) scale(1.7)">
        <path d="M-25 8h50l-6 38a7 7 0 0 1-7 6h-24a7 7 0 0 1-7-6z" fill={C.terra} />
        <rect x="-30" y="0" width="60" height="13" rx="6" fill={C.terraClara} />
        <ellipse cx="0" cy="3" rx="25" ry="4.5" fill={C.tierra} />
      </g>
      {[
        [92, 92, 8],
        [108, 96, 6],
        [132, 92, 9],
        [148, 95, 6],
        [120, 90, 5],
      ].map(([cx, cy, r], i) => (
        <g key={i} opacity=".95">
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.55} fill="#fff" />
          <ellipse cx={cx + r * 0.6} cy={cy + 1} rx={r * 0.6} ry={r * 0.35} fill="#eef1ea" />
        </g>
      ))}
    </Escena>
  ),
  'esqueje-agua': () => (
    <Escena fondo={C.cielo}>
      <Piso color="#a9cfdf" />
      <Frasco x={120} y={156} w={62} h={92} />
      <path d="M120 112c-2-22 4-40 0-62" stroke="#5f9a52" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Hoja x={120} y={78} rot={-48} l={1.05} color={C.hoja} />
      <Hoja x={120} y={58} rot={40} l={1.05} color={C.hojaClara} />
      <circle cx="120" cy="112" r="4.5" fill="#3f7a3a" />
      <Raicitas x={120} y={114} s={1.05} color="#fff" />
    </Escena>
  ),
  nudo: () => (
    <Escena fondo="#e9f1e4">
      <path d="M30 150C80 120 150 76 214 40" stroke="#5f9a52" strokeWidth="11" strokeLinecap="round" fill="none" />
      <Hoja x={118} y={98} rot={-20} l={1.5} color={C.hoja} />
      <Hoja x={176} y={62} rot={140} l={1.2} color={C.hojaClara} />
      <circle cx="118" cy="98" r="10" fill="#3f7a3a" />
      <path d="M118 104c2 8 0 14 4 22" stroke={C.marron} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="118" cy="98" r="19" fill="none" stroke={C.sol} strokeWidth="4" strokeDasharray="5 6" />
      <path d="M72 108l18 34" stroke={C.terra} strokeWidth="4" strokeDasharray="4 6" strokeLinecap="round" />
      <Tijera x={62} y={96} rot={-118} s={0.7} />
    </Escena>
  ),
  'planta-en-agua': () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <Frasco x={120} y={158} w={74} h={78} nivel={0.72} />
      <path d="M112 104c-6-20-20-34-36-40M120 104c0-24 2-40 0-58M128 104c6-20 20-32 38-38" stroke="#5f9a52" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Hoja x={78} y={66} rot={-60} l={1.05} color={C.hoja} />
      <Hoja x={120} y={50} rot={0} l={1.15} color={C.hojaClara} />
      <Hoja x={164} y={68} rot={62} l={1.05} color={C.hoja} />
      <Raicitas x={108} y={108} s={1.2} color="#fff" />
      <Raicitas x={132} y={110} s={1.1} color="#fff" />
    </Escena>
  ),
  division: () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      {[72, 168].map((x) => (
        <g key={x}>
          <path d={`M${x - 26} 96h52c4 30-10 48-26 48s-30-18-26-48z`} fill={C.tierra} />
          <Raicitas x={x - 6} y={128} s={1.1} />
          <Raicitas x={x + 10} y={132} s={0.9} />
          <path d={`M${x} 98V60M${x - 12} 98c-2-16-8-24-14-30M${x + 12} 98c2-16 8-24 14-30`} stroke="#5f9a52" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <Hoja x={x} y={64} l={0.9} color={C.hojaClara} />
          <Hoja x={x - 26} y={70} rot={-40} l={0.85} color={C.hoja} />
          <Hoja x={x + 26} y={70} rot={40} l={0.85} color={C.hoja} />
        </g>
      ))}
      <path d="M110 112h20" stroke={C.terra} strokeWidth="5" strokeLinecap="round" />
      <path d="M104 112l10-8v16zM136 112l-10-8v16z" fill={C.terra} />
    </Escena>
  ),
  hijuelo: () => (
    <Escena fondo="#e9f1e4">
      <Piso color="#c9dcb6" />
      <path d="M40 112h160l-12 50a8 8 0 0 1-8 6H60a8 8 0 0 1-8-6z" fill={C.terra} />
      <rect x="32" y="102" width="176" height="16" rx="8" fill={C.terraClara} />
      <ellipse cx="120" cy="105" rx="78" ry="6" fill={C.tierra} />
      {[-34, -16, 0, 16, 34].map((r, i) => (
        <path key={i} transform={`translate(100 104) rotate(${r})`} d="M0 0C-9-24-7-58 0-78 7-58 9-24 0 0z" fill={i % 2 ? C.hojaClara : C.hoja} />
      ))}
      {[-22, 0, 22].map((r, i) => (
        <path key={i} transform={`translate(168 104) rotate(${r}) scale(.42)`} d="M0 0C-9-24-7-58 0-78 7-58 9-24 0 0z" fill={i % 2 ? C.hoja : C.hojaClara} />
      ))}
      <circle cx="168" cy="92" r="24" fill="none" stroke={C.sol} strokeWidth="4" strokeDasharray="5 6" />
    </Escena>
  ),
  estolon: () => (
    <Escena fondo={C.cielo}>
      <rect x="0" y="86" width="240" height="8" fill={C.marron} />
      {[-70, -40, -12, 16, 46, 74].map((r, i) => (
        <path key={i} transform={`translate(84 48) rotate(${r})`} d="M0 0c-5-12-4-28 0-40 4 12 5 28 0 40z" fill={i % 2 ? C.hojaClara : C.hoja} />
      ))}
      <path d="M100 48c40 4 60 32 64 70" stroke="#c9b85e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M70 48c-30 8-38 36-34 62" stroke="#c9b85e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <Maceta x={84} y={46} s={0.78} cara="feliz" />
      {[
        [164, 126, 1],
        [36, 116, 0.75],
      ].map(([x, y, s], k) => (
        <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
          {[-150, -110, -70, -30, 30, 70, 110, 150].map((r, i) => (
            <path key={i} transform={`rotate(${r})`} d="M0 0c-4-9-3-20 0-28 3 8 4 19 0 28z" fill={i % 2 ? C.hojaClara : C.hoja} />
          ))}
          <Raicitas x={0} y={2} s={0.5} color={C.marron} />
        </g>
      ))}
    </Escena>
  ),
  callo: () => (
    <Escena fondo="#f4e6c6">
      <Sol x={204} y={34} r={14} suave />
      <rect x="20" y="118" width="200" height="40" rx="10" fill="#fff" />
      <path d="M20 132h200" stroke="#e8dfc9" strokeWidth="3" />
      <g transform="translate(70 126) rotate(78)">
        <path d="M0 0v-44" stroke="#7fae62" strokeWidth="9" strokeLinecap="round" />
        {[-60, -20, 20, 60].map((r, i) => (
          <path key={i} transform={`translate(0 -48) rotate(${r})`} d="M0 0C-9-8-9-22 0-30 9-22 9-8 0 0z" fill={i % 2 ? C.hojaClara : '#6fb07a'} />
        ))}
        <ellipse cx="0" cy="2" rx="6" ry="3.5" fill="#d9c08a" />
      </g>
      <g transform="translate(176 128) rotate(80)">
        <path d="M0 0C-10-10-10-30 0-40 10-30 10-10 0 0z" fill="#6fb07a" />
        <ellipse cx="0" cy="-1" rx="5" ry="3" fill="#d9c08a" />
      </g>
      <circle cx="70" cy="126" r="15" fill="none" stroke={C.terra} strokeWidth="3.5" strokeDasharray="4 6" />
      <g transform="translate(120 52)">
        <circle r="20" fill="#fff" stroke={C.tierra} strokeWidth="4" />
        <path d="M0-11V0l8 6" stroke={C.tierra} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </Escena>
  ),
  'hoja-suculenta': () => (
    <Escena fondo="#e9f1e4">
      <rect x="0" y="118" width="240" height="62" fill={C.tierra} />
      <g transform="translate(96 116) rotate(64)">
        <path d="M0 0C-16-16-16-52 0-70 16-52 16-16 0 0z" fill="#6fb07a" />
        <path d="M0-8v-48" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
      </g>
      <Raicitas x={86} y={120} s={1} color="#f6c9d6" />
      {[-70, -35, 0, 35, 70].map((r, i) => (
        <path key={i} transform={`translate(84 116) rotate(${r})`} d="M0 0C-7-6-7-18 0-24 7-18 7-6 0 0z" fill={i % 2 ? '#6fb07a' : C.hojaClara} />
      ))}
      <circle cx="84" cy="104" r="26" fill="none" stroke={C.sol} strokeWidth="4" strokeDasharray="5 6" />
    </Escena>
  ),
  oidio: () => (
    <Escena fondo="#e9f1e4">
      <HojaGrande color="#4d9a62" />
      {[
        [78, 108, 16],
        [112, 92, 20],
        [150, 76, 18],
        [182, 64, 12],
        [130, 112, 12],
        [96, 84, 10],
      ].map(([cx, cy, r], i) => (
        <g key={i} fill="#fff">
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} opacity=".55" />
          <ellipse cx={cx + 3} cy={cy - 2} rx={r * 0.6} ry={r * 0.4} opacity=".8" />
        </g>
      ))}
    </Escena>
  ),
  pincel: () => (
    <Escena fondo="#f4e6c6">
      <HojaGrande color="#5f9a52" />
      {Array.from({ length: 40 }, (_, i) => {
        const x = 52 + ((i * 41) % 140)
        const y = 70 + ((i * 29) % 56) - ((i * 41) % 140) * 0.24
        return <path key={i} d={`M${x} ${y}l2-6`} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
      })}
      <g transform="translate(150 74) rotate(40)">
        <path d="M-9 0h18l-3 26h-12z" fill="#f3ead2" />
        <rect x="-10" y="-12" width="20" height="14" rx="2" fill="#9aa7ad" />
        <rect x="-6" y="-70" width="12" height="60" rx="6" fill={C.terra} />
      </g>
    </Escena>
  ),
  'poste-musgo': () => (
    <Escena fondo="#e9f1e4">
      <Piso color="#c9dcb6" />
      <rect x="112" y="22" width="22" height="84" rx="9" fill="#6f8f3f" />
      {[34, 50, 66, 82, 98].map((y, i) => (
        <path key={y} d={`M114 ${y}c4-4 8 4 12 0s6 4 8 0`} stroke={i % 2 ? '#8fb15a' : '#557333'} strokeWidth="3" strokeLinecap="round" fill="none" />
      ))}
      <path d="M96 106c0-26 8-40 18-52M116 106c2-30 12-48 8-72" stroke="#5f9a52" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Hoja x={114} y={56} rot={-62} l={1.1} color={C.hoja} />
      <Hoja x={122} y={42} rot={58} l={1.1} color={C.hojaClara} />
      <Hoja x={118} y={30} rot={-18} l={1} color={C.hoja} />
      <Hoja x={98} y={92} rot={-76} l={0.9} color={C.hojaClara} />
      <ellipse cx="116" cy="109" rx="31" ry="5" fill={C.tierra} />
      <Maceta x={116} y={106} s={1.2} cara="feliz" />
    </Escena>
  ),
  enrejado: () => (
    <Escena fondo={C.pared}>
      <Piso />
      <g stroke={C.marron} strokeWidth="5" strokeLinecap="round">
        <path d="M70 24v110M110 24v110M150 24v110M190 24v110" />
        <path d="M62 44h136M62 76h136M62 108h136" />
      </g>
      <path d="M96 138c-2-30 10-46 6-70s14-30 14-44M96 138c10-20 34-30 50-52s28-20 40-40" stroke="#5f9a52" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <Hoja x={104} y={70} rot={-50} l={0.85} color={C.hoja} />
      <Hoja x={120} y={42} rot={52} l={0.85} color={C.hojaClara} />
      <Hoja x={146} y={88} rot={70} l={0.85} color={C.hoja} />
      <Hoja x={172} y={62} rot={-40} l={0.85} color={C.hojaClara} />
      <Hoja x={190} y={46} rot={34} l={0.8} color={C.hoja} />
      <Maceta x={96} y={138} s={0.8} cara="feliz" />
    </Escena>
  ),
  trepadora: () => (
    <Escena fondo={C.cielo}>
      <Piso color="#a9cfdf" />
      <path d="M150 150V18" stroke={C.marron} strokeWidth="7" strokeLinecap="round" />
      <path d="M92 110c0-30 54-26 58-54M150 56c-8-10-24-10-30-22" stroke="#5f9a52" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M96 108c4-22 40-20 52-40s-18-30 0-48" stroke="#5f9a52" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Hoja x={112} y={90} rot={-70} l={0.95} color={C.hoja} />
      <Hoja x={134} y={80} rot={70} l={0.95} color={C.hojaClara} />
      <Hoja x={150} y={60} rot={-64} l={1} color={C.hoja} />
      <Hoja x={152} y={40} rot={64} l={1} color={C.hojaClara} />
      <Hoja x={148} y={22} rot={-10} l={1.05} color={C.hoja} />
      <ellipse cx="90" cy="113" rx="29" ry="5" fill={C.tierra} />
      <Maceta x={90} y={110} s={1.15} cara="feliz" />
    </Escena>
  ),
  colgante: () => (
    <Escena fondo={C.pared}>
      <rect x="0" y="0" width="240" height="14" fill="#d7c8a2" />
      <path d="M120 14L96 52M120 14l24 38" stroke={C.marron} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M92 52h56l-7 38a8 8 0 0 1-8 6h-26a8 8 0 0 1-8-6z" fill={C.terra} />
      <rect x="86" y="46" width="68" height="13" rx="6" fill={C.terraClara} />
      <path d="M100 56c-6 30-4 56-10 84M112 58c-2 24 4 50-2 90M130 58c4 28-4 48 4 84M144 56c8 26 6 52 12 78" stroke="#5f9a52" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {[
        [96, 84, -80],
        [94, 118, 80],
        [108, 96, 90],
        [108, 128, -80],
        [132, 92, -90],
        [134, 122, 90],
        [152, 98, 80],
        [154, 124, -80],
      ].map(([x, y, r], i) => (
        <Hoja key={i} x={x} y={y} rot={r} l={0.6} color={i % 2 ? C.hojaClara : C.hoja} />
      ))}
    </Escena>
  ),
  zarcillo: () => (
    <Escena fondo="#e9f1e4">
      <path d="M170 168V20" stroke={C.marron} strokeWidth="8" strokeLinecap="round" />
      <path d="M40 150c30-6 50-30 68-50" stroke="#5f9a52" strokeWidth="6" strokeLinecap="round" fill="none" />
      <Hoja x={64} y={140} rot={-30} l={1.1} color={C.hoja} />
      <Hoja x={90} y={118} rot={60} l={1.1} color={C.hojaClara} />
      <path d="M108 100c20-8 36-22 54-12c14 8 4 24-6 18s0-18 14-16c10 2 10 14 0 16s-14-10-4-16" stroke="#7fae62" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M168 88c-14-12-2-26 6-20s-2 16-8 12" stroke="#7fae62" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="108" cy="100" r="5" fill="#3f7a3a" />
    </Escena>
  ),
  'atar-tutor': () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <path d="M142 24v82" stroke={C.marron} strokeWidth="7" strokeLinecap="round" />
      <path d="M118 106c-2-26 2-50 16-74" stroke="#5f9a52" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <Hoja x={120} y={80} rot={-60} l={1} color={C.hoja} />
      <Hoja x={126} y={58} rot={-50} l={1} color={C.hojaClara} />
      <Hoja x={134} y={36} rot={-24} l={1} color={C.hoja} />
      <path d="M128 72c8-4 14-4 18 0M128 72c8 6 14 4 18 0" stroke={C.terra} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M130 52c8-4 12-4 16 0" stroke={C.terra} strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="118" cy="109" rx="29" ry="5" fill={C.tierra} />
      <Maceta x={118} y={106} s={1.15} cara="feliz" />
    </Escena>
  ),
  'planta-flor': () => (
    <Escena fondo="#fbe9ef">
      <Piso color="#efd0da" />
      <path d="M120 100V62M120 88c-14-4-24-12-28-26M120 84c14-4 24-12 28-26" stroke="#5f9a52" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Hoja x={120} y={92} rot={-50} l={0.85} color={C.hoja} />
      <Hoja x={120} y={92} rot={50} l={0.85} color={C.hojaClara} />
      <Flor x={120} y={52} s={1.3} color="#f08aa6" />
      <Flor x={88} y={62} s={1} color="#f6c1d0" />
      <Flor x={152} y={58} s={1} color="#f6c1d0" />
      <Destello x={64} y={40} s={1.2} />
      <Destello x={178} y={36} />
      <ellipse cx="120" cy="103" rx="29" ry="5" fill={C.tierra} />
      <Maceta x={120} y={100} s={1.2} cara="feliz" />
    </Escena>
  ),
  'planta-follaje': () => (
    <Escena fondo="#e9f1e4">
      <Piso color="#c9dcb6" />
      <path d="M120 100V50" stroke="#5f9a52" strokeWidth="5" strokeLinecap="round" />
      {[-70, -42, -14, 14, 42, 70].map((r, i) => (
        <Hoja key={r} x={120} y={96 - Math.abs(r) * 0.2} rot={r} l={1.5 - Math.abs(r) / 160} color={i % 2 ? C.hojaClara : C.hoja} />
      ))}
      <Hoja x={120} y={56} rot={0} l={1.2} color={C.hojaOsc} />
      <ellipse cx="120" cy="103" rx="29" ry="5" fill={C.tierra} />
      <Maceta x={120} y={100} s={1.2} cara="feliz" />
    </Escena>
  ),
  'raices-aereas': () => (
    <Escena fondo="#e9f1e4">
      <rect x="150" y="14" width="26" height="150" rx="10" fill="#6f8f3f" />
      {[30, 52, 74, 96, 118, 140].map((y, i) => (
        <path key={y} d={`M152 ${y}c4-4 8 4 12 0s6 4 10 0`} stroke={i % 2 ? '#8fb15a' : '#557333'} strokeWidth="3" strokeLinecap="round" fill="none" />
      ))}
      <path d="M60 164c0-40 40-44 64-60s30-40 36-80" stroke="#5f9a52" strokeWidth="7" strokeLinecap="round" fill="none" />
      <Hoja x={96} y={124} rot={-72} l={1.15} color={C.hoja} />
      <Hoja x={126} y={96} rot={-70} l={1.15} color={C.hojaClara} />
      <path d="M126 106c10 4 20 2 26-4M138 88c8 4 14 2 18-2M148 66c4 2 8 2 8 0" stroke="#c9a46a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M132 112c-2 10 2 18 0 24" stroke="#c9a46a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </Escena>
  ),
  'atado-apretado': () => (
    <Escena fondo="#f4e6c6">
      <Piso color="#dcc699" />
      <path d="M142 24v82" stroke={C.marron} strokeWidth="7" strokeLinecap="round" />
      <path d="M118 106c-2-26 2-50 16-74" stroke="#5f9a52" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <Hoja x={120} y={80} rot={-60} l={1} color={C.hoja} />
      <Hoja x={134} y={36} rot={-24} l={1} color={C.hojaClara} />
      <path d="M121 66l16 5M121 70l16 5M121 74l16 5M122 78l15 5" stroke={'#c2452d'} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M124 58c-4 4-4 8-2 10M130 84c-4 3-4 6-2 9" stroke="#8a5a2b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="118" cy="109" rx="29" ry="5" fill={C.tierra} />
      <Maceta x={118} y={106} s={1.15} cara="triste" />
    </Escena>
  ),
}

export const NOMBRES_ILUSTRACIONES = Object.keys(ESCENAS)

/** Posiciones (en % del lienzo) de las zonas tocables de cada ilustración táctil */
export const ZONAS: Record<string, Record<string, { x: number; y: number }>> = {
  'planta-partes': {
    hojas: { x: 41, y: 27 },
    tallo: { x: 50, y: 51 },
    raices: { x: 50, y: 82 },
    maceta: { x: 64, y: 62 },
  },
}

export function Ilustracion({ nombre, className, titulo }: { nombre: string; className?: string; titulo?: string }) {
  const escena = ESCENAS[nombre] ?? ESCENAS['planta-feliz']
  return (
    <svg viewBox="0 0 240 180" className={className} role="img" aria-label={titulo ?? nombre.replace(/-/g, ' ')}>
      {escena()}
    </svg>
  )
}

/** Brote, la mascota de Plantitas: una macetita con un brote y mucha paciencia */
export function Brote({ animo = 'feliz', className }: { animo?: 'feliz' | 'festejo' | 'pensando'; className?: string }) {
  return (
    <svg viewBox="0 0 120 130" className={className} role="img" aria-label="Brote, la mascota de Plantitas">
      <ellipse cx="60" cy="122" rx="34" ry="5" fill="#000" opacity=".08" />
      <path d="M60 62V34" stroke={C.hojaOsc} strokeWidth="5" strokeLinecap="round" />
      <Hoja x={60} y={40} rot={-58} l={0.85} color={C.hoja} />
      <Hoja x={60} y={36} rot={48} l={0.95} color={C.hojaClara} />
      {animo === 'festejo' && (
        <>
          <Destello x={20} y={30} />
          <Destello x={102} y={24} s={0.8} />
          <Destello x={98} y={62} s={0.6} />
          <path d="M22 78L10 62M98 78l12-16" stroke={C.terra} strokeWidth="7" strokeLinecap="round" />
        </>
      )}
      {animo === 'pensando' && <path d="M96 30c0-7 10-7 10 0 0 5-5 5-5 10m0 6v1" stroke={C.hojaOsc} strokeWidth="4" strokeLinecap="round" fill="none" />}
      <ellipse cx="60" cy="64" rx="30" ry="5" fill={C.tierra} />
      <Maceta x={60} y={60} s={1.25} cara={animo === 'pensando' ? 'neutro' : 'feliz'} />
    </svg>
  )
}
