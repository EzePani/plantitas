import { T } from '../data/textos'
import type { Bloqueo } from '../store/disco'
import { Boton } from './Boton'

/** Cuando seguir usando esta ventana podría destruir datos */
export function Bloqueada({ motivo }: { motivo: Exclude<Bloqueo, null> }) {
  return (
    <div className="marco">
      <div role="alert" className="flex flex-1 flex-col justify-center gap-3 px-7 text-center">
        <h1 className="font-display text-hoja-osc m-0 text-[26px] leading-tight font-semibold">{T.bloqueo.titulo}</h1>
        <p className="text-tinta m-0 text-[16px] leading-snug font-bold">{T.bloqueo[motivo]}</p>
        <Boton onClick={() => location.reload()}>{T.bloqueo.boton}</Boton>
      </div>
    </div>
  )
}
