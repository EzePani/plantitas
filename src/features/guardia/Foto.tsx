import { Camera, Image } from 'lucide-react'
import { useState } from 'react'
import { T } from '../../data/textos'
import { TG } from '../../data/textosGuardia'
import { reducir } from '../../lib/fotos'
import { vibrar } from '../../lib/haptics'
import { ayuda, titulo } from './comunes'

const boton = 'border-arena-osc text-hoja-osc focus-within:border-hoja flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 bg-white px-3 text-center text-[15px] leading-tight font-extrabold'

/** La foto de un caso: se saca con la cámara o se elige de la galería. Entrega la foto ya achicada. */
export function Foto({ etiqueta, nombre, url, fallo, onFoto, onQuitar }: { etiqueta: string; nombre: string; url: string | null; fallo?: boolean; onFoto: (f: Blob) => void; onQuitar: () => void }) {
  const [noAbre, setNoAbre] = useState(false)
  const [cambiando, setCambiando] = useState(false)
  const elegir = async (input: HTMLInputElement) => {
    const archivo = input.files?.[0]
    // Se vacía para poder elegir otra vez la misma
    input.value = ''
    if (!archivo) return
    const foto = await reducir(archivo)
    setNoAbre(!foto)
    if (foto) {
      setCambiando(false)
      onFoto(foto)
    }
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
      {/* Siempre cuadrada y recortada al centro: se ve igual sea como sea la foto. El archivo queda entero */}
      {url && <img src={url} alt={TG.foto.de(nombre)} className="border-arena-osc aspect-square w-full rounded-3xl border-2 bg-white object-cover" />}
      {url && !cambiando ? (
        <button type="button" onClick={() => setCambiando(true)} className={boton}>
          <Camera size={20} className="shrink-0" aria-hidden />
          {TG.foto.cambiar}
        </button>
      ) : (
        <>
          {url && <p className="text-tinta m-0 text-center text-[15px] font-extrabold">{TG.foto.comoCambiar}</p>}
          <div className="grid grid-cols-2 gap-2">
            {entrada(TG.foto.sacar, Camera, true)}
            {entrada(TG.foto.galeria, Image, false)}
          </div>
        </>
      )}
      {(noAbre || fallo) && (
        <p role="alert" className="text-alerta m-0 text-[14px] leading-snug font-bold">
          {noAbre ? TG.foto.noAbre : TG.foto.noGuarda}
        </p>
      )}
      {url ? (
        <button
          type="button"
          onClick={cambiando ? () => setCambiando(false) : onQuitar}
          className={`min-h-11 self-center border-0 bg-transparent px-3 text-[14px] font-extrabold underline ${cambiando ? 'text-tinta-suave' : 'text-alerta'}`}
        >
          {cambiando ? T.comun.cancelar : TG.foto.quitar}
        </button>
      ) : (
        <p className={ayuda}>{TG.foto.aviso}</p>
      )}
    </section>
  )
}
