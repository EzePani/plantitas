import { Ilustracion } from '../../components/Ilustracion'
import { T } from '../../data/textos'

/** Recomendador "Armá tu espacio". Se construye en la fase 5. */
export function MiEspacio() {
  return (
    <div className="safe-top flex min-h-0 flex-1 flex-col">
      <header className="px-5 pt-4 pb-2">
        <h1 className="font-display text-hoja-osc m-0 text-[30px] font-semibold">{T.espacio.titulo}</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-10 text-center">
        <Ilustracion nombre="luz-indirecta" className="w-4/5 rounded-3xl" />
        <h2 className="font-display text-tinta mt-5 mb-0 text-[22px] font-semibold">{T.espacio.vacio}</h2>
        <p className="text-tinta-suave mt-2 text-[15px] leading-snug font-bold">{T.espacio.vacioTexto}</p>
      </div>
    </div>
  )
}
