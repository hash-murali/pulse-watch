# Troubleshooting

- **Local UI shows API failure:** run `npm run build`, then `npm run dev:worker` on port 8787; Vite proxies `/api` there. Or inspect the complete built app directly at http://localhost:8787. `npm run preview` serves static files only, so it cannot supply the Worker API. `npm run dev:demo` is the explicitly labeled UI-only development option.
- **403/429 or unknown for a target:** the provider may block Cloudflare or HEAD requests. This is inconclusive, not an outage. Do not follow redirects or retry aggressively. Review a replacement public endpoint in code and tests if necessary.
- **503/down/timeout for one service:** this is an observation from one location, not proof of a global outage. Other services should remain visible. Use the last-checked time and error label.
- **Refresh disabled:** wait for the 60-second cooldown. There is no automatic polling; timestamps can become old on an open tab. A manual refresh can reuse a cached snapshot.
- **API returns HTML:** verify the deployed commit contains `worker/index.ts` and `wrangler.jsonc`, `main` points at that Worker, and `assets.run_worker_first` includes `/api` and `/api/*`. A static-only deploy cannot serve the API.
- **Build did not run:** check `pulse-watch` → Settings → Builds: repository hash-murali/pulse-watch, branch master, build `npm run build`, deploy `npx wrangler deploy`, root `/`. Inspect build logs; never create a duplicate deployment workflow to work around a transient failure.
- **Cloudflare deployment rejects source:** inspect missing account authorization or build token scope through the existing connection. Never commit or paste tokens into code, logs or chat.
- **Worker error 1102/Free quota exceeded:** inspect Metrics for CPU and request usage; keep the Free plan. Cache or simplify processing, reduce demand, or wait for quota reset. No paid fallback.
- **Rollback required:** see [DEPLOYMENT.md](DEPLOYMENT.md). Prefer the prior successful Worker version for immediate recovery; use a source revert for lasting recovery.

Run `npm run check`, `npm run deploy:check`, then `npm run smoke` for routine verification. Automated tests stub network boundaries and never contact providers. Smoke tests make one status request plus a few asset/routing checks; do not schedule them at high frequency.
