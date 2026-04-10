# Brief maestro operativo — Avalon Propiedades & Avalon Premier

Documento interno para Cursor y el equipo. Resume objetivo, alcance, datos, branding y criterios de entrega. Las implementaciones deben alinearse con este texto salvo acuerdo explícito en contrario.

---

## 1. Objetivo

Construir **dos sitios inmobiliarios** modernos, actuales, funcionales y confiables que compartan **infraestructura técnica y origen de datos**, con:

- **Identidades visuales diferenciadas** (sobria vs premium).
- **Inventario segmentado**: propiedades con tag **Premier** → sitio **Avalon Premier**; sin ese tag → **Avalon Propiedades**.

Prioridad de producto: **fotos y video con protagonismo**, fichas claras, excelente experiencia móvil, sensación de seriedad y responsabilidad.

---

## 2. Alcance

### Incluido

- Monorepo: **dos aplicaciones front** (una por marca) + **packages compartidos** (tipos, adaptadores de datos, componentes base opcionales, tokens de tema).
- Capa de datos basada en **JSON/API reales** de Kiteprop (estructura y tipado derivados de datos reales, no inventados).
- Listados, filtros acordes a hábitos de búsqueda actuales, fichas de propiedad, soporte de galería y video (YouTube / iframe 360 cuando exista en datos).
- **Branding centralizado** por marca (CSS variables / tema).
- Pie de página y contacto con **datos registrales obligatorios** (nombre, matrícula, teléfono) según lineamientos legales del negocio.

### Fuera de alcance (salvo que se amplíe el brief)

- Backoffice propio (el origen de verdad es Kiteprop).
- CRM, reservas online o pagos.

### Dependencias externas

- **JSON de difusión (referencia estructural):**  
  `https://static.kiteprop.com/kp/difusions/4b3c894a10d905c82e85b35c410d7d4099551504/externalsite-2-9e4f284e1578b24afa155c578d05821ac4c56baa.json`
