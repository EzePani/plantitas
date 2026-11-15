import type { InsigniaId } from '../lib/gamificacion'

/** Nombres de los niveles, en el mismo orden que UMBRALES_NIVEL */
export const NIVELES = ['Semilla', 'Brote', 'Plantín', 'Planta', 'Jardín']

export const INSIGNIAS: Record<InsigniaId, { nombre: string; descripcion: string; icono: string }> = {
  'primera-leccion': { nombre: 'Primera lección', descripcion: 'Terminaste tu primera lección.', icono: 'semilla' },
  'racha-3': { nombre: 'Racha de 3 días', descripcion: 'Tres días seguidos aprendiendo.', icono: 'fuego' },
  'racha-7': { nombre: 'Una semana entera', descripcion: 'Siete días seguidos. ¡Constancia de jardinero!', icono: 'fuego' },
  'experto-riego': { nombre: 'Experto en riego', descripcion: 'Completaste todas las lecciones de Riego.', icono: 'gota' },
  'modulo-completo': { nombre: 'Módulo completo', descripcion: 'Terminaste una unidad entera.', icono: 'trofeo' },
  'puntaje-perfecto': { nombre: 'Sin errores', descripcion: 'Un quiz perfecto, de punta a punta.', icono: 'estrella' },
  'primer-cofre': { nombre: 'Primer cofre', descripcion: 'Abriste tu primer cofre.', icono: 'cofre' },
}
