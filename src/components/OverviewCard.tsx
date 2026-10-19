import { Icon } from "./Icon";
import type { IconName } from "./Icon";
export function OverviewCard({
  label,
  value,
  detail,
  icon,
  tone = "",
}: {
  label: string;
  value: number | null;
  detail: string;
  icon: IconName;
  tone?: string;
}) {
  return (
    <article className={`overview-card ${tone}`}>
      <div className="card-label">
        {label}
        <span className="card-icon">
          <Icon name={icon} />
        </span>
      </div>
      <div className="card-value">{value ?? "—"}</div>
      <p>
        <span className="small-dot" />
        {detail}
      </p>
    </article>
  );
}
