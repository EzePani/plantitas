-- Lo que ya existía en Supabase antes del 27/11/2026 (creado a mano en el panel).
-- Está acá para poder levantar una base de prueba igual a la real.

create table if not exists public.progreso (
  user_id uuid primary key references auth.users (id) on delete cascade,
  datos jsonb not null,
  version integer not null,
  actualizado timestamptz not null default now()
);
alter table public.progreso enable row level security;
drop policy if exists "progreso propio" on public.progreso;
create policy "progreso propio" on public.progreso for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.dispositivos (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 40),
  creado timestamptz not null default now(),
  ultima_sync timestamptz not null default now()
);
alter table public.dispositivos enable row level security;
drop policy if exists "dispositivos propios" on public.dispositivos;
create policy "dispositivos propios" on public.dispositivos for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Como en la base real: solo quien inició sesión llega a estas tablas (y las reglas de arriba le muestran lo suyo)
revoke all on public.progreso, public.dispositivos from anon;
grant all on public.progreso, public.dispositivos to authenticated;
