# Changelog

## 1.0.0 — 2026-10-19

- Replace production fixtures with a same-origin Cloudflare Worker status API for three fixed public HTTPS endpoints.
- Report operational, degraded, down and unknown observations, HTTP codes, header latency, check timestamps and safe errors.
- Bound checks to five seconds per target and two concurrent requests; prevent arbitrary URL fetching and redirect following; consume no upstream bodies.
- Add best-effort 60-second snapshots, manual refresh cooldown and partial-failure handling. No automatic polling or historical uptime claims.
- Preserve responsive light/dark UI, search and filtering; add keyboard access and status descriptions.
- Add automated monitoring/client/frontend tests, strict type checks, linting, formatting, security headers and validation-only GitHub Actions.
- Document the existing Workers Git deployment, Free-plan constraints, API contract, rollback and troubleshooting. No paid services, storage or scheduled jobs added.

## 0.1.0

Initial React, TypeScript and Vite dashboard with labeled mock data, service cards/table, responsive themes, search, filtering and demo states.
