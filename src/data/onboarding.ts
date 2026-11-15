import type {
  Abertura,
  Alcance,
  Experiencia,
  HoraSol,
  Lugar,
  Muerde,
  Objetivo,
  Perfil,
  Tiempo,
  TipoMascota,
} from '../lib/tipos'

export interface Opcion<T extends string> {
  valor: T
  texto: string
  /** nombre de ícono (ver components/Icono) */
  icono: string
}

export const ONBOARDING = {
  bienvenida: {
    titulo: '¡Hola! Soy Brote',
    texto: 'Te voy a acompañar a entender tus plantas, de a poquito y sin vueltas.',
    boton: 'Empecemos',
    nota: 'Son unas preguntas cortitas para armar tu camino.',
  },
  experiencia: {
    titulo: '¿Cómo te llevás con las plantas?',
    opciones: [
      { valor: 'nunca', texto: 'Nunca tuve plantas', icono: 'semilla' },
      { valor: 'murieron', texto: 'Tuve y se me murieron', icono: 'hoja-caida' },
      { valor: 'algunas', texto: 'Tengo algunas y quiero entender', icono: 'maceta' },
      { valor: 'bastante', texto: 'Ya sé bastante', icono: 'estrella' },
    ] satisfies Opcion<Experiencia>[],
  },
  test: {
    titulo: 'Tres preguntitas rápidas',
    texto: 'Así sé desde dónde arrancar. No es un examen, tranqui.',
    // Borrador sin verificar: se contrasta con fuentes en la fase de contenido
    preguntas: [
      {
        pregunta: 'Hojas amarillas y tierra que sigue mojada hace días. ¿Qué es lo más probable?',
        opciones: ['Le falta agua', 'Le sobra agua', 'Le falta abono'],
        correcta: 1,
      },
      {
        pregunta: '¿Qué es la "luz brillante indirecta"?',
        opciones: ['Sol pegando directo en las hojas', 'Mucha claridad sin rayos directos', 'Un rincón lejos de la ventana'],
        correcta: 1,
      },
      {
        pregunta: '¿Cuándo conviene abonar una planta de interior?',
        opciones: ['Cuando está creciendo, en primavera y verano', 'En pleno invierno', 'Recién trasplantada y todos los días'],
        correcta: 0,
      },
    ],
  },
  lugar: {
    titulo: '¿Dónde viven (o vivirían) tus plantas?',
    opciones: [
      { valor: 'interior', texto: 'Adentro de casa', icono: 'casa' },
      { valor: 'balcon', texto: 'En el balcón', icono: 'balcon' },
      { valor: 'ambos', texto: 'En los dos', icono: 'ambos' },
    ] satisfies Opcion<Lugar>[],
  },
  sol: {
    titulo: 'Tu espacio y el sol',
    preguntaAbertura: '¿Qué tenés?',
    aberturas: [
      { valor: 'ventana', texto: 'Ventana', icono: 'ventana' },
      { valor: 'balcon', texto: 'Balcón', icono: 'balcon' },
      { valor: 'ambas', texto: 'Las dos', icono: 'ambos' },
    ] satisfies Opcion<Abertura>[],
    preguntaHora: '¿A qué hora suele dar el sol ahí?',
    horas: [
      { valor: 'manana', texto: 'A la mañana', icono: 'amanecer' },
      { valor: 'mediodia', texto: 'Al mediodía', icono: 'sol' },
      { valor: 'tarde', texto: 'A la tarde', icono: 'atardecer' },
      { valor: 'todo_el_dia', texto: 'Casi todo el día', icono: 'sol-fuerte' },
      { valor: 'casi_nunca', texto: 'Casi nunca', icono: 'nube' },
      { valor: 'no_se', texto: 'No sé', icono: 'duda' },
    ] satisfies Opcion<HoraSol>[],
    ayudaNoSe: {
      titulo: 'No pasa nada, lo averiguamos',
      texto: 'Por ahora voy a suponer luz media. Cuando puedas, mirá ese lugar en tres momentos y fijate si le da el sol:',
      momentos: ['10 hs', '13 hs', '17 hs'],
      cierre: 'Después lo cambiás desde tu perfil.',
    },
  },
  mascotas: {
    titulo: '¿Hay mascotas en casa?',
    nota: 'Lo uso para no recomendarte nunca una planta que les haga mal. Lo podés cambiar cuando quieras.',
    opciones: [
      { valor: 'gato', texto: 'Gato(s)', icono: 'gato' },
      { valor: 'perro', texto: 'Perro(s)', icono: 'perro' },
      { valor: 'ambos', texto: 'Gatos y perros', icono: 'huella' },
      { valor: 'ninguna', texto: 'Ninguna', icono: 'no' },
    ] satisfies Opcion<TipoMascota>[],
  },
  muerde: {
    titulo: '¿Les da por morder o masticar plantas?',
    opciones: [
      { valor: 'siempre', texto: 'Sí, siempre', icono: 'alerta' },
      { valor: 'a_veces', texto: 'A veces', icono: 'mas-menos' },
      { valor: 'nunca', texto: 'Nunca lo hicieron', icono: 'ok' },
      { valor: 'no_se', texto: 'No sé', icono: 'duda' },
    ] satisfies Opcion<Muerde>[],
  },
  alcance: {
    titulo: '¿Pueden llegar a donde estarían las plantas?',
    opciones: [
      { valor: 'todo', texto: 'Sí, llegan a todo', icono: 'alerta' },
      { valor: 'bajo', texto: 'Solo a lo que está bajo', icono: 'abajo' },
      { valor: 'puedo_aislar', texto: 'Puedo ponerlas en altura o en un cuarto cerrado', icono: 'estante' },
    ] satisfies Opcion<Alcance>[],
  },
  tiempo: {
    titulo: '¿Cuánto tiempo les querés dedicar?',
    opciones: [
      { valor: 'casi_nada', texto: 'Casi nada', icono: 'reloj' },
      { valor: 'un_rato', texto: 'Un rato por semana', icono: 'calendario' },
      { valor: 'me_encanta', texto: 'Me encanta dedicarles tiempo', icono: 'corazon' },
    ] satisfies Opcion<Tiempo>[],
  },
  objetivo: {
    titulo: '¿Qué querés lograr?',
    opciones: [
      { valor: 'basico', texto: 'Entender lo básico', icono: 'semilla' },
      { valor: 'elegir', texto: 'Aprender a elegir y comprar plantas', icono: 'bolsa' },
      { valor: 'a_fondo', texto: 'Entender más a fondo cómo funcionan', icono: 'lupa' },
    ] satisfies Opcion<Objetivo>[],
  },
  resultado: {
    listo: 'Tu camino está listo',
    boton: 'Empezar a aprender',
    luz: {
      titulo: 'Tu luz',
      poca: 'Poca luz',
      media: 'Luz media',
      mucha: 'Mucha luz',
      asumida: 'Supuse luz media hasta que lo observes.',
    },
    mascotasActivas: 'Filtro de mascotas activado en todas las recomendaciones.',
    arrancaPor: 'Arrancás por',
  },
  continuar: 'Continuar',
  atras: 'Volver',
}

export const PERFILES: Record<Perfil, { nombre: string; bienvenida: string }> = {
  primerizo: {
    nombre: 'Primerizo',
    bienvenida: '¡Qué lindo arrancar de cero! Vamos paso a paso, sin apuro y sin palabras raras.',
  },
  sobreviviente: {
    nombre: 'Sobreviviente',
    bienvenida: 'No pasa nada, a todos se nos muere alguna. Arrancamos por luz y riego, que es donde suele estar el secreto.',
  },
  en_camino: {
    nombre: 'En camino',
    bienvenida: 'Ya tenés el ojo entrenado. Ahora vamos a entender el porqué de cada cosa.',
  },
  experimentado: {
    nombre: 'Experimentado',
    bienvenida: 'Se nota que sabés. Podés saltear lo básico con un test cortito e ir directo a lo que te interese.',
  },
}
