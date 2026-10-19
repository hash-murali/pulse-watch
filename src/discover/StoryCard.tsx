import type { Story } from "./model";
import { Glyph } from "./Glyph";
function age(time: number) {
  if (!time) return "Date unavailable";
  const hours = Math.max(0, Math.floor((Date.now() / 1000 - time) / 3600));
  return hours < 1
    ? "Just posted"
    : hours < 24
      ? `${hours}h ago`
      : `${Math.floor(hours / 24)}d ago`;
}
export function StoryCard({
  story,
  saved,
  onSave,
  index,
}: {
  story: Story;
  saved: boolean;
  onSave: (story: Story) => void;
  index: number;
}) {
  const domain = new URL(story.url).hostname.replace(/^www\./, "");
  return (
    <article className={`play-story tone-${index % 4}`}>
      <div className="play-story-top">
        <span className="play-story-source">
          <span className="play-domain-icon">
            {domain.slice(0, 1).toUpperCase()}
          </span>
          {domain}
        </span>
        <button
          className={`play-save ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${story.title}`}
          aria-pressed={saved}
          onClick={() => onSave(story)}
        >
          <Glyph name="bookmark" />
        </button>
      </div>
      <div className="play-story-label">
        <span>#{String(index + 1).padStart(2, "0")}</span>
        <span>{age(story.publishedAt)}</span>
      </div>
      <h3>
        <a href={story.url} target="_blank" rel="noopener noreferrer">
          {story.title}
        </a>
      </h3>
      <p className="play-author">
        Shared by <span>{story.author}</span>
      </p>
      <div className="play-story-bottom">
        <span className="play-points">
          <Glyph name="flame" />
          {story.points.toLocaleString()} points
        </span>
        <a
          href={story.commentsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${story.comments} comments on ${story.title}`}
        >
          <Glyph name="chat" />
          {story.comments.toLocaleString()}
        </a>
        <a
          className="play-story-open"
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Read ${story.title}`}
        >
          <Glyph name="external" />
        </a>
      </div>
    </article>
  );
}
