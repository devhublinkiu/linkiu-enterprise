# ADR-0005 · La ficha del asociado se gobierna por secciones independientes

- **Estado:** Aceptada (decisión) — implementación pendiente, se aplica **sección por sección**
- **Fecha:** 2026-09-13
- **Afecta a:** `Associate`, `section_reviews`, `AssociateController`, el área de perfil del
  asociado y la auditoría del admin. Es el **ADR general**; cada sección tendrá su **sub-ADR**
  (`0005-a`, `0005-b`, …) con sus reglas propias.

---

## Contexto

El perfil del asociado ya se revisa por secciones: cada sección tiene su estado en el JSON
`section_reviews` (reemplazó al viejo `audit_log` campo a campo). Pero al levantar el flujo real
—usando **Información Básica** como caso— aparecieron tres cosas que estorban y que hay que fijar
antes de intervenir sección por sección:

1. **Doble ida y vuelta para cambiar algo aprobado.** Un asociado que quiere corregir un dato ya
   aprobado debe *solicitar un cambio* (con motivo), esperar a que el admin **apruebe la solicitud**
   (estado `change_pending`), editar, reenviar, y esperar a que el admin **apruebe de nuevo**. Dos
   aprobaciones para un cambio. El estado `change_pending` solo autoriza *desbloquear*; no protege
   el dato (el sistema no versiona: en cuanto se desbloquea, se edita el dato en vivo).

2. **Dos puertas de escritura con reglas opuestas.** El asociado pasa por todo el ritual de
   revisión; el admin, en cambio, tiene un formulario de edición (`PUT admin.associates.update`)
   que sobreescribe los datos **en silencio**, sin cambiar el estado de la sección, sin correo y
   sin traza. Y ese `update()` es un método *catch-all* que toca campos de varias secciones a la
   vez, acoplándolas.

3. **Restos muertos.** `VerificationDashboard.tsx` es una pantalla mockeada (datos fijos, sin
   acciones); la auditoría real vive en `Admin/Associates/Show`. Y el formulario del asociado
   arrastra props del modelo campo-a-campo ya retirado (`auditLog={{}}`, `setChangeRequestField`).

El patrón: la máquina de revisión existe, pero no es la **única** forma en que cambia la ficha, y
tiene un estado de más. Antes de tocar cada sección, se fija el esqueleto común.

---

## Decisión

### 1. Una sola fuente de verdad: la máquina de revisión por sección

> Toda modificación de la ficha del asociado entra por la máquina de estados de la sección.
> No existe ninguna vía que cambie los datos «por fuera» de ella.

### 2. Cuatro estados, no cinco

Se **elimina** `change_pending`. La máquina queda:

```
draft → pending → approved
          ▲          │  (el asociado pulsa «Editar»)
       rejected ◀────┘
          │
          └── editar → pending
```

| Estado | Quién manda | Editable | Qué significa |
|---|---|---|---|
| `draft` | asociado | sí | Lienzo privado. Validación **laxa**: guarda a medias. |
| `pending` | asociado → espera admin | no | Enviada. Validación **estricta** pasó. Esperando revisión. |
| `approved` | admin | no (se reabre con «Editar») | CAMEP dio visto bueno. |
| `rejected` | admin → vuelve al asociado | sí | Devuelta con **motivo**. Corrige y reenvía. |

- **Reabrir una sección aprobada:** el asociado pulsa **«Editar»** y la sección vuelve a
  `draft` (edita con calma, guarda a medias, y decide **cuándo** *Enviar a revisión*). No pide
  permiso para desbloquear; el candado real —que nada re-aprobado cambia sin el admin— se conserva
  porque la re-aprobación sigue existiendo.
- Se retiran: el estado `change_pending`, `requestSectionChange()` + su ruta + su modal, y
  `auditChangeRequest()` + su ruta + su UI. Y el correo `AssociateFieldChangeRequested`.

### 3. El asociado es el único autor; el admin solo aprueba o rechaza

> El admin **no edita** los datos de la ficha. Su rol es **aprobar** o **rechazar** (con motivo).
> Una corrección se pide **rechazando con motivo**; el asociado la aplica y reenvía.

- Se retira la edición del admin: los modos edición de las pestañas y el `PUT
  admin.associates.update`. La vista del admin (`Associates/Show`) queda **solo lectura +
  aprobar/rechazar**.
