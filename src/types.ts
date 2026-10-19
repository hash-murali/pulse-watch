export type ServiceStatus = "operational" | "unavailable";
export interface Service {
  id: string;
  name: string;
  url: string;
  category: string;
  status: ServiceStatus;
  httpCode: number | null;
  responseTime: number | null;
  lastChecked: string;
}
export type DemoState = "ready" | "loading" | "empty" | "error";
export type DashboardState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; services: Service[] };
