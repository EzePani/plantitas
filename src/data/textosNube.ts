/** Textos de la sincronización entre dispositivos (pantalla Perfil) */
export const TN = {
  titulo: 'Mis dispositivos',
  intro: 'Usá tu correo para tener el mismo progreso en el celu y en la compu.',
  correo: 'Tu correo',
  enviar: 'Mandame el código',
  enviando: 'Enviando…',
  enviado: 'Te mandé un correo a',
  enviadoAyuda: 'Escribí el código de 6 números, o tocá el link del correo.',
  codigo: 'Código de 6 números',
  entrar: 'Entrar',
  verificando: 'Entrando…',
  reenviar: 'Reenviar código',
  reenviarEn: (s: number) => `Reenviar en ${s} s`,
  cambiarCorreo: 'Cambiar correo',
  vinculando: 'Conectando este dispositivo…',
  reintentar: 'Reintentar',
  sesionVencida: 'Tu sesión venció. Entrá de nuevo con tu correo.',
  privacidad: 'Solo lo usamos para sincronizar tu progreso.',
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

/** Paso de cuenta en el onboarding y aviso en la pantalla principal */
export const TCU = {
  titulo: '¿Guardamos tu progreso?',
  texto: 'Usá tu correo para tener el mismo progreso en el celu y en la compu.',
  saltar: 'Ahora no, seguir',
  avisoTitulo: 'Guardá tu progreso',
  avisoTexto: 'Usalo igual en el celu y en la compu.',
  avisoBoton: 'Conectar mi correo',
  avisoCerrar: 'Cerrar aviso',
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