- **Excepción real** (socio inactivo, dato que hay que tocar sí o sí): es una intervención de
  **super-admin / base de datos**, documentada y puntual — **no** una función del producto.

### 4. Independencia total entre secciones

> Guardar, enviar o revisar una sección **no toca** el estado ni los datos de ninguna otra.

Cada sección posee: **solo sus campos**, **su** clave en `section_reviews`, **sus** rutas y **sus**
validaciones. Prohibido el método *catch-all* que escribe varias secciones (por eso cae el
`update()` del admin). Información Básica no puede afectar a Caracterización, ni al revés.

### 5. La unicidad la garantiza el NIT

- El **NIT** lleva la restricción de unicidad (identificador real de la empresa).
- La **razón social** (`company_name`) **no** es única: caben homónimos legítimos. No se añade
  aviso de duplicado por nombre (sería complejidad sin problema que la motive).

### 6. Borrador laxo, envío estricto

En `draft` los campos son opcionales (se guarda incompleto). La obligatoriedad se valida **solo al
Enviar a revisión**. El borrador es un lienzo; la revisión es el contrato.

### 7. Alertas, mensajes y validaciones son parte del contrato de cada sección

No son un adorno final. Cada sub-plan define, explícitamente: qué se valida (laxo vs. estricto),
qué mensaje sale en cada caso (éxito, error, en revisión, rechazo con motivo) y con **qué
componente** se muestra. Los banners y avisos se rehacen con el **sistema de diseño** (tokens y
componentes `base/`); nada de colores hardcodeados (hoy usan `slate/amber/emerald` literales).

---

## Alcance y pendientes explícitos

- **Fuera de este alcance — imágenes (logo y galería).** La regla «el admin no edita» **también
  cubrirá** el logo y la galería, pero **no se tocan ahora**: requieren resolver primero el
  almacenamiento (Amazon/S3). Queda anotado como su propia intervención futura.
- **Fuera de este alcance — estado global del asociado y visibilidad pública.** La relación entre
  el `status` global (`draft/pending/verified/…`), la admisión del socio y `is_public` (hoy palanca
  manual del admin) **no** se decide aquí. Es una decisión aparte, posterior a ordenar las
  secciones. Este ADR gobierna **solo** la máquina de secciones.
- `VerificationDashboard.tsx` (mock muerto) se retira cuando se intervenga el lado admin.

---

## Estructura de la documentación

- **Este ADR (0005)** fija el esqueleto que heredan todas las secciones.
- **Sub-ADR por sección** (`0005-a-informacion-basica`, `0005-b-caracterizacion`, …): reglas
  propias de cada una (campos, obligatorios, validaciones y mensajes específicos).
- En `docs/actualizaciones/`: un **plan general** (0007) y un **plan por sección**.

---

## Opciones consideradas

**A. Conservar `change_pending`.** Da al admin el poder de autorizar el *desbloqueo* de una
sección aprobada. Se descarta: son dos aprobaciones para un cambio y el estado no protege el dato
(no hay versionado). La re-aprobación del resultado ya es candado suficiente.

**B. Mantener la edición del admin con traza (`edited_by/at/note`).** Conserva las dos puertas y
agrega una capa de auditoría. Se descarta por complejidad: dos formas de cambiar el mismo dato con
reglas distintas es justo lo que enreda. Una sola puerta es más simple y más honesta.

**C. Unicidad dura de razón social + aviso de duplicados.** Se descarta: bloqueos falsos y una
feature nueva sin un problema que la motive. El NIT ya identifica de forma única.

---

## Consecuencias

**A favor**

- Un estado menos, una ruta y dos métodos menos, un modal y ~dos correos menos, un `PUT` menos.
  El flujo queda **más chico** que el actual.
- Una sola forma de que cambie la ficha ⇒ cero ambigüedad sobre «quién y cómo la tocó».
- Secciones desacopladas ⇒ intervenir una no arriesga otra; se puede trabajar sección por sección
  sin efectos colaterales.

**En contra**

- El admin pierde el atajo de corregir un typo él mismo; ahora rechaza con motivo (una vuelta con
  el socio). Es el costo de tener una sola autoría.
- Es un cambio de comportamiento sobre datos de producción: se aplica **sección por sección**, con
  su plan y sus pruebas, no de un solo golpe.
