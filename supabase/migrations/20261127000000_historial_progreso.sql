-- Plantitas: historial de versiones de la nube.
-- Cada vez que la app pisa el progreso, la versión anterior queda guardada acá.
-- Correrlo de nuevo no rompe nada.
-- No cambia la tabla `progreso` ni los datos actuales.


create table if not exists public.progreso_historial (
  id bigint generated always as identity primary key,
  guardado timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  datos jsonb not null,
  version integer not null,
  actualizado timestamptz,
  espacios integer not null,
  plantas integer not null,
  planos integer not null,
  guardia integer not null,
  -- verdadero si lo que vino después tenía menos cosas que esta versión
  antes_de_perder boolean not null default false
);
create index if not exists progreso_historial_usuario on public.progreso_historial (user_id, id desc);

-- Solo se puede ver desde el panel de Supabase: la app y su clave pública no tienen acceso
alter table public.progreso_historial enable row level security;
revoke all on public.progreso_historial from anon, authenticated;

create or replace function public.plantitas_contenido(d jsonb, out espacios integer, out plantas integer, out planos integer, out guardia integer)
language sql immutable set search_path = ''
as $$
  select
    jsonb_array_length(coalesce(d -> 'espacios', '[]'::jsonb)),
    (select count(*)::integer from jsonb_array_elements(coalesce(d -> 'espacios', '[]'::jsonb)) e, jsonb_array_elements(coalesce(e -> 'plantas', '[]'::jsonb))),
    (select count(*)::integer from jsonb_array_elements(coalesce(d -> 'espacios', '[]'::jsonb)) e where e ? 'plano'),
    jsonb_array_length(coalesce(d -> 'casos', '[]'::jsonb))
$$;

create or replace function public.guardar_historial_progreso()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  a record;
  n record;
begin
  if old.datos::jsonb is distinct from new.datos::jsonb then
    -- Si algo falla acá, la sincronización sigue igual: queda un aviso en los registros
    begin
      select * into a from public.plantitas_contenido(old.datos::jsonb);
      select * into n from public.plantitas_contenido(new.datos::jsonb);

      insert into public.progreso_historial (user_id, datos, version, actualizado, espacios, plantas, planos, guardia, antes_de_perder)
      values (old.user_id, old.datos::jsonb, old.version, old.actualizado, a.espacios, a.plantas, a.planos, a.guardia,
              n.espacios < a.espacios or n.plantas < a.plantas or n.planos < a.planos or n.guardia < a.guardia);

      -- Se conservan las últimas 30 y, durante 90 días, la última de cada día y las anteriores a una pérdida
      delete from public.progreso_historial h
      where h.user_id = old.user_id
        and h.id not in (select x.id from public.progreso_historial x where x.user_id = old.user_id order by x.id desc limit 30)
        and not (
          h.guardado > now() - interval '90 days'
          and (h.antes_de_perder or h.id in (select max(x.id) from public.progreso_historial x where x.user_id = old.user_id group by x.guardado::date))
        );
    exception when others then
      raise warning 'No se pudo guardar el historial de Plantitas: %', sqlerrm;
    end;
  end if;
  return new;
end
$$;

revoke execute on function public.plantitas_contenido(jsonb) from public, anon, authenticated;
revoke execute on function public.guardar_historial_progreso() from public, anon, authenticated;

drop trigger if exists progreso_historial on public.progreso;
create trigger progreso_historial
  before update on public.progreso
  for each row execute function public.guardar_historial_progreso();

-- Punto de partida: lo que hay ahora
insert into public.progreso_historial (user_id, datos, version, actualizado, espacios, plantas, planos, guardia)
select p.user_id, p.datos::jsonb, p.version, p.actualizado, c.espacios, c.plantas, c.planos, c.guardia
from public.progreso p
cross join lateral public.plantitas_contenido(p.datos::jsonb) c
where not exists (select 1 from public.progreso_historial h where h.user_id = p.user_id and h.actualizado is not distinct from p.actualizado);
