import { useEffect, useState, useSyncExternalStore } from 'react'
import { Boton } from '../../components/Boton'
import { TN } from '../../data/textosNube'
import { cerrarSesion, cliente, enviarLink, entrarConCodigo, iniciar, leerEstado, listarDispositivos, quitarDispositivo, sincronizar, suscribir, vincular, type Dispositivo } from '../../lib/nube'

const campo = 'border-arena-osc text-tinta min-h-12 w-full rounded-2xl border-2 bg-white px-4 text-[16px] font-bold'

const cuando = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : TN.nunca)

export function Nube() {
  const e = useSyncExternalStore(suscribir, leerEstado)
  const [correo, setCorreo] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [lista, setLista] = useState<Dispositivo[]>([])

  useEffect(() => iniciar(), [])
  useEffect(() => {
    if (e.email && e.registrado) void listarDispositivos().then(setLista)
  }, [e.email, e.registrado, e.ultima])

  return (
    <section className="px-5 pt-6">
      <h2 className="font-display text-tinta m-0 mb-2 text-[20px] font-semibold">{TN.titulo}</h2>
      <div className="border-arena-osc flex flex-col gap-3 rounded-3xl border-2 bg-white p-4">
        {!e.email ? (
          <>
            <p className="text-tinta-suave m-0 text-[14px] font-bold">{TN.intro}</p>
            <input type="email" autoComplete="off" aria-label={TN.correo} placeholder={TN.correo} value={correo} onChange={(x) => setCorreo(x.target.value)} className={campo} />
            <Boton
              disabled={!correo.includes('@')}
              onClick={async () => {
                const err = await enviarLink(correo.trim())
                setMsg(err)
                setEnviado(!err)
              }}
            >
              {TN.enviar}
            </Boton>
            {enviado && (
              <>
                <p className="text-tinta-suave m-0 text-[14px] font-bold">{TN.enviado}</p>
                <input inputMode="numeric" autoComplete="one-time-code" aria-label={TN.codigo} placeholder={TN.codigo} value={codigo} onChange={(x) => setCodigo(x.target.value)} className={campo} />
                <Boton variante="secundario" disabled={codigo.trim().length < 6} onClick={async () => setMsg(await entrarConCodigo(correo.trim(), codigo.trim()))}>
                  {TN.entrar}
                </Boton>
              </>
            )}
          </>
        ) : !e.registrado ? (
          <>
            <p className="text-tinta-suave m-0 text-[14px] font-bold">
              {TN.conectadoComo} {e.email}
            </p>
            <input aria-label={TN.nombreTitulo} placeholder={TN.nombrePista} maxLength={40} value={nombre} onChange={(x) => setNombre(x.target.value)} className={campo} />
            <Boton disabled={!nombre.trim()} onClick={async () => setMsg(await vincular(nombre.trim()))}>
              {TN.vincular}
            </Boton>
            <Boton variante="fantasma" onClick={() => void cliente.auth.signOut()}>
              {TN.salir}
            </Boton>
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
