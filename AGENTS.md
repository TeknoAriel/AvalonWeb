# Guía para agentes (Cursor / IA)

- **Producto y alcance:** `docs/BRIEF_MAESTRO_OPERATIVO.md`
- **KiteProp (env, REST, consultas, qué tocar en código):** `docs/KITEPROP.md` — **prioridad** antes de inventar URLs o cuerpos de POST.
- **Campos del JSON de propiedades:** `docs/DATA_LAYER.md`
- **Variables locales:** `.env.example`

No exponer `KITEPROP_API_KEY` al cliente. Formularios → `POST /api/consultas` (Next) → `submitWebConsulta` + `postConsultaToKiteprop` en `@avalon/core`.
