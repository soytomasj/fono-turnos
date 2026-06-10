# fono·turnos

PWA mobile-first para que una fonoaudióloga gestione turnos fijos, asistencias y pagos. Local-first: todo el estado vive en `localStorage` (Zustand persist, key `fonoapp`). Sin backend en runtime. Español, guaraní paraguayo (₲, `es-PY`).

## Correr

```bash
npm install
npm run dev
```

## Stack

- Vite + React 18, react-router-dom v6, Zustand v5 (persist), date-fns v3 (locale `es`), Tailwind v3.
- `@supabase/supabase-js` incluido solo como scaffolding (ver abajo).

## Modelo

La agenda fija del paciente es la fuente de verdad: los turnos **no se guardan**, se calculan por fecha desde los slots recurrentes (`lib/turnos.js`). Solo se persisten los desvíos:

- `excepciones`: `cancelado` (motivo `cancelo` = avisó, no se cobra; `ausente` = faltó, se cobra) y `extra` (sesión puntual).
- `pagos`: la presencia de la fila = pagado. Por sesión (fecha + hora) o mensual (período `YYYY-MM`).

## Diseño

Identidad "libreta de consultorio": papel lino con grano, tinta verde petróleo, acento arcilla, líneas punteadas tipo libro contable. Tipografías: Young Serif (títulos), Karla (UI), Spline Sans Mono (horas y montos).

## Decisiones tomadas (criterio propio)

- **Grilla derivada de los datos**: las franjas horarias de la vista Grilla salen de los turnos reales de la semana en vez de una lista fija; el separador "Almuerzo" aparece cuando hay un hueco mayor a 60 min entre franjas.
- **Pago por sesión congela el monto**: al marcar pagado se guarda el monto vigente; cambiar el valor de sesión después no reescribe pagos históricos. Lo pendiente sí se recalcula en vivo.
- **Pagos de turnos luego cancelados** no suman al "Pagado" del mes (solo cuentan turnos cobrables).
- **Turnos extra cancelados**: la excepción `extra` persiste y se le superpone una excepción `cancelado`; volver a "Asistió" elimina solo la cancelación.
- **`activo` en pacientes** existe en el modelo (y en el esquema SQL) aunque todavía no hay UI para desactivar: deja preparado el "archivar paciente" sin borrar historial.
- **Resumen** lista solo pacientes con turnos en el mes; el botón "Marcar mes pagado" registra el total del mes al momento de marcarlo.
- **PWA**: manifest + meta listos para instalar; sin service worker por ahora (no se pidió offline y evita bugs de caché en desarrollo).
- **Navegación de semana** conserva el día de la semana seleccionado al pasar de semana; en fin de semana la app salta al lunes siguiente.

## Supabase (scaffolding, no conectado)

La app corre 100 % en localStorage. Quedan preparados, sin cablear al store ni proteger rutas:

- `src/lib/supabase.js`: cliente que se crea solo si hay env vars (`isConfigured`).
- `src/auth/AuthContext.jsx` + `src/pages/Login.jsx`: sesión email/password (sin montar; para activarlos, envolver `<App />` con `<AuthProvider>` y agregar la ruta `/login`).
- `supabase/schema.sql`: esquema idempotente que espeja el modelo del store campo a campo, con índices únicos contra pagos duplicados y RLS `for all to authenticated` (app de un solo usuario).

### Setup

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Pegar `supabase/schema.sql` en el SQL Editor y ejecutarlo (es re-ejecutable).
3. En Authentication → Users, crear el usuario único (email + contraseña).
4. Copiar `.env.example` a `.env` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Settings → API).
