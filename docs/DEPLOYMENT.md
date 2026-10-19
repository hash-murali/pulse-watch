# Deployment and operations

Existing production is Cloudflare **Workers with static assets**. Worker name: `pulse-watch`. URL: https://pulse-watch.mail2murali-ks.workers.dev. Repository: https://github.com/hash-murali/pulse-watch; branch: `master`. Build command: `npm run build`; static output: `dist`.

The user reports an existing Cloudflare Git-based deployment. The local repository has no Wrangler config as of audit. Do not switch to Pages, create another Worker, overwrite unknown account settings, or add a parallel GitHub Actions deployer. Inspect the existing Worker Settings → Builds, its branch/build/deploy commands, bindings, routes, and Workers plan before the first API deployment. Do not upgrade the plan.

GitHub Actions will validate code only. Cloudflare remains the deployment owner. A production push is allowed by the current project brief after checks; verify its resulting deployment explicitly. If account access is unavailable, finish local work and report the exact verification/deployment blocker.

Rollback: use Cloudflare Workers → pulse-watch → Deployments to roll back to the previous successful version. For source rollback, use `git revert` on the release commit range and let the existing build integration redeploy; never reset/force-push shared history. Reverting to v0.1.0 intentionally restores mock-only UI.

## Inspected configuration (2026-10-19)
Authenticated dashboard confirms existing `pulse-watch`, static-assets-only baseline, no bindings/variables, no custom routes, compatibility date 2026-10-19. Git repository hash-murali/pulse-watch, production branch master, build `npm run build`, deploy `npx wrangler deploy`, root `/`. Builds enabled; build cache enabled. This existing integration is preserved. Local `wrangler.jsonc` adds a Worker entry and API-first routing to the same named Worker; `keep_vars` preserves any future dashboard variables. Workers Free ($0) confirmed in the authenticated account plan screen before production push. No account settings were changed.
