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
