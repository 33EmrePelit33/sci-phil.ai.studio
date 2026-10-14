import fallback from "@/data/archive.json";
import { fetchAndSieve, type Archive, type SievedPost } from "@/lib/blog-sync";

const SNAPSHOT = fallback as Archive;

let cache: { at: number; data: Archive } | null = null;
const TTL = 5 * 60 * 1000;

export async function loadArchive(force = false): Promise<Archive> {
  if (!force && cache && Date.now() - cache.at < TTL) return cache.data;
  try {
    const data = await fetchAndSieve();
    if (data.posts.length === 0) throw new Error("Süzgeç boş döndü");
    cache = { at: Date.now(), data };
    return data;
  } catch {
    if (cache) return { ...cache.data, mode: "snapshot" };
    return { ...SNAPSHOT, mode: "snapshot" };
  }
}

export type IndexPost = Pick<
  SievedPost,
  "slug" | "title" | "published" | "updated" | "category" | "minutes" | "excerpt" | "claim"
>;

export type IndexPayload = {
  syncedAt: string;
  mode: Archive["mode"];
  sourceCount: number;
  turkishCount: number;
  droppedTranslations: number;
  posts: IndexPost[];
};

export function toIndex(archive: Archive): IndexPayload {
  return {
    syncedAt: archive.syncedAt,
    mode: archive.mode,
    sourceCount: archive.sourceCount,
    turkishCount: archive.turkishCount,
    droppedTranslations: archive.droppedTranslations,
    posts: archive.posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      published: p.published,
      updated: p.updated,
      category: p.category,
      minutes: p.minutes,
      excerpt: p.excerpt,
      claim: p.claim,
    })),
  };
}
