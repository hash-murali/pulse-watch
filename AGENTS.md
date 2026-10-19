# PulseWatch engineering guide

## Purpose and architecture

Keep this a small public learning project costing $0. Preserve the React/TypeScript/Vite UI and Cloudflare Worker `pulse-watch` with static assets. Production: https://pulse-watch.mail2murali-ks.workers.dev. GitHub: hash-murali/pulse-watch; production branch: master. No database, authentication, paid services, cron, or historical uptime claims.

## Standards

Use strict TypeScript, reusable focused modules, plain CSS, accessible labels, keyboard controls, and status text alongside color. Validate untrusted API data at runtime. Keep demo mode development-only. Use test-first changes for monitoring and frontend behavior. Tests must not contact real endpoints. Do not rewrite working code without a reason.

## Safety

Never print or commit credentials, personal data, `.env`, `.dev.vars`, Wrangler state, or secret files. Never accept URLs from API callers: server-side requests must use exact reviewed HTTPS allowlist entries, no redirects, bounded concurrency, timeouts, and no response bodies. Do not proxy user headers/cookies. No purchases, paid bindings, resource deletion, force pushes, history rewrites, or production data deletion. Preserve unknown production configuration. Ask only for missing external authorization, destructive actions, security risks, or potential costs.

## Commands

`npm ci`; `npm run dev` (Vite UI); `npm run dev:worker` (local full stack after build); `npm run dev:demo` (development fixtures); `npm run lint`; `npm run format:check`; `npm run typecheck`; `npm test`; `npm run build`; `npm run check` (all gates); `npm run deploy:check` (local Wrangler dry run).

## Workflow

Read docs/PLAN.md, docs/ARCHITECTURE.md, and docs/DEPLOYMENT.md. Update progress and operational docs with coherent milestone commits. Use existing Cloudflare Git deployment as the only automatic publisher; GitHub Actions validates only. Before a production push, run all checks and review the staged diff and target Worker. Validate production HTML, assets, API JSON, and desktop/mobile UI after deployment. Record blockers honestly. Never tag v1.0.0 until docs/RELEASE.md acceptance checks all pass. No blanket assumption that a Git push deployed successfully.
