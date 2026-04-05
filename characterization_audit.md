# Auditoría de Paridad: Información Básica vs Caracterización

Este documento detalla las diferencias actuales entre los dos módulos para asegurar una implementación espejo.

## 1. Vista del Asociado (Formularios)

| Característica | Información Básica | Caracterización | Estado de Paridad |
| :--- | :--- | :--- | :--- |
| **Ubicación de Badges** | Al lado de la etiqueta (arriba) | Debajo del input (nuevo ajuste) | ⚠️ **Desfasado** (Básica sigue arriba) |
| **Solicitar Cambio** | ✅ Funcional y con Modal | ✅ Implementado (Paridad lograda) | ✅ **OK** |
| **Badges de Estado** | Aprobado, Rechazado, Solicitud Pendiente | Aprobado, Rechazado, Solicitud Pendiente | ✅ **OK** |
| **Lógica de Bloqueo** | Bloquea si está Aprobado o Pendiente | Bloquea si está Aprobado o Pendiente | ✅ **OK** |
| **Alertas Superiores** | Muestra avisos de revisión/rechazo | Muestra avisos de revisión/rechazo | ✅ **OK** |
| **Campo Requerido** | Asterisco rojo (*) | Asterisco rojo (*) | ✅ **OK** |

> [!WARNING]
> **Decisión de Diseño**: Robert pidió colocar badges debajo en Caracterización. Para paridad total, deberíamos aplicar esto también a Información Básica o decidir si Caracterización será el nuevo estándar.

---

## 2. Vista del Administrador (Auditoría)

Aquí es donde reside la brecha más importante detectada.

| Característica | Tab Información Básica | Tab Caracterización | Estado de Paridad |
| :--- | :--- | :--- | :--- |
| **Aprobar / Rechazar** | ✅ Funcional por campo | ✅ Funcional por campo | ✅ **OK** |
| **Ver Solicitud de Cambio** | ✅ Se ve el motivo y botón de autorizar | ❌ **No se ve nada** (Falta lógica) | 🔴 **CRÍTICO** |
| **Contadores de Pendientes** | ✅ Badge naranja en el Tab | ✅ Badge naranja en el Tab | ✅ **OK** |
| **Iconografía** | ✅ Building2, Globe, User | ✅ Briefcase, Layers, ShieldAlert | ✅ **OK** |
| **Layout** | Grid de 2 columnas | Grid de 2 columnas | ✅ **OK** |

---

## 3. Lógica de Datos (Backend)

| Característica | Información Básica | Caracterización | Estado de Paridad |
| :--- | :--- | :--- | :--- |
| **Guardado de Borrador** | `saveBasicInfoDraft` | `saveCharacterizationDraft` | ✅ **OK** |
| **Procesar Auditoría** | Controlador genérico | Controlador genérico | ✅ **OK** |
| **Solicitud de Cambio** | `requestFieldChange` | `requestFieldChange` (Reutilizado) | ✅ **OK** |
| **Tipo de Columna** | String / Text | **Text** (Migrado para evitar truncado) | ✅ **Mejorado** |

---

## Próximos Pasos para Paridad Total:

1.  **Admin Side**: Actualizar `TabCharacterization.tsx` para que reciba `getChangeRequest` y lo pase a `AuditSection`.
2.  **Visual Side**: Decidir si movemos los badges de Básica abajo también para que todo el sistema sea coherente.
3.  **Limpieza**: Asegurar que los nombres de los campos en el `FIELD_LABELS` de Caracterización coincidan exactamente con lo que el Admin espera ver.
