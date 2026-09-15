# ADR-0009 · Micrositio del asociado: modelo de datos y ruteo por slug

- **Estado:** Aceptada — implementación en curso (plan 0021).
- **Fecha:** 2026-09-14
- **Afecta a:** `Associate` (+ tablas hijas del micrositio), `PublicCompanyController`,
  `Associate\MicrositeController`, `routes/web.php`, `config/microsite.php`. No toca el login ni las
  rutas del panel autenticado.

---

## Contexto

El perfil público (`/empresas/{id}`) era una ficha fija autoderivada. Se decide convertirlo en un
**micrositio** de 5 pestañas que el asociado nutre desde su panel, con una **URL personalizada** al
raíz del dominio (`dominio/mi-empresa`). Dos riesgos a resolver de raíz: (1) que la URL pública no
afecte de ninguna forma el acceso autenticado del asociado, y (2) que un slug no pueda pisar una ruta
del sistema.

## Decisión

1. **Contenido en tablas propias, no en JSON disperso.** Se añaden a `associates` los campos de
   cabecera del micrositio (`slug`, `microsite_published`, `whatsapp`, `contact_email`,
   `facade_photo_path`, `about_story`) y el pivot `associate_service` gana `description` + `cover_path`
   (enriquece la selección **ya aprobada**, sin permitir crear servicios nuevos ni saltarse su
   revisión). Las colecciones repetibles van en tablas hijas: `associate_projects` (+
   `associate_project_images`, tabla hija para ordenar/borrar imágenes), `associate_certifications`,
   `associate_team_members`, `associate_clients`.

2. **El slug es la fuente de verdad server-side.** Se normaliza siempre con `Str::slug`
   (`"Empresa X" → "empresa-x"`, sin tildes ni ñ), es `unique`, tiene longitud mín./máx.
   (`config/microsite.php`) y **se define una sola vez** (luego lo bloquea; solo un admin lo cambia).
   La disponibilidad se consulta en vivo por un endpoint autenticado con `throttle`.

3. **Ruteo sin colisiones.** La dirección pública se sirve por una ruta comodín `GET /{slug}`
   registrada **de última** en `web.php`, con constraint de forma de slug. Todas las rutas reales
   (login, panel, `/empresas`, `/nosotros`, …) se resuelven **antes**; el comodín solo captura un
   único segmento que nadie reclamó. Una **lista de reservadas** (`config/microsite.php`) impide tomar
   un slug que corresponda al primer segmento de cualquier ruta viva o palabra de plataforma. `slug`
   vacío → se sigue sirviendo `/empresas/{id}`; si el asociado ya tiene slug, `/empresas/{id}` hace
   **301** a la URL canónica.

## Consecuencias

- **El login y el panel quedan intactos.** Es imposible que el micrositio los afecte: sus rutas se
  resuelven primero y el slug es un fallback guardado por la lista de reservadas.
- **Sin revisión de admin** para el contenido del micrositio (decisión de negocio): responsabilidad del
  asociado. La selección de servicios conserva su revisión; el micrositio solo la adorna.
- Añadir una ruta pública nueva obliga a **sumar su primer segmento a las reservadas** (o ya estará
  cubierto si comparte prefijo). Es el único mantenimiento que impone el esquema.
- El borrado de un asociado arrastra en cascada sus tablas hijas del micrositio (FK `cascadeOnDelete`).
