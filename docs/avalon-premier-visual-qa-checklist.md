# Avalon Premier — checklist de QA visual

Usar tras cambios de UI en `avalon-premier` (y al validar deploy).

## Desktop

- [ ] Home: hero con imagen/video y sin video (fallback) — legibilidad del título y subtítulos.
- [ ] Home: secciones en orden — sin saltos de layout ni solapamiento con header sticky.
- [ ] Colección destacada: 0, 1, 2 y 4 propiedades — grid y mensaje “en preparación”.
- [ ] Tipologías: chips alineados, hover sobrio.
- [ ] Footer: columnas, enlaces y línea legal legibles.
- [ ] Comparador activo: barra inferior (CompareDock) legible sobre contenido claro.

## Tablet

- [ ] Hero: proporción de texto y CTAs no cortadas.
- [ ] Grid de cards: 2 columnas sin desbordes.
- [ ] Diferenciadores: `divide-x` visible y texto no amontonado.

## Mobile

- [ ] Hero: padding vertical adecuado; CTAs apilados tocables (área mínima).
- [ ] Menú flotante + sheet inferior: overlay, cierre al tocar fuera, scroll si hiciera falta.
- [ ] Cards: una columna, imagen y texto sin solapes.
- [ ] Dock comparador no tapa CTAs críticos (scroll hasta final de página).

## Contraste

- [ ] Texto principal sobre `paper` / `wash`.
- [ ] Texto claro sobre bloques oscuros (destinos, CTA final).
- [ ] Enlaces y acentos oro: visibles sin parecer “alerta”.

## Consistencia de tarjetas

- [ ] Borde y sombra homogéneos en todas las cards de la home.
- [ ] Hover de imagen sutil y sin jank.
- [ ] Favoritos y comparar siguen operativos.

## Consistencia de CTA

- [ ] Hero: outline + relleno oro coherentes con el resto del sitio.
- [ ] CTA final: borde claro, hover discreto.
- [ ] Chips de tipología: estados default y hover.

## Coherencia premium general

- [ ] Sensación mayoritariamente **clara** con bloques oscuros **puntuales** (no “sitio todo navy”).
- [ ] Sin parpadeos de animaciones pesadas.
- [ ] `avalon-propiedades` sin regresiones si se tocó UI compartida: abrir listado y comparador allí.

## Regresión cross-app (si aplica)

- [ ] Build de `avalon-propiedades` sin clases Tailwind huérfanas desde `packages/ui`.
