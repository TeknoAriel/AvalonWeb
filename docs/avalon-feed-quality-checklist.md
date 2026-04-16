# Checklist de calidad del feed (KiteProp → Avalon)

Usalo con soporte KiteProp o el equipo de datos para mejorar búsqueda, scoring y textos automáticos.

## Ubicación y mapas

- [ ] Propiedades **sin** `latitude` / `longitude` válidos → mapa en ficha muestra fallback (“Coordenadas no disponibles”).
- [ ] `hide_exact_location` consistente con expectativa legal/comercial.
- [ ] `zone` y `zone_2` poblados de forma homogénea (evita relacionadas pobres si la zona está vacía).

## Precios y operación

- [ ] `hide_prices` masivo limita filtros por precio e insights de comparador / mercado.
- [ ] Moneda (`currency`) coherente con precios numéricos parseables.
- [ ] Operación (`for_sale`, `for_rent`, `for_temp_rental`) alineada con precios presentes.

## Superficie y tipología

- [ ] `total_meters` / `covered_meters` numéricos donde se espera filtrar por m².
- [ ] `property_type` estable para filtros y NL (“casas” vs `houses`, etc.).

## Amenities estructuradas

- [ ] `fit_for_credit`, `parkings`, `accept_pets`, etc. alimentan filtros “apto crédito” / “cochera” y el scoring de relacionadas.
- [ ] Si todo viene vacío, la UI ya degrada (amenities desde booleanos en `extractAmenities`).

## Premier

- [ ] Tags / flags `premier` o equivalentes según convención del CRM.
- [ ] Revisar activos con **pocas fotos** o datos incompletos si activás `PREMIER_MIN_GALLERY_IMAGES` o `PREMIER_MIN_TOTAL_M2`.
- [ ] Lista de exclusión temporal: `PREMIER_EXCLUDE_PROPERTY_IDS` para outliers puntuales.

## NL y MCP

- [ ] Ciudades y zonas con **nombres** que el usuario escriba tal cual en búsqueda libre (sinónimos en data = mejor recall).
- [ ] Si usás `KITEPROP_MCP_BRIDGE_URL`, validar que `search_properties` devuelva `filters` compatibles con `PropertyListFilters` parcial.
