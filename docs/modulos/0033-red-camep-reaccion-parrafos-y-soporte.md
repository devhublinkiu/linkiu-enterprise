# Plan de actualización — Red Camep: correo de respuesta, reacción al objeto correcto, párrafos; y botón Soporte

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** (A) el correo de nueva respuesta deja de fallar en Linux; (B) el pulgar valora el
  objeto correcto (tema vs respuesta); (C) los párrafos del foro conservan los saltos de línea;
  (D) el botón "Soporte CAMEP" de Anuncios enlaza a Mensajes.
  **NO entra:** los "menores" de 09/10/11 (abajo).

> Ejecutado tras `*go` (A+B+C+D, recomendados).

---

## Cortes

### A — Correo "Nueva respuesta" (crítico, producción)
- [x] `NewForumReply.php`: `view('emails.forum\new_reply')` → `'emails.forum.new_reply'`. La barra
  invertida es un carácter literal en Linux → la vista no se encontraba y el correo fallaba (solo
  quedaba en el log). La vista correcta ya existe.

### B — Reacción al objeto correcto (bug lógico)
- [x] La ruta era `/react/{type}/{id}` sin decir si el id es tema o respuesta, y el controlador
  buscaba tema primero (`ForumTopic::find($id)`): el voto de una respuesta caía en el tema del mismo
  número. Ahora: `/react/{reactable}/{type}/{id}` (`reactable` ∈ {topic, reply}), el controlador
  resuelve el modelo por `reactable`, y las 2 llamadas del frontend mandan `reactable`.

### C — Párrafos del foro
- [x] `TopicShow.tsx`: `whitespace-pre-line` en el contenido de tema y de respuesta (el texto viene
  de un Textarea con saltos de línea, no HTML; el CSS de prose no lo cubría).

### D — Botón "Soporte CAMEP"
- [x] `Associate/Announcements/Show.tsx`: el botón (sin acción) ahora enlaza a
  `route('associate.messages.index')`.

## Pruebas

- `tests/Feature/ForumReactTest.php`: valorar una respuesta marca la respuesta (no el tema del mismo
  número); valorar un tema marca el tema.

## Fuera de alcance / menores (anotados)

- Correo de licitación: "sección de Licitaciones" → "Bienes y Servicios", tuteo, enviar solo a quien
  corresponde por plan/vencimiento. `NewForumReply`: nombre de la persona vs. nombre de la empresa.
- Foro: "Reportar" con `window.prompt` → diálogo; resumen que siempre termina en "..."; fechas
  `toLocaleDateString()` → locale `es-CO`; "¡Aporte valorado!" también al quitar el voto; el aviso
  `info` no se ve.
- Anuncios: vencidos en lista; "Información exclusiva…" en públicos; "despeja los filtros" sin
  filtros; migas/menú.
- Nota: "el foro abre sin plan vigente" es **a propósito** (leer es público; publicar lo frena
  `subscription.active`).

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
