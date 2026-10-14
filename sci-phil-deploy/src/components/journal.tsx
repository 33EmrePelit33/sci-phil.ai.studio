import type { ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { refreshArchive } from "@/lib/archive-api";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="group flex min-w-0 flex-col">
            <span className="font-display text-xs tracking-[0.22em] text-gold uppercase">
              Emre Pelit
            </span>
            <span className="truncate font-display text-lg tracking-wide text-fg">
              Science & Philosophy
            </span>
          </Link>
          <a
            href="https://emrepelit7337.blogspot.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-gold"
          >
            Blogger
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        </div>
      </header>
      {children}
    </div>
  );
}

export function SyncBar({
  syncedAt,
  mode,
  sourceCount,
  turkishCount,
  droppedTranslations,
}: {
  syncedAt: string;
  mode: "live" | "snapshot";
  sourceCount: number;
  turkishCount: number;
  droppedTranslations: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function syncNow() {
    setBusy(true);
    setNote(null);
    try {
      const result = await refreshArchive();
      setNote(
        result.mode === "live"
          ? `${result.turkishCount} Türkçe yazı güncellendi.`
          : "Blogger'a şimdi ulaşılamadı. Son süzgeç kopyası duruyor.",
      );
      await router.invalidate();
    } catch {
      setNote("Senkron tamamlanamadı. Arşiv son kopyayla açık.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-line bg-surface/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          <span className="text-fg">{sourceCount}</span> Blogger yazısı tarandı ·{" "}
          <span className="text-gold">{turkishCount} Türkçe</span> süzgeçten geçti ·{" "}
          {droppedTranslations} çeviri elendi
          <span className="mt-1 block text-xs tracking-wide uppercase">
            {mode === "live" ? "Canlı senkron" : "Son kayıtlı süzgeç"} · {formatDate(syncedAt)}
          </span>
        </p>
        <button
          type="button"
          onClick={syncNow}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm text-fg hover:border-gold hover:text-gold disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} aria-hidden />
          Şimdi senkronize et
        </button>
      </div>
      {note ? <p className="mx-auto max-w-5xl px-5 pb-3 text-sm text-gold">{note}</p> : null}
    </div>
  );
}