- **Documentación API:** [Kiteprop API v1](https://www.kiteprop.com/docs/api/v1)

> **Nota sobre el archivo local de muestra:** la copia guardada en uploads puede venir **truncada** por límite de tamaño. Para tipado y pruebas usar siempre el **JSON completo** desde la URL anterior o respuestas reales de la API. Validar en producción el campo exacto del tag **Premier** (p. ej. `tags`, categorías o equivalente en el esquema vigente).

---

## 3. Arquitectura

| Decisión | Detalle |
|----------|---------|
| Repositorio | Monorepo (pnpm/npm/yarn + workspaces, según se defina al crear el repo) |
| Apps | `apps/avalon-propiedades`, `apps/avalon-premier` (nombres orientativos) |
| Packages compartidos | `packages/data` (tipos, fetch, normalización), `packages/ui` o tokens en `packages/theme`, etc. |
| Hosting | **Vercel** (un proyecto por app o preview por app, según configuración elegida) |
| CI | **GitHub** Actions (lint, typecheck, build) |
| Theming | Variables/tokens por marca; **sin duplicar lógica de datos** entre apps |

### Regla de enrutamiento de inventario

- `tieneTagPremier(propiedad) === true` → visible solo en **Avalon Premier** (y excluida del catálogo estándar si así se define).
- Caso contrario → **Avalon Propiedades**.

Confirmar en API/JSON el nombre y forma del tag (string, id, array).

---

## 4. Data layer

### 4.1 Principios

1. Incorporar el **JSON real desde el día uno** para relevar estructura, tipar y crear **adaptadores** hacia un modelo interno estable.
2. No asumir campos que no existan: **opcionales y nulos** explícitos en tipos.
3. **Amenities / extras:** mapear solo lo que venga en la fuente (p. ej. texto en `content`, flags, o listas si aparecen en el payload completo). Ampliar el modelo cuando el JSON/API lo justifique.

### 4.2 Hallazgos del JSON de muestra (externalsite, prefijo parseable)

Sobre un subconjunto válido del archivo (~**146** ítems en la muestra local analizada), cada ítem es un objeto con **~57 claves** de primer nivel. Ejemplos relevantes:

| Área | Campos (ejemplos) |
|------|-------------------|
| Identificación | `id`, `url`, `title`, `status`, `last_update` |
| Ubicación | `address`, `city`, `region`, `country`, `zone`, `zone_2`, `latitude`, `longitude`, `hide_exact_location` |
| Tipología | `property_type`, `property_type_old`, `rooms`, `bedrooms`, `bathrooms`, `total_meters`, `covered_meters`, `uncovered_meters`, etc. |
| Operación | `for_sale`, `for_rent`, `for_temp_rental`, precios asociados, `currency`, `hide_prices` |
| Contenido | `content` (HTML o texto con entidades), `images`: `[{ url, title }]` |
| Media extra | `link_youtube`, `link_360_iframe` (pueden ser `null`) |
| Agencia / agente | `agency`, `agent` (nombre, email, teléfonos, avatar) |

**Tipos de propiedad observados** en la muestra: `apartments`, `houses`, `residential_lands`, `retail_spaces`, `offices`, `farms`, `parking_spaces`, `warehouses` (normalizar etiquetas en UI).

**Premier:** en la muestra analizada **no apareció** la cadena `premier` en el JSON serializado; **obligatorio** validar contra JSON completo o API para el criterio de filtrado.

### 4.3 Entregables de la capa de datos

- Tipos TypeScript (o equivalente) **generados o mantenidos** alineados al payload.
- Función(es) de **normalización** → modelo `Property` (o similar) para listados y ficha.
- **Adaptadores** de imágenes y video (URLs absolutas, orden, alt desde `title`).
- Tests o fixtures con un **slice** del JSON oficial (sin commitear secretos).

---

## 5. Branding

### 5.1 Avalon Propiedades

- **Personalidad:** moderna, actual, clara, sobria, profesional, confiable, funcional, comercialmente sólida.
- **Paleta:** `#0B376B`, `#082A52`, `#1A4C86`, `#FFFFFF`, `#F7F5F0`, `#E9EDF3`, `#5E6B7A`, `#C5A46D`.
- **Tipografía sugerida:** sans geométrica limpia (estilo del logotipo).

### 5.2 Avalon Premier

- **Personalidad:** moderna, actual, muy elegante, refinada, suntuosa, exclusiva, aspiracional, premium real.
- **Paleta:** `#0A2342`, `#103B73`, `#1B4E8C`, `#C7A15A`, `#E6D5AF`, `#FAF7F2`, `#F1ECE3`, `#222833`.
- **Tipografía sugerida:** serif display para títulos / marca + sans de apoyo; más profundidad (sombras sutiles, gradientes metálicos discretos) que en Propiedades.

### 5.3 Logos (assets en proyecto Cursor)

Ruta de referencia: `.cursor/projects/.../assets/` (copiar al `public/` o `apps/*/public` del monorepo al inicializar).

| Marca | Uso | Archivo orientativo |
|-------|-----|---------------------|
| Propiedades | General (header / favicon base): isologo + marca, opcional tel | `New_logo_Avalon1-*.png`, `New_logo_Avalon_con_Tel-*.png` |
| Propiedades | Completo: contacto / footer (marca + datos legales + tel) | `New_logo_Avalon_Completo-*.png` |
| Premier | General | `Avalon_Premier_LG-*.png`, `Avalon_Premier_LG_tel-*.png`, `Avalon_Premier-*.png` |
| Premier | Completo: contacto / footer | `Avalon_Premier_LG_Completo-*.png` |
| Legado / alternativo | Propiedades | `Logo_Avalon-*.png` |

**Reglas de uso**

- **Logo completo** (con CI, matrícula, teléfono según pieza): solo **footer**, **contacto** y zonas legales/análogas.
- **Uso general:** variante **isologo + nombre de marca**; se puede **recortar** el asset para header y reducir altura en móvil. Elegir versión con o sin teléfono según limpieza visual (recomendación: **sin tel** en header; **completo** abajo).

**Datos legales de contacto (consolidar con el cliente; criterio del brief)**

- Profesional: **Ariel Carnevali**
- Matrícula: **0413**
- Teléfono: unificar en sitio según marca operativa (validar número definitivo para Propiedades vs Premier si difieren en material impreso).

---

## 6. UX / UI

- **Búsqueda:** filtros y orden acordes a uso actual (ubicación, tipo, operación, precio, superficie, ambientes, etc., según datos disponibles).
- **Listados:** tarjetas con **foto principal**, precio (si no está oculto), tipo, zona, operación; estados (`reserved`, `suspended`, etc.) tratados con claridad.
- **Ficha:** galería grande, plano de ubicación coherente con `hide_exact_location`, bloque de descripción saneado (HTML/entidades), video embebido si hay `link_youtube`, tour 360 si hay `link_360_iframe`.
- **Móvil:** navegación táctil, CTA de contacto / WhatsApp si hay `agent.phone_whatsapp` en datos.
- **Confianza:** tipografía legible, contrastes adecuados, datos de matrícula visibles donde corresponda.

---

## 7. Páginas (mínimo viable por app)

| Página | Contenido |
|--------|-----------|
| Inicio | Propuesta de valor, destacados, acceso a buscador |
| Listado / búsqueda | Filtros + resultados paginados o infinite scroll |
| Ficha de propiedad | Media, datos, mapa, contacto |
| Contacto | Formulario o CTAs + **logo completo** y datos legales |
| Legal / privacidad | Placeholder o texto provisto por el cliente |

Opcional: Sobre nosotros, guía de barrios, blog — solo si hay contenido.

---

## 8. Deploy

- Rama principal → producción en Vercel.
- Variables de entorno: URL base del JSON/API, claves si la API las exige, analytics si aplica.
- Previews por PR para ambas apps o al menos la app afectada.

---

## 9. Criterios de calidad

- **Typecheck y lint** sin errores en CI.
- **Sin datos inventados** en campos críticos; fallbacks honestos (“Consultar”) cuando falte dato.
- **Rendimiento:** imágenes optimizadas (tamaños del CDN Kiteprop según URL), lazy load.
- **Accesibilidad:** textos alternativos en imágenes, foco visible, contraste de marca validado.
- **SEO base:** títulos y meta por ficha, URLs alineadas a `url` canónica o slugs estables.
- **Coherencia de marca:** Propiedades sobria; Premier más rica en detalle visual sin sacrificar usabilidad.

---

## 10. Orden de trabajo obligatorio para Cursor

1. Infraestructura del monorepo y apps vacías desplegables.
2. Integración e inspección del **JSON/API real** (payload completo).
3. Capa de **normalización** y tipos.
4. Definición de **ficha** y **amenities** según campos reales.
5. **Diseño final** y armado completo de ambas webs sobre esa base.

---

## 11. Referencias rápidas

- JSON difusión: `https://static.kiteprop.com/kp/difusions/4b3c894a10d905c82e85b35c410d7d4099551504/externalsite-2-9e4f284e1578b24afa155c578d05821ac4c56baa.json`
- API: [https://www.kiteprop.com/docs/api/v1](https://www.kiteprop.com/docs/api/v1)

Última actualización del brief operativo: alineada al mensaje de producto del cliente (abril 2026).
