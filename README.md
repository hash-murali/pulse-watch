# PulseWatch

A lightweight public website-status dashboard built to learn how to operate a real cloud application at **$0**.

[Production dashboard](https://pulse-watch.mail2murali-ks.workers.dev) · [Source](https://github.com/hash-murali/pulse-watch)

React + strict TypeScript + Vite + plain CSS, served by the existing Cloudflare Worker **pulse-watch** with static assets. This project uses **Workers, not Cloudflare Pages**.

## What it does

- Point-in-time server-side HTTPS checks against three fixed public endpoints.
- Operational, degraded, down, and unknown results; HTTP code, header latency, individual timestamps and safe errors.
- Summary cards, search, status filtering, manual refresh, loading/empty/API-error and partial-failure states.
- Responsive dark/light themes, local theme persistence, keyboard controls, visible focus and reduced-motion support.
- Five-second target timeouts, two concurrent checks, no redirects/body reads, and 60-second best-effort snapshots. No automatic polling.

These observations are **not historical uptime**, continuous monitoring, authoritative provider health, or browser transaction tests. A successful status-page HTTP response does not mean all that provider's products are healthy. Unknown results are inconclusive and never counted as healthy.

## Local setup

Use **Node.js 24 LTS** (`.nvmrc`) and npm.

```sh
npm ci
npm run build
npm run dev:worker
```

Open http://localhost:8787 for the complete built frontend and local Worker API. This local runtime performs real checks against the fixed public endpoints on demand. It does not deploy anything.

For frontend hot reload, keep the Worker running and use another terminal:

```sh
npm run dev
```

Vite prints its local URL and proxies `/api` to port 8787. After changing API code, Wrangler reloads it; after changing frontend code, Vite hot reloads. Rebuild to update the frontend served directly on 8787.

For UI-only mock mode without the Worker:

```sh
npm run dev:demo
```

Mock mode is clearly labeled and enabled only in development. Its state selector demonstrates loading, empty and error states. Production builds always use the real API, even if the demo environment flag is set.

## Verification

```sh
npm run check          # formatting, lint, frontend/Worker types, tests, production build
npm run deploy:check   # local Wrangler packaging dry run; no deployment
npm run smoke          # verify the public production deployment
```

To smoke-test the local Worker: `PULSEWATCH_URL=http://localhost:8787 npm run smoke`. Tests use controlled fetch responses and do not make live checks. The build writes `dist/`; `npm run preview` only serves frontend files and does not run `/api/status`.

## Deployment

The existing Cloudflare Git integration watches **master** in `hash-murali/pulse-watch`:

| Setting           | Value                                      |
| ----------------- | ------------------------------------------ |
| Platform / Worker | Cloudflare Workers / `pulse-watch`         |
| Build             | `npm run check`                            |
| Deploy            | `npx wrangler deploy`                      |
| Root              | `/`                                        |
| Assets            | `dist/`                                    |
| Runtime entry     | `worker/index.ts`                          |
| Account plan      | Workers Free ($0), verified before release |

Run validation and review the target configuration before pushing to master. That push triggers the existing Cloudflare build/deployment. GitHub Actions validates only; it does not deploy. No Cloudflare credentials belong in the repository or GitHub Actions. Do not create another Worker or switch to Pages. Detailed verification, rollback and troubleshooting are in [deployment operations](docs/DEPLOYMENT.md).

## Architecture and docs

- `src/`: React UI, API validation/client hook, development-only fixtures and CSS.
- `worker/`: fixed allowlist, bounded checker, safe API routing and best-effort caching.
- `tests/`: frontend integration, API-client validation and monitoring/API tests.
- `wrangler.jsonc`: existing Worker identity, static assets and API-first routing; no paid resources.
- [Architecture](docs/ARCHITECTURE.md) · [API contract](docs/API.md) · [$0 limits and security](docs/LIMITS.md)
- [Deployment and rollback](docs/DEPLOYMENT.md) · [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Implementation plan](docs/PLAN.md) · [Release checklist](docs/RELEASE.md) · [Engineering guide](AGENTS.md)

Only React and React DOM are runtime npm dependencies. No database, authentication, paid API, third-party fonts, analytics, cron, or secrets are required. Theme preference is the only browser-stored setting. Public API traffic can exhaust Free quotas; availability may then be limited without incurring charges. Historical monitoring remains a documented future option, not an enabled resource.
