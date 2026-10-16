/**
 * Notify IndexNow-participating search engines about Sci-Phi's canonical URLs.
 * This does not submit to Google and does not guarantee indexing or rankings.
 * Run after deployment: npm run submit:indexnow
 */
import fs from 'node:fs';
import path from 'node:path';

const HOST = 'sci-phil.ai.studio';
const ORIGIN = `https://${HOST}`;
const INDEXNOW_KEY = '5d3436c931b6024c';
const KEY_LOCATION = `${ORIGIN}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

async function main() {
  const catalogPath = path.resolve(process.cwd(), 'catalog.json');
  if (!fs.existsSync(catalogPath)) throw new Error(`Katalog bulunamadı: ${catalogPath}`);
  const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const posts = Array.isArray(raw?.posts) ? raw.posts : [];
  const urlList = [...new Set([
    `${ORIGIN}/`,
    `${ORIGIN}/analytics.html`,
    ...posts.filter(post => post && (post.slug || post.id))
      .map(post => `${ORIGIN}/makale/${encodeURIComponent(String(post.slug || post.id))}`)
  ])];

  if (urlList.length > 10000) throw new Error(`IndexNow isteği 10.000 URL sınırını aşıyor: ${urlList.length}`);
  if (urlList.some(url => new URL(url).hostname !== HOST || !url.startsWith(`${ORIGIN}/`))) {
    throw new Error('Kanonik olmayan veya başka bir hosta ait URL tespit edildi; gönderim durduruldu.');
  }

  // Do not claim submission succeeded unless the live key file proves domain control.
  const keyResponse = await fetch(KEY_LOCATION, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!keyResponse.ok) throw new Error(`IndexNow anahtar dosyası erişilemiyor (${keyResponse.status}): ${KEY_LOCATION}`);
  const publishedKey = (await keyResponse.text()).trim();
  if (publishedKey !== INDEXNOW_KEY) throw new Error('Yayındaki IndexNow anahtar dosyası beklenen anahtarla eşleşmiyor.');

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList }),
    signal: AbortSignal.timeout(20000)
  });

  console.log(`[IndexNow] HTTP ${response.status}; ${urlList.length} kanonik URL gönderildi.`);
  if (response.status !== 200 && response.status !== 202) {
    const details = (await response.text().catch(() => '')).slice(0, 500);
    throw new Error(`IndexNow gönderimi kabul edilmedi: HTTP ${response.status}${details ? ` — ${details}` : ''}`);
  }
  console.log('[IndexNow] Kabul edildi; bu yanıt indekslenme veya sıralama garantisi değildir.');
}

main().catch(error => {
  console.error('[IndexNow] HATA:', error?.message || error);
  process.exitCode = 1;
});
