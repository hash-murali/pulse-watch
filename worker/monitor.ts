import type { CheckError, Service, ServiceStatus } from "../src/types";
import type { Target } from "./targets";
import { TARGETS } from "./targets";
export type HealthFetcher = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;
const TIMEOUT_MS = 5000;
export function classifyStatus(code: number, ms: number): ServiceStatus {
  if (!Number.isInteger(code) || code < 200 || code > 599) return "unknown";
  if (code >= 500) return "down";
  if (code >= 400) return "unknown";
  if (code >= 300 || ms >= 1500) return "degraded";
  return "operational";
}
export async function checkService(
  target: Target,
  fetcher: HealthFetcher = fetch,
): Promise<Service> {
  const started = performance.now();
  const result: Service = {
    ...target,
    status: "unknown",
    httpCode: null,
    responseTime: null,
    lastChecked: new Date().toISOString(),
    error: null,
  };
  // Only exact entries in this reviewed list can ever reach fetch. Callers cannot supply a URL.
  if (
    !TARGETS.some(
      (allowed) => allowed.url === target.url && allowed.id === target.id,
    )
  )
    return { ...result, error: "INVALID_TARGET" };
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(new Error("deadline"));
    }, TIMEOUT_MS);
  });
  try {
    const response = await Promise.race([
      fetcher(target.url, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "*/*",
          "User-Agent": "PulseWatch/1.0 (point-in-time health check)",
        },
      }),
      deadline,
    ]);
    // No response text or upstream headers are copied into our output. HEAD has zero expected body bytes.
    if (response.body) void response.body.cancel().catch(() => {});
    if (
      !Number.isInteger(response.status) ||
      response.status < 200 ||
      response.status > 599
    )
      return { ...result, error: "INVALID_RESPONSE" };
    const elapsed = Math.max(0, Math.round(performance.now() - started));
    const error: CheckError =
      response.status >= 400
        ? "HTTP_ERROR"
        : response.status >= 300
          ? "REDIRECT_NOT_FOLLOWED"
          : null;
    return {
      ...result,
      status: classifyStatus(response.status, elapsed),
      httpCode: response.status,
      responseTime: elapsed,
      error,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return {
      ...result,
      status: "down",
      error: timedOut ? "TIMEOUT" : "UNREACHABLE",
      lastChecked: new Date().toISOString(),
    };
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
export async function checkServices(
  fetcher: HealthFetcher = fetch,
): Promise<Service[]> {
  const results: Service[] = new Array<Service>(TARGETS.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(2, TARGETS.length) }, async () => {
      while (next < TARGETS.length) {
        const index = next++;
        results[index] = await checkService(TARGETS[index]!, fetcher);
      }
    }),
  );
  return results;
}
