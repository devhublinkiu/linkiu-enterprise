# Planes de actualización

Cada módulo o sección del proyecto tiene aquí **su propio plan** antes de intervenirlo. Un plan
se redacta con `#plan` y **no** se ejecuta hasta recibir `#go`. Reglas completas en
[`../../agents.md`](../../agents.md).

## Cómo trabajar un plan

1. Copia [`_plantilla.md`](_plantilla.md) a `NNNN-nombre-del-modulo.md` (número correlativo).
2. Complétalo en el orden de la plantilla. Los tres primeros bloques son obligatorios y van
   siempre en este orden: **Componentes → Documentación → Flujo actual**.
3. Se revisa y se aprueba con `#go`. Solo entonces se toca código, y únicamente lo que el plan
   describe.
4. Al terminar, se marca el estado del plan y se actualiza este índice.

## Índice

| # | Módulo | Estado |
|---|---|---|
| [0001](0001-fundacion-visual-y-tooling.md) | Fundación: sistema visual + tooling/gates | Hecho |
| [0002](0002-preflight.md) | Preflight: orquestador de gates | Hecho |
| [0003](0003-login-registro.md) | Login y Registro (lado asociado) | Borrador |
| [0004](0004-plantillas-correo-react.md) | Plantillas de correo en React (react-email) | Hecho |
| [0005](0005-sidebar-navegacion.md) | Sidebar y navegación (shell de la app) | Hecho |
| [0006](0006-navbar-topbar.md) | Navbar / Topbar del panel | Hecho |
| [0007](0007-ficha-informacion-basica.md) | Ficha del asociado · Información Básica | Borrador |
| [0008](0008-ficha-caracterizacion.md) | Ficha del asociado · Caracterización | Borrador |
| [0009](0009-ficha-contactos.md) | Ficha del asociado · Contactos y Referencias | Borrador |

Estados posibles: `Borrador` · `Aprobado (#go)` · `En curso` · `Hecho` · `Descartado`.
