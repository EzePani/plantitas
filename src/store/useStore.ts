import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { VERSION_DATOS, esquemaDatos, migrar } from '../lib/backup'
import { guardarCopia, sePierde } from '../lib/copias'
import { fusionar } from '../lib/fusion'
import { CLAVE_ESTADO, almacen, bloquear, novedad } from './disco'
import { agregarPlanta, moverPlanta, quitarPlanta } from '../lib/espacios'
import { hoyLocal } from '../lib/fecha'
import { MAX_CASOS, anotarControl, revisarCaso, anotarVisita, borrarVisita, sinVisitas, cerrarEl, corregirFecha, dentroDe, limitesDeIngresoNuevo, type FechaDeCaso } from '../lib/guardia'
import { avisarFotos, borrarFoto, borrarFotos } from '../lib/fotos'
import { MAX_HIJITOS, aplicarCorreccion, errorDeFechas, normalizar, type CorreccionHijito } from '../lib/hijitos'
import { ponerLuz } from '../lib/lugares'
import type { CategoriaLuz } from '../lib/luz'
import { ponerPlano } from '../lib/plano'
import { actualizarFallidas, leccionesHechas } from '../lib/refuerzo'
import {
  XP_COFRE,
  XP_REFUERZO,
  XP_REPASO,
  insigniasMerecidas,
  nivelPara,
  sumarARacha,
  xpDeLeccion,
  type InsigniaId,
} from '../lib/gamificacion'
import { asignarPerfil } from '../lib/perfil'
import type { Caso, CausaId, Control, DatosMascotas, DatosPersistidos, Espacio, Plano, Esfuerzo, Hijito, PerfilLuz, RespuestasGuardia, Respuestas, Tiempo, TipoEspacio, UnidadId, VisitaVivero } from '../lib/tipos'
import { LECCIONES_POR_UNIDAD } from '../data/lessons'

export const DATOS_INICIALES: DatosPersistidos = {
  onboardingCompleto: false,
  respuestas: null,
  perfil: null,
  mascotas: { tipo: 'ninguna' },
  completadas: {},
  salteadas: [],
  xp: 0,
  racha: { dias: 0, ultima: null },
  insignias: {},
  semillas: [],
  espacios: [],
  favoritas: [],
  colecciones: [],
  hijitos: [],
  casos: [],
  refuerzo: { ultimo: null, leccionesAlUltimo: 0, fallidas: [] },
}

export interface Resumen {
  xpGanada: number
  aciertos: number
  total: number
  insigniasNuevas: InsigniaId[]
  subioDeNivel: boolean
  rachaDias: number
}

/** Espacio cargado en el onboarding: tipo y luz. El resto arranca con valores razonables y se edita después. */
export interface EspacioInicial {
  tipo: TipoEspacio
  nombre: string
  luz: PerfilLuz
}

export const ESFUERZO_POR_TIEMPO: Record<Tiempo, Esfuerzo> = { casi_nada: 'poco', un_rato: 'medio', me_encanta: 'mucho' }

