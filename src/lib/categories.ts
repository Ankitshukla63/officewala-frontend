export type CategoryId = "manager" | "meetings" | "deadline" | "client" | "chai" | "wfh";

export type Clip = {
  id: string;
  title: string;
  description: string | null;
  notes?: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  image_url?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  client_name?: string | null;
  category: string;
  created_at: string;
  user_id: string;
  author_name?: string | null;
};

export type DeadlineNote = {
  id: string;
  title: string;
  note: string | null;
  funny_line: string | null;
  due_date: string | null;
  created_at: string;
  user_id: string;
  author_name?: string | null;
};

export type FridayPost = {
  id: string;
  image_url: string | null;
  caption: string | null;
  user_name: string | null;
  created_at: string;
  user_id: string;
};

export const CATEGORY_LABEL: Record<string, string> = {
  manager: "Manager",
  meetings: "Meetings",
  deadline: "Deadline",
  client: "Client",
  chai: "Chai Break",
  wfh: "WFH",
};

export const NAV_LINKS = [
  { to: "/manager", label: "Manager" },
  { to: "/meetings", label: "Meetings" },
  { to: "/deadline", label: "Deadline" },
  { to: "/client", label: "Client" },
  { to: "/chai", label: "Chai Break" },
  { to: "/wfh", label: "WFH" },
  { to: "/friday", label: "Friday" },
] as const;

export const CATEGORY_TILES = [
  {
    to: "/manager",
    emoji: "👨‍💼",
    title: "MANAGER",
    blurb: "Funny manager-related clips.",
    tone: "mustard",
  },
  {
    to: "/meetings",
    emoji: "📓",
    title: "MEETINGS",
    blurb: "Meeting-related clips.",
    tone: "forest",
  },
  {
    to: "/deadline",
    emoji: "⏰",
    title: "DEADLINE",
    blurb: "Notes and deadline memes.",
    tone: "brick",
  },
  {
    to: "/client",
    emoji: "💼",
    title: "CLIENT",
    blurb: "Funny client-related clips.",
    tone: "tangerine",
  },
  {
    to: "/chai",
    emoji: "☕",
    title: "CHAI BREAK",
    blurb: "Office chai and gossip.",
    tone: "forest",
  },
  { to: "/wfh", emoji: "🏠", title: "WFH", blurb: "Work-from-home clips.", tone: "mustard" },
  {
    to: "/friday",
    emoji: "🎉",
    title: "FRIDAY",
    blurb: "Friday moments and photos.",
    tone: "tangerine",
  },
  { to: "/random", emoji: "🎲", title: "RANDOM", blurb: "Random corporate reality.", tone: "brick" },
] as const;

export const TONE_CLASS: Record<string, string> = {
  mustard: "bg-mustard text-ink",
  forest: "bg-forest text-primary-foreground",
  brick: "bg-brick text-primary-foreground",
  tangerine: "bg-tangerine text-ink",
};

export function formatTimeRange(clip: Clip): string | null {
  const parts: string[] = [];
  if (clip.event_date) {
    parts.push(
      new Date(`${clip.event_date}T00:00:00`).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    );
  }
  if (clip.start_time || clip.end_time) {
    parts.push([clip.start_time, clip.end_time].filter(Boolean).join(" – "));
  }
  return parts.length ? parts.join(" • ") : null;
}
