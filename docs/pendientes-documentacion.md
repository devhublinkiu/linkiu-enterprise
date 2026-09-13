# Pendientes de documentación y gobernanza — CAMEPG

- **Fecha:** 2026-09-11
- **Contexto:** el motor de cobro, los interruptores de plan y la integración Bold están muy
  bien documentados (ADR-0001, ADR-0002, `bold-integracion.md`, `despliegue.md`). El resto de
  la plataforma no. Este documento lista, **en orden de prioridad**, el trabajo pendiente de
  documentación, ADRs, reglas y limpieza.

Leyenda: 🔴 crítico · 🟠 importante · 🟡 conviene · ⬜ pendiente · ✅ hecho

---

## Bloque 1 — Crítico (resolver primero)

- [x] ✅ **Commitear `docs/` a git.** Hecho (commit `docs:` en `production`, junto con README y CLAUDE.md).
- [x] ✅ **Decidir y commitear el motor de cobro.** Hecho (commit `feat:` en `production` con
      services, payments, features, migraciones y controladores). `login_debug.txt` se dejó
      fuera a propósito (pendiente de limpieza, Bloque 5).
- [x] ✅ **Escribir un `README.md` real.** Hecho: stack, módulos, puesta en marcha (Herd, MySQL
      `camepg`, Minio), variables clave, tareas programadas, pruebas y despliegue.
- [x] ✅ **Crear `CLAUDE.md` en el repo.** Hecho: entorno Windows/Herd, comandos, reglas de
      arquitectura (aritmética única, rieles de pago, interruptores, section reviews), middleware.

---

## Bloque 2 — ADRs faltantes (decisiones ya tomadas o inminentes)

- [ ] 🟠 **ADR-0003 · Section reviews.** Documentar la migración de `audit_log` (campo a campo)
      a `section_reviews` (JSON, máquina de estados por sección). Decisión hecha y verificada;
      solo vive en memoria del agente.
- [ ] 🟠 **ADR-0004 · Vitrina Empresarial / subdominios.** `propuesta-nuevos-modulos.md` la
      propone y `stancl/tenancy` ya es dependencia, pero no hay decisión escrita: subdominio real
      vs. ruta, resolución del tenant, wildcard DNS, plantilla de las 4 pestañas.
- [ ] 🟠 **ADR-0005 · Notificaciones unificadas.** La rama principal es
      `feature/camep-unified-notifications` y hoy hay ~20 Mailables sueltos sin `app/Notifications`.
      Decidir: canal (mail/database/in-app), tabla, y migración de los Mailables existentes.
- [ ] 🟡 **ADR-0006 · Roles y autorización.** admin / superadmin / associate + middlewares
      existen sin decisión escrita sobre el modelo de permisos.
- [ ] 🟡 **Cierre del retiro de `payment_requests`.** ADR-0001 lo deja "pendiente"; al ejecutar
      el backfill, escribir el ADR de cierre o actualizar el estado del 0001.

---

## Bloque 3 — Pruebas y reglas de repo

- [ ] 🟠 **Suite mínima del motor de cobro.** Hoy solo hay los tests de Breeze por defecto
      (`Auth/*`, `ExampleTest`); nada del cobro. Cubrir al menos:
      - `SubscriptionService`: aritmética `max(hoy, plan_expires_at)`, anclaje al día 19, idempotencia.
      - `PaymentService`: los tres rieles, un solo punto que extiende la suscripción.
      - `BoldGateway`: verificación de firma (HMAC hex sobre base64 del cuerpo), idempotencia por
        `payment_id`, clasificación de los 5 eventos.
- [ ] 🟠 **Regla de pruebas** en CONTRIBUTING: todo riel de pago y toda compuerta de plan lleva test.
- [ ] 🟡 **`CONTRIBUTING.md`.** Convenciones de commit, estilo (ESLint/Prettier/Pint), y sobre todo
      la rama de trabajo (hoy se trabaja sobre `production`, que es riesgoso y no está documentado).
- [ ] 🟡 **Elevar la regla del ADR-0002** ("ningún módulo sin interruptor de plan") a regla de
      repo enlazada desde CONTRIBUTING, para que no se olvide.
