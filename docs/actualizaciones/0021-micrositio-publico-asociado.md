# Plan de actualización — Micrositio público del asociado ("Mi Página")

- **Estado:** Borrador
- **Fecha:** 2026-09-14
- **Alcance:** convertir el perfil público del asociado (`/empresas/{id}`) en un **micrositio** de 5
  pestañas, con **URL personalizada** (slug), que el asociado **nutre desde su panel** en un nuevo
  grupo **"Mi Página"**. Una **sola estructura estándar** para todos; **sin cobro por plan** y **sin
  revisión de admin** (publica directo). El **login y el panel del asociado NO cambian** — el slug es
  solo la dirección pública (sin sesión).
- **NO entra:** brochure, cobertura geográfica, color de marca, formulario/buzón de leads (los botones
  de contacto son enlaces directos), editor de texto enriquecido (la historia es texto simple),
  page-builder libre (la plantilla es única y curada).

> Este plan no se ejecuta hasta `#go`.

---

## 1. Componentes *(primer punto, obligatorio)*

- **Panel (authoring, `base/`):** Card, Field/Input/Textarea/Label, Button, Badge, Switch, Alert,
  Progress, Dialog (confirmaciones) — **todo reutilizado**, cero componentes nuevos.
- **Público (micrositio):** vive en `PublicLayout` con el **lenguaje visual del sitio público**
  (sistema propio, aparte del `base/` del panel). Las **5 pestañas** son navegación propia del
  micrositio (no requieren un componente `base/Tabs`, que no existe).
- **Imágenes de tamaño fijo:** se resuelve con CSS (`aspect-*` + `object-cover`), **no** con un
  recortador — sin componente nuevo. **Excepción:** la Galería va libre (ya tiene su lightbox).
