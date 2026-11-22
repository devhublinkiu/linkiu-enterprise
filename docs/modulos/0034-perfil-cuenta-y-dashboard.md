# Plan de actualización — Perfil (contraseña, eliminar cuenta, foto) y Dashboard (candados y guía)

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** Perfil: (1) cambio de contraseña autenticado real + formulario en español; (2) eliminar
  cuenta en cascada + formulario en español; (3) quitar la promesa de foto a quien no la tiene.
  Dashboard: (4) distinguir "vencido → pagar" de "perfil incompleto"; (5) tarjetas respetan los
  candados; (6) menor del menú `verified`.

> Ejecutado tras `*go`. Decisiones: eliminar = **cascada**; foto = **quitar la promesa**; campana de
> notificaciones = **se deja para más adelante** (no se toca).

---

## Cortes

### 1 — Cambio de contraseña (autenticado)
- [x] No existía ruta/controlador: `UpdatePasswordForm` posteaba a `password.update`, que es la
  recuperación por OTP (grupo guest). Se crea `Auth\PasswordController@update` + ruta
  `PUT /profile/password` (`password.change`) validando `current_password` + nueva confirmada.
- [x] Formulario traducido al español.

### 2 — Eliminar cuenta (cascada)
- [x] `ProfileController::destroy`: borra la empresa (y por FK sus facturas, pagos, servicios,
  secciones…) y todos los usuarios de la empresa, en transacción. Formulario traducido con el aviso
  explícito de qué se borra.

### 3 — Foto de perfil
- [x] `UpdateProfileInformationForm`: el texto solo promete la foto al admin (que es quien la tiene);
  al asociado dice "Actualiza tu nombre y correo electrónico."

### 4 — Dashboard: vencido vs. incompleto
- [x] `AppSidebar`: `needsProfileCompletion` solo con plan **activo** (vencido/gracia muestran el CTA
  de pago, no "completa tus secciones").
- [x] `ProfileCard`: con el plan vencido/gracia y perfil oculto, muestra "Tu plan venció… Paga para
  reactivarlo" (enlace a facturación) en vez de "completa tus secciones".

### 5 — Tarjetas del Dashboard respetan candados
- [x] `QuickAccessCard`: sin suscripción activa, los módulos de plan salen bloqueados (candado), no
  "Entrar"; Bienes y Servicios además por `plan_features`.
- [x] `InvoicesCard`: sin plan al día, lleva a Gestión del Plan (puerta de pago) en vez de a Mis
  Facturas (que el menú tiene bloqueada).

### 6 — Menú `verified`
- [x] Admitido sin pagar: Caracterización/Contactos/Servicios/Documentación salen bloqueadas en el
  menú (solo Información Básica queda abierta), reflejando lo que el middleware ya hace.

## Pruebas

- `tests/Feature/ProfilePasswordAndDeleteTest.php`: cambio de contraseña (actual correcta/incorrecta);
  borrado en cascada (usuarios + empresa + facturas); no borra con contraseña incorrecta.

## Fuera de alcance

- Campana de notificaciones (se retoma más adelante).

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
