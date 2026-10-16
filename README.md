# Science & Philosophy — Emre Pelit

React/Vite uygulaması, mevcut arayüz ve PWA dosyaları korunarak `sci-phil.ai.studio` ana alan adı için SEO taşıma katmanıyla birleştirilmiştir.

## Ana alan adı

- Kanonik kaynak: https://sci-phil.ai.studio/
- 301 ile yönlendirilecek eski alan adları: https://science-philosophy.ai.studio/ ve https://science-philosophy-emre-pelit.ai.studio/
- AI Studio projesi: https://ai.studio/apps/1e9a7659-39ef-46ea-9b91-8bec35d316cf

## Entegrasyon içeriği

- `server.ts` — tüm eski hostlar için en erken aşamada 301, canlı SEO rotaları, çalışma zamanı Blogger arşivi ve üretim statik sunumu.
- `seo.js` + `catalog.json` — sunucu tarafında `/makale/<slug>` makale sayfaları, `robots.txt` ve sitemap.
- `/sitemap.xml` — sunucu tarafında katalogdan oluşturulan ana sayfa + 294 makale + Analytics olmak üzere 296 URL.
- `public/robots.txt` — site haritası bildirimi ve API uç noktalarının tarama dışı bırakılması.
- `submit-indexnow.js` — canlı anahtar dosyasını doğruladıktan sonra IndexNow global ucuna kanonik URL bildirimi yapar (Google’a göndermez).
- `analytics.html` — salt okunur Analytics sayfası.
- Ana sayfada açılabilir, görünür ve taranabilir makale arşivi bağlantısı.

## Yerel test / Çalıştırma

Gereksinim: Node.js 20.19+ veya 22.12+ (package.json engines ile uyumlu).

```bash
npm install
npm test
npm run build
NODE_ENV=production npm start
```

Geliştirme için `npm run dev` komutunu kullanın.

## Yayına alma notu

Bu ZIP'i indirmek canlı siteyi tek başına değiştirmez. Hosting veya AI Studio panelinde `sci-phil.ai.studio` bu uygulamanın Primary Domain'i olmalı; `science-philosophy.ai.studio` ve `science-philosophy-emre-pelit.ai.studio` aynı uygulamaya alias olarak bağlanmalıdır. Sunucu bilinen eski hostları ve `www` varyantlarını Sci-Phi ana alan adına 301 ile yönlendirir; bunun çalışması için DNS/hosting alias ayarları da yapılmalıdır. SEO sayfaları, robots.txt ve sitemap artık sunucuya bağlıdır. Canlıya aldıktan sonra Search Console ve Bing Webmaster Tools'ta yeni adresi doğrulayın ve `/sitemap.xml` gönderin. IndexNow için `npm run submit:indexnow` anahtar dosyasını canlıda doğrulayıp yalnızca HTTP 200/202 kabul yanıtında başarılı sayar. Arama motorları URL'leri indekslemeyi veya belirli bir sıralamayı garanti etmez. `GOOGLE_API_KEY` (öncelikli) veya `GEMINI_API_KEY` isteyen yapay zekâ API uç noktaları yayın ortamında sunucu Secrets alanında yapılandırılmalıdır. Varsayılan model `GEMINI_MODEL=gemini-3.8-flash` değeridir; anahtar frontend koduna eklenmemelidir.

## Sektör analizi

Her makale kartı ve makale detay sayfası, konuya göre **Sektör Tanımı** ve **Sektör Değerlendirmesi** içerir. Değerlendirme, makale metni temelinde oluşturulan analitik bir çerçevedir; gerçek kişi veya kurum görüşü değildir. Teknik ayrıntılar için `SEKTOR_ANALIZI_NOTU_TR.md` dosyasına bakın.

## Canlı Analytics ve Ülke Dağılımı

Üst menüde **Live Analytics** düğmesi ve `/analytics.html` içindeki canlı panel eklendi. Yeni panel Umami Cloud API üzerinden 12 Ekim 2026 00.00 Türkiye saati miladından itibaren benzersiz ziyaretçi, sayfa görüntüleme, ziyaret oturumu ve ülke bazlı benzersiz ziyaretçi verilerini okur. İzleyici ana sayfaya, Analytics sayfasına ve sunucu tarafında üretilen makale sayfalarına eklenmiştir. Canlı ve birleşik veriler için her alan adına ait Umami Website ID (Sci-Phi: `UMAMI_WEBSITE_ID`, Blogger: `UMAMI_BLOGGER_WEBSITE_ID`, Grok.me: `UMAMI_GROKME_WEBSITE_ID`) ile gizli `UMAMI_API_KEY` sunucu değişkenleri girilmeli; diğer sitelere de izleyici betiği eklenip uygulama yeniden dağıtılmalıdır. Kurulum adımları `LIVE_ANALYTICS_KURULUM_TR.md` dosyasındadır. Umami yapılandırması olmadan sahte/örnek rakamlar gösterilmez. Birleşik site tablosu yalnızca bağlı Umami özelliklerinin gerçek toplamlarını kullanır; eksik ziyaretçi, oturum veya süre değerleri tahmin edilmez. Raporlama miladı 12 Ekim 2026 olsa da gerçek toplama, izleyici etkinleştirildikten sonra başlar ve geçmiş tarihler için geriye dönük veri oluşturulmaz.

