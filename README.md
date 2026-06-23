# Visor 2030 — Frontend

Aplicació pública (SPA) que visualitza els indicadors dels **Objectius de Desenvolupament Sostenible (ODS)** de municipis catalans. Aquesta és la part *frontend* del projecte Visor 2030.

- **Visor públic**: [https://visor2030.diba.cat/](https://visor2030.diba.cat/)
- **Documentació tècnica**: [https://visor2030-documentacio.diba.cat/](https://visor2030-documentacio.diba.cat/)

> El projecte sencer està format per:
> - [`Visor2030-API`](https://github.com/DiputacioBarcelona/Visor2030-API) — backend (API REST)
> - **aquest repo** — visualització pública (SPA)
> - [`Visor2030-Back`](https://github.com/DiputacioBarcelona/Visor2030-Back) — backoffice

## Tecnologia

- **Node 20+**
- **Vue 3** (Composition API, `<script setup>`)
- **Vite 5**
- **Vue Router 4** + **Vue I18n 9** (ca / es / en)
- **Tailwind CSS 3**
- **D3.js 7** + `topojson-client` per a les visualitzacions

## Instal·lació ràpida

```bash
# 1. Clonar
git clone https://github.com/DiputacioBarcelona/Visor2030-Front.git
cd Visor2030-Front

# 2. Instal·lar dependències
npm install

# 3. Configurar la URL del backend
echo 'VITE_API_URL=http://localhost:8000/' > .env.local

# 4. Servidor de desenvolupament
npm run dev
```

## Scripts disponibles

```bash
npm run dev          # Dev server amb HMR
npm run build        # Comprovació de tipus + build de producció
npm run build-prod   # Build amb --base=/ (per a desplegament a l'arrel)
npm run serve        # Previsualitza el build de producció
npm run build-zip    # Build + genera un ZIP a dist/
```

## Documentació tècnica

La documentació tècnica completa del projecte està publicada a **[https://visor2030-documentacio.diba.cat/](https://visor2030-documentacio.diba.cat/)**:

- Estructura de fitxers
- Rutes i pàgines
- Sistema de càrrega de dades (`useLoadData`, `data.js`)
- Filtres i estat global (`provide` / `inject`)
- Textos i etiquetes (i18n amb tres idiomes)
- Components gràfics (mapa, beeswarm, rose, line, bar...)
- Pressupost, plans estratègics, valoració ciutadana

## Llicència

[AGPLv3](LICENSE)

## Crèdits

Desenvolupat per [OneTandem](https://onetandem.com) per a la [Diputació de Barcelona](https://www.diba.cat).
