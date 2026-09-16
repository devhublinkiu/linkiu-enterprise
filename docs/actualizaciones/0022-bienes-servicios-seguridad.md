# Plan de actualización — Bienes y Servicios · Corte 0022-A (seguridad)

- **Estado:** Implementado en local (gates verdes) — sin commit.
- **Fecha:** 2026-09-16
- **Decisiones (confirmadas por el usuario antes del `#go`):**
  - Contenido/documentos `exclusivo_asociados` → **asociado con suscripción activa** (al día/gracia)
    **+ admin**. No cualquier logueado.
  - Documentos → **alinear con el patrón existente** (ruta gateada + disco privado), como
    `AssociateController::showDocument` / `BillingDocumentController`.
- **Hallazgo de seguimiento:** el módulo **Anuncios** (misma base Spatie) comparte el mismo hueco de
  documentos públicos; conviene alinearlo en un corte posterior con esta misma decisión (ADR-0010).
- **Alcance:** Cerrar las tres fugas/riesgos de seguridad del módulo detectadas en el `#review`.
  **Entra:** (1) fin del spam de correos a todos los asociados en cada edición; (2) documentos
  exclusivos servidos por ruta autenticada (disco privado); (3) el contenido `exclusivo_asociados`
  deja de abrirse a cualquier usuario logueado. **NO entra:** auto-cierre por `fecha_cierre`,
  paginación/N+1, deduplicación Associate/Public, modernización visual, ni el interruptor de plan
  (`feature:bienes_servicios`) — se decide aparte (ver §5).

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito.

---

## 1. Componentes

Sin componentes de UI nuevos: es un corte de backend + un pequeño ajuste en las vistas de detalle
para que el enlace de descarga apunte a la ruta gateada.

- **Reutilizar:** `PaymentService`/patrón `defer()` para correo diferido (igual que facturación);
  `Associate::isSubscriptionActive()`; middleware `admin` (ya protege el CRUD).
- **Integrar:** nada de shadcn.
- **Reemplazar:** en `TenderDetail.tsx` (público y asociado), la URL directa de Spatie de cada
  documento por la ruta interna de descarga.
- **Nuevo (solo lo imprescindible):** un controlador de descarga de documentos de licitación
  (`LicitacionDocumentController@download`) que autoriza y hace *stream* desde el disco privado.

## 2. Documentación

- [x] ADR — **ADR-0010: documentos de licitación en disco privado y descarga gateada** (por qué el
  disco `documents` deja de ser público y cómo se autoriza la descarga).
- [x] Seguridad — este plan documenta el modelo de autorización de contenido exclusivo.
- [ ] Funcional/flujos — nota breve en el propio plan; no requiere doc aparte.

## 3. Flujo actual

- **Punto de entrada:** admin `admin/bienes-servicios/tenders/*` (CRUD); público
  `/bienes-y-servicios/{company}/{tender}`; asociado `/dashboard/bienes-y-servicios/...`.
- **Acciones principales:** el admin crea/edita licitaciones (imagen + documentos + contenido HTML);
  público y asociados las consultan.
- **Estados:** `borrador | publicado | cerrado`; público `abierto | exclusivo_asociados`.
- **Validaciones:** las de `store/update` (tipos de archivo, `in:` de enums).
- **Problemas detectados (lo que este corte corrige):**
  1. `LicitacionController@store` y `@update` envían **BCC a TODOS los asociados verificados** de
     forma **síncrona** siempre que `estado === 'publicado'`. En `update` eso re-notifica en **cada
     guardado** (corregir un typo dispara un correo masivo) y bloquea la petición.
  2. La colección `documents` de Spatie vive en el disco **`public`** (default, no hay
     `config/media-library.php`), así que el archivo tiene **URL pública directa**: la restricción
     `exclusivo_asociados` solo oculta el enlace en la página, no protege el archivo.
  3. `PublicBienesServiciosController@showTender` decide el acceso exclusivo con `!auth()->check()`,
     de modo que **cualquier usuario autenticado** (no asociado, vencido o admin curioso) ve el
     contenido y el enlace exclusivos por la URL pública.
- **Resultado esperado tras el corte:** un correo por licitación (solo al publicarse, diferido);
  documentos exclusivos inaccesibles sin sesión de asociado activo; contenido exclusivo visible solo
  para asociado con suscripción activa (o admin).

## 4. Revisión de accesibilidad

Cambio mínimo en UI (el enlace de descarga cambia de destino, no de forma). Se conserva texto y foco
existentes; el enlace sigue siendo un `<a>` con nombre accesible. Sin regresiones previstas.

## 5. Revisión de seguridad

Modelo de autorización objetivo para contenido/descargas **exclusivos** (una sola regla, reutilizada
en el controlador público y en el de descarga):

```
puedeVerExclusivo = usuario->esAdmin()
                 || (usuario->associate && usuario->associate->isSubscriptionActive())
```

