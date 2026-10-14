/**
 * submit-indexnow.js
 * IndexNow API submission script for sci-phil.ai.studio
 * Submits the homepage, Analytics page, and catalog article URLs to IndexNow-compatible search engines.
 */
import fs from 'node:fs';

const HOST = 'sci-phil.ai.studio';
const KEY = '5d3436c931b6024c'; // Verification key
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

async function main() {
  console.log('IndexNow Gönderimi Başlatılıyor...');
  const catalog = JSON.parse(fs.readFileSync('./catalog.json', 'utf8'));
  const featured70thUrl = `https://${HOST}/makale/evren-her-zaman-tekil-bir-olguydu-ve-ilelebet-de-oyle-kalacak-8837081716175656566`;
  const urlList = [...new Set([
    `https://${HOST}/`,
    `https://${HOST}/sitemap.xml`,
    `https://${HOST}/rss.xml`,
    `https://${HOST}/analytics.html`,
    featured70thUrl,
    ...catalog.posts
      .filter(post => post && (post.slug || post.id) && post.title)
      .map(post => `https://${HOST}/makale/${encodeURIComponent(post.slug || post.id)}`),
  ])];

  console.log(`Toplam ${urlList.length} URL hazırlandı.`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };

  const endpoints = [
    { name: 'IndexNow Universal API', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Microsoft Bing IndexNow', url: 'https://www.bing.com/indexnow' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Gönderiliyor: ${endpoint.name} (${endpoint.url})...`);
      const res = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      console.log(`[${endpoint.name}] Yanıt: HTTP ${res.status} ${res.statusText}`);
      if (res.ok || res.status === 200 || res.status === 202) {
        console.log(`✓ Başarılı: ${urlList.length} URL ${endpoint.name}'a iletildi.`);
      } else {
        const errText = await res.text();
        console.log(`[${endpoint.name}] Yanıt detayı:`, errText);
      }
    } catch (err) {
      console.error(`[${endpoint.name}] Hata:`, err.message);
    }
  }
}

main();
