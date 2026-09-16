# ADR-0010 · Documentos de licitación en disco privado y descarga gateada

- **Estado:** Aceptada
- **Fecha:** 2026-09-16
- **Afecta a:** `Licitacion` (colección `documents`), `PublicBienesServiciosController`,
  `Associate\BienesServiciosController`, `LicitacionDocumentController` (nuevo), `routes/web.php`,
  comando `bienes-servicios:secure-documents`. No toca la imagen destacada ni el logo de empresa.

---

## Contexto

En el módulo Bienes y Servicios una licitación puede marcarse `exclusivo_asociados`. La restricción
se aplicaba **solo en el frontend**: el controlador ocultaba el enlace y el contenido a quien no
tuviera sesión (`!auth()->check()`), pero:

1. Los documentos (`documents`, colección Spatie) vivían en el disco **público** (`MEDIA_DISK=public`),
   así que el archivo era descargable por **URL directa** por cualquiera con el enlace, sin importar
   si la licitación era exclusiva.
2. La comprobación `!auth()->check()` dejaba ver el contenido exclusivo a **cualquier usuario
   autenticado** (un registrado que no es asociado, un asociado vencido, o un admin curioso).

El resto de la plataforma ya había resuelto esto para los documentos **sensibles** (documentos del
asociado en `AssociateController::showDocument`; comprobantes y facturas en `BillingDocumentController`):
disco privado + ruta que autoriza y hace *stream* (o firma una URL temporal en S3/Minio). Bienes y
Servicios —módulo legado— nunca adoptó esa convención. (El módulo hermano **Anuncios** comparte el
mismo hueco; queda como deuda a alinear por separado.)

## Decisión

1. **La colección `documents` de `Licitacion` usa el disco privado `local`.** Deja de tener URL
   pública. La **imagen destacada** y el **logo** de empresa siguen en disco público: son de consumo
   público, sin dato sensible.

2. **Una sola ruta de descarga, gateada por el servidor.**
   `GET /bienes-y-servicios/documentos/{tender}/{media}` → `LicitacionDocumentController@download`.
   El controlador acota el `media` a esa licitación y a la colección `documents` (un id ajeno da 404,
   no IDOR), autoriza con la regla única, y sirve: en S3/Minio una URL firmada de 10 min, en local un
   *stream*. Tanto la vista pública como la del asociado apuntan a esta ruta (no a `getUrl()`).

3. **Regla única de acceso** — `Licitacion::isAccessibleBy(?User $user)`, reusada por el controlador
   público (para el contenido/enlace) y el de descarga (para los documentos):

   - `abierto` → cualquiera.
   - `exclusivo_asociados` → **admin**, o **asociado con suscripción activa** (`isSubscriptionActive()`:
     al día o en gracia, igual que el área de asociado gateada por `subscription.active`). Nadie más.

4. **Los documentos ya subidos se aseguran** con el comando idempotente
   `bienes-servicios:secure-documents`, que los mueve del disco público al privado. Se corre al
   desplegar.

## Consecuencias

- Un documento de licitación exclusiva ya no es accesible sin ser asociado activo (o admin), ni por
  URL directa ni por la página. El contenido y el enlace exclusivos también.
- Un asociado **vencido** deja de ver lo exclusivo también en la web pública, coherente con que ya no
  lo ve dentro del panel.
- Frontend sin cambios: las vistas siguen consumiendo `document.url`; solo cambia a qué apunta.
- **Deuda registrada:** Anuncios (misma base Spatie) sigue exponiendo sus documentos por URL pública;
  conviene alinearlo con esta misma decisión en un corte posterior.
- Fuera de alcance de este ADR (siguientes cortes): interruptor de plan `feature:bienes_servicios`,
  auto-cierre por `fecha_cierre`, paginación/N+1 y deduplicación de controladores.
