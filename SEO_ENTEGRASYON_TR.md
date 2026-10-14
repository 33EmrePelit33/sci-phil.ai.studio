# Sci-Phil SEO entegrasyonu — bu paketteki uygulama

## Asıl kaynak

- Kanonik adres: `https://sci-phil.ai.studio/`
- 301 ile taşınacak adres: `https://science-philosophy.ai.studio/`
- Eski alternatif adres: `https://science-philosophy-emre-pelit.ai.studio/`

Bu paket mevcut React/Vite arayüzünü korur. SEO katmanı `catalog.json` içindeki 289 makaleyi `/makale/<slug>` adreslerinde sunucu tarafında HTML olarak yayınlar; `robots.txt` ve 291 URL içeren `sitemap.xml` sunucu tarafından oluşturulur. Ana sayfanın altında açılabilir, kullanıcıya görünür 289-makale listesi de normal HTML bağlantıları olarak yer alır.

## Yerel test ve yayınlama

1. Node.js 20+ kullanın.
2. `npm install`
3. `npm test`
4. `npm run build`
5. Üretimde `NODE_ENV=production npm start` ile başlatın.
6. Yayına aldıktan sonra `https://sci-phil.ai.studio/healthz`, `/robots.txt`, `/sitemap.xml` ve birkaç `/makale/<slug>` URL'sini kontrol edin.

`npm run dev` yerel Vite geliştirme sunucusunu ve SEO sayfalarını birlikte açar.

## Alan adı eşlemesi zorunludur

Sunucu kuralı eski host istekleri aynı uygulamaya ulaştığında HTTP 301 döndürür. Bunun için hosting/AI Studio panelinde eski alan adını bu Node.js uygulamasına alias olarak bağlayın veya eski alan adının sağlayıcı panelinde 301 yönlendirmesi kurun. Alan adı DNS/hosting erişimi bu ZIP ile otomatik değiştirilemez. Rastgele preview hostları bilerek otomatik yönlendirilmez.

## İndeksleme

- `https://sci-phil.ai.studio/sitemap.xml` haritasını Google Search Console ve Bing Webmaster Tools'a gönderin.
- IndexNow gönderimi için dağıtımdan sonra Node.js 20+ ortamında `npm run submit:indexnow` çalıştırın. Key dosyası `public/5d3436c931b6024c.txt` konumundadır.
- IndexNow Google'a gönderim yapmaz. Search Console üzerinden ayrıca doğrulama ve URL denetimi gerekir. Bütün sayfaların indeksleneceği veya üst sıraların garanti edildiği iddia edilmez; arama motorları kendi kalite ve tarama değerlendirmelerini yapar.

## Dikkat

`server.ts`, bu kaynak projede bulunmayan API uç noktaları uydurmamaktadır; uygulamadaki `/api` uç noktaları 404 JSON yanıtıyla açıkça raporlanır.

Bu paketteki yeni SEO makale sayfaları sesli okumayı tarayıcının Speech Synthesis API'si ile sunar. Çeviri API'si için `GEMINI_API_KEY` içeren bir sunucu uç noktası ayrıca yapılandırılmalıdır.

## Türkçe makale arşivi geri yükleme

- `src/data/turkishCatalog.json` paketteki Türkçe asıl makalelerin çevrim dışı yedeğidir. Katalogda 69 benzersiz Türkçe kayıt bulundu; önceki 68 kayıtla birlikte en yeni kayıt da korunur.
- React ortamı örnek kayıt yerine tam Türkçe katalogla başlar.
- `GET /api/articles` aynı tam arşivi döndürür; kısa/eksik API yanıtları arşivin yerini alamaz.
- `npm test` içinde makale sayısı, benzersizlik ve API bağlantısı için regresyon testleri bulunur.
