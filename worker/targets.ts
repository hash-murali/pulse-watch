export const TARGETS = [
  {
    id: "cloudflare",
    name: "Cloudflare website",
    url: "https://www.cloudflare.com/robots.txt",
    category: "Website",
  },
  {
    id: "github-status",
    name: "GitHub status page",
    url: "https://www.githubstatus.com/",
    category: "Website",
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    url: "https://www.wikipedia.org/",
    category: "Website",
  },
] as const;
export interface Target {
  id: string;
  name: string;
  url: string;
  category: string;
}
