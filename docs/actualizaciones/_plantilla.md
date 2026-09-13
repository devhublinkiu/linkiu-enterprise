# Plan de actualización — <Módulo / Sección>

- **Estado:** Borrador
- **Fecha:** <AAAA-MM-DD>
- **Alcance:** <qué entra y qué NO entra en esta intervención>

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito.

---

## 1. Componentes *(primer punto, obligatorio)*

Qué componentes se necesitan y cuáles **integrar, reemplazar o reutilizar**. Todos provienen de
shadcn (`@/Components/ui`). Se respeta su estructura; solo se usan variantes existentes; ajustes
permitidos: tipografía, colores y tokens de `design.md`.

- **Reutilizar:** <componentes existentes que ya sirven>
- **Integrar:** <componentes de shadcn a añadir, con su motivo>
- **Reemplazar:** <qué se retira y por qué>
- **Nuevo (solo si es necesario):** <justificación de por qué no basta lo existente>

## 2. Documentación *(segundo punto, obligatorio)*

Qué documentación debe existir o actualizarse. Marcar solo lo que aporte valor real:

- [ ] ADR — <cuál/por qué>
- [ ] Funcional / técnica / flujos
- [ ] Decisiones de arquitectura
- [ ] Seguridad · Accesibilidad
- [ ] Estados del módulo · Casos límite · Dependencias relevantes

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

Descripción del comportamiento existente para validar que sea el esperado.

- **Punto de entrada:** <ruta/controlador/pantalla>
- **Acciones principales:** …
- **Estados:** …
- **Validaciones:** …
- **Errores:** …
- **Redirecciones:** …
- **Dependencias relevantes:** …
- **Resultado esperado:** …

## 4. Revisión de accesibilidad

<Hallazgos y ajustes previstos: foco, contraste, teclado, etiquetas, no-solo-color.>

## 5. Revisión de seguridad

<Autorización, validación de entrada, exposición de datos, CSRF, permisos por plan, etc.>

## 6. Revisión funcional

<Qué debe seguir funcionando igual; qué cambia; casos límite a cubrir con pruebas.>

## 7. Plan de actualización (pasos)

1. …
2. …

**Gates a ejecutar** (proporcionales al cambio): <Pint/Larastan/Pest · types:check/ESLint/Prettier/Vitest>

## 8. Aprobación

- [ ] Plan revisado
- [ ] `#go` recibido → implementar
