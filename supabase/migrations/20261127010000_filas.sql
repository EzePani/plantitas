-- Plantitas: cada cosa en su fila.
-- Antes la nube guardaba un solo bloque por cuenta (`progreso`) que cada sincronización reemplazaba.
-- Ahora cada espacio, planta, caso, control, hijito, lección… es una fila propia.
-- Correrlo de nuevo no rompe nada. No toca `progreso` ni `dispositivos`.

-- ───────── Historial: la versión anterior de cada fila que cambia ─────────

create table if not exists public.historial (
  n bigint generated always as identity primary key,
  guardado timestamptz not null default now(),
  tabla text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  datos jsonb not null,
  version integer not null,
  actualizado timestamptz not null,
  borrado boolean not null
);
create index if not exists historial_fila on public.historial (user_id, tabla, id, n desc);

-- Solo se ve desde el panel de Supabase: la app no puede leerlo ni tocarlo
alter table public.historial enable row level security;
revoke all on public.historial from anon, authenticated;

create or replace function public.plantitas_antes_de_guardar()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.actualizado := now();
    return new;
  end if;

  -- Una app vieja no puede pisar lo que escribió una más nueva: podría no conocer todos los datos
  if new.version < old.version then
    raise exception 'PLANTITAS_VERSION_VIEJA';
  end if;
  new.user_id := old.user_id;
  new.id := old.id;
  new.creado := old.creado;

  if new.datos is not distinct from old.datos and new.borrado = old.borrado then
    new.actualizado := old.actualizado;
    return new;
  end if;
  new.actualizado := greatest(now(), old.actualizado + interval '1 microsecond');

  -- Si el historial falla, el guardado sigue igual: queda un aviso en los registros
  begin
    insert into public.historial (tabla, user_id, id, datos, version, actualizado, borrado)
    values (tg_table_name, old.user_id, old.id, old.datos, old.version, old.actualizado, old.borrado);

    -- De cada fila se conservan las últimas 20 versiones y todo lo de los últimos 90 días
    delete from public.historial h
    where h.user_id = old.user_id and h.tabla = tg_table_name and h.id = old.id
      and h.guardado < now() - interval '90 days'
      and h.n not in (
        select x.n from public.historial x
        where x.user_id = old.user_id and x.tabla = tg_table_name and x.id = old.id
        order by x.n desc limit 20
      );
  exception when others then
    raise warning 'No se pudo guardar el historial de Plantitas: %', sqlerrm;
  end;
  return new;
end
$$;
revoke execute on function public.plantitas_antes_de_guardar() from public, anon, authenticated;

-- ───────── Las tablas ─────────
-- Todas tienen la misma forma. `datos` lleva el contenido tal como lo usa la app;
-- `borrado` marca lo que se quitó (la app no puede eliminar filas: siempre se puede volver atrás).

do $$
declare
  t text;
