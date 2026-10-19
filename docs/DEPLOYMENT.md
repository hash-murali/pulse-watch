# Deployment and operations

Production: https://pulse-watch.mail2murali-ks.workers.dev. Existing **Cloudflare Worker with static assets**: `pulse-watch`. Repository: https://github.com/hash-murali/pulse-watch; production branch `master`. This is not a Pages project.

## Audited configuration (2026-10-19)

Authenticated dashboard inspection confirmed the existing Git integration, Worker identity, zero application bindings/variables, no custom routes, compatibility date 2026-10-19, Workers Free plan ($0), enabled builds and build cache. Before v1, this was static-assets-only and matched source ff7d3a7. Previous active Worker version began `3883d131`.

| Setting        | Current value                   |
| -------------- | ------------------------------- |
| Git source     | hash-murali/pulse-watch, master |
| Build command  | `npm run check`                 |
| Deploy command | `npx wrangler deploy`           |
| Root directory | `/`                             |
| Assets         | `dist/`                         |
| Worker entry   | `worker/index.ts`               |
| Plan           | Workers Free ($0)               |

Only the build command was changed in the dashboard, from `npm run build` to `npm run check`, so formatting/lint/types/tests run before every deployment. `npm run check` invokes the existing production build at the end. No account, billing, route, token, binding, or production-branch settings were changed. Existing preview builds are enabled with `npx wrangler preview`; they can build candidate branches without changing production.

Tracked `wrangler.jsonc` adds the Worker entry/API routing to the **same named Worker**; `keep_vars` preserves dashboard variables. `/api` and `/api/*` run through code first; the rest use static assets. An empty `previews` block supports the already-enabled `npx wrangler preview` command; assets remain at the top level as Cloudflare requires. Only `ASSETS` is bound; no storage or paid resource is provisioned. Sampled logs use the existing observability feature without app logs or visitor data.

## Controlled deployment

1. Keep the Workers **Free** plan. Confirm settings still match the table before material configuration changes.
2. Implement on a branch; run `npm ci`, `npm run check`, and `npm run deploy:check` using Node 24.
3. Push the candidate branch, inspect GitHub Actions and the existing Cloudflare preview build. GitHub Actions is validation-only: read-only repository permissions, SHA-pinned official actions, standard public Linux runner, timeout and cancellation. No deployment tokens or duplicate publishing jobs.
4. After review and passing validation, fast-forward master and push it. Never force-push or overwrite history. The existing Cloudflare integration is the only automatic production publisher.
5. Inspect Cloudflare build/deployment logs. Both the validation build and `npx wrangler deploy` must succeed. Verify the Worker name and resulting production URL.
6. Run `npm run smoke`: homepage, built JS, versioned JSON snapshot, fresh timestamp, three valid service observations, JSON 404 and rejected query. Check desktop/mobile themes and keyboard access in the public browser. A failed service observation is different from a broken API.
7. Update docs/PLAN.md and docs/RELEASE.md with actual evidence. Tag v1.0.0 only after all acceptance gates pass; never use a tag to stand in for verification.

A push does not guarantee a successful deployment. If validation or deploy fails, production stays on its prior successful version; inspect logs and fix the cause. Direct `npm run deploy` exists for operator recovery only and requires authenticated Cloudflare access; do not use it alongside Git deployment for the same release.

## Rollback

For immediate recovery, use Cloudflare → pulse-watch → Deployments → the prior successful version → Roll back. This replaces code/assets without deleting the Worker or source history. Before v1 the known working version began `3883d131` (mock-only source ff7d3a7). After v1 use the last verified version listed by Cloudflare.

For lasting source rollback, revert the bad commit(s) on master with `git revert`, validate, then push through the existing integration. Never reset/force-push shared history. Reverting the entire v1 range intentionally restores the v0.1 mock dashboard and removes the live API; the pre-v1 build command must also return to `npm run build` because that source has no `check` script. Do not delete production resources or data.

See [troubleshooting](TROUBLESHOOTING.md) and [$0 limits](LIMITS.md). Cloudflare credentials remain only in the existing platform connection; never put tokens in source, logs, GitHub Actions or chat.
