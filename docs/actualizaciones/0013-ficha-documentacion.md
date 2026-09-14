# Plan de actualización — Ficha del asociado · Documentación

- **Estado:** Hecho
- **Fecha:** 2026-09-14
- **Alcance:** Migrar la **última** sección de la ficha (`documentation`) al modelo ADR-0005 (4 estados,
  reabrir con "Editar", admin solo aprueba/rechaza) con UI en `base/` + tokens (design.md §6), y —por ser
  la última— **cerrar ADR-0005**: retirar el flujo de solicitud de cambio, el `PUT associates.update`
  no-op y `SEC_CHANGE_PENDING`. **No entra:** el catálogo admin de documentos (ya modernizado en 0012,
  aquí solo se consume), ni Imágenes/logo/galería (dependen de S3, van al final).

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

La pantalla actual (`Associate/Company/Documentation.tsx`) y el tab admin (`TabDocumentation.tsx`) usan
idioma **legacy**: `@/Components/ui/*`, modales caseros (`fixed inset-0 … bg-black/60`), `StatusBadge`/
`FieldWrapper` (auditoría campo a campo ya retirada), `SectionReviewBanner`, tarjeta oscura "firma
digital / Trust Identity", barra de progreso a mano, colores hardcodeados (`slate/emerald/red/amber/
indigo`) y props `any`. Se reconstruye con `base/` + tokens siguiendo **design.md §6/§7.4** y el patrón de
las secciones ya migradas (0007–0011).

**Componentes nuevos: se auditará en 13-B, pero no se anticipa ninguno** — todo lo necesario ya está en
`base/`.

Tabla auditada control por control contra el código real:

| Componente | Rol en Documentación | Estado | Acción |
| --- | --- | --- | --- |
| **Card** (`Card`, `CardHeader`, `CardContent`, …) | tarjetas de Documentos, Interés de afiliación y Declaración jurada | ✅ en `base/` | Reutilizar |
| **Field** (`Field*`) + helper `FormField` (0007) | representante/cédula, "otro" interés | ✅ en `base/` | Reutilizar |
| **Input** | `rep_name`, `rep_doc`, `membership_interest_other` | ✅ en `base/` | Reutilizar |
| **Checkbox** | aceptación del juramento (`funds_origin_declaration`) e ítems de interés de afiliación | ✅ en `base/` | Reutilizar |
| **Dialog** (familia) | previsualización de documento (reemplaza el modal casero) | ✅ en `base/` | Reutilizar |
| **Progress** | barra de completitud documental | ✅ en `base/` | Reutilizar |
| **Button** | subir/reemplazar/eliminar doc, guardar borrador, enviar, "Editar" (reabrir) | ✅ en `base/` | Reutilizar |
| **Badge** | "Obligatorio"/estado por documento | ✅ en `base/` | Reutilizar |
| **Alert** | mensajes de éxito/error/borrador y resumen de errores | ✅ en `base/` | Reutilizar |
| Banner de revisión + acciones (patrón 0007–0011) | estado de la sección + "Editar" cuando `approved` | ✅ existente | Reutilizar el mismo patrón que BasicInfo/Contacts |

- **Reutilizar:** `Card*`, `Field*`, `Input`, `Checkbox`, `Dialog*`, `Progress`, `Button`, `Badge`,
  `Alert`; helper local `FormField`; el patrón de banner/acciones de secciones ya migradas. Iconos por
  `lucide-react` (mapa `@/lib/documentIcons`, sin cambios).
- **Composición local (no `base/`, re-estilada a tokens):** la **grilla de tarjetas de documento**
  (subir/reemplazar/eliminar/ver + plantilla descargable), como en las demás secciones.
- **Reemplazar / retirar (solo en estas pantallas):** `ui/*` → `base/*`; modales caseros → `base/Dialog`;
  `StatusBadge`/`FieldWrapper`/`SectionReviewBanner` legacy → patrón de revisión migrado; tarjeta oscura
  "firma digital / Trust Identity" → **tarjeta estándar (§6) con Checkbox de aceptación**; barra de
  progreso a mano → `base/Progress`; colores hardcodeados → tokens; `any` → tipos reales.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0013-ficha-documentacion.md`).
- [x] **ADR-0005-e — Documentación (sub-ADR de 0005)**: reglas propias de la sección (campos, envío
      estricto, reapertura con "Editar", admin no edita) + nota de **cierre de ADR-0005**.
- [x] **ADR-0005 (padre)**: marcado el cierre — retirado el flujo de solicitud de cambio y el
      `associates.update` no-op; todas las secciones migradas.
- [x] `docs/adr/README.md` — fila 0005-e.
- [ ] `README.md` de actualizaciones — fila 0013.
- [ ] `orden-componentes.md` — **sin cambios** (no se crea ningún componente).
- [x] `docs/ejemplos/empresa-ficticia.md` — añadida la sección Documentación (docs + interés + declaración).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Entrada:** `GET /company/documentation` → `AssociateController@editDocumentation` →
  `Associate/Company/Documentation.tsx`. Renderiza `initialAssociate` + `documentCatalog()` (activos del
  catálogo admin, agrupados obligatorios/opcionales).
- **Campos de la sección `documentation`** (una sola *section review*):
  1. **`files`** (documentos por clave del catálogo). Validación por-clave (MIME según `accepts` + 10 MB),
     guardado en disco por defecto con borrado del anterior (`storeAssociateDocument`).
  2. **`membership_interest[]`** + **`membership_interest_other`** (interés de afiliación).
  3. **`rep_name`, `rep_doc`, `funds_origin_declaration`** (declaración jurada).
- **Acciones asociado hoy:**
  - `saveDocumentationDraft`: guarda parcial; si el estado no es pending/approved/**change_pending**, lo
    pone en `draft`.
  - `updateDocumentation`: exige `canSubmitSection`; valida (juramento `accepted`, `rep_name`/`rep_doc`
    requeridos, `membership_interest` min 1, `_other` si "Otro", MIME/tamaño por archivo) y **todos los
    obligatorios presentes**; pasa a `pending` y envía `AssociateDocsSubmitted` al admin.
  - `deleteDocument`: borra un archivo (solo si `canEditSection`).
  - `showDocument`: sirve el archivo con control de acceso (dueño o admin); S3 → URL firmada 10 min.
- **Flujo viejo que aún conserva (a retirar, Opción A):**
  - `change_pending`: `requestSectionChange` (`in:documentation`) → notifica admin; `auditChangeRequest`
    (admin aprueba→draft / rechaza→approved).
  - `PUT admin.associates.update` → **no-op** (`return back()`), vivo solo por 4 tests.
  - `Associate::SEC_CHANGE_PENDING` + `canRequestSectionChange()`; manejo de `change_pending` en Show.tsx.
- **Admin hoy:** `TabDocumentation.tsx` muestra declaraciones + archivos (con "documentos históricos"
  huérfanos del catálogo) + `SectionAuditPanel` con `onAuditChangeRequest`.
- **Seguridad hoy:** rutas del asociado bajo su middleware de onboarding/subscription; `showDocument`
  valida dueño/admin; el panel admin ya bajo middleware `admin` (ADR-0006).
- **Resultado esperado:** mismo comportamiento de datos/validación/almacenamiento; cambia la piel, el
  modelo de estados (fuera `change_pending`, entra "Editar") y se retira el código muerto.

## 4. Revisión de accesibilidad

- **Subida de documentos:** cada tarjeta con `aria-label` claro ("Subir {documento}", "Reemplazar",
  "Eliminar", "Ver"); estado cargado/faltante comunicado con **texto + ícono + color** (no solo color);
  errores por documento con `role="alert"`.
- **Checkbox del juramento e ítems de interés:** control nativo accesible (`base/Checkbox`) con etiqueta
  asociada; foco y teclado correctos (reemplaza los `div onClick` actuales).
- **Dialog de previsualización:** foco atrapado, `Esc` cierra, título asociado, enlace "abrir en pestaña".
- **Progress:** con `aria` de progreso y texto equivalente ("N/M obligatorios").
- **Resumen de errores:** `Alert` con lista, foco/scroll al enviar con errores (se preserva el
  comportamiento actual).

## 5. Revisión de seguridad

- **Validación al servidor (autoridad):** se conservan íntegras las reglas de `updateDocumentation`
  (juramento aceptado, campos requeridos, MIME/tamaño por archivo, obligatorios completos) y las guardas
  de estado (`canSubmitSection`/`canEditSection`). El front solo asiste.
- **`showDocument`:** control de acceso dueño/admin y URL firmada de corta vida — sin cambios.
- **Reapertura:** `reopenDocumentation` exige `canReopenSection` (`approved`), como el resto.
- **Cierre del flujo viejo:** al retirar `requestSectionChange`/`auditChangeRequest`/`update`, se elimina
  superficie (endpoints que ya no deben existir). El admin **no edita** la ficha por ninguna vía.
- **Subidas grandes:** se conserva la detección de `post_max_size` excedido y el mensaje con el tope real.

## 6. Revisión funcional

- **Debe seguir igual:** subir/reemplazar/eliminar/previsualizar documentos con su catálogo; validación
  por-clave; obligatorios completos al enviar; declaración jurada + interés de afiliación requeridos al
  enviar; borrador laxo; correo `AssociateDocsSubmitted`; `showDocument` con URL firmada.
- **Cambia:**
  - **Estados:** entra al modelo de 4 estados; **reabrir con "Editar"** (`reopenDocumentation`,
    `approved → draft`) en lugar de solicitar cambio. El admin solo **aprueba/rechaza** (corrección =
    rechazo con motivo).
  - **Declaración jurada:** tarjeta estándar (§6) + **Checkbox** de aceptación (semántica legal), sin el
    cromo "Trust Identity".
  - **UI asociado + admin:** reconstruidas con `base/` + tokens; preview en `Dialog`; progreso con
    `Progress`; fuera `any` y colores hardcodeados.
- **Cierre ADR-0005 (Opción A):** se **retiran** `requestSectionChange`, `auditChangeRequest`, `update()`
  y sus rutas; `SEC_CHANGE_PENDING` + `canRequestSectionChange`; y el manejo de `change_pending` en
  Show.tsx / `saveDocumentationDraft`. Se **actualizan** los 4 tests de sección (BasicInfo,
  Characterization, Contacts, Services) que invocan esas rutas: se **eliminan** los casos ya obsoletos
  ("rechaza solicitud de cambio sobre X" y "el admin no edita" vía `associates.update`), pues el endpoint
  deja de existir (la garantía se refuerza: no hay vía que abusar).
- **Alertas / mensajes (contrato, se preservan textos del backend):**
  | Situación | Mensaje | Componente |
  |---|---|---|
  | Documentación enviada | "Documentación enviada a revisión." | `Alert success` |
  | Faltan obligatorios | "Faltan documentos obligatorios: …" | `Alert error` |
  | Formato/tamaño de archivo | mensaje por archivo | `Alert`/error por doc |
  | Subida supera el límite del servidor | "Los archivos superan el tamaño máximo… (N MB)…" | `Alert error` |
  | Borrador guardado | "Borrador guardado · {hora Colombia}" | `Alert`/nota |
  | Sección reabierta | "Sección reabierta para edición…" | `Alert success` |
  | Documento eliminado | "Documento eliminado." | `Alert success` |
- **Casos límite con pruebas (`DocumentationSectionTest`):** enviar sin obligatorios → rechazo; enviar sin
  juramento/representante/interés → rechazo; formato/tamaño inválido → rechazo; guardar borrador no toca
  el estado si está pending/approved; `reopenDocumentation` solo desde `approved`; `deleteDocument` solo
  si editable; `showDocument` niega a terceros; **el admin no edita** (ya sin endpoint); reapertura marca
  `draft`; hora de "borrador guardado" en zona Colombia.

## 7. Plan de actualización (cortes)

- **13-A · Backend + cierre ADR-0005.** ✅ `reopenDocumentation` (`approved → draft`) + ruta
  `reopen.documentation`; quitado el manejo de `change_pending` de los guardas de borrador; **retirados**
  `requestSectionChange`, `auditChangeRequest`, `update()` y sus rutas; retirados `SEC_CHANGE_PENDING` y
  `canRequestSectionChange` de `Associate` (import `AssociateFieldChangeRequested` fuera del controlador;
  la clase se conserva, la usa `SendTestMail`). Conservados `updateDocumentation`/`deleteDocument`/
  `showDocument`. **Actualizados** los 4 tests de sección (borrados los casos obsoletos). **Pest**
  `DocumentationSectionTest` (13 tests). Baseline de Larastan ajustado (3 conteos que bajaron al borrar
  código: `env` 2→1, `$users` 3→2, `?->email` 3→2). Gates: Pint ✅ · Larastan `[OK]` ✅ · Pest
  **115/115** ✅.
- **13-B · Front asociado.** ✅ `Associate/Company/Documentation.tsx` → `Documentation/Index.tsx` +
  `types.ts` + `Parts/` (`DocumentsGrid`, `MembershipInterest`, `SwornDeclaration`) con `base/` + tokens
  + design.md §6: grilla de documentos (subir/reemplazar/eliminar/ver/plantilla + validación cliente de
  formato/tamaño), `Progress` de avance, preview en `Dialog`, **Checkbox** del juramento e ítems de
  interés, banner/acciones + "Editar" (reopen) como las secciones migradas, sticky actions, hidratación
  null-safe, sin `any`. Controlador renderiza `Documentation/Index`; borrado el archivo plano viejo.
  **Vitest** `Documentation.test.tsx`. Gates: types:check ✅ · ESLint ✅ · Prettier ✅ · Vitest
  **90/90** ✅.
- **13-C · Admin.** ✅ `TabDocumentation.tsx` reescrito read-only + `AuditPanel` local (base/ + tokens,
  como `TabServices`, **sin** change-request): declaraciones e interés, documentación oficial y
  "documentos históricos" (claves fuera del catálogo), preview en `Dialog`; tipado real (fuera `any`).
  `Show.tsx`: retirado `handleAuditChangeRequest`, el prop en `TabDocumentation` y las dos ramas
  `change_pending` de los contadores. `SectionAuditPanel.tsx` se conserva (sigue siendo la fuente del
  tipo `SectionReviewData` y lo usan tabs aún no modernizados). Gates: types:check ✅ · ESLint ✅ ·
  Prettier ✅ · Vitest **90/90** ✅.

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (13-A) · **Frontend** —
types:check · ESLint · Prettier · Vitest (13-B/13-C).

## 8. Aprobación

- [x] Decisión §6: **Opción A** — migrar Documentación y **cerrar ADR-0005** (retirar flujo viejo +
      actualizar los 4 tests de sección).
- [x] Decisión §6: Declaración jurada = **tarjeta estándar + Checkbox** (design.md §6), sin "Trust Identity".
- [x] Plan revisado.
- [x] `#go` recibido → **13-A ✅ → 13-B ✅ → 13-C ✅**. Plan 0013 implementado; ADR-0005 cerrado.

## Decisiones cerradas

1. **Última sección → cierre de ADR-0005.** Documentación adopta el modelo de 4 estados y "Editar"
   (reopen); se retiran el flujo de solicitud de cambio, el `associates.update` no-op y
   `SEC_CHANGE_PENDING`, con actualización de los 4 tests de sección afectados.
2. **Tres piezas, una sección.** Documentos + interés de afiliación + declaración jurada siguen juntos en
   la sección `documentation` (una sola review, mismo momento de onboarding).
3. **Declaración jurada estándar.** Tarjeta de sección normal + Checkbox de aceptación (semántica legal),
   alineada a design.md §6.
4. **Cero componentes nuevos** (a confirmar en 13-B): todo sale de `base/`; la grilla de documentos es
   composición local re-estilada a tokens.
5. **Backend de documentos intacto.** Subida/validación/almacenamiento/`showDocument` se conservan; solo
   cambian los estados y la piel.