interface Acciones {
  completarOnboarding: (r: Respuestas, mascotas: DatosMascotas, espacios: EspacioInicial[]) => void
  actualizarMascotas: (m: DatosMascotas) => void
  /** Registra una lección o repaso terminado y devuelve el resumen para la celebración */
  completarNodo: (id: string, xpBase: number, aciertos: number, total: number) => Resumen
  abrirCofre: (u: UnidadId) => Resumen
  saltarUnidad: (u: UnidadId) => void
  guardarEspacio: (e: Espacio) => void
  borrarEspacio: (id: string) => void
  /** Anota una planta del catálogo en un espacio, opcionalmente en un lugar del plano. Se puede repetir. */
  agregarPlantaAEspacio: (espacioId: string, plantaId: string, lugar?: string | null) => void
  /** Saca del espacio una planta de ese tipo (de ese lugar, si se indica) */
  quitarPlantaDeEspacio: (espacioId: string, plantaId: string, lugar?: string | null) => void
  /** Cambia de lugar una planta ya anotada (null = sin ubicar) */
  moverPlantaEnEspacio: (espacioId: string, plantaId: string, desde: string | null, hacia: string | null) => void
  /** Guarda el plano de un espacio, o lo quita */
  guardarPlano: (espacioId: string, plano: Plano | undefined) => void
  /** Corrige la luz de un lugar del plano; con null vuelve a la estimada */
  corregirLuz: (espacioId: string, lugar: string, categoria: CategoriaLuz | null) => void
  alternarFavorita: (plantaId: string) => void
  /** Crea una colección vacía y devuelve su id (o null si el nombre está vacío o ya hay 20) */
  crearColeccion: (nombre: string) => string | null
  renombrarColeccion: (id: string, nombre: string) => void
  borrarColeccion: (id: string) => void
  /** Agrega la planta a la colección o la saca si ya estaba */
  alternarEnColeccion: (id: string, plantaId: string) => void
  /** Empieza a seguir un hijito desde hoy (o desde `inicio`). Devuelve false si el nombre está vacío o ya hay demasiados. */
  agregarHijito: (h: { plantaId: string | null; nombre: string; origen: Hijito['origen']; medio: Hijito['medio']; inicio?: string }) => boolean
  /** Anota que hoy se le cambió el agua, se le vieron raíces, pasó a maceta o (si es una separada) prendió */
  marcarHijito: (id: string, que: 'agua' | 'raices' | 'maceta' | 'prendio') => void
  /** Corrige a mano el tipo, dónde está y las fechas (null = todavía no pasó) */
  corregirHijito: (id: string, correccion: CorreccionHijito) => void
  borrarHijito: (id: string) => void
  /** Abre un caso en Guardia. Devuelve su id, o null si ya hay demasiados. */
  /** Sin fecha, ingresa hoy */
  ingresarCaso: (c: Omit<Caso, 'id' | 'ingreso' | 'controles' | 'cierre'> & { ingreso?: string }) => string | null
  /** Anota el control de hoy */
  controlarCaso: (id: string, control: Omit<Control, 'fecha'>) => void
  /** Nuevos síntomas y causas porque empeoró */
  revisarSintomas: (id: string, r: RespuestasGuardia, causas: CausaId[]) => void
  /** Alta o despedida; sin fecha, es hoy */
  cerrarCaso: (id: string, tipo: 'alta' | 'despedida', fecha?: string) => void
  corregirFechaCaso: (id: string, cual: FechaDeCaso, fecha: string) => void
  borrarCaso: (id: string) => void
  /** Sin id es una visita nueva */
  anotarVisitaCaso: (id: string, visita: Omit<VisitaVivero, 'id'> & { id?: string }) => void
  sinVisitasCaso: (id: string) => void
  borrarVisitaCaso: (id: string, visitaId: string) => void
  /** Anota en el caso la marca de su foto (null: ya no tiene) */
  marcarFotoCaso: (id: string, marca: string | null) => void
  /** Guarda qué preguntas de una lección se fallaron, para repetirlas en el refuerzo */
  anotarRespuestas: (falladas: string[], acertadas: string[]) => void
  completarRefuerzo: (aciertos: number, total: number, falladas: string[], acertadas: string[]) => Resumen
  /** "Ahora no": el refuerzo vuelve a aparecer más adelante */
  posponerRefuerzo: () => void
  /** Cambia todos los datos (sincronización o archivo). Si se pierde algo, antes guarda una copia */
  reemplazarDatos: (d: DatosPersistidos) => void
  /** Suma lo que haya en una copia, sin borrar nada de lo actual */
  recuperarCopia: (d: DatosPersistidos) => void
  reiniciar: () => void
}

export type Estado = DatosPersistidos & Acciones

const ctx = { leccionesPorUnidad: LECCIONES_POR_UNIDAD }

export function soloDatos(s: Estado): DatosPersistidos {
  return {
    onboardingCompleto: s.onboardingCompleto,
    respuestas: s.respuestas,
    perfil: s.perfil,
    mascotas: s.mascotas,
    completadas: s.completadas,
    salteadas: s.salteadas,
    xp: s.xp,
    racha: s.racha,
    insignias: s.insignias,
    semillas: s.semillas,
    espacios: s.espacios,
    favoritas: s.favoritas,
    colecciones: s.colecciones,
    hijitos: s.hijitos,
    casos: s.casos,
    refuerzo: s.refuerzo,
  }
}

function conInsignias(
  previas: Record<string, string>,
  progreso: Pick<DatosPersistidos, 'completadas' | 'racha' | 'semillas' | 'salteadas'>,
  hoy: string,
) {
  const nuevas = insigniasMerecidas(progreso, ctx).filter((i) => !previas[i])
  const insignias = { ...previas }
  for (const i of nuevas) insignias[i] = hoy
  return { insignias, nuevas }
}

let reemplazando = false
/**
 * Mientras se cambian todos los datos juntos (un archivo, una copia). Lo que falte después de eso no es
 * algo que la persona borró: la sincronización no lo quita de la base
 */
