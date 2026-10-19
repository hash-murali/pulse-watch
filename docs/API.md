# Status API

`GET /api/status` on the same origin. No parameters, body, URL input, credentials or API key. All results are point-in-time observations, including cached responses. Cache TTL is 60 seconds; checking frequency is demand-driven with no scheduled jobs.

```json
{
  "schemaVersion": 1,
  "checkedAt": "2026-10-19T12:00:00.000Z",
  "cacheTtlSeconds": 60,
  "services": [
    {
      "id": "cloudflare",
      "name": "Cloudflare website",
      "url": "https://www.cloudflare.com/robots.txt",
      "category": "Website",
      "status": "operational",
      "httpCode": 200,
      "responseTime": 120,
      "lastChecked": "2026-10-19T12:00:00.000Z",
      "error": null
    }
  ]
}
```

Example above is illustrative; actual responses contain three fixed services. `responseTime` is milliseconds to HTTP headers, excluding response bodies. It is null if no valid HTTP response was obtained. Timestamps are ISO UTC; the dashboard renders local time. `checkedAt` is snapshot completion; each `lastChecked` is that check's completion. Endpoint responses can occur several seconds apart.

| Observation                                       | State       | Error                             |
| ------------------------------------------------- | ----------- | --------------------------------- |
| HTTP 2xx under 1500ms                             | operational | null                              |
| HTTP 2xx at least 1500ms                          | degraded    | null                              |
| HTTP 3xx                                          | degraded    | REDIRECT_NOT_FOLLOWED             |
| HTTP 4xx (including access denial or rate limits) | unknown     | HTTP_ERROR                        |
| HTTP 5xx                                          | down        | HTTP_ERROR                        |
| Five-second deadline                              | down        | TIMEOUT                           |
| Network/TLS/DNS failure                           | down        | UNREACHABLE                       |
| Invalid target or response                        | unknown     | INVALID_TARGET / INVALID_RESPONSE |

The response is HTTP 200 even if some or all services fail; those are observations, not API transport failures. Unknown is not counted as operational or down. No upstream body, redirect target, exception text, cookies, or visitor headers are exposed. HEAD cannot tell whether an application renders or works end-to-end. A provider's status page responding successfully is not a guarantee all its products are healthy.

API errors: query parameters → 400; non-GET method → 405 with `Allow: GET`; unknown `/api` route → JSON 404; unexpected API failure → safe JSON 503. No CORS header is set. Response uses `Cache-Control: no-store`; the Worker itself caches snapshots internally. The client times out after 15 seconds, reads at most 16KiB, validates data, and allows manual refresh once per 60 seconds after success. It never polls. Cache reuse means refresh may return the same timestamp.
