# Propuesta de dos nuevos módulos para CAMEPG

**Plataforma:** CAMEPG — Directorio y gestión de empresas asociadas
**Fecha:** Junio 2026
**Dirigido a:** Junta / Dirección CAMEPG
**Preparado por:** Equipo de Producto y Tecnología

---

## En pocas palabras

Hoy CAMEPG ya cuenta con una plataforma sólida: cada empresa asociada tiene su perfil completo
(logo, galería, servicios, contactos, documentos) que aparece en el directorio público, y ya
hay un sistema de membresía y cobros funcionando.

Lo que proponemos son **dos mejoras importantes** para llevar la plataforma al siguiente nivel:

1. **Vitrina Empresarial** — Que el perfil de cada asociado se vea y se sienta como **su propio
   sitio web profesional**, con pestañas (Inicio, Quiénes Somos, Servicios, Contacto) y su
   **propia dirección web** (por ejemplo `miempresa.camepg.com`).

2. **Pagos automáticos con Bold** — Que la plataforma **genere el cobro y envíe un enlace de
   pago** en cada periodo, con recordatorios automáticos y un manejo ordenado de la mora, para
   dejar de revisar comprobantes uno por uno de forma manual.

Las dos buscan lo mismo: **darle más valor al asociado** y **reducir la carga del equipo
administrativo**.

---

# Módulo 1 · Vitrina Empresarial

### El "mini sitio web" de cada empresa asociada

---

## ¿Qué es?

Imagine que cada empresa asociada, además de aparecer en el directorio, tenga una página que se
vea como un **sitio web propio y profesional**, organizada en pestañas claras y con un diseño
estándar y elegante (igual para todos, para que siempre se vea ordenado y serio).

En lugar de una simple ficha, quien la visita encuentra una experiencia completa:

```
   ┌───────────────────────────────────────────────────────────┐
   │   [LOGO]   MI EMPRESA S.A.S.                  ✔ Verificada  │
   │                                                            │
   │   [ Inicio ]  [ Quiénes Somos ]  [ Servicios ]  [ Contacto ]│
   ├───────────────────────────────────────────────────────────┤
   │                                                            │
   │        IMAGEN DE PORTADA GRANDE / PRESENTACIÓN             │
   │                                                            │
   │        "Soluciones mineras con 20 años de experiencia"    │
   │                                                            │
   │        [ Conócenos ]      [ Contáctanos ]                  │
   │                                                            │
   └───────────────────────────────────────────────────────────┘
            ↑ Su propia dirección:  miempresa.camepg.com
```

---

## Las cuatro pestañas

| Pestaña | Qué muestra |
|---|---|
| **🏠 Inicio** | Imagen de portada, frase de presentación, logo y un resumen llamativo de la empresa. Es la primera impresión, así que debe entrar por los ojos. |
| **👥 Quiénes Somos** | La historia de la empresa, su descripción, los años de experiencia, el representante y la galería de fotos. |
| **🛠️ Servicios** | La lista visual y ordenada de lo que ofrece, agrupada por categoría. |
| **📞 Contacto** | Teléfonos, correo, dirección, redes sociales y un botón directo para escribirles. |

> Lo mejor de todo: **la información ya está cargada** en el perfil actual del asociado. Este
> módulo solo se encarga de **reorganizarla y mostrarla bien presentada** como sitio web. Es
> decir, el asociado no tiene que volver a cargar nada.

---

## Su propia dirección web (subdominio)

Cada empresa va a tener una dirección fácil de recordar y de compartir:

```
   miempresa.camepg.com
   constructora-andina.camepg.com
   mineria-del-sur.camepg.com
```

Con eso el asociado puede:

- **Compartir su sitio** en las tarjetas de presentación, en redes y en las cotizaciones.
- Proyectar **seriedad y respaldo** (estar dentro de CAMEPG genera confianza).
- Tener **presencia web profesional sin tener que pagar un desarrollador** que le arme la
  página desde cero. Lo recibe incluido en su membresía.

