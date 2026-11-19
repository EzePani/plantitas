/** Textos de la sincronización entre dispositivos (pantalla Perfil) */
export const TN = {
  titulo: 'Mis dispositivos',
  intro: 'Vinculá tu PC y tu celu para que el progreso sea el mismo en los dos.',
  correo: 'Tu correo',
  enviar: 'Enviar link a mi correo',
  enviado: 'Te mandé un correo. Tocá el link, o escribí acá el código de 6 números si viene en el mensaje.',
  codigo: 'Código del correo',
  entrar: 'Entrar con el código',
  nombreTitulo: 'Poné un nombre a este dispositivo',
  nombrePista: 'Por ejemplo: Celu o PC',
  vincular: 'Vincular este dispositivo',
  conectadoComo: 'Conectado como',
  este: 'Este dispositivo',
  ultima: 'Última sincronización',
  nunca: 'todavía no',
  sincronizar: 'Sincronizar ahora',
  sincronizando: 'Sincronizando…',
  quitar: 'Quitar',
  desvincular: 'Desvincular este dispositivo',
  salir: 'Cerrar sesión',
  ok: 'Todo al día.',
  errorGenerico: 'No se pudo sincronizar. Tu progreso sigue guardado en este dispositivo.',
} as const

/** Recuperar progreso desde la pantalla de bienvenida */
export const TR = {
  entrada: 'Ya usé Plantitas: recuperar mi progreso',
  titulo: 'Recuperar mi progreso',
  vincularTitulo: 'Con mi cuenta',
  vincularTexto: 'Si ya vinculaste otro dispositivo, entrá con tu correo y se baja todo.',
  textoTitulo: 'Con el texto copiado',
  textoPista: 'Pegá acá lo que copiaste con "Copiar mi progreso"',
  leer: 'Leer progreso',
  archivo: 'Elegir un archivo de backup',
  usar: 'Usar este progreso',
  descartar: 'Cancelar',
  resumen: (lecciones: number, xp: number, espacios: number) => `Trae ${lecciones} lecciones, ${xp} XP y ${espacios} espacios.`,
} as const
