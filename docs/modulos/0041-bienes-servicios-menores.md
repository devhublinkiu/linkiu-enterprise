# Plan de actualización — Bienes y Servicios: fechas y aviso de actualización

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** menores de Bienes y Servicios (10): (5) formato de fecha; (6) envío de
  `TenderUpdatedAlert`.

> Ejecutado tras `*go`. Decisión: el aviso de actualización se manda solo al subir documentos nuevos a
> una licitación ya publicada (coincide con el asunto del correo; no spamea en ediciones triviales).

---

## Cortes

### 5 — Fechas sin coma sobrante
- [x] `'d M, Y'` → `'d M Y'` ("20 nov. 2026") en `BienesServiciosController` (listado y detalle) y, por
  consistencia, en `Associate/AnnouncementController` (listado y detalle).

### 6 — TenderUpdatedAlert ya no es código muerto
- [x] `Admin/LicitacionController@update`: si la licitación ya estaba publicada y se suben documentos
  nuevos, envía `TenderUpdatedAlert`. Se refactorizó `notifyAssociates(tender, mailable)` para compartir
  la query de destinatarios (admitido + al día + módulo); publicación y actualización la reusan.

## Pruebas

- `BienesServiciosTest`: editar una publicada **con** documento nuevo → `TenderUpdatedAlert` (to + bcc),
  sin reenviar `NewTenderPublished`; el caso sin documentos sigue sin enviar nada.

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
