import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { VERSION_DATOS, esquemaDatos, migrar } from '../lib/backup'
import { hoyLocal } from '../lib/fecha'
import {
  XP_COFRE,
  XP_REPASO,
  insigniasMerecidas,
  nivelPara,
  sumarARacha,
  xpDeLeccion,
  type InsigniaId,
} from '../lib/gamificacion'
import { asignarPerfil } from '../lib/perfil'
import type { DatosMascotas, DatosPersistidos, Espacio, Esfuerzo, PerfilLuz, Respuestas, Tiempo, TipoEspacio, UnidadId } from '../lib/tipos'
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
  alternarFavorita: (plantaId: string) => void
  reemplazarDatos: (d: DatosPersistidos) => void
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

export const useStore = create<Estado>()(
  persist(
    (set, get) => ({
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

      // Si el espacio ya existe se actualiza en su lugar; si es nuevo va al final
      guardarEspacio: (e) => set((s) => ({ espacios: s.espacios.some((x) => x.id === e.id) ? s.espacios.map((x) => (x.id === e.id ? e : x)) : [...s.espacios, e].slice(0, 50) })),
      borrarEspacio: (id) => set((s) => ({ espacios: s.espacios.filter((x) => x.id !== id) })),

      // Sin duplicados; las nuevas van primero
      alternarFavorita: (id) =>
        set((s) => ({ favoritas: s.favoritas.includes(id) ? s.favoritas.filter((x) => x !== id) : [id, ...s.favoritas].slice(0, 200) })),

      reemplazarDatos: (d) => set({ ...d }),
      reiniciar: () => set({ ...DATOS_INICIALES }),
    }),
    {
      name: 'plantitas-estado',
      version: VERSION_DATOS,
      partialize: (s) => soloDatos(s),
      // Un estado guardado con un formato viejo pasa por las mismas migraciones que un backup
      migrate: (guardado, version) => {
        const r = esquemaDatos.safeParse(migrar(guardado, version))
        return r.success ? r.data : DATOS_INICIALES
      },
    },
  ),
)