## Blogger Türkçe makale senkronizasyonu

Bu sürümde `blogger-sync.js`, `emrepelit7337.blogspot.com` herkese açık JSON/Atom feed'ini okur. Sunucu açılışında ve her 15 dakikada bir Türkçe yazılar çalışma zamanı ana arşivine birleştirilir; eşzamanlı işler birleştirilir ve tarayıcı arşivi dakikada bir ya da sekmeye geri dönüldüğünde yenilenir; `POST /api/sync-blog` ile elle tetiklenebilir. Kurulum, Blogger'da tam feed'i etkinleştirme ve Blogger tema bağlantısı için `BLOGGER_TURKISH_SYNC_KURULUM_TR.md` belgesine bakın.

## Google Search Console verification

The expected verification asset name `google5d3436c931b6024c.html` is included in `public/` so Vite copies it into the production document root. Verify that its token matches the file currently offered by your Search Console account before relying on it.

## Canonical mapping lifecycle

`public/blogger-canonical.js` starts with an empty mapping. After a successful live Blogger feed synchronization, the server regenerates the mapping only from Blogger items processed by that synchronization. No Blogger canonical target is inferred from unrelated catalogue rows.

Son düzenlemede `node --test test/*.test.js` ile 58/58 test geçti. Bu çalışma ortamında Vite bağımlılığı kurulu olmadığı ve bağımlılıklar çevrimdışı kurulamadığı için `npm run build` doğrulanamadı. Yayına almadan önce Node.js 20.19+ veya 22.12+ ortamında `npm install`, `npm test` ve `npm run build` komutlarını yeniden çalıştırın. SEO adımları arama motorlarında indekslenme veya sıralama garantisi vermez; canlı DNS/hosting ve webmaster hesap ayarları ayrıca yapılmalıdır.

## Site genelinde doğal dil değiştirme

Üst menüdeki dil seçici arayüz dilini değiştirir; arşivdeki tüm makale kartlarının başlık, özet, kategori ve diyalektik alanlarını toplu ve paralel çeviri isteğiyle hazırlar. Kullanıcı makale detayını açtığında tam gövde aynı hedef dile çevrilir ve önbelleğe alınır; HTML etiketleri, görsellerin URL'leri ve matematiksel ifadeler korunmaya çalışılır. İlk çeviri için hosting/AI Studio Secrets alanında `GEMINI_API_KEY` gereklidir. Aynı tarayıcıda katalog çevirileri yerel önbellekte saklanır ve yeni Blogger içerikleri geldiğinde katalog sürümü yenilenir. Blogger ve tarayıcı arşiv kontrolleri dakikada bir çalışır; tarayıcıya geri dönüldüğünde hemen kontrol yapılır.

## Birleşik diğer site istatistikleri ve Gemini anahtarı

`/analytics.html` içindeki **Diğer Sitelerle Birleşik Canlı İstatistikler** bölümü Sci-Phi, Blogger ve `science-philosophy.grok.me` alan adlarını ayrı satırlarda gösterir. Toplam yalnızca Umami'ye bağlanan sitelerin doğrulanmış verilerini toplar; aynı ziyaretçi farklı alan adlarında ayrı sayılabilir. Blogger teması kendine ait izleme parametresini içerir. Grok.me üzerinde de şu izleyici etiketi yüklenmelidir: `<script defer src="https://sci-phil.ai.studio/analytics-tracker.js?site=grokme"></script>`. Sonrasında sunucuda `UMAMI_GROKME_WEBSITE_ID` doldurulmalıdır.

Gemini anahtarı sunucu tarafında `.env`/Secrets'tan yüklenir; `GOOGLE_API_KEY` ve `GEMINI_API_KEY` ikisi de desteklenir. `/api/gemini/status` anahtarın kendisini göstermeden yapılandırma durumunu döndürür. Google anahtarı geçersiz ya da iptal edilmişse yeni geçerli anahtar oluşturup Secrets alanından tanımlamak gerekir. Üstteki sahte `NLP CONNECTED` bildirimi kaldırılmıştır.
