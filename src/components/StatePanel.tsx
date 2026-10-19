import { Icon } from "./Icon";
export function StatePanel({
  kind,
  message,
  onRetry,
}: {
  kind: "loading" | "empty" | "error";
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className={`state-panel ${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <span className="state-icon">
        <Icon
          name={
            kind === "loading"
              ? "refresh"
              : kind === "error"
                ? "alert"
                : "globe"
          }
          className={kind === "loading" ? "spin" : ""}
        />
      </span>
      <h3>
        {kind === "loading"
          ? "Checking in on your services"
          : kind === "error"
            ? "Couldn’t load services"
            : "No services to show"}
      </h3>
      <p>
        {message ??
          (kind === "loading"
            ? "Loading simulated status data…"
            : "Try a different search or switch back to the populated demo.")}
      </p>
      {onRetry && (
        <button className="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
