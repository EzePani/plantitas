import { Ilustracion } from '../../components/Ilustracion'
import { T } from '../../data/textos'

/** Catálogo de plantas. Se completa en la fase de contenido verificado. */
export function Plantas() {
  return (
    <div className="safe-top flex min-h-0 flex-1 flex-col">
      <header className="px-5 pt-4 pb-2">
        <h1 className="font-display text-hoja-osc m-0 text-[30px] font-semibold">{T.plantas.titulo}</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-10 text-center">
        <Ilustracion nombre="gato" className="w-4/5 rounded-3xl" />
        <h2 className="font-display text-tinta mt-5 mb-0 text-[22px] font-semibold">{T.plantas.vacio}</h2>
        <p className="text-tinta-suave mt-2 text-[15px] leading-snug font-bold">{T.plantas.vacioTexto}</p>
        <div className="mt-4 flex w-full flex-col gap-2" aria-hidden>
          <div className="skeleton h-14 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
      </div>
    </div>
  )
}
