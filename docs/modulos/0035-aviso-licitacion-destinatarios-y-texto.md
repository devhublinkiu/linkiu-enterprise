# Plan de actualización — Aviso de nueva licitación: destinatarios correctos y texto

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** (A) el aviso de nueva licitación va solo a quien puede abrirla; (B) texto del correo en
  tuteo y con el nombre correcto ("Bienes y Servicios"); semilla local con el módulo en los planes
  pagos; y un texto menor del vacío de Anuncios.

> Ejecutado tras `*go a todo`.

---

## Cortes

### A — Destinatarios del aviso
- [x] `Admin\LicitacionController::notifyAssociatesOfPublication`: antes mandaba a `status = 'verified'`
  (admitidos **sin pagar**, que el middleware manda a Gestión del Plan y no pueden abrir el enlace).
  Ahora va a los **admitidos, al día y con el módulo en su plan** (`approved` +
  `isSubscriptionActive()` + `plan->allows('bienes_servicios')`), reusando la lógica autoritativa.

### B — Texto del correo
- [x] `NewTender.tsx`: tuteo ("puede interesarte", "entra a") y el módulo se nombra **"Bienes y
  Servicios"** (antes "sección de Licitaciones"). Blade recompilado.

### Semilla local
- [x] `LocalShowcaseSeeder`: Profesional y Corporativo traen `can_download_tenders = true` (Básico no),
  para que el demo local sea coherente. En producción lo define el admin por plan.

### Menor
- [x] `Associate/Announcements/Index.tsx`: el vacío decía "despeja los filtros" sin filtros; ahora
  solo "Intenta con otros términos."

## Pruebas

- `tests/Feature/BienesServiciosTest.php`: el admitido-sin-pagar (`verified`) **no** recibe; el
  admitido al día con el módulo sí (tests de aviso actualizados a un destinatario válido).

## Fuera de alcance (menores, follow-up delimitado)

- **Anuncios vencidos en la lista:** decidir ocultarlos o marcarlos "Cerrado" (elección de producto).
- **"Información exclusiva…" en públicos:** no se localizó en la vista pública (el texto solo está en
  la del asociado); confirmar dónde aparece.
- **Migas/menú** sin marcar Anuncios/Bienes en lista y detalle (matching de navegación).
- **Fecha "20 nov., 2026"** con punto: abreviatura estándar en español; cambiarla contradiría el
  corte 0032. Se deja.
- **`tender_updated`** sin uso en el flujo real (correo muerto; no se retira por ahora).

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