- **Regla de pausa:** si en la construcción apareciera la necesidad de un **componente `base/` nuevo**
  (p. ej. `Tabs` para el panel, o un editor rico), **se pausa y se pide la spec** antes de crearlo
  (regla del proyecto). Con el alcance actual **no se prevé ninguno**.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0021-micrositio-publico-asociado.md`).
- [ ] `README.md` de actualizaciones — fila 0021.
- [ ] **ADR** para el **ruteo del slug** (fallback al raíz + lista de reservadas + resolución
      slug/id) y el modelo de datos del micrositio: es una decisión de arquitectura pública.

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Perfil público:** `PublicCompanyController@show($id)` → `Public/Companies/Show.tsx`, ruta
  `/empresas/{id}` (`companies.show`). Es una **ficha fija** (diseño legado `ui/*`) que autoderiva:
  hero (cover+logo), galería con lightbox, "Sobre la empresa" (`description`), servicios agrupados por
  categoría (solo nombres), contacto (teléfono, `billing_email`, dirección, redes) y **datos legales**
  (NIT, `rep_name`, `main_ciiu`, `constitution_date`, `company_type`). Solo sale si `status=approved`
  y `is_public=true`.
- **Datos existentes (`Associate`):** `description`, `phone`, `address`, `department`, `city`,
  `website`, `social_{facebook,instagram,linkedin,other}`, `billing_email`, `logo_path`, `cover_path`,
  `gallery_paths` (array), `nit`, `rep_name`, `main_ciiu`, `constitution_date`, `company_type`,
  `is_public`, `is_verified`. **Servicios:** `belongsToMany(Service, 'associate_service')` (pivot sin
  columnas extra). La selección de servicios es una **sección revisada** (`REVIEWABLE_SECTIONS`
  incluye `services`).
- **Panel:** sidebar con "Mi empresa" (Información Básica, Caracterización, Contactos, Servicios,
  Documentación — **con revisión de admin**), "Galería de Fotos" (ítem propio, ya en `base/`, plan
  0020) y el resto. El topbar (`AppLayout.tsx`) tiene una zona derecha (notificaciones) donde encaja
  el botón **"Ver mi página"**.
- **Patrón reutilizable:** el registro valida el correo en vivo contra `register/check-email`
  (endpoint con `throttle`) — mismo patrón para la **disponibilidad del slug**.
- **Resultado esperado:** micrositio de 5 pestañas alimentado desde "Mi Página", con URL propia, sin
  tocar login/panel, sin revisión ni cobro.

## 4. Revisión de accesibilidad

- Pestañas del micrositio con roles ARIA (`tablist`/`tab`/`tabpanel`) y foco por teclado; estado por
  texto, no solo color.
- Input del slug: `aria-describedby` con el estado (disponible/ocupado/normalizado), errores
  accesibles; la normalización visible ("empresa x → empresa-x").
- Imágenes con `alt` (nombre de empresa / proyecto / cliente). Botones de contacto son enlaces reales
  (`tel:`/`wa.me`/`mailto:`), no `onClick`.

## 5. Revisión de seguridad

- **Login/panel intactos (requisito del usuario):** las rutas autenticadas se resuelven **primero**;
  el slug es una **ruta pública de último recurso** (fallback) registrada **al final**. Con una **lista
  de palabras reservadas** (`login`, `dashboard`, `admin`, `empresas`, `api`, `storage`, `webhooks`,
  `profile`, `register`, `forgot-password`, assets…) es **imposible** que un slug capture una ruta del
  sistema. `slug` vacío → sigue sirviendo `/empresas/{id}`.
- **Slug:** normalización **server-side** como fuente de verdad (no confiar en el front), `unique` en
  BD, longitud mín./máx., validación de reservadas al guardar. **Se fija una sola vez** (bloqueado tras
  guardar; solo un admin lo cambia). Endpoint de disponibilidad con `throttle` (anti-enumeración).
- **Sin revisión de admin** para el contenido del micrositio (decisión de negocio): el contenido es
  responsabilidad del asociado. **Importante:** la **selección de servicios** sigue pasando por su
  revisión actual; el micrositio solo **enriquece** (descripción + cover) lo ya aprobado — no permite
  crear servicios nuevos ni saltarse esa revisión.
- Subidas de imágenes (proyectos, equipo, certificaciones, clientes, fachada, covers de servicio):
  validación de tipo/tamaño como el logo/galería (image, máx 5 MB), en el disco por defecto.
- Solo el dueño (`associate_id` de la sesión) edita su micrositio; el público es de solo lectura.

## 6. Revisión funcional

**URL / slug**
- Nace **vacío**; el asociado lo crea (input con normalización en vivo + check de disponibilidad).
  Mientras esté vacío, la dirección pública es `/empresas/{id}` (respaldo permanente).
- Al raíz: `dominio/empresa-x` (fallback con guard de reservadas). El público resuelve por **slug** o,
  si no hay, por **id**.

**5 pestañas públicas** (pestaña vacía → **oculta** en público):
- **Quiénes somos:** historia (texto simple) · **certificaciones** (máx 5: imagen/logo + nombre + año)
  · **equipo** (nombre + cargo + foto; correo/teléfono opcionales) · **clientes** (nombre + logo,
  tamaño fijo) · **bloque legal** discreto (el mismo set de hoy: NIT, rep. legal, CIIU, constitución,
  tipo de entidad — solo lectura, reusa datos del perfil).
- **Servicios:** los **servicios aprobados** (de "Mi empresa > Servicios") + **descripción y cover por
  tarjeta** (opcionales; sin ellos, la tarjeta muestra el nombre).
- **Proyectos:** título + descripción + galería de imágenes + cliente (opcional).
- **Galería:** la actual (imágenes libres — única excepción a los tamaños fijos) con su lightbox.
- **Contacto:** teléfono/dirección/redes reusados **+ WhatsApp + correo de contacto + foto de
  fachada**; botones directos `tel:` / `wa.me` / `mailto:`. Sin formulario.

**Panel "Mi Página"** (grupo con 5 hijos espejo de las pestañas): Quiénes somos · Servicios ·
Proyectos · Galería · Contacto. Más: pantalla del **slug**, interruptor **"publicado"** y **"Ver mi
página"** (preview) — botón también en el **topbar** del panel.

**Reglas transversales:** imágenes con recorte fijo salvo Galería · sin cobro por plan · sin revisión ·
preview + publicado + pestañas vacías ocultas · plantilla única.

**Casos límite:** micrositio sin publicar → solo el dueño lo ve (preview), público 404/oculto · slug
duplicado → check en vivo lo marca ocupado · empresa no `approved`/`is_public=false` → no accesible ·
servicio aprobado sin enriquecer → tarjeta con solo el nombre.

## 7. Plan de actualización (cortes)

- **21-A · Cimientos (datos + ruteo).** Migraciones: `slug` (nullable, `unique`), `microsite_published`,
  `whatsapp`, `contact_email`, `facade_photo_path`, `about_story`; pivot `associate_service` +=
  `description`, `cover_path` (`withPivot`); tablas `associate_projects` (+ imágenes: array o tabla
  hija), `associate_certifications`, `associate_team_members`, `associate_clients`. Modelos +
  relaciones. **Ruteo:** resolución por slug/id + **fallback al raíz** (registrado al final) con
  **lista de reservadas**; `slug` vacío → `/empresas/{id}`. **Endpoint de disponibilidad** del slug
  (throttle) + **normalizador server-side**. **ADR** del ruteo/modelo. Pest: normalización, unicidad,
  reservadas, resolución slug/id, que login/panel no se ven afectados.
- **21-B · Micrositio público. ✅** `Public/Companies/Show.tsx` reescrito con el **diseño editorial
  aprobado** (maqueta iterada con el usuario): página **standalone** (topbar propio + footer, sin el
  `PublicLayout` global) con hero oscuro (logo redondo + verificado estilo Instagram), franja de datos
  discreta, y **5 secciones en scroll** con nav superior fija (secciones vacías ocultas): Quiénes somos
  (historia + imagen, certificaciones, equipo con botones WhatsApp/llamar/correo, clientes con logo),
  Servicios (tarjetas), Proyectos (bloques alternados + visor), Galería (mosaico con **+N** para 50+
  fotos + visor) y Contacto (claro, con todos los datos + redes + slider de fachada). **Íconos reales**
  (WhatsApp con glyph oficial, ver memoria). Ajuste de datos: `facade_paths` (hasta 3, slider) +
  `about_image_path` (migración 21-B). Partido en `Parts/` (Regla 6). Pest payload + Vitest de secciones.
- **21-C · Panel: grupo "Mi Página" + slug + Quiénes somos. ✅** Grupo **"Mi Página"** en el sidebar
  (por ahora Quiénes somos + Galería movida; los demás hijos entran en 21-D/21-E). Pantalla
  `Associate/Microsite/QuienesSomos` con **SlugCard** (normalización + disponibilidad en vivo vía
  `axios` + guardado una-sola-vez + "Ver mi página") y el contenido en **pestañas** (componente nuevo
  **`base/Tabs`**, adaptado de shadcn v4; también añadido a `dev/componentes`): **Historia** (texto +
  imagen) · **Certificaciones** (máx 5) · **Equipo** · **Clientes**. Cada colección es **lista compacta
  + modal (`base/Dialog`) con CRUD por ítem** (no un mega-formulario), para escalar a muchos ítems;
  imágenes con `ImagePicker` (formato + peso + medida en texto simple). Backend `MicrositeController`
  reescrito a **CRUD por ítem** (`updateStory` + store/update/destroy de cada colección, con verificación
  de dueño 403). Pest (7) + Vitest (Tabs + página). El bloque legal va en la franja pública (21-B).
- **21-D · Servicios + Proyectos (authoring). ✅** Grupo "Mi Página" += **Servicios** y **Proyectos**.
  **Servicios** (`Associate/Microsite/Servicios`): lista de los **ya seleccionados** en «Mi empresa ›
  Servicios» (solo enriquece; no crea/quita — respeta la revisión de admin), modal con **descripción +
  cover** que actualiza el pivot (`updateExistingPivot`); guard 403 si el servicio no está seleccionado;
  estado vacío enlaza a «Mi empresa › Servicios». **Proyectos** (`Associate/Microsite/Proyectos` +
  `Parts/ProjectDialog`): **CRUD por ítem** (título, cliente opcional, descripción) con **galería
  multi-imagen** (tabla hija, máx 12; añadir/quitar en el mismo modal vía `remove_image_ids[]`);
  `destroyProject` borra archivos + hijas. Backend en `MicrositeController` (`services/updateService`,
  `projects/storeProject/updateProject/destroyProject`, helper `micrositeUrl`). Encabezado común
  `Parts/MicrositeHeader`. Pest (+5: carga/enriquece/guard servicios, CRUD proyecto, guard proyecto) +
  Vitest (Servicios, Proyectos). Baseline Larastan += falsos positivos de relaciones dinámicas.
- **21-E · Galería + Contacto (authoring). ✅** Galería ya vive en "Mi Página" (ítem del plan 0020,
  sin cambios). **Contacto** (`Associate/Microsite/Contacto` + `Parts/FacadeManager`): tarjeta de
  **publicado** (Switch → `togglePublished`), formulario con **WhatsApp + correo de contacto** y
  **fotos de fachada** (hasta 3, cuadradas, add/quitar; `facade_paths`), y tarjeta de **datos del
  perfil** (solo lectura: teléfono/dirección/web/redes, con enlace a «Mi empresa › Contactos»).
  **Compuerta de publicado (ADR-0009):** el público ve el micrositio solo si `is_public &&
  microsite_published`; en borrador solo el **dueño** lo ve como **vista previa** (banner naranja),
  el resto recibe 404; el **directorio** y la ficha de servicio ocultan los borradores. Migración de
  **backfill**: las empresas ya visibles (approved + is_public) quedan publicadas para no romper
  producción. Pest (+6: contacto, toggle, borrador 404, preview dueño, directorio oculta) + Vitest
  (Contacto). El interruptor "publicado" default sigue `false` (nuevas nacen en borrador).
- **21-F · "Ver mi página" en el topbar + cierre. ✅** Botón en el topbar del panel del asociado
  (`AppLayout`, solo asociados) que abre su micrositio en pestaña nueva (slug o id; **vista previa**
  si está en borrador, con etiqueta «borrador»). La dirección viaja en las props compartidas
  (`HandleInertiaRequests` → `auth.associate.microsite_url` + `microsite_published`). Pest (+1:
  prop compartida). Baseline Larastan += acceso dinámico `$user->associate`.

**Gates:** Pint · Larastan · Pest (backend) · types:check · ESLint · Prettier · Vitest (frontend).
Recordatorio: no correr `npm run lint` (reformatea todo el árbol); usar gates escopados o el preflight.
Páginas grandes se parten en `Parts/` (Regla 6).

## 8. Aprobación

- [x] Alcance debatido y cerrado con el usuario (URL al raíz, 5 pestañas, servicios híbridos,
  contacto reusar+WhatsApp/correo/fachada, sin revisión ni cobro, preview+publicado, slug una vez).
- [x] **Decisión resuelta:** imágenes de proyecto en **tabla hija** (`associate_project_images`).
- [x] `#go` → **21-A ✅** (cimientos: datos + ruteo por slug + ADR-0009; preflight 7/7). Pendiente
  `#commit`. Siguen 21-B … 21-F.
- [x] `#go` → **21-B ✅**, **21-C ✅** (reestructurado a Tabs + CRUD por ítem; `base/Tabs` nuevo).
- [x] `#go` → **21-D ✅** (Servicios + Proyectos authoring; preflight 7/7).
- [x] `#go` → **21-E ✅** (Contacto + interruptor publicado + preview + compuerta pública + backfill;
  preflight 7/7).
- [x] `#go` → **21-F ✅** (botón "Ver mi página" en el topbar del panel; preflight 7/7).
- [x] **Refactor (Regla 6):** `MicrositeController` (627 líneas) partido en traits por concern en
  `app/Http/Controllers/Associate/Concerns/`: `ManagesMicrositeSlug`, `ManagesMicrositeAbout`,
  `ManagesMicrositeServices`, `ManagesMicrositeProjects`, `ManagesMicrositeContact` +
  `InteractsWithMicrositeMedia` (helpers compartidos). El controlador queda en 32 líneas; ningún
  archivo supera 250. Sin cambios de comportamiento; preflight 7/7.
  **Plan 0021 COMPLETO** (21-A … 21-F). Todo **verde pero SIN commitear** — pendiente `#commit`.