- [ ] 🟡 **`SECURITY.md`.** Política de reporte + checklist de seguridad del despliegue (el
      argumento PCI SAQ A ya está en `bold-integracion.md`; enlazarlo).

---

## Bloque 4 — Documentos de referencia

- [ ] 🟡 **Guía de desarrollo local** (`docs/desarrollo.md`): Herd, MySQL, Minio, seeders,
      permisos de storage. Hoy solo en memoria del agente.
- [ ] 🟡 **Modelo de datos / diagrama ER.** 50 migraciones y 29 modelos sin mapa. Priorizar el
      núcleo: Associate ↔ Invoice ↔ Payment ↔ Plan ↔ Feature.
- [ ] 🟡 **Mapa de módulos y su estado.** Qué módulos existen y cuáles tienen interruptor de plan
      realmente aplicado (hoy solo foros y anuncios, según ADR-0002).
- [ ] 🟡 **Glosario de dominio.** "asociado", "corte", "gracia", "riel", "reactivación", día 19.
- [ ] 🟡 **Referencia de variables de entorno.** Explicar cada bloque del `.env.example`
      (Bold, Minio, ADMIN_EMAIL, tenancy).
- [ ] 🟡 **Documentar módulos sin ADR ni doc:** Foros/Red CAMEP, Blog, Bienes y Servicios,
      Convocatorias/Licitaciones, Directorio público.
- [ ] 🟡 **Resolver los modelos huérfanos `Ticket`/`TicketReply`** (sin controlador ni rutas):
      documentarlos como módulo previsto o retirarlos.
- [ ] 🟡 **Patrón `<form>` dentro de `Card` (gap).** El `Card` es `flex flex-col
      gap-[var(--card-spacing)]` y separa a sus hijos directos (Header/Content/Footer). Al
      envolver `CardContent` + `CardFooter` en un `<form>`, el hijo directo pasa a ser el `<form>`
      y la separación se pierde (el footer se pega). Remedio (patrón shadcn): el `<form>` lleva
      `className="flex flex-col gap-[var(--card-spacing)]"`. Aplicado ya en `Auth/Login`,
      `Auth/ForgotPassword` y `Auth/register/{Email,Otp,Details}Step`. **Pendiente opcional:**
      crear un componente `CardForm` en `Components/base/` que incorpore ese gap para no repetir
      la clase ni olvidarla en futuros formularios (cambio de base → su propio `#plan`).

---

## Bloque 5 — Limpieza del repositorio

- [ ] 🟡 **Borrar o gitignorar la basura de raíz:** `login_debug.txt`, `characterization_audit.md`,
      `routes.json`, `routes.txt`, `route_names.txt`, `logo_b64.txt`, `ziggy.json`, y el archivo
      con nombre corrupto **`toArray())`**.
- [ ] 🟡 **Actualizar el índice de ADRs** (`docs/adr/README.md`) a medida que se agreguen 0003+.
- [ ] 🟠 **Entregabilidad de correo (infra) — plan 0004 §10.** No es código (eso ya está: Reply-To
      y texto plano en el corte 4K). Pendiente en Resend/DNS: (1) **enviar desde `camepg.org`**
      (verificar el dominio en Resend y cambiar `MAIL_FROM_ADDRESS`) para alinear remitente con la
      marca —hoy sale de `camepg.com` y enlaza a `.org`, señal de phishing—; (2) **`APP_NAME="CAMEP"`
      en `.env`** (hoy vacío → el From sale sin nombre); (3) completar el **DKIM** en Resend a
      `v=DKIM1; k=rsa; p=…` (hoy solo `p=…`); (4) **DMARC** `p=none` → `p=quarantine` tras monitorear;
      (5) **calentar** el dominio; (6) `List-Unsubscribe` solo cuando exista un flujo de baja real,
      para los correos masivos (foro/licitaciones), no los transaccionales.

---

## Orden recomendado de ejecución

1. Bloque 1 completo (commit de `docs/` + README + CLAUDE.md).
2. ADR-0003 (section reviews) y ADR-0005 (notificaciones) — el código de notificaciones está
   creciendo en la rama principal.
3. Suite mínima de tests del motor de cobro + regla de pruebas.
4. ADR-0004 (vitrina) antes de empezar ese módulo.
5. Referencia (ER, glosario, módulos) y limpieza de raíz, en paralelo cuando haya hueco.