---

## ¿Para quién es?

La Vitrina Empresarial es **un beneficio más de la membresía CAMEPG**. Todo asociado que esté al
día tiene derecho a tener su sitio con su subdominio. No hay que complicarse con planes ni
niveles: **es un solo plan, y este beneficio queda incluido ahí**.

Es, sencillamente, **una razón más de peso para asociarse y para mantenerse al día** con la
membresía.

---

## ¿Cómo funciona? — Paso a paso

```
   ASOCIADO                          PLATAFORMA CAMEPG
   ────────                          ─────────────────

  1. Está al día con      ───────►   Detecta que tiene la
     su membresía                    membresía activa

                                          │
                                          ▼
  2. Completa/actualiza   ───────►   La información se organiza
     su perfil                       sola en las pestañas

                                          │
                                          ▼
  3. Activa su sitio      ───────►   Se le crea su subdominio
                                     ( miempresa.camepg.com )

                                          │
                                          ▼
  4. Comparte su          ◄───────   Sitio publicado y visible
     dirección web                   para todo el mundo
```

---

## ¿Qué gana CAMEPG con esto?

- **Un argumento fuerte para vender membresías** → más empresas interesadas en entrar.
- **La membresía vale más** a los ojos del asociado (siente que recibe bastante por su dinero).
- **La marca CAMEPG queda presente** en el sitio de cada asociado (eso fortalece el gremio).
- **Nos diferenciamos** de cualquier otro directorio de empresas.

---
---

# Módulo 2 · Pagos automáticos con Bold

### Cobros, enlaces de pago y manejo de mora — sin trabajo manual

---

## Cómo funciona hoy

Actualmente el cobro funciona así:

```
  El asociado paga por transferencia  ──►  Sube la foto del comprobante
            │
            ▼
  Alguien del equipo revisa la foto   ──►  Aprueba o rechaza manualmente
            │
            ▼
  Se activa o se renueva la membresía
```

Funciona, pero tiene un costo: **es mucho trabajo manual**, se demora, puede colarse algún
error, y todo depende de que alguien esté pendiente revisando comprobantes.

---

## La propuesta: integrar Bold

