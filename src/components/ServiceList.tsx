import type { Service } from "../types";
import { Icon } from "./Icon";
export function ServiceList({ services }: { services: Service[] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Status</th>
            <th scope="col">HTTP code</th>
            <th scope="col">Response time</th>
            <th scope="col">Last checked</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>
                <div className="service-name">
                  <span className={`service-icon ${service.status}`}>
                    <Icon
                      name={service.category === "API" ? "pulse" : "globe"}
                    />
                  </span>
                  <div>
                    <strong>{service.name}</strong>
                    <span className="service-url">
                      {service.url.replace("https://", "")}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`status-badge ${service.status}`}>
                  <span className="small-dot" />
                  {service.status === "operational"
                    ? "Operational"
                    : "Unavailable"}
                </span>
              </td>
              <td>
                <code
                  className={
                    service.httpCode !== null && service.httpCode >= 400
                      ? "bad-code"
                      : ""
                  }
                >
                  {service.httpCode ?? "—"}
                </code>
              </td>
              <td>
                <span
                  className={`response ${service.responseTime !== null && service.responseTime > 1000 ? "slow" : ""}`}
                >
                  {service.responseTime ?? "—"}
                  {service.responseTime !== null && <small> ms</small>}
                </span>
              </td>
              <td>
                <time
                  dateTime={service.lastChecked}
                  title={new Date(service.lastChecked).toLocaleString()}
                >
                  {new Date(service.lastChecked).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
