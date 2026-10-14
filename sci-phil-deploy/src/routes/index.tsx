import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getIndex } from "@/lib/archive-api";
import { formatDate, Shell, SyncBar } from "@/components/journal";

export const Route = createFileRoute("/")({
  loader: () => getIndex(),
  component: Home,
});

function Home() {
  const data = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of data.posts) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    return ["Tümü", ...Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, "tr"))];
  }, [data.posts]);

  const featured = data.posts[0];

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return data.posts.filter((post) => {
      if (category !== "Tümü" && post.category !== category) return false;
      if (!q) return true;
      return `${post.title} ${post.claim} ${post.category}`.toLocaleLowerCase("tr").includes(q);
    });
  }, [data.posts, query, category]);

  return (
    <Shell>
      <SyncBar
        syncedAt={data.syncedAt}
        mode={data.mode}
        sourceCount={data.sourceCount}
        turkishCount={data.turkishCount}
        droppedTranslations={data.droppedTranslations}
      />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <p className="font-display text-xs tracking-[0.28em] text-gold uppercase">Türkçe arşiv</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-fg sm:text-5xl">
          Süzgeçten geçmiş yazılar
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          emrepelit7337.blogspot.com üzerindeki Türkçe metinler burada iddia, karşı iddia ve
          kanıt sayılmayanlar olarak durur. İngilizce, Almanca, Fransızca ve İspanyolca kopyalar
          elenir. Yeni veya güncellenen yazı bir sonraki okumada arşive girer.
        </p>

        {featured ? (
          <section className="mt-10 overflow-hidden rounded-2xl border border-gold/40 bg-surface">
            <div className="border-b border-line px-6 py-3 text-xs tracking-[0.2em] text-gold uppercase">
              Vitrin · Son yazı
            </div>
            <Link
              to="/makale/$slug"
              params={{ slug: featured.slug }}
              className="block px-6 py-7 transition hover:bg-gold/5"
            >
              <div className="text-sm text-muted">
                <time dateTime={featured.published}>{formatDate(featured.published)}</time>
                <span className="mx-2">·</span>
                <span className="text-gold uppercase tracking-wide">
                  {featured.category} · {featured.minutes} dk
                </span>
              </div>
              <h2 className="mt-3 font-display text-3xl leading-tight text-fg sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">{featured.claim}</p>
              <span className="mt-5 inline-flex items-center text-sm text-gold">
                Oku →
              </span>
            </Link>
          </section>
        ) : null}

        <div className="mt-10 flex flex-col gap-4">
          <label className="block">
            <span className="sr-only">Yazılarda ara</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Başlık veya iddiada ara"
              className="w-full rounded-full border border-line bg-surface px-5 py-3 text-base text-fg outline-none placeholder:text-muted focus:border-gold"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((name) => {
              const active = name === category;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategory(name)}
                  className={`min-h-11 shrink-0 rounded-full border px-4 text-sm ${
                    active
                      ? "border-gold bg-gold text-bg"
                      : "border-line text-muted hover:border-gold hover:text-fg"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-8 text-sm text-muted">{visible.length} yazı</p>
        <ol className="mt-2 divide-y divide-line border-y border-line">
          {visible.map((post) => (
            <li key={post.slug}>
              <Link
                to="/makale/$slug"
                params={{ slug: post.slug }}
                className="grid gap-2 py-5 sm:grid-cols-[9.5rem_1fr] sm:gap-6"
              >
                <div className="text-sm text-muted">
                  <time dateTime={post.published}>{formatDate(post.published)}</time>
                  <div className="mt-1 text-xs tracking-[0.16em] text-gold uppercase">
                    {post.category} · {post.minutes} dk
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl leading-snug text-fg">{post.title}</h2>
                  <p className="mt-2 line-clamp-3 text-base leading-relaxed text-muted">{post.claim}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
        {visible.length === 0 ? (
          <p className="py-10 text-muted">Bu süzgeçte eşleşen yazı yok.</p>
        ) : null}
      </main>
    </Shell>
  );
}
