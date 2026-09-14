# Registro de decisiones de arquitectura (ADR)

Cada archivo de esta carpeta documenta **una decisión** que cambia la forma del sistema:
el contexto que la motivó, las opciones que se consideraron, lo que se decidió y las
consecuencias que acarrea.

Un ADR no se edita para cambiar de opinión. Si una decisión deja de servir, se escribe un
ADR nuevo que la sustituya y se marca la anterior como `Sustituida por ADR-XXXX`.

## Índice

| # | Decisión | Estado | Fecha |
|---|---|---|---|
| [0001](0001-motor-de-cobro-unificado.md) | Motor de cobro unificado: factura como documento, pago como transacción | Aceptada | 2026-08-06 |
| [0002](0002-interruptores-de-modulo-por-plan.md) | Todo módulo se entrega con interruptor de plan | Aceptada | 2026-08-06 |
| [0003](0003-sistema-otp-por-correo.md) | Sistema OTP por correo (registro y recuperación) | Aceptada | 2026-09-13 |
| [0004](0004-plantillas-correo-react.md) | Plantillas de correo en React (react-email) compiladas a Blade | Aceptada | 2026-09-13 |
| [0005](0005-fichas-de-asociado-por-seccion.md) | La ficha del asociado se gobierna por secciones independientes | Aceptada | 2026-09-13 |
| [0005-a](0005-a-informacion-basica.md) | Información Básica (sub-ADR de 0005) | Aceptada | 2026-09-13 |
| [0005-b](0005-b-caracterizacion.md) | Caracterización (sub-ADR de 0005) | Aceptada | 2026-09-13 |
| [0005-c](0005-c-contactos.md) | Contactos y Referencias (sub-ADR de 0005) | Aceptada | 2026-09-13 |
| [0005-d](0005-d-servicios.md) | Servicios (sub-ADR de 0005) | Aceptada | 2026-09-14 |
| [0005-e](0005-e-documentacion.md) | Documentación (sub-ADR de 0005; cierra 0005) | Aceptada | 2026-09-14 |
| [0006](0006-autorizacion-panel-admin.md) | Autorización del panel de administración | Aceptada | 2026-09-14 |

## Cómo escribir uno nuevo

Copia la estructura de cualquiera de los existentes. El número es correlativo y no se reutiliza.

Estados posibles: `Propuesta` · `Aceptada` · `Sustituida por ADR-XXXX` · `Descartada`.
