import { Fragment } from 'react'

/**
 * Texto con **negrita** marcada en el contenido. Lo importante se ve con más peso y color;
 * el resto queda en un peso más liviano para que se note la diferencia.
 */
export function Rico({ texto }: { texto: string }) {
  return (
    <>
      {texto.split('**').map((parte, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-hoja-osc font-extrabold">
            {parte}
          </strong>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        ),
      )}
    </>
  )
}
