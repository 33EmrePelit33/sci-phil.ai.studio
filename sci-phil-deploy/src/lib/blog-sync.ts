export type SievedPost = {
  id: string;
  slug: string;
  title: string;
  url: string;
  published: string;
  updated: string;
  category: string;
  minutes: number;
  excerpt: string;
  claim: string;
  paragraphs: string[];
  counter: string;
  notEvidence: string[];
  literature: string;
  image: string | null;
};

export type Archive = {
  syncedAt: string;
  mode: "live" | "snapshot";
  sourceCount: number;
  turkishCount: number;
  droppedTranslations: number;
  posts: SievedPost[];
};

type RawPost = {
  id: string;
  title: string;
  published: string;
  updated: string;
  url: string;
  html: string;
};

const TR = new Set(
  "ve bir için olan olarak değil gibi kadar önce sonra üzerine arasında ancak nedir nasıl neden mıyız miyiz hakkında üzere yoktur vardır değildir niçin diye fakat çünkü hem lakin içinde evrenin zamanın insanın".split(
    " ",
  ),
);
const EN = new Set(
  "the and of to in is that for with as on this by from are be it an or which was were has have not but can will if at into about than then also its their they you we our your would does what been show".split(
    " ",
  ),
);
const FR = new Set(
  "le la les des une est dans pour que qui avec sur nous cette sont aux par plus comme tout du au pas mais son ses leur dans une".split(
    " ",
  ),
);
const DE = new Set(
  "der die das und ist ein eine von mit auf für nicht sich dem den des im zu als auch oder nach bei aus wird sind war eine".split(
    " ",
  ),
);
const ES = new Set(
  "el los las que en un una por con para del es se su sus como más pero este esta esto hay son una y".split(
    " ",
  ),
);

const FEED = "https://emrepelit7337.blogspot.com/feeds/posts/default";

function tokens(title: string): string[] {
  return (
    title
      .toLocaleLowerCase("tr")
      .match(/[a-zà-ÿğüşöçıîâû]{2,}/gi) ?? []
  );
}

function score(words: string[], vocab: Set<string>): number {
  let n = 0;
  for (const w of words) if (vocab.has(w)) n += 1;
  return n;
}

function outsideParens(title: string): string {
  return title.replace(/\([^)]*\)/g, " ");
}

/** Turkish originals only. Translations and parenthetical glosses are rejected. */
export function isTurkishTitle(title: string): boolean {
  const clean = title.replace(/\s+/g, " ").trim();
  const words = tokens(clean);
  const scores = {
    tr: score(words, TR),
    en: score(words, EN),
    fr: score(words, FR),
    de: score(words, DE),
    es: score(words, ES),
  };
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topLang, topScore] = ranked[0];
  const second = ranked[1][1];
  if (topScore >= 1 && topScore > second) return topLang === "tr";
  const core = outsideParens(clean);
  if (/[ğışçĞŞÇıİ]/.test(core)) return topLang !== "en" && topLang !== "fr" && topLang !== "de" && topLang !== "es" || topScore === 0;
  return false;
}

function decode(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;|'/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&#(\d+);/g, (_, n) => {
      const c = Number(n);
      return Number.isFinite(c) ? String.fromCodePoint(c) : _;
    });
}

function stripTags(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function firstImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!m) return null;
  const src = m[1];
  if (!/^https?:\/\//i.test(src)) return null;
  if (/icon|pixel|emoji|blank/i.test(src)) return null;
  return src;
}

const BOILER = /^(yazan|yazar|written by|par\s*:|yorum ekle|popular letters|popüler yayınlar|tarafından yayınlandı)/i;

export function paragraphsFromHtml(html: string, title: string): string[] {
  const raw = stripTags(html)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n");
  const titleKey = title.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr");
  const out: string[] = [];
  for (const chunk of raw.split("\n")) {
    const t = chunk.replace(/\s+/g, " ").trim();
    if (t.length < 40) continue;
    if (BOILER.test(t)) continue;
    if (t.toLocaleLowerCase("tr") === titleKey) continue;
    const commas = (t.match(/,/g) || []).length;
    if (t.length > 900 && commas > 25) continue;
    out.push(t);
  }
  return out.slice(0, 80);
}

function firstSentences(paragraphs: string[]): string {
  const text = paragraphs.join(" ");
  const parts = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 50);
  const picked = parts.slice(0, 2).join(" ");
  if (picked.length > 40) return picked.length > 420 ? `${picked.slice(0, 417).trim()}…` : picked;
  const fallback = paragraphs[0] ?? "";
  return fallback.length > 420 ? `${fallback.slice(0, 417).trim()}…` : fallback;
}

