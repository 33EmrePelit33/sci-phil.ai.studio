# Sci-Phi SEO ve alan adı taşıma rehberi

## Kanonik kaynak

- Ana kaynak: **https://sci-phil.ai.studio/**
- Eski alan adları: `science-philosophy.ai.studio` ve `science-philosophy-emre-pelit.ai.studio`
- İsteğe bağlı `www` hostları da kanonik alan adına 301 yönlendirilir.

`server.ts` yönlendirmeyi tüm uygulama/API/statik rotalarından önce uygular. `seo.js` makale sayfalarını sunucu tarafında HTML olarak sunar; `/robots.txt` ve `/sitemap.xml` katalogdan dinamik oluşturulur. Ana sayfada makalelere doğrudan HTML bağlantıları bulunur. Katalogda şu anda 294 benzersiz makale vardır; sitemap ana sayfa + 294 makale + Analytics olmak üzere 296 URL içerir. Yeni Blogger içerikleri başarılı senkronizasyondan sonra aynı çalışma zamanı kataloğuna dahil olur.

## Yayınlama

1. Node.js 20.19+ veya 22.12+ ortamında `npm install` çalıştırın.
2. Testleri `npm test` ile, derlemeyi `npm run build` ile kontrol edin.
3. Hosting/AI Studio panelinde **Primary Domain** olarak `sci-phil.ai.studio` seçin.
4. Eski iki hostu (kullanılıyorsa `www` varyantlarını da) bu uygulamaya alias olarak bağlayın veya sağlayıcı tarafında aynı yol ve query string'i koruyan 301 kuralı kurun. DNS ve hosting ayarları ZIP dosyasından değiştirilemez.
5. Canlıya aldıktan sonra `/healthz`, `/robots.txt`, `/sitemap.xml`, `/5d3436c931b6024c.txt`, `/makale/<gerçek-slug>` ve `/analytics.html` uç noktalarını doğrulayın.

Blogger senkronizasyonu başlangıçta ve her 15 dakikada bir denenir; `POST /api/sync-blog` elle tetikleme içindir. Yeni makaleler çalışma zamanı kataloğuna eklenir. Dosya sistemine de yazılması gerekiyorsa `WRITE_CATALOG_TO_DISK=true` tanımlayın; aksi hâlde senkronizasyonun çalışma zamanı güncellemesi salt okunur barındırmada da çalışır. Sunucu başarılı feed senkronizasyonunda yalnızca gerçekten gelen Blogger kayıtları için `blogger-canonical.js` haritasını günceller.

## Google, Bing ve diğer arama motorlarına bildirme

- Google Search Console'da `https://sci-phil.ai.studio/` için sahipliği doğrulayın ve `https://sci-phil.ai.studio/sitemap.xml` site haritasını gönderin. URL Denetleme üzerinden ana sayfa ve birkaç örnek makale için tarama isteği verebilirsiniz.
- Eski alan adları Search Console'da size ait ve uygun durumdaysa, 301 yönlendirmeleri çalıştıktan sonra her eski özellikte **Adres Değişikliği** aracını kullanın. Eski yönlendirmeleri en az 180 gün, tercihen eski URL'lerden trafik geldiği sürece açık tutun.
- Bing Webmaster Tools'ta alan adını doğrulayın, aynı sitemap'i gönderin ve IndexNow sekmesinden alım durumunu takip edin.
- Canlı sunucu erişilebilir olduktan sonra `npm run submit:indexnow` çalıştırın. Betik önce `https://sci-phil.ai.studio/5d3436c931b6024c.txt` dosyasının gerçek içeriğini doğrular; ardından kanonik ana sayfa, Analytics ve makale URL'lerini IndexNow global ucuna gönderir. IndexNow Google'a gönderim yapmaz.
- Tarayıcıların kendilerine site gönderimi yapılmaz; indekslemeyi arama motorları yönetir. Sitemap ve bildirimler taramaya yardımcı olur ancak herhangi bir URL'nin dizine alınmasını veya belirli bir sırayı garanti etmez.

## Otoriteyi güvenli biçimde geliştirme

- Her makaleyi özgün, açık başlık/özet, tarih ve mümkün olduğunda birincil kaynaklar ile yayımlayın; iddia, yorum ve kanıtı birbirinden ayırın.
- Konu kümeleri arasında doğal iç bağlantılar kurun; önemli sayfalara ana sayfadan ve ilgili makalelerden erişilebilsin.
- Blogger profilini ve gerçek sosyal/proje profillerini yeni kanonik alan adına bağlayın; eski sitelerden eşdeğer sayfalara 301 verin ve iç bağlantıları yeni adrese güncelleyin.
- Search Console ve Bing raporlarında 404, yönlendirme zinciri, canonical seçimi, indeks dışı sayfalar ve arama sorgularını düzenli inceleyin.
- Satın alınmış bağlantı, yapay ziyaret, anahtar kelime doldurma veya indeksleme garantisi vaat eden hizmetlerden kaçının.

## Doğrulama notu

Paket içinde bazı Search Console doğrulama dosyaları bulunur; bunlar yalnızca hesabınızda gösterilen token ile birebir eşleşiyorsa geçerlidir. Gerekirse Search Console'un sunduğu gerçek doğrulama dosyasını/etiketini kullanın. Bu paket canlı hosting, DNS, Search Console veya Bing hesabında kendi başına değişiklik yapmaz.
