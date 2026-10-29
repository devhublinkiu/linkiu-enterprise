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
- [x] Textarea ↻ *(base/Textarea.tsx · en galería · Corte 7-E del plan 0007)*
- [x] Checkbox ↻ *(base/Checkbox.tsx · en galería · integrado con los grupos de Field)*
- [x] Radio Group *(base/RadioGroup.tsx · Radix · en galería (sí/no, niveles, choice cards, disabled, invalid) · Corte 8-A del plan 0008 · retira `ui/YesNoToggle`)*
- [x] Switch *(base/Switch.tsx · Radix · en galería (con descripción, tamaños, disabled, invalid) · Corte 10-A del plan 0010 · para `is_active`)*
- [ ] Toggle
- [x] Badge ↻ *(base/Badge.tsx · cva + Slot (asChild) · variantes default/secondary/destructive/outline/ghost/link · en galería · Corte 6B del plan 0006)*
- [x] Separator ↻ *(base/Separator.tsx · en galería · conectado en FieldSeparator)*
- [x] Spinner *(base/Spinner.tsx · en galería)*
- [x] Skeleton *(base/Skeleton.tsx · en galería · Corte 5C del plan 0005)*
- [x] Avatar ↻ *(base/Avatar.tsx · Radix Avatar · en galería (imagen/fallback, tamaños, badge, grupo) · Corte 6A del plan 0006)*
- [ ] Aspect Ratio
- [x] Progress *(base/Progress.tsx · Radix · en galería · Corte 7-F del plan 0007)*
- [ ] Slider
- [ ] Kbd

## Fase 2 · Agrupadores y campos de formulario
Usan primitivos de la fase 1.

- [x] Field *(→ [Label ✓, Separator ✓] — base/Field.tsx · familia completa (Field, FieldSet, FieldLegend, FieldGroup, FieldContent, FieldLabel, FieldTitle, FieldDescription, FieldError, FieldSeparator) · en galería · Separator conectado)*
- [x] Input Group *(base/InputGroup.tsx · reusa Input/Button/Textarea · en galería · Corte 7-I del plan 0007)*
- [ ] Button Group *(→ [Button])*
- [ ] Toggle Group *(→ [Toggle])*
- [ ] Native Select
- [x] Select ↻ *(base/Select.tsx · Radix · en galería · Corte 7-A del plan 0007)*
- [x] Input OTP *(base/InputOTP.tsx · usa `input-otp` · en galería · Corte 3A del plan 0003)*

## Fase 3 · Overlays / capas (Radix portal)
Base de menús, diálogos y popovers. Muchos compuestos dependen de estos.

- [x] Tooltip *(base/Tooltip.tsx · Radix `radix-ui` · en galería (4 lados) · Corte 5A del plan 0005)*
- [x] Popover *(base/Popover.tsx · Radix · en galería · Corte 7-G del plan 0007)*
- [ ] Hover Card
- [x] Dialog *(base/Dialog.tsx · Radix · en galería · Corte 7-H del plan 0007)*
- [ ] Alert Dialog *(→ [Dialog, Button])*
- [x] Sheet *(base/Sheet.tsx · Radix Dialog · en galería (4 lados) · Corte 5B del plan 0005)*
- [ ] Drawer
- [x] Dropdown Menu ↻ *(base/DropdownMenu.tsx · Radix DropdownMenu · familia completa · en galería (item/íconos/destructivo, checkbox, radio, submenú) · Corte 6B del plan 0006)*
- [ ] Context Menu
- [ ] Menubar

## Fase 4 · Compuestos sobre overlays
Dependen de la fase 3 (y de cmdk / react-day-picker).

- [ ] Command *(→ [Dialog, Popover] + cmdk · descartado en 0007: el Combobox usa Base UI, no Command; se recrea si hace falta una paleta ⌘K)*
- [x] Combobox *(base/Combobox.tsx · @base-ui/react · en galería · Corte 7-K del plan 0007 · reemplazará a `SearchableSelect`)*
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

- [x] Breadcrumb *(base/Breadcrumb.tsx · shadcn · en galería · usado en el topbar de AppLayout con migas derivadas de la navegación (helper `matchBreadcrumbs`))*
- [x] Pagination *(base/Pagination.tsx · shadcn · en galería · Corte 10-A del plan 0010 · reutilizable en todo el admin)*
- [ ] Navigation Menu
- [x] Sidebar *(base/Sidebar.tsx · familia completa + `useSidebar`/`useIsMobile` · en galería · Corte 5C del plan 0005)*

## Fase 7 · Feedback / estado

- [x] Alert *(base/Alert.tsx · variantes default/success/warning/destructive · en galería)*
- [ ] Toast *(hoy usamos `sonner`; decidir si se reemplaza o se mantiene)*

## Fase 8 · Datos y visualización (compuestos complejos)
Van al final porque dependen de varias fases anteriores.

- [x] Table *(base/Table.tsx · shadcn · en galería · Corte 10-A del plan 0010 · reutilizable en todo el admin)*
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
