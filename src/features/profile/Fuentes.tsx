import { ListaFuentes } from '../../components/ListaFuentes'
import type { Fuente, Leccion } from '../../data/lessons'
import { useContenido } from '../../lib/useContenido'
import { PELIGROSAS, PLANTAS } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'

/** Todas las fuentes citadas en lecciones, catálogo y advertencias, sin repetir, agrupadas por organización */
export function todasLasFuentes(lecciones: Leccion[]): Map<string, Fuente[]> {
  const vistas = new Set<string>()
  const porOrg = new Map<string, Fuente[]>()
  const todas: Fuente[] = [
    ...lecciones.flatMap((l) => l.fuentes),
    ...PLANTAS.flatMap((p) => [...p.fuentes, ...p.mascotas.fuentes_toxicidad]),
    ...PELIGROSAS.flatMap((p) => p.fuentes),
  ]
  for (const f of todas) {
    if (vistas.has(f.url)) continue
    vistas.add(f.url)
    porOrg.set(f.org, [...(porOrg.get(f.org) ?? []), f])
  }
  return new Map([...porOrg].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])))
}

export function Fuentes() {
  const contenido = useContenido()
  const grupos = todasLasFuentes(contenido ? Object.values(contenido.LECCIONES).flat() : [])
  const total = [...grupos.values()].reduce((n, g) => n + g.length, 0)
  return (
    <div className="px-5 pb-8">
      <p className="text-tinta mt-0 mb-1 text-[15px] leading-snug font-bold">{TC.fuentes.texto}</p>
      <p className="text-tinta-suave mt-0 mb-4 text-[13px] font-extrabold">{TC.fuentes.cuenta(total)}</p>
      {[...grupos].map(([org, fuentes]) => (
        <section key={org} className="mb-5">
          <h2 className="font-display text-tinta mt-0 mb-2 text-[18px] font-semibold">{org}</h2>
          <ListaFuentes fuentes={fuentes} />
        </section>
      ))}
    </div>
  )
}

export function Creditos() {
  const C = TC.creditos
  const conFoto = PLANTAS.filter((p) => p.imagen && p.atribucion_imagen)
  return (
    <div className="px-5 pb-8">
      <h2 className="font-display text-tinta mt-0 mb-1 text-[18px] font-semibold">{C.fotos}</h2>
      <p className="text-tinta-suave mt-0 mb-3 text-[14px] leading-snug font-bold">{conFoto.length ? C.fotosTexto : C.sinFotos}</p>
      {conFoto.length > 0 && (
        <ul className="border-arena-osc m-0 mb-5 list-none overflow-hidden rounded-2xl border-2 bg-white p-0">
          {conFoto.map((p) => (
            <li key={p.id} className="border-arena border-b-2 last:border-b-0">
              <a href={p.atribucion_imagen!.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2">
                <span className="text-tinta block text-[14px] font-extrabold">{p.nombre_comun}</span>
                <span className="text-tinta-suave block text-[12px] font-bold">
                  {p.atribucion_imagen!.autor} · {p.atribucion_imagen!.licencia}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <h2 className="font-display text-tinta mt-0 mb-1 text-[18px] font-semibold">{C.otros}</h2>
      {[C.ilustraciones, C.iconos, C.tipografias].map((t) => (
        <p key={t} className="text-tinta mt-0 mb-1 text-[14px] leading-snug font-bold">
          {t}
        </p>
      ))}
    </div>
  )
}
