import type { StoreBook, StoreConfig, StoreCourse, StoreItem } from "./types";

export type Tone = { tone: string; deep: string };

export const TONES: Record<string, Tone> = {
  amber: { tone: "#D98324", deep: "#A35D12" },
  royal: { tone: "#2E5EAA", deep: "#1F3F7A" },
  emerald: { tone: "#1E7F63", deep: "#14563F" },
  wine: { tone: "#8E3B55", deep: "#6B2440" },
  violet: { tone: "#6C4AB0", deep: "#4A3080" },
  gold: { tone: "#C9A227", deep: "#9A7A1C" },
};

export const CAT_COLORS: Record<string, Tone> = {
  Devotionals: { tone: "#D98324", deep: "#A35D12" },
  Theology: { tone: "#2E5EAA", deep: "#1F3F7A" },
  Series: { tone: "#6C4AB0", deep: "#4A3080" },
  "Life Skills": { tone: "#1E7F63", deep: "#14563F" },
  Fiction: { tone: "#8E3B55", deep: "#6B2440" },
  _default: { tone: "#C9A227", deep: "#9A7A1C" },
};

export const PLATFORM_META = {
  amazon: { mark: "AZ", name: "Amazon", note: "Paperback and hardcover", color: "#D98324" },
  kindle: { mark: "K", name: "Kindle", note: "Read on any device", color: "#2E5EAA" },
  selar: { mark: "SL", name: "Selar", note: "Pay in naira, instant delivery", color: "#1E7F63" },
  bambooks: { mark: "BB", name: "Bambooks", note: "Nigerian ebook library", color: "#6C4AB0" },
  okadabooks: { mark: "OK", name: "OkadaBooks", note: "Nigerian ebook store", color: "#8E3B55" },
  other: { mark: "✦", name: "More", note: "Additional platform", color: "#C9A227" },
} as const;

export function catColor(cat?: string): Tone {
  return (cat && CAT_COLORS[cat]) || CAT_COLORS._default;
}

export function toneOf(item: StoreItem): Tone {
  const course = item as StoreCourse;
  if (course.tone && TONES[course.tone]) return TONES[course.tone];
  return catColor((item as StoreBook).category);
}

export function isCourse(item: StoreItem | null, store: StoreConfig): item is StoreCourse {
  return !!item && (store.courses || []).some((c) => c.id === item.id);
}

export function findItem(store: StoreConfig, id: string): StoreItem | undefined {
  return store.books.find((b) => b.id === id) || store.courses.find((c) => c.id === id);
}

export function fmt(
  item: StoreItem,
  currency: "USD" | "NGN",
  fxRate: number
): { main: string; alt: string } {
  const usd = `$${Number(item.priceUSD).toFixed(2)}`;
  const ngn = `₦${Number(
    item.priceNGN || Math.round(item.priceUSD * fxRate)
  ).toLocaleString()}`;
  return currency === "USD" ? { main: usd, alt: ngn } : { main: ngn, alt: usd };
}

export function matchesSearch(item: StoreItem, term: string): boolean {
  if (!term) return true;
  const hay = [
    item.title,
    (item as StoreBook).subtitle,
    item.description,
    (item as StoreBook).category,
    (item as StoreBook).kicker,
    (item as StoreCourse).track,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(term);
}

export function paginationMeta(
  totalItems: number,
  perPage: number,
  page: number
): { navPages: number[]; note: string; pages: number; show: boolean } {
  const pages = Math.max(1, Math.ceil(totalItems / perPage));
  const show = pages > 1;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);
  const note = show ? `Showing ${start} to ${end} of ${totalItems}` : "";
  const navPages: number[] = [];
  const win = 2;
  let last = 0;
  for (let n = 1; n <= pages; n++) {
    if (n === 1 || n === pages || Math.abs(n - page) <= win) {
      if (last && n - last > 1) navPages.push(-1);
      navPages.push(n);
      last = n;
    }
  }
  return { navPages, note, pages, show };
}

