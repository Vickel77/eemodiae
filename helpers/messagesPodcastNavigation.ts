/** Query appended when opening a podcast episode from /messages so Back restores tab state. */
export const MESSAGES_PODCAST_EPISODE_SEARCH =
  "tab=podcasts&podcastView=episodes" as const;

/** Open a message from the Series tab / series modal → Back returns to Series. */
export const MESSAGES_SERIES_TAB_SEARCH = "tab=series" as const;

/** Open a message from the Messages tab → Back returns to Messages. */
export const MESSAGES_STANDALONE_TAB_SEARCH = "tab=messages" as const;

const TAB_IDS = ["series", "messages", "podcasts"] as const;
const PODCAST_VIEW_IDS = ["series", "episodes"] as const;

type TabId = (typeof TAB_IDS)[number];
type PodcastViewId = (typeof PODCAST_VIEW_IDS)[number];

export type MessagesNavigationDefaults = {
  tab?: TabId;
  podcastView?: PodcastViewId;
};

function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value);
}

function isPodcastViewId(value: string): value is PodcastViewId {
  return (PODCAST_VIEW_IDS as readonly string[]).includes(value);
}

/** `/messages?tab=…&podcastView=…&page=…` — Back from audio/podcast detail screens. */
export function messagesListHrefFromQuery(
  query: Record<string, string | string[] | undefined>,
  defaults?: MessagesNavigationDefaults
): string {
  const defaultTab = defaults?.tab ?? "messages";
  const defaultPv = defaults?.podcastView ?? "episodes";
  const rawTab = query.tab;
  const rawPv = query.podcastView;
  const rawPage = query.page;
  const tab =
    typeof rawTab === "string" && isTabId(rawTab) ? rawTab : defaultTab;
  const podcastView =
    typeof rawPv === "string" && isPodcastViewId(rawPv)
      ? rawPv
      : defaultPv;
  const params = new URLSearchParams();
  params.set("tab", tab);
  params.set("podcastView", podcastView);
  const pageRaw = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = parseInt(pageRaw ?? "1", 10);
  if (Number.isFinite(page) && page > 1) {
    params.set("page", String(page));
  }
  return `/messages?${params.toString()}`;
}

/** Query string for `/messages/[id]?…` when navigating inside the player. */
export function messageDetailQueryStringFromRouter(
  query: Record<string, string | string[] | undefined>,
  defaults?: MessagesNavigationDefaults
): string {
  const defaultTab = defaults?.tab ?? "messages";
  const defaultPv = defaults?.podcastView ?? "episodes";
  const rawTab = query.tab;
  const rawPv = query.podcastView;
  const tab =
    typeof rawTab === "string" && isTabId(rawTab) ? rawTab : defaultTab;
  const podcastView =
    typeof rawPv === "string" && isPodcastViewId(rawPv)
      ? rawPv
      : defaultPv;
  const params = new URLSearchParams();
  params.set("tab", tab);
  params.set("podcastView", podcastView);
  const pageRaw = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = parseInt(pageRaw ?? "1", 10);
  if (Number.isFinite(page) && page > 1) {
    params.set("page", String(page));
  }
  return params.toString();
}

/** Podcast player → messages list (defaults: podcasts / episodes). */
export function messagesHrefFromPlayerQuery(
  query: Record<string, string | string[] | undefined>
): string {
  return messagesListHrefFromQuery(query, {
    tab: "podcasts",
    podcastView: "episodes",
  });
}

/** Preserve tab context when switching episodes on the podcast player. */
export function podcastEpisodeQueryStringFromRouter(
  query: Record<string, string | string[] | undefined>
): string {
  return messageDetailQueryStringFromRouter(query, {
    tab: "podcasts",
    podcastView: "episodes",
  });
}
