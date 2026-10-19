import type { Service, StatusResponse } from "../types";
const MAX_BYTES = 16384;
const errorCodes: readonly unknown[] = [
  null,
  "TIMEOUT",
  "UNREACHABLE",
  "INVALID_TARGET",
  "INVALID_RESPONSE",
  "REDIRECT_NOT_FOLLOWED",
  "HTTP_ERROR",
];
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function text(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}
function date(value: unknown): value is string {
  return text(value, 40) && Number.isFinite(Date.parse(value));
}
function service(value: unknown): value is Service {
  if (
    !record(value) ||
    !text(value.id, 64) ||
    !text(value.name, 100) ||
    !text(value.category, 40) ||
    !text(value.url, 500) ||
    !date(value.lastChecked)
  )
    return false;
  try {
    const url = new URL(value.url);
    if (url.protocol !== "https:" || url.username || url.password) return false;
  } catch {
    return false;
  }
  return (
    ["operational", "degraded", "down", "unknown"].includes(
      String(value.status),
    ) &&
    (value.httpCode === null ||
      (typeof value.httpCode === "number" &&
        Number.isInteger(value.httpCode) &&
        value.httpCode >= 200 &&
        value.httpCode <= 599)) &&
    (value.responseTime === null ||
      (typeof value.responseTime === "number" &&
        Number.isFinite(value.responseTime) &&
        value.responseTime >= 0 &&
        value.responseTime <= 60000)) &&
    errorCodes.includes(value.error)
  );
}
export function isStatusResponse(value: unknown): value is StatusResponse {
  if (
    !record(value) ||
    value.schemaVersion !== 1 ||
    value.cacheTtlSeconds !== 60 ||
    !date(value.checkedAt) ||
    !Array.isArray(value.services) ||
    value.services.length > 10 ||
    !value.services.every(service)
  )
    return false;
  return (
    new Set(value.services.map((s) => s.id)).size === value.services.length
  );
}
async function readBounded(response: Response): Promise<unknown> {
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error("Invalid status response");
  if (Number(response.headers.get("content-length")) > MAX_BYTES) {
    void response.body?.cancel();
    throw new Error("Status response too large");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Invalid status response");
  const decoder = new TextDecoder();
  let length = 0;
  let body = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > MAX_BYTES) {
        void reader.cancel();
        throw new Error("Status response too large");
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error("Invalid status response");
  }
}
export async function loadStatus(
  signal?: AbortSignal,
): Promise<StatusResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 15000);
  try {
    const response = await fetch("/api/status", {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      void response.body?.cancel();
      throw new Error("Status temporarily unavailable");
    }
    const data = await readBounded(response);
    if (!isStatusResponse(data)) throw new Error("Invalid status response");
    return data;
  } catch (error) {
    if (timedOut) throw new Error("Status request timed out", { cause: error });
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