- **Contenido (`contenido`, `enlace_externo`):** en el controlador público, `isRestricted` pasa de
  `!auth()->check()` a `publico_objetivo === 'exclusivo_asociados' && !puedeVerExclusivo`.
- **Documentos:** la colección `documents` se mueve al disco privado `local`. Las vistas ya no
  reciben la URL de Spatie sino una ruta interna `…/tenders/{tender}/documents/{media}` que:
  - `abierto` → cualquiera puede descargar;
  - `exclusivo_asociados` → exige `puedeVerExclusivo`, si no **403**;
  - valida que el `media` pertenezca a esa licitación y a la colección `documents` (evita IDOR).
- **`featured_image` y `logo`** siguen en disco público (son miniaturas de consumo público, sin
  dato sensible).
- **Decisión abierta (fuera de este corte):** aplicar `feature:bienes_servicios` a las rutas de
  asociado (ADR-0002). La feature **ya existe** (sembrada desde `can_download_tenders`), así que es
  solo añadir el middleware — pero **cambia quién ve el módulo** (planes con `can_download_tenders`
  en falso lo perderían). Lo dejo como decisión tuya; no lo incluyo aquí para no alterar accesos sin
  tu visto bueno.

## 6. Revisión funcional

- **Sigue igual:** admin CRUD, imagen destacada, listados público/asociado, render sanitizado
  (DOMPurify) del contenido.
- **Cambia:**
  - Correo: se envía **solo en la transición a `publicado`** (al crear ya publicada, o al pasar de
    `borrador`/`cerrado` → `publicado`), **diferido** con `defer()` y **en lotes** (BCC por tandas
    para no armar una cabecera gigante). Se retira el envío automático de `TenderUpdatedAlert` en
    cada guardado (queda el Mailable disponible para un futuro botón "notificar cambios" manual).
  - Descarga de documentos vía ruta gateada.
- **Casos límite / pruebas:**
  - editar una licitación ya publicada **no** dispara correo;
  - publicar una en borrador dispara **un** correo (diferido);
  - documento de licitación `exclusivo_asociados` → 403 para invitado y para asociado vencido; 200
    para asociado activo y para admin;
  - documento de licitación `abierto` → 200 para cualquiera;
  - `media` de otra licitación en la ruta de descarga → 404;
  - contenido exclusivo nulo en la respuesta pública para no autorizados.

## 7. Plan de actualización (pasos)

1. **`Licitacion::registerMediaCollections`** — `documents` con `->useDisk('local')`. Ajustar
   `?Media` en `registerMediaConversions` (deprecación PHP 8.4) de paso.
2. **Migración de datos** — mover a `local` los documentos existentes que estén en `public`
   (comando/artisan puntual e idempotente). En local hay datos de prueba; en prod, si aún no hay
   licitaciones con documentos, es no-op.
3. **`LicitacionDocumentController@download`** + ruta (nombre `bienes-servicios.tender.document`)
   accesible sin `subscription.active` en el grupo (la autorización fina la hace el controlador),
   con la regla `puedeVerExclusivo`. *Stream* con `Storage::disk('local')->download()` /
   `$media->toResponse($request)`. Guard de pertenencia (media↔tender↔colección).
4. **`PublicBienesServiciosController@showTender`** — sustituir `!auth()->check()` por la regla de
   §5; mapear cada documento a la nueva URL de descarga en vez de `getUrl()`.
5. **`Associate\BienesServiciosController@showTender`** — mapear documentos a la ruta de descarga
   (aunque el asociado ya está gateado por `subscription.active`, unifica el origen de las URLs).
6. **`LicitacionController@store/@update`** — guardar `estado` previo, notificar **solo** en la
   transición a `publicado`, envolver en `defer()` y trocear el BCC en lotes; quitar el
   `TenderUpdatedAlert` automático de `@update`.
7. **Vistas `TenderDetail.tsx` (Public y Associate)** — usar `document.url` ya reescrita (sin cambio
   de forma); verificar que `isRestricted` sigue ocultando bloque exclusivo.
8. **Pruebas Pest** — feature test del módulo (hoy 0 cobertura): autorización de descarga (4 casos),
   restricción de contenido exclusivo, y "editar publicada no notifica / publicar sí notifica"
   (`Mail::fake()`).
9. **ADR-0010** + índice de ADRs.

**Gates a ejecutar:** Pint · Larastan · Pest (nuevas pruebas) · types:check · ESLint · Prettier
(solo archivos tocados) · Vitest (sin cambios de lógica JS, correrá igual).

## 8. Aprobación

- [x] Plan revisado
- [x] `#go` recibido → implementado
- [x] Gates verdes: Pint · Larastan (0 errores) · Pest (183 + 12 nuevas del módulo). JS sin cambios.

**Pendiente de despliegue:** correr `php artisan bienes-servicios:secure-documents` para asegurar
documentos ya subidos (en local: 0 por mover, aún no hay adjuntos).
