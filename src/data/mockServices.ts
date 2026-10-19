import type { Service } from "../types";
// Demo fixtures only. No endpoint is contacted by this application.
export function getMockServices(now = new Date()): Service[] {
  const fixtures: Omit<Service, "lastChecked">[] = [
    {
      id: "web",
      name: "Main website",
      url: "https://pulsewatch.example.com",
      category: "Website",
      status: "operational",
      httpCode: 200,
      responseTime: 142,
    },
    {
      id: "api",
      name: "Public API",
      url: "https://api.example.com/v1/health",
      category: "API",
      status: "operational",
      httpCode: 200,
      responseTime: 86,
    },
    {
      id: "app",
      name: "Web application",
      url: "https://app.example.com",
      category: "Application",
      status: "operational",
      httpCode: 200,
      responseTime: 218,
    },
    {
      id: "docs",
      name: "Documentation",
      url: "https://docs.example.com",
      category: "Website",
      status: "operational",
      httpCode: 200,
      responseTime: 104,
    },
    {
      id: "checkout",
      name: "Checkout API",
      url: "https://checkout.example.com/health",
      category: "API",
      status: "down",
      httpCode: 503,
      responseTime: 1240,
    },
    {
      id: "cdn",
      name: "Asset delivery",
      url: "https://cdn.example.com",
      category: "Infrastructure",
      status: "operational",
      httpCode: 200,
      responseTime: 42,
    },
  ];
  return fixtures.map((service, index) => ({
    ...service,
    lastChecked: new Date(now.getTime() - index * 3000).toISOString(),
  }));
}
