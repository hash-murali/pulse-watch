export type ServiceStatus = "operational" | "degraded" | "down" | "unknown";
export type CheckError = "TIMEOUT" | "UNREACHABLE" | "INVALID_TARGET" | "INVALID_RESPONSE" | "REDIRECT_NOT_FOLLOWED" | "HTTP_ERROR" | null;
export interface Service {
  id: string;
  name: string;
  url: string;
  category: string;
  status: ServiceStatus;
  httpCode: number | null;
  responseTime: number | null;
  lastChecked: string;
  error?: CheckError;
}
export interface StatusResponse {
  schemaVersion: 1;
  checkedAt: string;
  cacheTtlSeconds: 60;
  services: Service[];
}
export type DemoState = "ready" | "loading" | "empty" | "error";
export type DashboardState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; services: Service[]; checkedAt?: string };
export const STATUS_LABELS: Record<ServiceStatus, string> = { operational: "Operational", degraded: "Degraded", down: "Down", unknown: "Unknown" };