export const esReemplazo = () => reemplazando
function enBloque(hacer: () => void) {
  reemplazando = true
  try {
    hacer()
  } finally {
    reemplazando = false
  }
}

let refrescando = false
/** Mientras se lee lo que escribió otra ventana (no es un cambio hecho acá) */
export const estaRefrescando = () => refrescando

/** Pone esta ventana al día con lo guardado, por si escribió otra */
export function alDia(): void {
  const otro = novedad()
  if (!otro) return
  if (otro.version === VERSION_DATOS) {
    refrescando = true
    void useStore.persist.rehydrate()
    refrescando = false
    return
  }
  // Lo escribió una ventana con la app vieja, que puede no tener lo último: se suma, no se reemplaza
  const r = esquemaDatos.safeParse(migrar(otro.state, otro.version))
  if (r.success) useStore.setState(fusionar(soloDatos(useStore.getState()), r.data))
}

/** Cada acción parte de lo último guardado: si no, una ventana abierta de antes pisaría lo nuevo */
function alDiaAntes(estado: Estado): Estado {
  return Object.fromEntries(
    Object.entries(estado).map(([k, v]) => [
      k,
      typeof v === 'function'
        ? (...args: unknown[]) => {
            alDia()
            return (v as (...a: unknown[]) => unknown)(...args)
          }
        : v,
    ]),
  ) as unknown as Estado
}

