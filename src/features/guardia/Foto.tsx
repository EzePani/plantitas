import { Camera, Image } from 'lucide-react'
import { useState } from 'react'
import { TG } from '../../data/textosGuardia'
import { reducir } from '../../lib/fotos'
import { vibrar } from '../../lib/haptics'
import { ayuda, titulo } from './comunes'

const boton = 'border-arena-osc text-hoja-osc focus-within:border-hoja flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 bg-white px-3 text-center text-[15px] leading-tight font-extrabold'

/** La foto de un caso: se saca con la cámara o se elige de la galería. Entrega la foto ya achicada. */
export function Foto({ etiqueta, nombre, url, fallo, onFoto, onQuitar }: { etiqueta: string; nombre: string; url: string | null; fallo?: boolean; onFoto: (f: Blob) => void; onQuitar: () => void }) {
  const [noAbre, setNoAbre] = useState(false)
  const elegir = async (input: HTMLInputElement) => {
    const archivo = input.files?.[0]
    // Se vacía para poder elegir otra vez la misma
    input.value = ''
    if (!archivo) return
    const foto = await reducir(archivo)
    setNoAbre(!foto)
    if (foto) onFoto(foto)
  }
  // Dos botones aparte: en varios celulares el selector común no ofrece la cámara
  const entrada = (texto: string, Icono: typeof Camera, camara: boolean) => (
    <label className={boton} onClick={() => vibrar('toque')}>
      <Icono size={20} className="shrink-0" aria-hidden />
      {texto}
      <input type="file" accept="image/*" capture={camara ? 'environment' : undefined} className="sr-only" onChange={(e) => void elegir(e.target)} />
    </label>
  )
  return (
    <section className="flex flex-col gap-2">
      <h2 className={titulo}>{etiqueta}</h2>
      {url && <img src={url} alt={TG.foto.de(nombre)} className="border-arena-osc max-h-72 w-full rounded-3xl border-2 bg-white object-contain" />}
      <div className="grid grid-cols-2 gap-2">
        {entrada(url ? TG.foto.otra : TG.foto.sacar, Camera, true)}
        {entrada(TG.foto.galeria, Image, false)}
      </div>
      {(noAbre || fallo) && (
        <p role="alert" className="text-alerta m-0 text-[14px] leading-snug font-bold">
          {noAbre ? TG.foto.noAbre : TG.foto.noGuarda}
        </p>
      )}
      {url ? (
        <button type="button" onClick={onQuitar} className="text-alerta min-h-11 self-center border-0 bg-transparent px-3 text-[14px] font-extrabold underline">
          {TG.foto.quitar}
        </button>
      ) : (
        <p className={ayuda}>{TG.foto.aviso}</p>
      )}
    </section>
  )
}
