import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Boton } from '../../components/Boton'
import { TN } from '../../data/textosNube'
import { cerrarSesion, correoValido, enviarLink, entrarConCodigo, iniciar, leerEstado, listarDispositivos, nombreDispositivo, quitarDispositivo, sincronizar, suscribir, vincular, type Dispositivo } from '../../lib/nube'

const campo = 'border-arena-osc text-tinta min-h-12 w-full rounded-2xl border-2 bg-white px-4 text-[16px] font-bold'
const ESPERA = 30

const cuando = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : TN.nunca)

/** Entrar con correo (código o link) y vincular este dispositivo solo. `onListo` avisa cuando ya quedó conectado. */
export function Nube({ compacto = false, onListo }: { compacto?: boolean; onListo?: () => void }) {
  const e = useSyncExternalStore(suscribir, leerEstado)
  const [correo, setCorreo] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [espera, setEspera] = useState(0)
  const [vinculando, setVinculando] = useState(false)
  const [lista, setLista] = useState<Dispositivo[]>([])
  const vinculoIntentado = useRef(false)
  const avisado = useRef(false)

  useEffect(() => iniciar(), [])
  useEffect(() => {
    if (e.email && e.registrado) void listarDispositivos().then(setLista)
  }, [e.email, e.registrado, e.ultima])

  // Cuenta regresiva para poder reenviar el código
  useEffect(() => {
    if (espera <= 0) return
    const id = setTimeout(() => setEspera((n) => n - 1), 1000)
    return () => clearTimeout(id)
  }, [espera])

  // Con la sesión abierta, el dispositivo se vincula solo con un nombre automático
  const vincularAhora = async () => {
    vinculoIntentado.current = true
    setVinculando(true)
    setMsg(await vincular(nombreDispositivo()))
    setVinculando(false)
  }
  useEffect(() => {
    if (!e.email) vinculoIntentado.current = false
    else if (!e.registrado && !vinculoIntentado.current) void vincularAhora()
  }, [e.email, e.registrado])

  useEffect(() => {
    if (e.email && e.registrado && !avisado.current) {
      avisado.current = true
      onListo?.()
    }
  }, [e.email, e.registrado, onListo])

  const pedirCodigo = async () => {
    setOcupado(true)
    const err = await enviarLink(correo)
    setOcupado(false)
    setMsg(err)
    if (!err) {
      setEnviado(true)
      setCodigo('')
      setEspera(ESPERA)
    }
  }
  const verificar = async (c: string) => {
    setOcupado(true)
    const err = await entrarConCodigo(correo, c.trim())
    setOcupado(false)
    setMsg(err)
  }
  const alEscribirCodigo = (v: string) => {
    const limpio = v.replace(/\D/g, '').slice(0, 6)
    setCodigo(limpio)
    if (limpio.length === 6 && !ocupado) void verificar(limpio)
  }

  return (
    <section className={compacto ? 'pt-3' : 'px-5 pt-6'}>
      {!compacto && <h2 className="font-display text-tinta m-0 mb-2 text-[20px] font-semibold">{TN.titulo}</h2>}
      <div className="border-arena-osc flex flex-col gap-3 rounded-3xl border-2 bg-white p-4">
        {!e.email ? (
          <>
            {e.registrado && <p className="text-alerta m-0 text-[14px] font-extrabold">{TN.sesionVencida}</p>}
            {!enviado ? (
              <>
                {!compacto && <p className="text-tinta-suave m-0 text-[14px] font-bold">{TN.intro}</p>}
                <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" aria-label={TN.correo} placeholder={TN.correo} value={correo} onChange={(x) => setCorreo(x.target.value)} className={campo} />
                <Boton disabled={!correoValido(correo) || ocupado} onClick={() => void pedirCodigo()}>
                  {ocupado ? TN.enviando : TN.enviar}
                </Boton>
                <p className="text-tinta-suave m-0 text-[13px] font-bold">{TN.privacidad}</p>
              </>
            ) : (
              <>
                <p className="text-tinta m-0 text-[14px] font-bold">
                  {TN.enviado} <span className="font-extrabold">{correo.trim().toLowerCase()}</span>. {TN.enviadoAyuda}
                </p>
                <input autoFocus inputMode="numeric" autoComplete="one-time-code" aria-label={TN.codigo} placeholder={TN.codigo} value={codigo} onChange={(x) => alEscribirCodigo(x.target.value)} className={`${campo} text-center tracking-[0.3em]`} />
                <Boton disabled={codigo.length < 6 || ocupado} onClick={() => void verificar(codigo)}>
                  {ocupado ? TN.verificando : TN.entrar}
                </Boton>
                <div className="flex gap-2">
                  <Boton variante="fantasma" disabled={espera > 0 || ocupado} onClick={() => void pedirCodigo()}>
                    {espera > 0 ? TN.reenviarEn(espera) : TN.reenviar}
                  </Boton>
                  <Boton
                    variante="fantasma"
                    onClick={() => {
                      setEnviado(false)
                      setMsg(null)
                    }}
                  >
                    {TN.cambiarCorreo}
                  </Boton>
                </div>
              </>
            )}
          </>
        ) : !e.registrado ? (
          <>
            <p className="text-tinta-suave m-0 text-[14px] font-bold">{vinculando ? TN.vinculando : `${TN.conectadoComo} ${e.email}`}</p>
            {!vinculando && (
              <>
                <Boton onClick={() => void vincularAhora()}>{TN.reintentar}</Boton>
                <Boton variante="fantasma" onClick={() => void cerrarSesion()}>
                  {TN.salir}
                </Boton>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-tinta-suave m-0 text-[14px] font-bold">
              {TN.conectadoComo} {e.email}
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {lista.map((d) => (
                <li key={d.id} className="bg-arena/50 flex items-center gap-2 rounded-2xl p-3">
                  <span className="flex-1">
                    <span className="text-tinta block text-[15px] font-extrabold">
                      {d.nombre}
                      {d.id === e.idLocal && ` · ${TN.este}`}
                    </span>
                    <span className="text-tinta-suave block text-[13px] font-bold">
                      {TN.ultima}: {cuando(d.ultima_sync)}
                    </span>
                  </span>
                  <button type="button" className="text-alerta min-h-11 border-0 bg-transparent px-2 text-[14px] font-extrabold" onClick={() => void quitarDispositivo(d.id).then(() => listarDispositivos().then(setLista))}>
                    {d.id === e.idLocal ? TN.desvincular : TN.quitar}
                  </button>
                </li>
              ))}
            </ul>
            <Boton variante="secundario" disabled={e.fase === 'sincronizando'} onClick={() => void sincronizar()}>
              {e.fase === 'sincronizando' ? TN.sincronizando : TN.sincronizar}
            </Boton>
            <Boton variante="fantasma" onClick={() => void cerrarSesion()}>
              {TN.salir}
            </Boton>
          </>
        )}
        {e.fase === 'ok' && e.registrado && <p role="status" className="text-hoja-osc m-0 text-[14px] font-extrabold">{TN.ok}</p>}
        {(msg || e.error) && <p role="status" className="text-alerta m-0 text-[14px] font-extrabold">{msg ?? TN.errorGenerico}</p>}
      </div>
    </section>
  )
}
