import { createServerFn } from "@tanstack/react-start";

export const getIndex = createServerFn({ method: "GET" }).handler(async () => {
  const { loadArchive, toIndex } = await import("./archive.server");
  return toIndex(await loadArchive(false));
});

export const refreshArchive = createServerFn({ method: "POST" }).handler(async () => {
  const { loadArchive } = await import("./archive.server");
  const archive = await loadArchive(true);
  return {
    syncedAt: archive.syncedAt,
    mode: archive.mode,
    turkishCount: archive.turkishCount,
    sourceCount: archive.sourceCount,
    droppedTranslations: archive.droppedTranslations,
  };
});

export const getArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (typeof slug !== "string" || slug.length < 1 || slug.length > 180) {
      throw new Error("Geçersiz yazı");
    }
    return slug;
  })
  .handler(async ({ data: slug }) => {
    const { loadArchive } = await import("./archive.server");
    const archive = await loadArchive(false);
    const index = archive.posts.findIndex((p) => p.slug === slug);
    const post = index >= 0 ? archive.posts[index] : null;
    const newer = index > 0 ? archive.posts[index - 1] : null;
    const older =
      index >= 0 && index < archive.posts.length - 1 ? archive.posts[index + 1] : null;
    return {
      post,
      syncedAt: archive.syncedAt,
      mode: archive.mode,
      newer: newer ? { slug: newer.slug, title: newer.title } : null,
      older: older ? { slug: older.slug, title: older.title } : null,
    };
  });
