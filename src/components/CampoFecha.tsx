/** Selector de fecha nativo del celular, entre `min` y `max` (AAAA-MM-DD) */
export function CampoFecha({ etiqueta, valor, onCambio, min, max }: { etiqueta: string; valor: string; onCambio: (f: string) => void; min?: string; max: string }) {
  return (
    <input
      type="date"
      aria-label={etiqueta}
      value={valor}
      min={min}
      max={max}
      onChange={(e) => onCambio(e.target.value)}
      className="border-arena-osc text-tinta focus:border-hoja block min-h-12 w-full min-w-0 appearance-none rounded-full border-2 bg-white px-4 text-left text-[16px] font-bold outline-none"
    />
  )
}
