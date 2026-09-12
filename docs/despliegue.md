# Checklist de despliegue — motor de cobro + interruptores de módulo

Reúne, en orden, todo lo necesario para llevar a producción los tres cortes
(motor de cobro unificado, pagos con Bold, interruptores de módulo por plan).

Referencias: [ADR-0001](adr/0001-motor-de-cobro-unificado.md) ·
[ADR-0002](adr/0002-interruptores-de-modulo-por-plan.md) ·
[bold-integracion.md](bold-integracion.md)

Leyenda: 🤖 comando/código · 🙋 requiere una decisión o acción tuya · ⚠️ ojo

---

## 0. Antes de tocar producción

- [ ] 🙋 **Respaldo de la base de datos.** Hay migraciones nuevas; aunque son aditivas,
      un backup es obligatorio.
- [ ] 🙋 Desplegar primero en un entorno de prueba con una copia de los datos reales, y
      hacer la prueba de humo del punto 6 ahí.

---

## 1. Código y dependencias

- [ ] 🤖 `git pull` de la rama con los tres cortes.
- [ ] 🤖 `composer install --no-dev --optimize-autoloader`
- [ ] 🤖 `npm ci && npm run build`

---

## 2. Base de datos (comandos, se ejecutan en el deploy)

Corre en este orden:

- [ ] 🤖 `php artisan migrate --force`
      Crea: campos de pago en `invoices`, tabla `payments`, `features` y `plan_feature`.
      Todo aditivo; no borra nada. `payment_requests` queda intacta.
- [ ] 🤖 `php artisan db:seed --class=FeatureSeeder`
      Cataloga los módulos y siembra el pivote **preservando el acceso actual**
      (foros y anuncios quedan habilitados para todos). Idempotente.
- [ ] ⚠️ 🤖 `php artisan billing:backfill-payment-requests --dry-run`
      **Revisa la salida.** Traslada el histórico de `payment_requests` a
      `invoices` + `payments`. Cuando el dry-run se vea bien:
- [ ] 🙋 `php artisan billing:backfill-payment-requests` (sin `--dry-run`)

---

## 3. Variables de entorno (`.env` de producción)

- [ ] 🙋 `ADMIN_EMAIL=` — a dónde llegan los avisos de comprobantes por revisar.
- [ ] 🙋 **Bold** (cuando tengas las llaves del panel):
      ```
      BOLD_API_KEY=...           # llave de identidad (pública)
      BOLD_SECRET_KEY=...        # llave secreta
      BOLD_WEBHOOK_SECRET=...    # secreto de firma del webhook (si el panel da uno propio)
      ```
      - Sin `BOLD_API_KEY`/`BOLD_SECRET_KEY`, el pago en línea **no aparece** y la
        plataforma sigue cobrando por transferencia y efectivo. Se puede desplegar así y
        activar Bold después.
      - ⚠️ Los secretos los pones tú en el servidor; no deben pasar por el repo.
- [ ] 🤖 Tras editar el `.env`: `php artisan config:cache && php artisan route:cache`

---

## 4. Bold — panel y sandbox (tuyo)

- [ ] 🙋 Crear/obtener las llaves de **sandbox** y de **producción** en el panel de Bold.
- [ ] 🙋 Registrar el webhook en `panel.bold.co/panel/integrations`:
      `https://camepg.org/webhooks/bold` (HTTPS, responde 200; ya está fuera de CSRF).
- [ ] 🙋 Probar en **sandbox** (ver punto 6.B) y cerrar las 4 preguntas abiertas de
      `bold-integracion.md §5`. Recuerda: en sandbox el secreto de webhook es cadena vacía
      → deja `BOLD_WEBHOOK_SECRET=` presente y vacío.

---

## 5. Tareas programadas y cola

- [ ] 🙋 Asegurar el **cron de Laravel** en el servidor (si no está ya):
      ```
      * * * * * cd /ruta && php artisan schedule:run >> /dev/null 2>&1
      ```
      Activa: `invoices:generate-monthly` (día 15), `billing:send-reminders` (diario),
      `subscription:check-expiration` (diario) y `payments:reconcile-bold` (cada hora).
- [ ] 🤖 Verificar con `php artisan schedule:list`.
- [ ] ℹ️ **Cola:** hoy los correos se envían con `defer()` (tras la respuesta), así que
      **no hace falta un worker**. Si en el futuro se corre `php artisan queue:work`, se
      pueden migrar los mailables a `ShouldQueue`.

---

## 6. Prueba de humo (en staging, antes de producción)

### A. Flujo base (sin Bold)
- [ ] 🙋 Un asociado **recién admitido** (`verified`): elige plan → checkout → llega a la
      pantalla de pago → sube comprobante. Un admin lo aprueba en **Pagos** y el asociado
      queda `approved`, con plan, vencimiento al día 19 y perfil público.
- [ ] 🙋 Un asociado **vencido**: entra a facturación, ve su cuenta de reactivación y puede
      pagar. Confirmar que sí queda bloqueado en foros/bienes y libre en facturación.
- [ ] 🙋 **Registro manual (efectivo)** desde el panel: queda firmado quién y cuándo.
- [ ] 🙋 Comprobantes y facturas **no** son accesibles por URL directa sin sesión.

### B. Bold (en sandbox)
- [ ] 🙋 El botón abre el checkout con el monto y la referencia correctos.
- [ ] 🙋 `SALE_APPROVED` aplica el pago una sola vez; un reenvío no duplica.
- [ ] 🙋 Confirmar que el `data-order-id` vuelve como `data.metadata.reference`.
- [ ] 🙋 `SALE_REJECTED` deja la factura pendiente; se puede reintentar.

### C. Interruptores de módulo
- [ ] 🙋 En `/admin/plans`, apagar un módulo (ej. foros) en un plan y confirmar que ese
      asociado deja de poder participar, mientras otro plan sigue con acceso.

---

## 7. Post-despliegue

- [ ] 🙋 Confirmar en `/admin/plans` que cada plan tiene los módulos correctos (el seeder
      solo preserva el estado actual; **restringir** es decisión de negocio tuya).
- [ ] 🙋 Vigilar el log unos días: `payments:reconcile-bold` y los avisos de VOID quedan
      registrados ahí.

---

## Reversa (si algo sale mal)

- El código es aditivo. Un `git revert` del despliegue vuelve al flujo anterior:
  `payment_requests` nunca se dejó de poder leer y las columnas de `plans` siguen
  reflejando la realidad (el admin las sincroniza al guardar).
- Las tablas nuevas (`payments`, `features`, `plan_feature`) pueden quedarse sin uso sin
  afectar al flujo viejo.
- No corras `migrate:rollback` a la ligera en producción: preferible revertir código y
  dejar las tablas nuevas quietas.
