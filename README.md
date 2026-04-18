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
  core/      # Feed API KiteProp, normalización, filtros, reglas Premier
  ui/        # PriceSummary, MediaGallery (next/image)
```

## Datos

**Checklist corto de variables y BFF (un solo flujo):** [`docs/OPERACION.md`](docs/OPERACION.md).

En **producción**, **Avalon Web** lee la **API KiteProp** (`GET /properties` + `KITEPROP_API_KEY`). **Avalon Premier** puede consumir el mismo catálogo vía **BFF** interno (sin duplicar la key). El snapshot `packages/core/data/properties.json` (~5 MB) es **fallback** y merge de metadata; podés regenerarlo a mano si necesitás un dump local, por ejemplo:

```bash
curl -sL -o packages/core/data/properties.json \
  "https://static.kiteprop.com/kp/difusions/…/externalsite-….json"
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

## Vercel — una sola línea de trabajo (solo 2 proyectos)

### Nombres (para no mezclar cosas)

| Dónde | Qué usás |
|-------|-----------|
| **GitHub** | Un solo monorepo (p. ej. `AvalonWeb`): todo el código vive acá. |
| **Vercel** | Solo **`avalonweb`** (sitio principal) y **`avalon-premier`**. Esos son los dos “sitios” reales. |
| **Carpeta en este repo** | `apps/avalon-propiedades` = código que **desplegás** en el proyecto Vercel **`avalonweb`**. El nombre de la carpeta es el del **paquete** pnpm/Turbo (`avalon-propiedades`); **no** implica que tengas que tener otro proyecto Vercel llamado `avalon-propiedades`. Si borraste un proyecto Vercel con ese nombre, **bien**: era duplicado o confuso. |

El producto es simple: **web principal** (todo el catálogo institucional) + **web Premier** (mismo catálogo, recorte por etiqueta Premier). En Vercel solo tienen que existir **estos dos** proyectos para este repo:

| Rol | Carpeta en el repo | Proyecto en Vercel (slug en la URL) |
|-----|--------------------|-------------------------------------|
| Web principal | `apps/avalon-propiedades` | **`avalonweb`** |
| Web Premier (solidaria / editorial) | `apps/avalon-premier` | **`avalon-premier`** |

El deploy por GitHub Actions (`.github/workflows/deploy-vercel.yml`) publica solo **`avalon-premier`**. La web principal (`avalonweb`) conviene publicarla con la **integración Git → Vercel** del proyecto `avalonweb` en el dashboard (Root Directory `apps/avalon-propiedades`). No hace falta un tercer proyecto Vercel con nombre duplicado.

**Si ves más tarjetas en el dashboard** (por ejemplo `avalon-web-avalon-propiedades` o un segundo proyecto tipo `avalon-propiedades` apuntando al mismo Git): suelen ser **duplicados** que Vercel creó al enlazar el monorepo sin `Root Directory` correcto, o intentos viejos. **No los uses:** archivá o borrá el proyecto duplicado y desconectá el Git de esa tarjeta para que no siga haciendo builds. **`redalia`** y **`kite-prospect`** no forman parte de este monorepo; son otros sitios en tu cuenta.

**Git en Vercel:** conectá el repo a **`avalonweb`** (web principal) y, si querés, a **`avalon-premier`**. Para Premier, el workflow de Actions usa `VERCEL_TOKEN`; para la web principal podés dejar solo el deploy automático por Git en Vercel y evitar dos pipelines compitiendo en el mismo proyecto.

Configuración típica cuando enlazás a mano en Vercel (sin depender solo de Actions):

- **Framework**: Next.js  
- **Root Directory**: `apps/avalon-propiedades` o `apps/avalon-premier` según el proyecto  
- **Build** (ejemplo): `cd ../.. && pnpm turbo build --filter=avalon-propiedades` (cambiá el filtro en el proyecto Premier)

### Build en Vercel (evitar error de carpeta duplicada)

Si el log dice que no encuentra `.../apps/avalon-premier/apps/avalon-premier` (ruta **duplicada**):

1. Abrí **Settings → General** del proyecto en Vercel.  
2. **Root Directory** debe ser `apps/avalon-premier` (o `apps/avalon-propiedades` en `avalonweb`).  
3. **Output Directory** debe estar **vacío** o ser exactamente **`.next`**.  
   Si pusiste `apps/avalon-premier` ahí, Vercel lo concatena al root y rompe el deploy. Next.js ya escribe en `.next` dentro de esa carpeta.

Variables por proyecto: ver [`docs/KITEPROP.md`](docs/KITEPROP.md) y `.env.example` en cada app (`NEXT_PUBLIC_*`, KiteProp, `CRON_SECRET`, etc.).

## Logos

Cada app sirve sus assets desde `public/brand/`. Sustituí los PNG por las versiones finales exportadas (header, footer, favicon, OG).

## Calidad

- TypeScript estricto en paquetes compartidos.
- Listados y fichas alimentados por el modelo normalizado (`normalizeProperty`, `extractAmenities`, `extractMedia`).
- SEO: `metadata`, `sitemap.ts`, `robots.ts` por app.
