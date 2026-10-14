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
  const urlList = [
    `https://${HOST}/`,
    `https://${HOST}/analytics.html`,
    ...catalog.posts.map(p => `https://${HOST}/makale/${encodeURIComponent(p.slug || p.id)}`)
  ];

  console.log(`Toplam ${urlList.length} URL hazırlandı.`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    console.log(`IndexNow Yanıtı: HTTP ${res.status} ${res.statusText}`);
    if (res.ok || res.status === 200 || res.status === 202) {
      console.log(`✓ Başarılı: ${urlList.length} URL IndexNow'a gönderildi. Bu, indeks garantisi değildir.`);
    } else {
      const errText = await res.text();
      console.log('Yanıt detayı:', errText);
    }
  } catch (err) {
    console.error('IndexNow gönderim hatası:', err.message);
  }
}

main();
