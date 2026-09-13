# Orden de entrega de componentes (temporal / de trabajo)

Orden recomendado para irme pasando los componentes y **crearlos desde cero** en
`@/Components/base/` (con tokens). El criterio es **dependencias**: primero los primitivos que no
dependen de nada, luego lo que se apoya en ellos, y al final los compuestos.

**No migramos.** Cada componente de `base/` se escribe nuevo; luego se **reemplazan los usos** en la
app y, cuando el viejo (de `ui/` o de la raíz) queda sin referencias, **se borra**. Estado final:
solo `base/`.

**Cómo se marca:**
- `- [ ]` pendiente · `- [x]` **hecho** (chulo ✓ = creado en `base/` y visible en `/dev/componentes`).
- `- [~]` **hecho pero incompleto**: creado, pero le falta conectar una dependencia que aún no existe.
- `↻` = ya hay un equivalente viejo (en `ui/` o raíz) que este reemplazará y luego se borra.
- `→ [X, Y]` = **depende de** X e Y. Si esos aún no existen, el componente entra como `[~]` y en el
  código lleva un marcador `// PENDIENTE(base): ...` buscable. Apenas se cree la dependencia, se
  vuelve, se conecta y se pasa a `[x]`.

**Deuda de conexión:** antes de cerrar un corte, correr `grep -r "PENDIENTE(base)" resources/js`
(o el preflight) para que no quede ningún `[~]` sin resolver.

Este archivo es temporal; se puede borrar al terminar.

> Base ya lista (fase 0): tokens de color (3 pasos) + escala tipográfica.

---

## Fase 1 · Primitivos base
Sin dependencias; casi todo lo demás los usa. Empezar aquí.

- [x] Button ↻ *(base/Button.tsx · en galería · Spinner conectado en `loading`)*
- [x] Label ↻ *(base/Label.tsx · en galería)*
- [x] Input ↻ *(base/Input.tsx · en galería)*
- [ ] Textarea ↻
- [x] Checkbox ↻ *(base/Checkbox.tsx · en galería · integrado con los grupos de Field)*
- [ ] Radio Group
- [ ] Switch ↻
- [ ] Toggle
- [ ] Badge ↻
- [x] Separator ↻ *(base/Separator.tsx · en galería · conectado en FieldSeparator)*
- [x] Spinner *(base/Spinner.tsx · en galería)*
- [ ] Skeleton
- [ ] Avatar ↻
- [ ] Aspect Ratio
- [ ] Progress
- [ ] Slider
- [ ] Kbd

## Fase 2 · Agrupadores y campos de formulario
Usan primitivos de la fase 1.

- [x] Field *(→ [Label ✓, Separator ✓] — base/Field.tsx · familia completa (Field, FieldSet, FieldLegend, FieldGroup, FieldContent, FieldLabel, FieldTitle, FieldDescription, FieldError, FieldSeparator) · en galería · Separator conectado)*
- [ ] Input Group *(→ [Input, Button])*
- [ ] Button Group *(→ [Button])*
- [ ] Toggle Group *(→ [Toggle])*
- [ ] Native Select
- [ ] Select ↻
- [x] Input OTP *(base/InputOTP.tsx · usa `input-otp` · en galería · Corte 3A del plan 0003)*

## Fase 3 · Overlays / capas (Radix portal)
Base de menús, diálogos y popovers. Muchos compuestos dependen de estos.

- [ ] Tooltip
- [ ] Popover
- [ ] Hover Card
- [ ] Dialog
- [ ] Alert Dialog *(→ [Dialog, Button])*
- [ ] Sheet
- [ ] Drawer
- [ ] Dropdown Menu ↻
- [ ] Context Menu
- [ ] Menubar

## Fase 4 · Compuestos sobre overlays
Dependen de la fase 3 (y de cmdk / react-day-picker).

- [ ] Command *(→ [Dialog, Popover] + cmdk)*
- [ ] Combobox *(→ [Command, Popover]; ↻ reemplaza a `SearchableSelect`)*
- [ ] Calendar *(react-day-picker)*
- [ ] Date Picker *(→ [Calendar, Popover])*

## Fase 5 · Contenedores y disclosure

- [x] Card ↻ *(base/Card.tsx · familia completa · en galería (card de login))*
- [ ] Item
- [ ] Empty *(estado vacío)*
- [ ] Collapsible
- [ ] Accordion *(→ [Collapsible])*
- [ ] Tabs ↻
- [ ] Scroll Area
- [ ] Resizable

## Fase 6 · Navegación

- [ ] Breadcrumb
- [ ] Pagination
- [ ] Navigation Menu
- [ ] Sidebar *(→ [Sheet, Button, Separator, Tooltip])*

## Fase 7 · Feedback / estado

- [x] Alert *(base/Alert.tsx · variantes default/success/warning/destructive · en galería)*
- [ ] Toast *(hoy usamos `sonner`; decidir si se reemplaza o se mantiene)*

## Fase 8 · Datos y visualización (compuestos complejos)
Van al final porque dependen de varias fases anteriores.

- [ ] Table ↻
- [ ] Data Table *(→ [Table, Checkbox, Button, Dropdown Menu, Pagination] + TanStack Table)*
- [ ] Chart *(Recharts)*
- [ ] Carousel

## Fase 9 · Especializados / dominio
Se hacen solo si el módulo que los necesita entra en alcance.

- [ ] Message
- [ ] Message Scroller
- [ ] Bubble *(mensajería)*
- [ ] Attachment
- [ ] Marker
- [ ] Questionnaire
- [ ] Direction *(utilidad RTL/LTR; infraestructura, no visual — baja prioridad)*

---

**Cómo pasármelos:** de una fase a la vez (o de a pocos), en este orden. Cada uno lo creo en
`base/` con tokens, lo agrego a la galería `/dev/componentes` con sus variantes, y le marco el
chulo aquí.
