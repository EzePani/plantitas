-- Plantitas: copia a las tablas lo que ya estaba en el bloque `progreso`.
-- Solo los bloques en el formato 15 (el último antes de las tablas); los más viejos los pasa la app
-- de cada cuenta cuando se actualiza. No pisa filas que ya existan y no cambia `progreso`.
-- Las filas quedan con version 15: la app sabe que salieron del bloque y no son más nuevas que él.
-- El trigger pone `actualizado`; `creado` conserva el orden que tenían las listas.

-- Lo que no es una lista
insert into public.avance (user_id, id, datos, version)
select p.user_id, x.id, x.datos, 15
from public.progreso p
cross join lateral (values
  ('inicio', jsonb_build_object('onboardingCompleto', p.datos -> 'onboardingCompleto', 'respuestas', p.datos -> 'respuestas', 'perfil', p.datos -> 'perfil')),
  ('mascotas', p.datos -> 'mascotas'),
  ('xp', jsonb_build_object('xp', p.datos -> 'xp')),
  ('racha', p.datos -> 'racha'),
  ('semillas', jsonb_build_object('lista', p.datos -> 'semillas')),
  ('salteadas', jsonb_build_object('lista', p.datos -> 'salteadas')),
  ('refuerzo', p.datos -> 'refuerzo')
) as x (id, datos)
where p.version = 15
on conflict do nothing;

insert into public.lecciones (user_id, id, datos, version)
select p.user_id, l.key, l.value, 15
from public.progreso p, jsonb_each(p.datos -> 'completadas') l
where p.version = 15
on conflict do nothing;

insert into public.insignias (user_id, id, datos, version)
select p.user_id, i.key, jsonb_build_object('fecha', i.value), 15
from public.progreso p, jsonb_each(p.datos -> 'insignias') i
where p.version = 15
on conflict do nothing;

-- Listas donde lo nuevo va al final
insert into public.espacios (user_id, id, datos, version, creado)
select p.user_id, e.value ->> 'id', e.value - 'plantas' - 'plano', 15, now() + e.ordinality * interval '1 microsecond'
from public.progreso p, jsonb_array_elements(p.datos -> 'espacios') with ordinality e
where p.version = 15
on conflict do nothing;

insert into public.planos (user_id, id, datos, version)
select p.user_id, e.value ->> 'id', e.value -> 'plano', 15
from public.progreso p, jsonb_array_elements(p.datos -> 'espacios') e
where p.version = 15 and jsonb_typeof(e.value -> 'plano') = 'object'
on conflict do nothing;

insert into public.espacio_plantas (user_id, id, datos, version, creado)
select p.user_id, (e.value ->> 'id') || ':' || (pl.value ->> 'id'), pl.value || jsonb_build_object('espacio', e.value ->> 'id'), 15,
       now() + (e.ordinality * 1000 + pl.ordinality) * interval '1 microsecond'
from public.progreso p, jsonb_array_elements(p.datos -> 'espacios') with ordinality e, jsonb_array_elements(e.value -> 'plantas') with ordinality pl
where p.version = 15
on conflict do nothing;

insert into public.colecciones (user_id, id, datos, version, creado)
select p.user_id, c.value ->> 'id', c.value, 15, now() + c.ordinality * interval '1 microsecond'
from public.progreso p, jsonb_array_elements(p.datos -> 'colecciones') with ordinality c
where p.version = 15
on conflict do nothing;

-- Listas donde lo nuevo va primero: la más vieja queda con el `creado` más chico
insert into public.hijitos (user_id, id, datos, version, creado)
select p.user_id, h.value ->> 'id', h.value, 15, now() - h.ordinality * interval '1 microsecond'
from public.progreso p, jsonb_array_elements(p.datos -> 'hijitos') with ordinality h
where p.version = 15
on conflict do nothing;

insert into public.favoritas (user_id, id, datos, version, creado)
select p.user_id, f.value #>> '{}', '{}'::jsonb, 15, now() - f.ordinality * interval '1 microsecond'
from public.progreso p, jsonb_array_elements(p.datos -> 'favoritas') with ordinality f
where p.version = 15
on conflict do nothing;

insert into public.casos (user_id, id, datos, version, creado)
select p.user_id, c.value ->> 'id',
       (c.value - 'controles' - 'vivero') || case when c.value ? 'vivero' then '{"contestoVivero": true}'::jsonb else '{}'::jsonb end,
       15, now() - c.ordinality * interval '1 microsecond'
from public.progreso p, jsonb_array_elements(p.datos -> 'casos') with ordinality c
where p.version = 15
on conflict do nothing;

insert into public.controles (user_id, id, datos, version, creado)
select p.user_id, (c.value ->> 'id') || ':' || (k.value ->> 'fecha'), k.value || jsonb_build_object('caso', c.value ->> 'id'), 15,
       now() + k.ordinality * interval '1 microsecond'
from public.progreso p, jsonb_array_elements(p.datos -> 'casos') c, jsonb_array_elements(c.value -> 'controles') with ordinality k
where p.version = 15
on conflict do nothing;

insert into public.visitas_vivero (user_id, id, datos, version, creado)
select p.user_id, (c.value ->> 'id') || ':' || (v.value ->> 'id'), v.value || jsonb_build_object('caso', c.value ->> 'id'), 15,
       now() + v.ordinality * interval '1 microsecond'
from public.progreso p, jsonb_array_elements(p.datos -> 'casos') c, jsonb_array_elements(c.value -> 'vivero') with ordinality v
where p.version = 15
on conflict do nothing;
