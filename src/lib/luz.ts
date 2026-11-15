import type { HoraSol } from './tipos'

export type Orientacion = 'norte' | 'este' | 'oeste' | 'sur' | 'desconocida'
export type NivelLuz = 'poca' | 'media' | 'mucha'

export interface LuzDeducida {
  orientacion: Orientacion
  luz: NivelLuz
  /** true cuando no hubo dato y se asumió un valor conservador */
  asumida: boolean
}

/**
 * Deduce orientación aproximada y nivel de luz a partir de la hora en que da el sol.
 * Lógica para Buenos Aires (hemisferio sur): el sol recorre el cielo por el NORTE.
 * Nunca se le pregunta la orientación al usuario.
 */
export function deducirLuz(hora: HoraSol): LuzDeducida {
  switch (hora) {
    case 'manana':
      return { orientacion: 'este', luz: 'media', asumida: false }
    case 'tarde':
      return { orientacion: 'oeste', luz: 'mucha', asumida: false }
    case 'mediodia':
    case 'todo_el_dia':
      return { orientacion: 'norte', luz: 'mucha', asumida: false }
    case 'casi_nunca':
      return { orientacion: 'sur', luz: 'poca', asumida: false }
    case 'no_se':
      return { orientacion: 'desconocida', luz: 'media', asumida: true }
  }
}
