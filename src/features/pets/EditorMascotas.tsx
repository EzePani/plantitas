import { useState } from 'react'
import { Boton } from '../../components/Boton'
import { OpcionGrande } from '../../components/OpcionGrande'
import { ONBOARDING as O } from '../../data/onboarding'
import { T } from '../../data/textos'
import type { DatosMascotas } from '../../lib/tipos'

/** Formulario de mascotas reutilizable (perfil hoy, recomendador después) */
export function EditorMascotas({ inicial, onGuardar }: { inicial: DatosMascotas; onGuardar: (m: DatosMascotas) => void }) {
  const [m, setM] = useState<DatosMascotas>(inicial)
  const hay = m.tipo !== 'ninguna'
  const completo = !hay || (m.muerde && m.alcance)
  return (
    <div className="scroll-app max-h-[70dvh]">
      <h2 className="font-display text-tinta mt-0 mb-3 text-[22px] font-semibold">{O.mascotas.titulo}</h2>
      <div className="grid grid-cols-2 gap-2">
        {O.mascotas.opciones.map((o) => (
          <OpcionGrande key={o.valor} compacta icono={o.icono} texto={o.texto} elegida={m.tipo === o.valor} onClick={() => setM(o.valor === 'ninguna' ? { tipo: 'ninguna' } : { ...m, tipo: o.valor })} />
        ))}
      </div>
      {hay && (
        <>
          <h3 className="text-tinta mt-4 mb-2 text-[15px] font-extrabold">{O.muerde.titulo}</h3>
          <div className="grid grid-cols-2 gap-2">
            {O.muerde.opciones.map((o) => (
              <OpcionGrande key={o.valor} compacta texto={o.texto} elegida={m.muerde === o.valor} onClick={() => setM({ ...m, muerde: o.valor })} />
            ))}
          </div>
          <h3 className="text-tinta mt-4 mb-2 text-[15px] font-extrabold">{O.alcance.titulo}</h3>
          <div className="flex flex-col gap-2">
            {O.alcance.opciones.map((o) => (
              <OpcionGrande key={o.valor} compacta texto={o.texto} elegida={m.alcance === o.valor} onClick={() => setM({ ...m, alcance: o.valor })} />
            ))}
          </div>
        </>
      )}
      <div className="pt-5 pb-2">
        <Boton disabled={!completo} onClick={() => onGuardar(m)}>
          {T.perfil.guardar}
        </Boton>
      </div>
    </div>
  )
}
