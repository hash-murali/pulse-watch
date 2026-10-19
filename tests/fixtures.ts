import type { StatusResponse } from "../src/types";
export function snapshot(): StatusResponse {
  return {
    schemaVersion: 1,
    cacheTtlSeconds: 60,
    checkedAt: "2026-10-19T12:00:00.000Z",
    services: [
      {
        id: "one",
        name: "Healthy website",
        url: "https://www.cloudflare.com/robots.txt",
        category: "Website",
        status: "operational",
        httpCode: 200,
        responseTime: 120,
        lastChecked: "2026-10-19T12:00:00.000Z",
        error: null,
      },
      {
        id: "two",
        name: "Failed website",
        url: "https://www.wikipedia.org/",
        category: "Website",
        status: "down",
        httpCode: 503,
        responseTime: 320,
        lastChecked: "2026-10-19T12:00:00.000Z",
        error: "HTTP_ERROR",
      },
      {
        id: "three",
        name: "Blocked website",
        url: "https://www.githubstatus.com/",
        category: "Website",
        status: "unknown",
        httpCode: 403,
        responseTime: 100,
        lastChecked: "2026-10-19T12:00:00.000Z",
        error: "HTTP_ERROR",
      },
    ],
  };
}
