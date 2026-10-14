# Science & Philosophy — Emre Pelit

React/Vite uygulaması, mevcut arayüz ve PWA dosyaları korunarak `sci-phil.ai.studio` ana alan adı için SEO taşıma katmanıyla birleştirilmiştir.

## Ana alan adı

- Kanonik kaynak: https://sci-phil.ai.studio/
- 301 ile yönlendirilecek eski alan adı: https://science-philosophy.ai.studio/
- AI Studio projesi: https://ai.studio/apps/1e9a7659-39ef-46ea-9b91-8bec35d316cf

## Entegrasyon içeriği

- `server.ts` — eski alan adları için kesin eşleşmeli HTTP 301, üretim statik sunumu ve Vite geliştirme ara katmanı.
- `seo.js` + `catalog.json` — sunucu tarafında `/makale/<slug>` makale sayfaları, `robots.txt` ve sitemap.
- `public/sitemap.xml` — ana sayfa + 289 makale + Analytics olmak üzere 291 URL.
- `public/robots.txt` — site haritası bildirimi ve API uç noktalarının tarama dışı bırakılması.
- `submit-indexnow.js` — IndexNow uyumlu arama motorlarına makale URL bildirim betiği.
- `analytics.html` — salt okunur Analytics sayfası.
- Ana sayfada açılabilir, görünür ve taranabilir makale arşivi bağlantısı.

## Yerel test / Çalıştırma

Gereksinim: Node.js 20 veya üzeri.

```bash
npm install
npm test
npm run build
NODE_ENV=production npm start
```

Geliştirme için `npm run dev` komutunu kullanın.

## Yayına alma notu

Bu ZIP'i indirmek canlı siteyi tek başına değiştirmez. Hosting veya AI Studio panelinde `sci-phil.ai.studio` bu uygulamanın Primary Domain'i olmalı; `science-philosophy.ai.studio` aynı uygulamaya alias olarak bağlanmalıdır. Eski alan adı uygulamaya ulaşıyorsa sağlayıcının alan adı panelinden 301 kurun. Ardından Search Console ve Bing Webmaster Tools'ta yeni adresi doğrulayın ve `/sitemap.xml` gönderin. IndexNow isteğe bağlı olarak `npm run submit:indexnow` ile çalıştırılabilir. Arama motorları URL'leri indekslemeyi veya belirli bir sıralamayı garanti etmez. `GEMINI_API_KEY` isteyen yapay zekâ API uç noktaları ve alan adı eşlemesi yayın ortamında ayrıca yapılandırılmalıdır.

## Sektör analizi

Her makale kartı ve makale detay sayfası, konuya göre **Sektör Tanımı** ve **Sektör Değerlendirmesi** içerir. Değerlendirme, makale metni temelinde oluşturulan analitik bir çerçevedir; gerçek kişi veya kurum görüşü değildir. Teknik ayrıntılar için `SEKTOR_ANALIZI_NOTU_TR.md` dosyasına bakın.

## Canlı Analytics ve Ülke Dağılımı

Üst menüde **Live Analytics** düğmesi ve `/analytics.html` içindeki canlı panel eklendi. Yeni panel Umami Cloud API üzerinden 12 Ekim 2026 00.00 Türkiye saati miladından itibaren benzersiz ziyaretçi, sayfa görüntüleme, ziyaret oturumu ve ülke bazlı benzersiz ziyaretçi verilerini okur. İzleyici ana sayfaya, Analytics sayfasına ve sunucu tarafında üretilen makale sayfalarına eklenmiştir. Canlı verilerin gelmesi için barındırma ortamına `UMAMI_WEBSITE_ID` ve gizli `UMAMI_API_KEY` değişkenleri girilmeli, ardından uygulama yeniden dağıtılmalıdır. Kurulum adımları `LIVE_ANALYTICS_KURULUM_TR.md` dosyasındadır. Umami yapılandırması olmadan sahte/örnek rakamlar gösterilmez. Raporlama miladı 12 Ekim 2026 olsa da gerçek toplama, izleyici etkinleştirildikten sonra başlar ve geçmiş tarihler için geriye dönük veri oluşturulmaz.

## Blogger Türkçe makale senkronizasyonu

Bu sürümde `blogger-sync.js`, `emrepelit7337.blogspot.com` herkese açık JSON/Atom feed'ini okur. Sunucu açılışında ve 15 dakikada bir Türkçe yazılar ana arşive birleştirilir; `POST /api/sync-blog` ile elle tetiklenebilir. Kurulum, Blogger'da tam feed'i etkinleştirme ve Blogger tema bağlantısı için `BLOGGER_TURKISH_SYNC_KURULUM_TR.md` belgesine bakın.

## Google Search Console verification

The expected verification asset name `google5d3436c931b6024c.html` is included in `public/` so Vite copies it into the production document root. Verify that its token matches the file currently offered by your Search Console account before relying on it.

## Canonical mapping lifecycle

`public/blogger-canonical.js` starts with an empty mapping. After a successful live Blogger feed synchronization, the server regenerates the mapping only from Blogger items processed by that synchronization. No Blogger canonical target is inferred from unrelated catalogue rows.

Son paket kontrolü: `node --test` ile 30 test geçti. Bu ortamda npm deposuna erişilemediğinden bağımlılıklar kurulamıyor; `npm run build` Vite bulunamadığından burada doğrulanamadı. Yayın öncesinde Node.js 20+ ortamında `npm install`, `npm test`, `npm run build` çalıştırılmalıdır.
