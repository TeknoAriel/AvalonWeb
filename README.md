# Avalon — monorepo (Propiedades + Premier)

Dos aplicaciones **Next.js 14** (App Router) que comparten **tipos**, **capa de datos**, **utilidades** y **UI parcial**, con **identidad visual diferenciada** y **inventario segmentado** según etiqueta Premier.

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io) 9+

## Estructura

```
apps/
  avalon-propiedades/   # Sitio institucional sobrio (puerto 3000)
  avalon-premier/       # Sitio premium editorial (puerto 3001)
packages/
  types/     # RawProperty, NormalizedProperty, SiteType, etc.
  utils/     # cn, dinero, YouTube embed, strip HTML
  config/    # getSiteBrandConfig (copy, URLs, contacto)
  branding/  # paletas, CSS variables, rutas de logos
  core/      # JSON, normalización, filtros, reglas Premier
  ui/        # PriceSummary, MediaGallery (next/image)
```

## Datos

El archivo real de difusión está en `packages/core/data/properties.json` (~5 MB, ~1500 ítems). Para actualizarlo:

```bash
curl -sL -o packages/core/data/properties.json \
  "https://static.kiteprop.com/kp/difusions/4b3c894a10d905c82e85b35c410d7d4099551504/externalsite-2-9e4f284e1578b24afa155c578d05821ac4c56baa.json"
```

Documentación:

- **KiteProp (env, consultas CRM, seguridad de la key):** [`docs/KITEPROP.md`](docs/KITEPROP.md) — referencia principal para no duplicar reglas.
- **Esquema del JSON de difusión:** [`docs/DATA_LAYER.md`](docs/DATA_LAYER.md).
- **Invariante crítico Premier (tag, feed, mapper API — no romper):** [`docs/PREMIER_INVENTORY_INVARIANT.md`](docs/PREMIER_INVENTORY_INVARIANT.md).
- API pública: [KiteProp API v1](https://www.kiteprop.com/docs/api/v1).

### Regla Premier

- `hasPremierTag(raw)` revisa `tags`, `labels`, `categories`, flags `premier` / `is_premier`, y variables de entorno `PREMIER_PROPERTY_IDS` / `NEXT_PUBLIC_PREMIER_PROPERTY_IDS`. Detalle y checklist en **`docs/PREMIER_INVENTORY_INVARIANT.md`**.
- **Catálogo público**: solo propiedades con `status === "active"`.
- El mapper de la **API** debe usar `pickFirstNonEmpty` para tags (no solo `??`): si `tags` viene `[]` y el premier está en `property_tags`, sin eso el listado Premier queda vacío.

## Scripts

```bash
pnpm install
pnpm dev              # ambas apps con Turbo
pnpm dev:avalon       # solo Avalon Propiedades :3000
pnpm dev:premier      # solo Avalon Premier :3001
pnpm build            # build de todas las apps
pnpm lint
```

## Vercel (dos proyectos)

1. Crear **dos proyectos** enlazados al mismo repo.
2. **Root Directory**: `apps/avalon-propiedades` y `apps/avalon-premier` respectivamente.
3. **Build**: `cd ../.. && pnpm install && pnpm exec turbo build --filter=avalon-propiedades` (ajustar el filtro por proyecto).
4. **Install command** en la raíz del repo o `pnpm install` desde root con override de root directory (recomendado: configurar Root Directory y en Vercel usar “Include files outside root” si aplica).

Configuración típica con monorepo Vercel:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/avalon-propiedades` (o premier)
- **Build Command**: desde documentación oficial de Turborepo + Vercel:  
  `cd ../.. && pnpm turbo build --filter=avalon-propiedades`

5. Variables de entorno por proyecto: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_AVALON_URL`, `NEXT_PUBLIC_PREMIER_URL`, `NEXT_PUBLIC_PEER_SITE_URL`, `NEXT_PUBLIC_WHATSAPP`.

Copiá `.env.example` a `.env.local` en cada app o definí las variables en Vercel.

## Logos

Cada app sirve sus assets desde `public/brand/`. Sustituí los PNG por las versiones finales exportadas (header, footer, favicon, OG).

## Calidad

- TypeScript estricto en paquetes compartidos.
- Listados y fichas alimentados por el modelo normalizado (`normalizeProperty`, `extractAmenities`, `extractMedia`).
- SEO: `metadata`, `sitemap.ts`, `robots.ts` por app.