[Bold](https://bold.co) es una pasarela de pagos colombiana. Con esta integración, **la
plataforma genera el cobro y crea un enlace de pago** en cada periodo. El asociado paga con
tarjeta, PSE o el medio que prefiera, y **la plataforma confirma el pago de forma automática**,
sin que nadie tenga que revisar nada.

```
  CAMEPG genera el cobro  ──►  Crea un enlace de pago Bold
            │
            ▼
  El asociado recibe el enlace  ──►  Paga en línea (tarjeta / PSE)
            │
            ▼
  Bold confirma el pago   ──►  La plataforma activa/renueva SOLA
                              (sin revisión manual)
```

> **Lo que escogimos:** *un enlace de pago por cada cobro.* La plataforma genera cada cobro con
> su enlace, y el asociado paga en cada periodo. Así mantenemos **el control total** y es
> sencillo de manejar. (Más adelante, si se quiere, se puede activar el débito automático
> recurrente.)

---

## El ciclo completo del cobro — Paso a paso

```
                    ┌─────────────────────────────────┐
                    │   Llega la fecha del cobro       │
                    │   (la plataforma lo detecta sola)│
                    └────────────────┬────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │  Se genera la cuenta de cobro    │
                    │  + el enlace de pago Bold        │
                    └────────────────┬────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │  Le llega al asociado por correo │
                    │  "Tu cobro está listo, paga aquí"│
                    └────────────────┬────────────────┘
                                     ▼
                          ¿Pagó a tiempo?
                          ┌──────────┴───────────┐
                          ▼                      ▼
                       SÍ ✔                    NO ✘
                          │                      │
                          ▼                      ▼
              ┌────────────────────┐   ┌──────────────────────────┐
              │ Membresía renovada │   │  Inicia el PERIODO DE     │
              │ Perfil sigue activo│   │  GRACIA (ver más abajo)   │
              └────────────────────┘   └──────────────────────────┘
```

---

## Manejo de la mora — Recordatorios + corte suave

Cuando un asociado no paga a tiempo, **no se le corta de inmediato**. La plataforma le da un
periodo de gracia con recordatorios automáticos, y solo al final oculta el perfil — pero
**nunca le borra la cuenta**, para que pueda volver sin problema.

```
   SE VENCE EL COBRO
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │              PERIODO DE GRACIA (ej. 10 días)             │
   │                                                          │
   │   Día 1   →  Recordatorio amable: "Te quedó pendiente    │
   │              el pago"                                    │
   │   Día 5   →  Segundo aviso: "Paga aquí para no perder..."│
   │   Día 9   →  Aviso final: "Mañana se oculta tu perfil"   │
   │                                                          │
   │   (en todos los avisos va el enlace de pago Bold)       │
   └────────────────────────────┬─────────────────────────────┘
                                 ▼
                          ¿Pagó dentro de la gracia?
                          ┌──────────┴───────────┐
                          ▼                      ▼
                       SÍ ✔                    NO ✘
                          │                      │
                          ▼                      ▼
              ┌────────────────────┐   ┌──────────────────────────┐
              │ Todo vuelve a la   │   │  CORTE SUAVE:             │
              │ normalidad         │   │  • El perfil se oculta    │
              │                    │   │    del directorio         │
              │                    │   │  • La cuenta SE CONSERVA  │
              │                    │   │  • Vuelve apenas pague    │
              └────────────────────┘   └──────────────────────────┘
```

**¿Qué es el "corte suave"?** Que el perfil deja de aparecer en el directorio público, pero el
asociado **conserva su cuenta y toda su información**. Apenas paga, el perfil vuelve a aparecer
automáticamente. No se pierde nada.

---

## El antes y el después

| | **Hoy (manual)** | **Con Bold (automático)** |
|---|---|---|
| Generar el cobro | Manual | **Automático** |
| Forma de pagar | Transferencia + foto | **Enlace de pago en línea** |
| Confirmar el pago | Revisión manual | **Se confirma solo** |
| Recordatorios de mora | Manuales / no hay | **Automáticos y por etapas** |
| Corte por no pago | Manual | **Automático y suave** |
| Reactivación | Manual | **Automática apenas paga** |
| Trabajo del equipo | Alto | **Mínimo** |

---

## ¿Qué gana CAMEPG con esto?

- **Menos trabajo manual** → el equipo deja de revisar comprobantes uno por uno.
- **Menos morosidad** → los recordatorios automáticos hacen que más gente pague a tiempo.
- **El dinero entra más rápido** → y de forma más predecible, sin sorpresas.
- **Mejor experiencia** → el asociado paga en línea, fácil, desde el celular.
- **Todo queda registrado** → orden y trazabilidad sin tener que anotar nada manualmente.

---
---

# Para cerrar

Los dos módulos se complementan:

- El **Módulo 1 (Vitrina Empresarial)** le sube el **valor** a la membresía y le da a las
  empresas una razón de peso para asociarse y mantenerse al día.
- El **Módulo 2 (Pagos con Bold)** se asegura de que esa membresía **se cobre sola**, a tiempo y
  sin que nadie tenga que estar pendiente.

Juntos forman un círculo que se retroalimenta:

```
   Más valor (Vitrina)  ──►  Más empresas asociadas  ──►  Más ingresos
        ▲                                                    │
        │                                                    ▼
   Mejor experiencia  ◄──  Cobro automático y ordenado (Bold)
```

### Lo que sigue

1. **Dar el visto bueno** a la propuesta y definir por cuál empezar.
2. **Definir los detalles** (textos de la vitrina, valor del cobro, días de gracia).
3. **Abrir la cuenta Bold** de CAMEPG.
4. **Desarrollar por etapas**, empezando por el de mayor impacto.

---

*Documento de propuesta — CAMEPG · Junio 2026*
