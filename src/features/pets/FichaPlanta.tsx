import { Droplet, Flame, Home, Info, Layers, Scissors, Shapes, Sprout, Sun, TrendingUp, TriangleAlert, Wind } from 'lucide-react'
import type { ReactNode } from 'react'
import { Carrusel } from '../../components/Carrusel'
import { ListaFuentes } from '../../components/ListaFuentes'
import type { Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { rangoMeses } from '../../lib/catalogo'
import { BotonFavorita, CalceEspacios } from './Favorita'
import { BotonCompartirPlanta, GuardarEnColeccion } from './Lista'
import { Semaforo } from './Semaforo'

const P = TC.plantas
const F = P.ficha

function Dato({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <div className="border-arena flex gap-3 border-b-2 px-3 py-3 last:border-b-0">
      <span className="text-hoja-osc mt-0.5 shrink-0">{icono}</span>
      <div>
        <div className="text-tinta-suave text-[12px] font-extrabold tracking-wide uppercase">{titulo}</div>
        <div className="text-tinta text-[15px] leading-snug font-bold">{children}</div>
      </div>
    </div>
  )
}

export function FichaPlanta({ planta: p }: { planta: Planta }) {
  const m = p.mascotas
  const algunaToxica = m.toxicidad_gato === 'toxica' || m.toxicidad_perro === 'toxica'
  const algunaSinVerificar = m.toxicidad_gato === 'no_verificada' || m.toxicidad_perro === 'no_verificada'
  const c = p.cultivo
  const mesesPoda = rangoMeses(c.poda.meses)
  const mesesHijitos = rangoMeses(c.propagacion.meses)
  const fuentes = [...p.fuentes, ...m.fuentes_toxicidad, ...c.fuentes].filter((f, i, todas) => todas.findIndex((x) => x.url === f.url) === i)
  return (
    <article className="pb-8">
      <Carrusel planta={p} className="mx-5" />
      <div className="px-5 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-hoja-osc m-0 text-[30px] leading-tight font-semibold">{p.nombre_comun}</h2>
            <p className="text-tinta-suave m-0 text-[15px] font-bold italic">{p.nombre_cientifico}</p>
          </div>
          <div className="-mr-2 flex shrink-0">
            <BotonCompartirPlanta planta={p} />
            <GuardarEnColeccion planta={p} />
            <BotonFavorita planta={p} />
          </div>
        </div>
        {p.otros_nombres.length > 0 && <p className="text-tinta-suave m-0 text-[13px] font-bold">{p.otros_nombres.join(' · ')}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {[...p.clases.map((x) => P.clase[x]), ...c.porte.map((x) => P.porte[x]), P.dificultad[p.dificultad], P.tamano[p.tamano]].map((t) => (
            <span key={t} className="bg-arena text-tinta rounded-full px-3 py-1 text-[13px] font-extrabold">
              {t}
            </span>
          ))}
        </div>
        <p className="bg-brote text-hoja-osc mt-4 mb-0 rounded-2xl p-3 text-[16px] leading-snug font-extrabold">{p.tip}</p>

        <h3 className="font-display text-tinta mt-6 mb-2 text-[20px] font-semibold">{P.favoritas.calce.titulo}</h3>
        <div className="border-arena-osc rounded-2xl border-2 bg-white p-3">
          <CalceEspacios planta={p} />
          <p className="text-tinta-suave mt-2 mb-0 text-[12px] leading-snug font-bold">{P.favoritas.calce.estimacion}</p>
        </div>

        <h3 className="font-display text-tinta mt-6 mb-2 text-[20px] font-semibold">{F.mascotas}</h3>
        {m.advertencia_grave && (
          <div className="bg-alerta mb-3 flex gap-3 rounded-2xl p-4 text-white" role="alert">
            <TriangleAlert className="shrink-0" aria-hidden />
            <p className="m-0 text-[15px] leading-snug font-extrabold">{m.advertencia_grave}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Semaforo planta={p} especie="gato" />
          <Semaforo planta={p} especie="perro" />
        </div>
        <div className="border-arena-osc mt-3 rounded-2xl border-2 bg-white">
          {algunaToxica && m.gravedad && <Dato icono={<TriangleAlert size={20} aria-hidden />} titulo={P.gravedad[m.gravedad]}>{m.sintomas}</Dato>}
          {algunaToxica && m.partes && <Dato icono={<Layers size={20} aria-hidden />} titulo={F.partes}>{m.partes}</Dato>}
          {algunaSinVerificar && <Dato icono={<Info size={20} aria-hidden />} titulo={P.estado.no_verificada}>{F.noVerificada}</Dato>}
          <Dato icono={<Info size={20} aria-hidden />} titulo={F.mascotas}>
            {m.nota_mascotas}
            {m.atractivo_para_mascotas !== 'desconocido' && (
              <span className="text-tinta-suave mt-1 block text-[14px]">
                {F.atractivo[m.atractivo_para_mascotas]} {m.atractivo_motivo}
              </span>
            )}
            {m.repelencia_por_olor !== 'ninguna' && <span className="text-tinta-suave mt-1 block text-[14px]">{F.repelencia[m.repelencia_por_olor]}</span>}
            {m.confianza === 'baja' && <span className="mt-1 block text-[14px] text-[#7a5200]">{F.confianzaBaja}</span>}
          </Dato>
        </div>

        <h3 className="font-display text-tinta mt-6 mb-2 text-[20px] font-semibold">{F.cuidados}</h3>
        <div className="border-arena-osc rounded-2xl border-2 bg-white">
          <Dato icono={<Sun size={20} aria-hidden />} titulo={`${F.luz} · ${TC.luz.categorias[p.luz_requerida]}`}>
            {p.luz.detalle}
            {p.luz_tolerada.length > 0 && (
              <span className="text-tinta-suave mt-1 block text-[14px]">
                {F.tambienTolera}: {p.luz_tolerada.map((c) => TC.luz.categorias[c].toLowerCase()).join(', ')}.
              </span>
            )}
          </Dato>
          <Dato icono={<Sun size={20} aria-hidden />} titulo={F.solDirecto}>
            {p.horas_sol_directo === 0 ? F.sinSolDirecto : p.horas_sol_directo >= 6 ? F.plenoSol : F.horasSol(p.horas_sol_directo)} {p.horas_sol_directo > 0 && F.solTarde[p.tolera_sol_tarde ? 'si' : 'no']}
            {p.luz.confianza_sol === 'baja' && <span className="mt-1 block text-[14px] text-[#7a5200]">{F.solEstimado}</span>}
          </Dato>
          <Dato icono={<Flame size={20} aria-hidden />} titulo={F.calor}>
            {F.sensibilidad[p.sensibilidad_calor]}
            {p.luz.confianza_sol === 'baja' && <span className="mt-1 block text-[14px] text-[#7a5200]">{F.solEstimado}</span>}
          </Dato>
          <Dato icono={<Droplet size={20} aria-hidden />} titulo={F.riegoVerano}>{p.riego.verano}</Dato>
          <Dato icono={<Droplet size={20} aria-hidden />} titulo={F.riegoInvierno}>{p.riego.invierno}</Dato>
          <Dato icono={<Wind size={20} aria-hidden />} titulo={`${F.humedad} · ${P.humedad[p.humedad.nivel]}`}>{p.humedad.detalle}{p.humedad.confianza === 'baja' && <span className="mt-1 block text-[14px] text-[#7a5200]">{F.confianzaBaja}</span>}</Dato>
          <Dato icono={<Layers size={20} aria-hidden />} titulo={F.sustrato}>{p.sustrato.tipo}</Dato>
          <Dato icono={<Home size={20} aria-hidden />} titulo={F.lugar}>
            {[p.apta.interior && F.interior, p.apta.balcon && F.balcon].filter(Boolean).join(' y ')}
            {p.apta.nota_balcon && <span className="text-tinta-suave block text-[14px]">{p.apta.nota_balcon}</span>}
          </Dato>
          <Dato icono={<Info size={20} aria-hidden />} titulo={F.aguante}>
            <span className="flex gap-1" role="img" aria-label={`${p.tolerancia_descuido} de 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`h-2.5 w-7 rounded-full ${n <= p.tolerancia_descuido ? 'bg-hoja' : 'bg-arena-osc'}`} />
              ))}
            </span>
          </Dato>
        </div>
        <p className="text-tinta-suave mt-2 mb-0 text-[13px] font-bold">
          {F.confianza[p.confianza]}
          {p.confianza === 'baja' && ` · ${F.confianzaBaja}`}
          {p.adaptaciones.length > 0 && ` · ${F.adaptado}`}
        </p>
        {p.discrepancias.length > 0 && (
          <div className="bg-sol-claro mt-3 rounded-2xl p-3">
            <div className="text-tinta text-[13px] font-extrabold uppercase">{F.discrepancias}</div>
            {p.discrepancias.map((d) => (
              <p key={d} className="text-tinta m-0 mt-1 text-[14px] leading-snug font-bold">
                {d}
              </p>
            ))}
          </div>
        )}

        <h3 className="font-display text-tinta mt-6 mb-2 text-[20px] font-semibold">{F.crecimiento}</h3>
        <div className="border-arena-osc rounded-2xl border-2 bg-white">
          <Dato icono={<Shapes size={20} aria-hidden />} titulo={`${F.porte} · ${c.porte.map((x) => P.porte[x]).join(' y ')}`}>
            {c.porte.map((x) => F.porteDetalle[x]).join(' ')}
          </Dato>
          <Dato icono={<TrendingUp size={20} aria-hidden />} titulo={F.tutor}>
            {F.tutorNivel[c.tutor.recomendado]}
            {c.tutor.detalle && <span className="text-tinta-suave mt-1 block text-[14px]">{c.tutor.detalle}</span>}
          </Dato>
          <Dato icono={<Scissors size={20} aria-hidden />} titulo={F.poda}>
            {mesesPoda && <span className="block">{F.podaEpoca(mesesPoda)}</span>}
            <span className={mesesPoda ? 'text-tinta-suave mt-1 block text-[14px]' : 'block'}>{c.poda.detalle}</span>
          </Dato>
          <Dato icono={<Sprout size={20} aria-hidden />} titulo={F.hijitos}>
            {c.propagacion.metodos.length > 0 ? (
              <span className="mb-1 flex flex-wrap gap-1.5">
                {c.propagacion.metodos.map((x) => (
                  <span key={x} className="bg-brote text-hoja-osc rounded-full px-2.5 py-0.5 text-[13px] font-extrabold">
                    {F.metodo[x]}
                  </span>
                ))}
              </span>
            ) : (
              <span className="block">{F.sinMetodo}</span>
            )}
            {mesesHijitos && <span className="block">{F.hijitosEpoca(mesesHijitos)}</span>}
            <span className="text-tinta-suave mt-1 block text-[14px]">{c.propagacion.detalle}</span>
            {c.confianza === 'baja' && <span className="mt-1 block text-[14px] text-[#7a5200]">{F.confianzaBaja}</span>}
          </Dato>
        </div>
        {c.adaptaciones.length > 0 && <p className="text-tinta-suave mt-2 mb-0 text-[13px] font-bold">{F.adaptado}</p>}

        <h3 className="font-display text-tinta mt-6 mb-2 text-[20px] font-semibold">{F.fuentes}</h3>
        <ListaFuentes fuentes={fuentes} />
        <p className="text-tinta-suave mt-4 mb-0 text-[13px] leading-snug font-bold">{F.disclaimer}</p>
      </div>
    </article>
  )
}
