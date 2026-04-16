# Avalon Premier — refinamiento de dirección de arte (2026)

Documento de criterios y cambios aplicados en el refinamiento visual **controlado** de la app `avalon-premier`. No sustituye al diseño de producto ni a futuros assets definitivos.

## Criterios de dirección de arte aplicados

- **Lujo silencioso**: más aire, menos ruido; jerarquía editorial sin “portal masivo”.
- **Base clara dominante**: marfil frío / piedra suave en superficies y fondos generales; el dramatismo oscuro queda en **hero**, **bloque regional (destinos)**, **CTA final** y piezas puntuales — no en toda la página.
- **Contraste selectivo**: navy/petróleo (`ink`) como estructura de marca y texto principal, sin azul saturado ni negro puro omnipresente.
- **Acentos finos**: champagne / oro apagado solo donde aporta estatus (eyebrows, detalles), sin dorado fuerte.
- **Interacciones mínimas**: hovers y transiciones suaves; sin motion agresivo ni efectos barrocos.

## Stack y alcance técnico

- **Stack**: Next.js 14, Tailwind en `apps/avalon-premier/tailwind.config.ts`, tokens CSS vía `brandCssVariables('premier')` en `@avalon/branding` (`packages/branding/src/index.ts`).
- **Tipografías** (sin cambio de familia): DM Sans + Playfair Display en `app/layout.tsx`.
- **Alcance**: componentes y módulos bajo `apps/avalon-premier/**`; ajuste mínimo en `packages/ui/src/compare-dock.tsx` **solo** para `variant === 'premier'`, usando clases compatibles con ambas apps (`brand.*`, sin `premier-*` en el paquete compartido).

## Cambios realizados (resumen)

| Área | Archivos / notas |
|------|-------------------|
| Paleta Premier | `packages/branding/src/index.ts` — valores `premier` y variables CSS asociadas |
| Hero | `components/cinematic-hero.tsx` — overlay neutro (stone), tipografía más editorial, CTAs refinados |
| Header / footer / nav móvil | `site-header.tsx`, `site-footer.tsx`, `mobile-nav.tsx` |
| Home (secciones) | `modules/home/*`, `app/page.tsx`, `premier-destinations-and-video.tsx` |
| Cards | `property-card-premier.tsx` |
| Dock comparador | `compare-dock.tsx` (variante premier) |

## Decisiones de color

- **Papel (`paper`)**: `#FAFAF8` — marfil frío, menos “institucional blanco pleno”.
- **Lavado (`wash`)**: `#EEEBE6` — piedra cálida muy clara para alternancia con el papel.
- **Tinta (`ink`)**: `#121A2E` — navy/petróleo legible, menos duro que el anterior.
- **Línea (`line`)**: `#D8D4CC` — separadores de bajo contraste, tono cálido.
- **Oro (`gold`)**: `#B89A6A` — champagne apagado para acentos discretos.
- **Texto / muted** (CSS vars): grafito `#1B2130` y secundario `#5E636C` para mejor lectura en superficies claras.

## Decisiones de espaciado

- Aumento moderado de **padding vertical** en hero, bloques de posicionamiento, diferenciadores, colección destacada, tipologías y secciones de video.
- **Grid de propiedades**: más separación entre cards (`gap-14` / `md:gap-12`) para sensación “curada”.

## Decisiones de tipografía

- Titulares con **peso más liviano** (`font-normal` / `font-light` donde aplica) y **tracking** afinado para lectura editorial.
- Cuerpos con **leading** más generoso y `font-light` puntual para reducir sensación corporativa.

## Hero e imágenes

- Overlay principal reorientado a **gradiente neutro (stone)** sobre imagen/video, evitando la máscara azul densa anterior; la imagen gana protagonismo.
- Fallback sin media: gradiente `stone` + `premier-ink`, sin azul eléctrico.
- CTAs: primario **outline** claro sobre imagen; secundario **oro** con hover por tono sólido (sin `brightness-110`).

## Cards / colección

- Contenedor con **borde fino**, fondo papel y sombra muy suave; hover apenas más profundo.
- Imagen con **zoom hover reducido** (1.015) y **gradiente inferior muy sutil** para profundidad sin competir con el contenido.
- Metadatos: tipo en caps **discreto** (gris), título con peso normal; precio con `tabular-nums`.

## Qué se evitó deliberadamente

- Fondo azul oscuro en toda la experiencia.
- Reemplazo total de layout, rutas, feed, comparador o fichas.
- Animaciones llamativas, brillos, sombras pesadas, marcos dorados exagerados.
- Uso de tokens `premier-line` en `packages/ui` (riesgo de Tailwind en `avalon-propiedades`).

## Riesgos

- **Contraste**: revisar WCAG en overlays del hero con fotos muy claras u oscuras (variable por asset real).
- **Coherencia fotográfica**: Unsplash de referencia en destinos sigue siendo placeholder; conviene unificar tono cuando haya producción propia.
- **Percepción de “más claro”**: la base marfil puede pedir ajuste fino de logos si fueron diseñados sobre blanco puro.

## Próximos pasos sugeridos

- Sustituir hero por **imagen/video propio** con grading consistente (luz suave, poca saturación).
- Auditar **ficha de propiedad** y **listado** con la misma escala de espacio y bordes que la home.
- Definir **1–2 fotos institucionales** para `institucional` alineadas al mismo tono cromático.