begin
  foreach t in array array[
    'avance',          -- respuestas iniciales, mascotas, puntos, racha, semillas, refuerzo
    'lecciones',       -- una por lección o repaso completado
    'insignias',
    'espacios',        -- con su luz
    'planos',          -- el plano de un espacio (mismo id que el espacio)
    'espacio_plantas', -- cada planta que vive en un espacio
    'casos',           -- Guardia: la historia de cada planta enferma
    'controles',       -- Guardia: un control por caso y día
    'visitas_vivero',  -- Guardia: qué dijeron en el vivero
    'hijitos',
    'colecciones',
    'favoritas'
  ] loop
    execute format($f$
      create table if not exists public.%1$I (
        user_id uuid not null references auth.users (id) on delete cascade,
        id text not null check (char_length(id) between 1 and 200),
        datos jsonb not null check (jsonb_typeof(datos) = 'object' and pg_column_size(datos) <= 200000),
        version integer not null check (version > 0),
        creado timestamptz not null default now(),
        actualizado timestamptz not null default now(),
        borrado boolean not null default false,
        primary key (user_id, id)
      )$f$, t);
    execute format('create index if not exists %I on public.%I (user_id, actualizado)', t || '_cambios', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);

    execute format('drop policy if exists "ver lo propio" on public.%I', t);
    execute format('create policy "ver lo propio" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('drop policy if exists "crear lo propio" on public.%I', t);
    execute format('create policy "crear lo propio" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('drop policy if exists "cambiar lo propio" on public.%I', t);
    execute format('create policy "cambiar lo propio" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);

    execute format('drop trigger if exists antes_de_guardar on public.%I', t);
    execute format('create trigger antes_de_guardar before insert or update on public.%I for each row execute function public.plantitas_antes_de_guardar()', t);
  end loop;
end
$$;

-- Columnas de lectura, para ver las tablas en el panel sin abrir `datos`
alter table public.espacios add column if not exists nombre text generated always as (datos ->> 'nombre') stored;
alter table public.espacio_plantas add column if not exists espacio_id text generated always as (datos ->> 'espacio') stored;
alter table public.espacio_plantas add column if not exists planta_id text generated always as (datos ->> 'plantaId') stored;
alter table public.casos add column if not exists planta_id text generated always as (datos ->> 'plantaId') stored;
alter table public.casos add column if not exists ingreso text generated always as (datos ->> 'ingreso') stored;
alter table public.controles add column if not exists caso_id text generated always as (datos ->> 'caso') stored;
alter table public.controles add column if not exists fecha text generated always as (datos ->> 'fecha') stored;
alter table public.visitas_vivero add column if not exists caso_id text generated always as (datos ->> 'caso') stored;
alter table public.visitas_vivero add column if not exists fecha text generated always as (datos ->> 'fecha') stored;
alter table public.hijitos add column if not exists nombre text generated always as (datos ->> 'nombre') stored;
alter table public.colecciones add column if not exists nombre text generated always as (datos ->> 'nombre') stored;

-- ───────── Lo que usa la app ─────────

-- Todas las filas de la cuenta que cambiaron desde un momento (o todas), de la más vieja a la más nueva
create or replace function public.plantitas_cambios(desde timestamptz default null)
returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(f) order by f.creado, f.id), '[]'::jsonb)
  from (
    select 'avance'::text as tabla, id, datos, version, creado, actualizado, borrado from public.avance where user_id = (select auth.uid())
    union all select 'lecciones', id, datos, version, creado, actualizado, borrado from public.lecciones where user_id = (select auth.uid())
    union all select 'insignias', id, datos, version, creado, actualizado, borrado from public.insignias where user_id = (select auth.uid())
    union all select 'espacios', id, datos, version, creado, actualizado, borrado from public.espacios where user_id = (select auth.uid())
    union all select 'planos', id, datos, version, creado, actualizado, borrado from public.planos where user_id = (select auth.uid())
    union all select 'espacio_plantas', id, datos, version, creado, actualizado, borrado from public.espacio_plantas where user_id = (select auth.uid())
    union all select 'casos', id, datos, version, creado, actualizado, borrado from public.casos where user_id = (select auth.uid())
    union all select 'controles', id, datos, version, creado, actualizado, borrado from public.controles where user_id = (select auth.uid())
    union all select 'visitas_vivero', id, datos, version, creado, actualizado, borrado from public.visitas_vivero where user_id = (select auth.uid())
    union all select 'hijitos', id, datos, version, creado, actualizado, borrado from public.hijitos where user_id = (select auth.uid())
    union all select 'colecciones', id, datos, version, creado, actualizado, borrado from public.colecciones where user_id = (select auth.uid())
    union all select 'favoritas', id, datos, version, creado, actualizado, borrado from public.favoritas where user_id = (select auth.uid())
  ) f
  where desde is null or f.actualizado > desde
$$;

-- Guarda varias filas juntas: o entran todas o ninguna.
-- Cada una es {tabla, id, datos, version, borrado, visto}. `visto` es el `actualizado` que el dispositivo
-- conocía: si la fila cambió desde entonces no se pisa (vuelve con escrito = false) y la app la une.
create or replace function public.plantitas_guardar(filas jsonb)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  yo uuid := auth.uid();
  f jsonb;
  n integer := 0;
  salida jsonb := '[]'::jsonb;
  t text;
  i text;
  ver integer;
  quitar boolean;
  hay timestamptz;
  escrito boolean;
begin
  if yo is null then
    raise exception 'PLANTITAS_SIN_SESION';
  end if;
  if jsonb_typeof(filas) is distinct from 'array' or jsonb_array_length(filas) > 5000 then
    raise exception 'PLANTITAS_PEDIDO';
  end if;

  for f in select value from jsonb_array_elements(filas) loop
    n := n + 1;
    t := f ->> 'tabla';
    i := f ->> 'id';
    ver := (f ->> 'version')::integer;
    quitar := coalesce((f ->> 'borrado')::boolean, false);
    if t is null or t not in ('avance', 'lecciones', 'insignias', 'espacios', 'planos', 'espacio_plantas', 'casos', 'controles', 'visitas_vivero', 'hijitos', 'colecciones', 'favoritas') then
      raise exception 'PLANTITAS_TABLA';
    end if;

    hay := null;
    execute format('select actualizado from public.%I where user_id = $1 and id = $2 for update', t) into hay using yo, i;

    escrito := true;
    if hay is null then
      -- Fila nueva. El orden dentro del pedido se conserva en `creado`
      if not quitar then
        execute format('insert into public.%I (user_id, id, datos, version, creado) values ($1, $2, $3, $4, now() + $5 * interval ''1 microsecond'') returning actualizado', t)
          into hay using yo, i, f -> 'datos', ver, n;
      end if;
    elsif (f ->> 'visto')::timestamptz is distinct from hay then
      escrito := false;
    elsif quitar then
      execute format('update public.%I set borrado = true, version = greatest(version, $3) where user_id = $1 and id = $2 returning actualizado', t)
        into hay using yo, i, ver;
    else
      execute format('update public.%I set datos = $3, version = $4, borrado = false where user_id = $1 and id = $2 returning actualizado', t)
        into hay using yo, i, f -> 'datos', ver;
    end if;

    salida := salida || jsonb_build_object('tabla', t, 'id', i, 'actualizado', hay, 'escrito', escrito);
  end loop;
  return salida;
end
$$;

revoke execute on function public.plantitas_cambios(timestamptz) from public, anon;
revoke execute on function public.plantitas_guardar(jsonb) from public, anon;
grant execute on function public.plantitas_cambios(timestamptz) to authenticated;
grant execute on function public.plantitas_guardar(jsonb) to authenticated;

-- ───────── Fotos de la Guardia ─────────
-- Almacenamiento privado: cada cuenta solo ve su carpeta (<id de la cuenta>/<id del caso>.jpg)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "fotos propias: ver" on storage.objects;
create policy "fotos propias: ver" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "fotos propias: subir" on storage.objects;
create policy "fotos propias: subir" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "fotos propias: cambiar" on storage.objects;
create policy "fotos propias: cambiar" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Sin permiso para quitar: una foto que se saca en la app queda guardada y se puede recuperar
drop policy if exists "fotos propias: quitar" on storage.objects;