export const useStore = create<Estado>()(
  persist(
    (set, get) => alDiaAntes({
      ...DATOS_INICIALES,

      completarOnboarding: (r, mascotas, espacios) =>
        set({
          onboardingCompleto: true,
          respuestas: r,
          mascotas,
          perfil: asignarPerfil(r.experiencia, r.aciertosTest),
          espacios: espacios.map((e, i) => ({
            id: `${e.tipo}-${Date.now().toString(36)}${i}`,
            nombre: e.nombre,
            creado: hoyLocal(),
            tipo: e.tipo,
            luz: e.luz,
            tamano: 'mediano',
            mascotas: mascotas.tipo,
            esfuerzo: ESFUERZO_POR_TIEMPO[r.tiempo],
            plantas: [],
          })),
        }),

      actualizarMascotas: (m) => set({ mascotas: m }),

      completarNodo: (id, xpBase, aciertos, total) => {
        const s = get()
        const hoy = hoyLocal()
        const yaHecha = Boolean(s.completadas[id])
        const esRepaso = id.startsWith('repaso-')
        // Repetir una lección ya hecha da solo la XP de los aciertos
        const base = yaHecha ? 0 : esRepaso ? XP_REPASO : xpBase
        const xpGanada = xpDeLeccion(base, aciertos)
        const previo = s.completadas[id]
        const mejor = previo && previo.aciertos > aciertos ? previo : { fecha: hoy, aciertos, total }
        const completadas = { ...s.completadas, [id]: mejor }
        const racha = sumarARacha(s.racha, hoy)
        const { insignias, nuevas } = conInsignias(s.insignias, { ...s, completadas, racha }, hoy)
        const xp = s.xp + xpGanada
        set({ completadas, racha, insignias, xp })
        return {
          xpGanada,
          aciertos,
          total,
          insigniasNuevas: nuevas,
          subioDeNivel: nivelPara(xp).indice > nivelPara(s.xp).indice,
          rachaDias: racha.dias,
        }
      },

      abrirCofre: (u) => {
        const s = get()
        const hoy = hoyLocal()
        if (s.semillas.includes(u)) {
          return { xpGanada: 0, aciertos: 0, total: 0, insigniasNuevas: [], subioDeNivel: false, rachaDias: s.racha.dias }
        }
        const semillas = [...s.semillas, u]
        const { insignias, nuevas } = conInsignias(s.insignias, { ...s, semillas }, hoy)
        const xp = s.xp + XP_COFRE
        set({ semillas, insignias, xp })
        return {
          xpGanada: XP_COFRE,
          aciertos: 0,
          total: 0,
          insigniasNuevas: nuevas,
          subioDeNivel: nivelPara(xp).indice > nivelPara(s.xp).indice,
          rachaDias: s.racha.dias,
        }
      },

      saltarUnidad: (u) => {
        const s = get()
        if (!s.salteadas.includes(u)) set({ salteadas: [...s.salteadas, u] })
      },

      // Si el espacio ya existe se actualiza en su lugar; si es nuevo va al final. Las plantas y el plano
      // no salen del formulario: valen los guardados, que pueden haber cambiado mientras estaba abierto
      guardarEspacio: (e) =>
        set((s) => ({
          espacios: s.espacios.some((x) => x.id === e.id)
            ? s.espacios.map((x) => (x.id === e.id ? { ...e, plantas: x.plantas, ...(x.plano && { plano: x.plano }) } : x))
            : [...s.espacios, e].slice(0, 50),
        })),
      borrarEspacio: (id) => set((s) => ({ espacios: s.espacios.filter((x) => x.id !== id) })),
      agregarPlantaAEspacio: (espacioId, plantaId, lugar) => {
        const id = `pl-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
        set((s) => ({ espacios: s.espacios.map((e) => (e.id === espacioId ? agregarPlanta(e, plantaId, id, lugar) : e)) }))
      },
      quitarPlantaDeEspacio: (espacioId, plantaId, lugar) => set((s) => ({ espacios: s.espacios.map((e) => (e.id === espacioId ? quitarPlanta(e, plantaId, lugar) : e)) })),
      moverPlantaEnEspacio: (espacioId, plantaId, desde, hacia) => set((s) => ({ espacios: s.espacios.map((e) => (e.id === espacioId ? moverPlanta(e, plantaId, desde, hacia) : e)) })),
      guardarPlano: (espacioId, plano) => set((s) => ({ espacios: s.espacios.map((e) => (e.id === espacioId ? ponerPlano(e, plano) : e)) })),
      corregirLuz: (espacioId, lugar, categoria) => set((s) => ({ espacios: s.espacios.map((e) => (e.id === espacioId ? ponerLuz(e, lugar, categoria) : e)) })),

      // Sin duplicados; las nuevas van primero
      alternarFavorita: (id) =>
        set((s) => ({ favoritas: s.favoritas.includes(id) ? s.favoritas.filter((x) => x !== id) : [id, ...s.favoritas].slice(0, 200) })),

      crearColeccion: (nombre) => {
        const n = nombre.trim().slice(0, 40)
        if (!n || get().colecciones.length >= 20) return null
        const id = `col-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
        set((s) => ({ colecciones: [...s.colecciones, { id, nombre: n, plantas: [] }] }))
        return id
      },
      renombrarColeccion: (id, nombre) => {
        const n = nombre.trim().slice(0, 40)
        if (n) set((s) => ({ colecciones: s.colecciones.map((c) => (c.id === id ? { ...c, nombre: n } : c)) }))
      },
      borrarColeccion: (id) => set((s) => ({ colecciones: s.colecciones.filter((c) => c.id !== id) })),
      alternarEnColeccion: (id, plantaId) =>
        set((s) => ({
          colecciones: s.colecciones.map((c) =>
            c.id !== id ? c : { ...c, plantas: c.plantas.includes(plantaId) ? c.plantas.filter((x) => x !== plantaId) : [plantaId, ...c.plantas].slice(0, 200) },
          ),
        })),

      agregarHijito: ({ plantaId, nombre, origen, medio, inicio }) => {
        const n = nombre.trim().slice(0, 40)
        if (!n || get().hijitos.length >= MAX_HIJITOS) return false
        const hoy = hoyLocal()
        const dia = inicio && !errorDeFechas({ inicio, raices: null, maceta: null, prendio: null }, hoy) ? inicio : hoy
        const id = `hij-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
        const nuevo = normalizar<Hijito>({ id, plantaId, nombre: n, origen, medio, inicio: dia, agua: dia, raices: null, maceta: null, prendio: null })
        set((s) => ({ hijitos: [nuevo, ...s.hijitos] }))
        return true
      },
      marcarHijito: (id, que) => set((s) => ({ hijitos: s.hijitos.map((h) => (h.id === id ? { ...h, [que]: hoyLocal() } : h)) })),
      corregirHijito: (id, correccion) => set((s) => ({ hijitos: s.hijitos.map((h) => (h.id === id ? aplicarCorreccion(h, correccion, hoyLocal()) : h)) })),
      borrarHijito: (id) => set((s) => ({ hijitos: s.hijitos.filter((h) => h.id !== id) })),

      ingresarCaso: (c) => {
        if (get().casos.length >= MAX_CASOS) return null
        const id = `caso-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
        const hoy = hoyLocal()
        const ingreso = c.ingreso && dentroDe(c.ingreso, limitesDeIngresoNuevo(hoy)) ? c.ingreso : hoy
        set((s) => ({ casos: [{ ...c, notas: c.notas.trim(), id, ingreso, controles: [] }, ...s.casos] }))
        return id
      },
      controlarCaso: (id, control) => set((s) => ({ casos: s.casos.map((c) => (c.id === id ? anotarControl(c, { ...control, fecha: hoyLocal() }) : c)) })),
      revisarSintomas: (id, r, causas) => set((s) => ({ casos: s.casos.map((c) => (c.id === id ? revisarCaso(c, r, causas, hoyLocal()) : c)) })),
      cerrarCaso: (id, tipo, fecha) => set((s) => ({ casos: s.casos.map((c) => (c.id === id ? cerrarEl(c, tipo, fecha ?? hoyLocal(), hoyLocal()) : c)) })),
      corregirFechaCaso: (id, cual, fecha) => set((s) => ({ casos: s.casos.map((c) => (c.id === id ? corregirFecha(c, cual, fecha, hoyLocal()) : c)) })),
      anotarVisitaCaso: (id, visita) => {
        const visitaId = visita.id ?? `visita-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
        set((s) => ({ casos: s.casos.map((c) => (c.id === id ? anotarVisita(c, { ...visita, id: visitaId }, hoyLocal()) : c)) }))
      },
      sinVisitasCaso: (id) => set((s) => ({ casos: s.casos.map((c) => (c.id === id ? sinVisitas(c) : c)) })),
      borrarVisitaCaso: (id, visitaId) => set((s) => ({ casos: s.casos.map((c) => (c.id === id ? borrarVisita(c, visitaId) : c)) })),
      marcarFotoCaso: (id, marca) =>
        set((s) => {
          const caso = s.casos.find((c) => c.id === id)
          if (!caso || (caso.foto ?? null) === marca) return s
          const { foto: _antes, ...resto } = caso
          return { casos: s.casos.map((c) => (c.id === id ? { ...resto, ...(marca && { foto: marca }) } : c)) }
        }),
      borrarCaso: (id) => {
        set((s) => ({ casos: s.casos.filter((c) => c.id !== id) }))
        void borrarFoto(id)
      },

      anotarRespuestas: (falladas, acertadas) => set((s) => ({ refuerzo: { ...s.refuerzo, fallidas: actualizarFallidas(s.refuerzo.fallidas, falladas, acertadas) } })),

      completarRefuerzo: (aciertos, total, falladas, acertadas) => {
        const s = get()
        const hoy = hoyLocal()
        const xpGanada = xpDeLeccion(XP_REFUERZO, aciertos)
        const racha = sumarARacha(s.racha, hoy)
        const { insignias, nuevas } = conInsignias(s.insignias, { ...s, racha }, hoy)
        const xp = s.xp + xpGanada
        set({
          xp,
          racha,
          insignias,
          refuerzo: { ultimo: hoy, leccionesAlUltimo: leccionesHechas(s.completadas).length, fallidas: actualizarFallidas(s.refuerzo.fallidas, falladas, acertadas) },
        })
        return { xpGanada, aciertos, total, insigniasNuevas: nuevas, subioDeNivel: nivelPara(xp).indice > nivelPara(s.xp).indice, rachaDias: racha.dias }
      },
      posponerRefuerzo: () => set((s) => ({ refuerzo: { ...s.refuerzo, ultimo: hoyLocal(), leccionesAlUltimo: leccionesHechas(s.completadas).length } })),

      reemplazarDatos: (d) => {
        const antes = soloDatos(get())
        if (sePierde(antes, d)) guardarCopia(antes, VERSION_DATOS, 'reemplazo')
        enBloque(() => set({ ...d }))
      },
      recuperarCopia: (d) => enBloque(() => set(fusionar(soloDatos(get()), d))),
      reiniciar: () => {
        enBloque(() => set({ ...DATOS_INICIALES }))
        void borrarFotos()
      },
    }),
    {
      name: CLAVE_ESTADO,
      storage: createJSONStorage(() => almacen(window.localStorage)),
      version: VERSION_DATOS,
      partialize: (s) => soloDatos(s),
      // Un estado guardado con un formato viejo pasa por las mismas migraciones que un backup
      migrate: (guardado, version) => {
        // Antes de pasar a otro formato queda una copia de lo que había
        guardarCopia(guardado, version, 'actualizacion')
        const r = esquemaDatos.safeParse(migrar(guardado, version))
        if (r.success) return r.data
        // Nunca se pisa lo que no se entiende: queda como está y la app avisa
        bloquear('ilegible')
        return DATOS_INICIALES
      },
    },
  ),
)

avisarFotos((id, marca) => useStore.getState().marcarFotoCaso(id, marca))

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', (e) => e.key === CLAVE_ESTADO && alDia())
  window.addEventListener('pageshow', alDia)
  window.addEventListener('focus', alDia)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && alDia())
}
