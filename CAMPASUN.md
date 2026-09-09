# Campasun presentation and demonstrations

Public entry point: https://www.jengu.ai/campasun/

- Website designs: `/braise`, `/terrasse`, `/feu-de-joie`, `/les-beaux-jours`, `/le-grand-tour`.
- Shared website assets: `/campasun/restaurant-assets/`.
- Guest app: `/campasun/app/#home`.
- Staff app: `/campasun/app/staff#staff`.
- PDF: `/documents/campasun-presentation-fr.pdf`.

The five designs are actual static builds copied from the latest La Savane source, not redirects or embedded external websites. `scripts/import-savane.mjs` imports a fresh `website/dist/client` build, namespaces assets and sends the designs’ home links back to `/campasun/`. Use `node scripts/import-savane.mjs /absolute/path/to/website/dist/client` after rebuilding the source. The five route names do not overlap existing Jengu pages.

The Campasun app is served through `src/pages/campasun/app/[...path].ts`. It proxies only to the fixed Campasun Worker. Its mount adapter updates script/API/image paths, redirects and cookie scope. Browsers remain on www.jengu.ai; no ChatGPT or workers.dev domain is used in the presentation links or app browser requests. Guest and staff requests use the same persistent demonstration workspace. Worker source is maintained locally in the sibling `campasun-jengu` repository.

This is a public sample-data demo. Concierge replies are guided, photo verdicts are simulated, and automatic urgency classification remains planned. No real campsite data, credentials, payments or operational service orders are included.
