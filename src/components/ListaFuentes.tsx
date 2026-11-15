import { ExternalLink } from 'lucide-react'
import type { Fuente } from '../data/lessons'

/** Fuentes como filas tocables (nada de enlaces azules subrayados) */
export function ListaFuentes({ fuentes }: { fuentes: Fuente[] }) {
  return (
    <ul className="border-arena-osc m-0 list-none overflow-hidden rounded-2xl border-2 bg-white p-0">
      {fuentes.map((f) => (
        <li key={f.url} className="border-arena border-b-2 last:border-b-0">
          <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 px-3 py-2">
            <span className="flex-1">
              <span className="text-tinta block text-[14px] leading-tight font-extrabold">{f.titulo}</span>
              <span className="text-tinta-suave block text-[12px] font-bold">{f.org}</span>
            </span>
            <ExternalLink size={16} className="text-tinta-suave shrink-0" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  )
}