export function peekFor(book: StoreBook): string {
  const cat = (book.category || "").toLowerCase();
  const openers: Record<string, string> = {
    devotionals: "Some books are read; this one is prayed.",
    theology: "This is a study that takes the Scriptures at full weight.",
    series: "This is not one book; it is a shelf, complete.",
    "life skills": "This is a manual for the building of a life.",
    fiction: "This is a story that preaches without raising its voice.",
  };
  const within: Record<string, string> = {
    devotionals:
      "Within its pages the reader finds a daily rhythm: Scripture set first, confession placed on the tongue, and prayer that walks out of the book into the day.",
    theology:
      "Within its pages doctrine is built the way a house is built: foundation first, verse upon verse, each claim shown its Scripture before it is allowed to stand.",
    series:
      "Within its volumes the subject is settled end to end. Each book stands on its own, yet together they walk the reader from first principles to full command of the matter.",
    "life skills":
      "Within its pages every principle is put to work: the teaching first, then the practice, then the Scripture that anchors it.",
    fiction:
      "Within its chapters the stakes are real, the faith is tested honestly, and grace arrives the way it does in life: unannounced, and exactly on time.",
  };
  const readers: Record<string, string> = {
    devotionals:
      "It belongs to anyone who wants Scripture to set the tone of the day before the day sets it for them.",
    theology:
      "It belongs to the serious student, the teacher preparing to teach, and the believer who wants roots as deep as their branches.",
    series: "It belongs to the reader who wants a subject settled, not sampled.",
    "life skills":
      "It belongs to anyone building a life on purpose rather than by accident.",
    fiction:
      "It belongs to readers who let a story do what a sermon sometimes cannot.",
  };
  const opener =
    openers[cat] ||
    "This is a volume shaped by the house marks of this library: KJV Scripture, plain speech, and a shepherd's intent.";
  const middle =
    within[cat] ||
    "Within its pages the matter is opened carefully and closed completely, with the Scriptures given the final word throughout.";
  const reader =
    readers[cat] || "It belongs to every serious reader of this library.";
  const sub = book.subtitle ? `, ${book.subtitle},` : "";
  return `${opener} ${book.title}${sub} opens a door and expects the reader to walk through it.\n\n${book.description || ""}\n\n${middle}\n\n${reader}\n\nTaste and see.`;
}

export function coursePeekFor(course: StoreCourse): string {
  const track = (course.track || "").toLowerCase();
  const openers: Record<string, string> = {
    ministry: "Some lessons are taught; this one is imparted.",
    influence: "This is a course about being known for the right thing.",
    finance: "This is a classroom where Scripture does the accounting.",
    "bible study":
      "This is a course that hands you the tools, not only the conclusions.",
    enterprise: "This is a business school with an altar in it.",
    craft: "This is an apprenticeship in words that outlive their writer.",
    media: "This is a course for carrying one message across many screens.",
    leadership: "This is a course about carrying people, not titles.",
  };
  const readers: Record<string, string> = {
    ministry:
      "The seat belongs to pastors, workers, and every hand that serves the house.",
    influence:
      "The seat belongs to anyone whose calling requires being seen without being spoiled.",
    finance:
      "The seat belongs to stewards who intend to multiply what they were handed.",
    "bible study":
      "The seat belongs to believers who want to feed themselves, and then feed others.",
    enterprise:
      "The seat belongs to builders who want their work to preach as loudly as their testimony.",
    craft:
      "The seat belongs to writers, poets, and every minister of the pen.",
    media:
      "The seat belongs to the hands behind the voice, the ones who make the message travel.",
    leadership:
      "The seat belongs to those preparing to carry more than themselves.",
  };
  const opener =
    openers[track] ||
    "This is a course built with the patience of a good teacher and the urgency of a true message.";
  const reader =
    readers[track] || "The seat belongs to every serious student of this Academy.";
  const meta = [
    course.modules ? `${course.modules} modules` : "",
    course.hours ? `${course.hours}+ hours of teaching` : "",
    course.level || "",
    "Lifetime access",
  ]
    .filter(Boolean)
    .join(" · ");
  return `${meta}\n\n${opener} ${course.title} opens its doors and expects the student to bring a notebook.\n\n${course.description || ""}\n\nThe teaching moves the way good discipleship moves: precept upon precept, each module building on the last, with room to pause, practice, and return.\n\n${reader}\n\nTake your seat.`;
}
