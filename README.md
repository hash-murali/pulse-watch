# PulseWatch v0.1.0

A lightweight, responsive website status dashboard built with React, strict TypeScript, Vite, and plain CSS. Includes light/dark themes, service summary cards, search and status filters, and loading, empty, and error states.

**All service data is mock data.** The app does not contact endpoints, monitor websites, measure uptime, or perform background checks. Refresh simulates a reload and updates fixture timestamps. The preview selector demonstrates each application state; error recovery returns to populated mock data. Example domains are placeholders. Response times and HTTP codes are simulated.

## Local setup

Use Node.js 22.12+ (Node 24 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To check and build:

```sh
npm run typecheck
npm run build
npm run preview
```

The production output is `dist/`. `npm run build` runs strict TypeScript checks before bundling. `npm run preview` serves that output locally; it is not a production server.

## Cloudflare Pages deployment

No deployment has been performed. When ready:

1. Push the repository to your own GitHub or GitLab repository.
2. In Cloudflare, open **Workers & Pages**, create a **Pages** project, and connect that repository.
3. Choose the **React (Vite)** preset. Set build command to `npm run build` and build output directory to `dist`. Use the repository root as the root directory.
4. Select Node.js 24 using the `NODE_VERSION` build environment variable if necessary.
5. Save and deploy when you are ready to publish.

Alternatively, build locally and use Cloudflare Pages Direct Upload for the contents of `dist/`. No database, credentials, environment variables, backend, or paid dependency is required by this app.

Official reference: [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## Structure

- `src/App.tsx`: dashboard state, theme, search, and status filtering
- `src/components/`: reusable cards, service table, state panels, and SVG icons
- `src/types.ts`: strict service and discriminated application state types
- `src/data/mockServices.ts`: labeled fixtures and generated check timestamps
- `src/styles.css`: responsive layout and theme tokens

Theme preference persists in local storage when available and defaults to the system preference. No user data is stored. Google Fonts is an optional external font request; system fonts are used as a fallback. The service table scrolls horizontally on small screens to preserve readable columns. Status is conveyed with text as well as color. Loading animations respect reduced-motion preferences.

## Manual verification

- Confirm six services, five operational, and one unavailable in the populated preview.
- Search by service name or URL and combine with the status filter; no matches shows an empty state.
- Switch preview states to loading, empty, and error. Use Try again to recover from the error.
- Refresh the populated preview; timestamps update after simulated loading.
- Toggle theme, reload, and confirm persistence. Inspect at mobile and desktop sizes.

Future live monitoring will need a separate server-side checker or monitoring API: browser requests alone cannot reliably determine service health because of CORS. v0.1.0 intentionally includes no authentication or database.