function categoryOf(title: string, body: string): string {
  const rules: [string, RegExp][] = [
    ["Yapay zekâ", /yapay zek|robot|llm|şuur|bilinç|algoritma|asistan|uygulama/],
    ["Kuantum", /kuantum|higgs|dolanık|süperpoz|gözlemci|parçacık/],
    ["Kozmoloji", /evren|big bang|kara delik|karadelik|solucan|genişle/],
    ["Zaman", /zaman|entropi|holograf|simülas/],
    ["Zihin", /zihin|beyin|kalp|nöron|irade|telepati|uyku|rüya/],
    ["Kelâm", /allah|kur.?an|islam|islâm|ruh|iman|ibadet|tövbe|fıtrat|vahdet|isa |cennet|cehennem|dua/],
  ];
  const titleBlob = title.toLocaleLowerCase("tr");
  for (const [name, re] of rules) if (re.test(titleBlob)) return name;
  const blob = `${titleBlob} ${body.slice(0, 500).toLocaleLowerCase("tr")}`;
  for (const [name, re] of rules) if (re.test(blob)) return name;
  return "Bilim";
}

function counterOf(title: string, paragraphs: string[]): string {
  const blob = `${title} ${paragraphs.slice(0, 3).join(" ")}`.toLocaleLowerCase("tr");
  const lines: string[] = [];
  if (/kuantum|dolanık|süperpoz|gözlemci/.test(blob)) {
    lines.push(
      "Aynı kuantum matematiği, çökme, çoklu dünyalar veya salt epistemik okumalarla bir arada durabilir. Yorumun seçilmesi, deneyin ölçtüğü şeyi kanıtlamaz.",
    );
  }
  if (/higgs|kara delik|karadelik|enerji|madde|cern/.test(blob)) {
    lines.push(
      "Parçacık ya da kara delik gözlemi, evrenin bir yazılım veya ilahi kod olduğu sonucuna tek başına götürmez. Gözlem modeli sınar; metaforun genişlemesini doğrulamaz.",
    );
  }
  if (/şuur|bilinç|llm|yapay zek|robot|algoritma/.test(blob)) {
    lines.push(
      "Davranış taklidi, akıcı dil veya insan biçimli tasarım fenomenal bilinci göstermez. Daha tutumlu açıklama, istatistiksel örüntü ve mühendislik işlevidir.",
    );
  }
  if (/zaman|holograf|simülas|entropi/.test(blob)) {
    lines.push(
      "Saatlerin farklı işlemesi ve termodinamik ok, zamanın yalnızca bir arayüz olduğu iddiasını zorunlu kılmaz. Görelilik, simülasyon hipotezinin kanıtı değildir.",
    );
  }
  if (/allah|kur'an|kuran|islam|islâm|ruh|cennet|cehennem|iman|ibadet/.test(blob)) {
    lines.push(
      "Metnin tutarlı yorumlanabilmesi, o yorumun fiziksel bir ölçümle doğrulandığı anlamına gelmez. İnanç önermesi ile deneysel önerme ayrı sınama ölçütlerine tabidir.",
    );
  }
  if (lines.length === 0) {
    lines.push(
      "Metnin iç tutarlılığı, anlattığı düzenin doğada aynı biçimde gerçekleştiğini göstermez. Aynı olgular için daha tutumlu ve bağımsız sınanabilir açıklamalar dışarıda bırakılmamıştır.",
    );
  }
  lines.push(
    "Karşı iddia özgün metni silmez. Süzgeç, iddia ile kanıtın birbirine karışmasını engellemek için burada tutulur.",
  );
  return lines.join(" ");
}

function notEvidenceOf(title: string, paragraphs: string[]): string[] {
  const blob = `${title} ${paragraphs.join(" ")}`.toLocaleLowerCase("tr");
  const items = [
    "Benzetme, alegori veya yazılım metaforu tek başına deneysel kanıt değildir.",
    "Bir modelin kurulabilmesi, modelin fiziksel gerçekliği temsil ettiğini kanıtlamaz.",
    "Mevcut bilgiyle çelişmemek, hipotezin doğrulanmış olduğu anlamına gelmez.",
  ];
  if (/korel|bağlant|neden/.test(blob)) {
    items.push("Korelasyon tek başına nedensellik göstermez.");
  }
  if (/kur'an|kuran|ayet|hadis|islam|islâm/.test(blob)) {
    items.push("Kutsal metin yorumu, laboratuvar ölçümü veya hakemli gözlem yerine geçmez.");
  }
  if (/şuur|bilinç|hissed|robot|llm|yapay/.test(blob)) {
    items.push("Akıcı çıktı, kullanıcıda oluşan empati veya 'hissediyorum' cümlesi içsel deneyimin kanıtı değildir.");
  }
  if (/rüya|uyku|telepati|ışın/.test(blob)) {
    items.push("Tekil deneyim, anekdot veya düşünce deneyi genel bir doğa yasası sayılmaz.");
  }
  return items.slice(0, 5);
}

