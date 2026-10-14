import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { getArticle } from "@/lib/archive-api";
import { formatDate, Shell } from "@/components/journal";

export const Route = createFileRoute("/makale/$slug")({
  loader: async ({ params }) => {
    const result = await getArticle({ data: params.slug });
    if (!result.post) throw notFound();
    return result;
  },
  notFoundComponent: NotHere,
  component: ArticlePage,
  head: ({ loaderData }) => ({
    meta: loaderData?.post
      ? [{ title: `${loaderData.post.title} · Science & Philosophy` }]
      : [{ title: "Yazı bulunamadı · Science & Philosophy" }],
  }),
});

function NotHere() {
  return (
    <Shell>
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-4xl">Bu yazı arşivde yok</h1>
        <p className="mt-4 text-muted">Süzgeçten çıkmış ya da hiç Türkçe yayımlanmamış olabilir.</p>
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-gold">
          Arşive dön
        </Link>
      </main>
    </Shell>
  );
}

function ArticlePage() {
  const { post, newer, older, mode } = Route.useLoaderData();
  if (!post) return null;
  const revised = post.updated.slice(0, 10) !== post.published.slice(0, 10);

  return (
    <Shell>
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link to="/" className="text-sm text-muted hover:text-gold">
          ← Arşiv
        </Link>
        <p className="mt-6 font-display text-xs tracking-[0.22em] text-gold uppercase">
          {post.category} · {post.minutes} dk okuma
          {mode === "snapshot" ? " · son kayıt" : ""}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-fg sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted">
          <time dateTime={post.published}>{formatDate(post.published)}</time>
          {revised ? <span> · güncellendi {formatDate(post.updated)}</span> : null}
          {" · "}
          Emre Pelit
        </p>
        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm text-gold"
        >
          Orijinal Blogger yazısı
          <ArrowUpRight className="size-4" aria-hidden />
        </a>

        {post.image ? (
          <img
            src={post.image}
            alt=""
            className="mt-8 max-h-[28rem] w-full rounded-2xl border border-line object-cover"
          />
        ) : null}

        <section className="mt-10">
          <h2 className="font-display text-xs tracking-[0.22em] text-gold uppercase">Temel iddia</h2>
          <p className="mt-3 text-xl leading-relaxed text-fg">{post.claim}</p>
        </section>

        <section className="mt-10 border-l-2 border-gold pl-5">
          <h2 className="font-display text-xs tracking-[0.22em] text-gold uppercase">Karşı iddia</h2>
          <p className="mt-3 text-lg leading-relaxed text-fg">{post.counter}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xs tracking-[0.22em] text-gold uppercase">
            Neyin kanıt olmadığı
          </h2>
          <ul className="mt-3 space-y-3 text-lg leading-relaxed text-muted">
            {post.notEvidence.map((item) => (
              <li key={item} className="border-t border-line pt-3">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-xs tracking-[0.22em] text-gold uppercase">
            Literatür ve kanıt durumu
          </h2>
          <p className="mt-3 leading-relaxed text-muted">{post.literature}</p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xs tracking-[0.22em] text-gold uppercase">
            Özgün metin
          </h2>
          <p className="mt-2 text-sm text-muted">
            Blogger kalıbı, etiket yığını ve çeviri kopyaları ayıklandı. Yazarın Türkçe cümleleri
            olduğu gibi duruyor.
          </p>
          <div className="mt-6 space-y-5 text-lg leading-8 text-fg">
            {post.paragraphs.map((paragraph, i) => (
              <p key={`${i}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        <nav className="mt-14 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          {newer ? (
            <Link to="/makale/$slug" params={{ slug: newer.slug }} className="text-fg hover:text-gold">
              <span className="block text-xs tracking-[0.16em] text-muted uppercase">Daha yeni</span>
              {newer.title}
            </Link>
          ) : (
            <span />
          )}
          {older ? (
            <Link
              to="/makale/$slug"
              params={{ slug: older.slug }}
              className="text-fg hover:text-gold sm:text-right"
            >
              <span className="block text-xs tracking-[0.16em] text-muted uppercase">Daha eski</span>
              {older.title}
            </Link>
          ) : null}
        </nav>
      </main>
    </Shell>
  );
}