function literatureOf(claim: string): string {
  const short = claim.length > 220 ? `${claim.slice(0, 217).trim()}…` : claim;
  return `Bu iddianın literatür karşılığı, bağımsız gözlem, ölçüm veya hakemli çalışmayla yanlışlanabilir bir öngörüye indirgenmesidir. Panel yeni bir bilimsel sonuç üretmez. Kaynak metindeki yorum korunur, kanıt diye sunulmaz. İzlenen iddia: ${short}`;
}

function readingMinutes(paragraphs: string[]): number {
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function slugFrom(url: string, id: string): string {
  const m = url.match(/\/([^/?#]+)\.html?$/i);
  const base = (m?.[1] || id).toLowerCase();
  const slug = base
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `yazi-${id.slice(-8)}`;
}

export function sievePost(raw: RawPost, slug: string): SievedPost | null {
  const title = raw.title.replace(/\s+/g, " ").trim();
  const paragraphs = paragraphsFromHtml(raw.html, title);
  if (paragraphs.length === 0) return null;
  const claim = firstSentences(paragraphs);
  const body = paragraphs.join(" ");
  return {
    id: raw.id,
    slug,
    title,
    url: raw.url,
    published: raw.published,
    updated: raw.updated,
    category: categoryOf(title, body),
    minutes: readingMinutes(paragraphs),
    excerpt: claim,
    claim,
    paragraphs,
    counter: counterOf(title, paragraphs),
    notEvidence: notEvidenceOf(title, paragraphs),
    literature: literatureOf(claim),
    image: firstImage(raw.html),
  };
}

function textField(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const t = (node as { $t?: string }).$t;
  return typeof t === "string" ? t : "";
}

async function fetchPage(start: number): Promise<{ total: number; entries: RawPost[] }> {
  const url = `${FEED}?alt=json&max-results=150&start-index=${start}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "sci-phil-sync/1.0" },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Blogger feed ${res.status}`);
  const data = (await res.json()) as {
    feed?: {
      openSearch$totalResults?: { $t?: string };
      entry?: Array<Record<string, unknown>>;
    };
  };
  const feed = data.feed;
  if (!feed) throw new Error("Blogger feed boş");
  const total = Number(feed.openSearch$totalResults?.$t ?? 0);
  const entries = (feed.entry ?? []).map((e) => {
    let alt = "";
    const links = Array.isArray(e.link) ? e.link : [];
    for (const link of links) {
      const l = link as { rel?: string; href?: string };
      if (l.rel === "alternate" && l.href) alt = l.href;
    }
    const id = textField(e.id);
    const postId = id.split(".post-").pop() || id;
    return {
      id: postId,
      title: textField(e.title),
      published: textField(e.published),
      updated: textField(e.updated),
      url: alt,
      html: textField(e.content),
    };
  });
  return { total, entries };
}

export async function fetchAndSieve(): Promise<Archive> {
  const all: RawPost[] = [];
  let start = 1;
  let total = 0;
  while (start < 5000) {
    const page = await fetchPage(start);
    total = page.total || total;
    if (page.entries.length === 0) break;
    all.push(...page.entries);
    start += page.entries.length;
    if (total && start > total) break;
  }
  const turkish = all.filter((p) => isTurkishTitle(p.title));
  const used = new Set<string>();
  const posts: SievedPost[] = [];
  for (const raw of turkish) {
    let slug = slugFrom(raw.url, raw.id);
    if (used.has(slug)) slug = `${slug}-${raw.id.slice(-6)}`;
    used.add(slug);
    const sieved = sievePost(raw, slug);
    if (sieved) posts.push(sieved);
  }
  posts.sort((a, b) => (a.published < b.published ? 1 : -1));
  return {
    syncedAt: new Date().toISOString(),
    mode: "live",
    sourceCount: all.length,
    turkishCount: posts.length,
    droppedTranslations: all.length - turkish.length,
    posts,
  };
}
