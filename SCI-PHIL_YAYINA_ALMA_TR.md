# Sci-Phi ana alan adına dağıtım ve indeksleme kontrol listesi

## 1. Var olan siteyi koruyarak güncelleme

1. Hosting/AI Studio projesinin şu anki sürümünü dışa aktarın veya ZIP yedeği alın.
2. `sci-phil.ai.studio` alan adını değiştirmeyin. Bu paketin kanonik adresi `https://sci-phil.ai.studio/` olarak sabittir.
3. Paketin içeriğini **aynı siteyi yayımlayan uygulama/proje** üzerine dağıtın. Hosting panelinde ayrı bir uygulama oluşturulursa alan adının yeni servise bağlanması ayrıca gerekir.
4. Üretim dağıtımında Node.js 20.19+ veya 22.12+ kullanın; `npm install`, `npm test`, `npm run build` komutlarını çalıştırın. Testler ve derleme başarılı olmadan canlı sürümü değiştirmeyin.
5. Sunucuyu `NODE_ENV=production npm start` ile başlatan dağıtım yapılandırmasını kullanın.

## 2. Alan adlarını tek kaynakta birleştirme

- Primary Domain / ana alan adı: `sci-phil.ai.studio`
- Eski alan adları: `science-philosophy.ai.studio`, `science-philosophy-emre-pelit.ai.studio`
- Eski hostların aynı Node uygulamasına alias olarak ulaştığından veya sağlayıcı tarafında 301 kuralı bulunduğundan emin olun. Yalnız ZIP yüklemek DNS ya da host eşlemesini değiştirmez.
- Kontrol: eski her alan adında aynı yolun (örneğin `/makale/örnek-slug`) `https://sci-phil.ai.studio` adresine tek adımda 301 yönlenmesi gerekir. Eski yönlendirmeleri en az 180 gün, mümkünse eski bağlantılar ziyaret aldığı sürece koruyun.

## 3. Canlı teknik kontroller

Aşağıdaki uç noktaları yeni dağıtımda tarayıcıda açın:

- `https://sci-phil.ai.studio/healthz` — sağlık kontrolü
- `https://sci-phil.ai.studio/robots.txt` — tarama kuralları ve sitemap referansı
- `https://sci-phil.ai.studio/sitemap.xml` — 294 makale + ana sayfa + Analytics olmak üzere 296 kanonik URL
- `https://sci-phil.ai.studio/api/seo/status` — URL listesi ve bağlantı durumları; bu **indekslenmiş URL sayısı değildir**
- `https://sci-phil.ai.studio/5d3436c931b6024c.txt` — IndexNow doğrulama dosyası
- `https://sci-phil.ai.studio/makale/evren-her-zaman-tekil-bir-olguydu-ve-ilelebet-de-oyle-kalacak-8837081716175656566` — sunucu tarafı HTML makale sayfası ve canonical

Ana sayfa, makale sayfaları ve sitemap yalnız `sci-phil.ai.studio` kanonik hostunu göstermelidir.

## 4. Arama motorlarına bildirim

1. Google Search Console'da yeni alan adının sahipliğini doğrulayın ve `https://sci-phil.ai.studio/sitemap.xml` gönderin.
2. Her eski alan adı için Search Console sahipliğiniz varsa, 301 yönlendirmeleri doğrulandıktan sonra Adres Değişikliği aracını değerlendirin.
3. Bing Webmaster Tools'ta alan adını doğrulayın ve aynı sitemap'i gönderin.
4. Canlı anahtar dosyası doğrulandıktan sonra uygulama ortamında `npm run submit:indexnow` çalıştırın. Betik başarı olarak yalnızca IndexNow'un HTTP 200 veya 202 yanıtını raporlar.
5. Search Console'da ana sayfayı ve örnek makaleleri URL Denetleme ile kontrol edin. Yeni veya güncellenen önemli birkaç sayfa için tarama isteği gönderebilirsiniz.

Tarayıcılar (Chrome, Edge, Firefox, Safari) kendi başlarına sayfa indekslemez. Arama motorları dizine alınma kararını kendileri verir; sitemap ya da IndexNow bildirimi görünürlüğü veya sıralamayı garanti etmez.

## 5. Otoriteyi kalıcı artırma

- Her makalede özgün ve açıklayıcı başlık, kısa ve doğru özet, ilgili konu iç bağlantıları ve mümkün olduğunda birincil kaynak/kaynakça bulundurun.
- Blogger yazılarını Sci-Phi'deki eşdeğer kanonik sayfaya bağlayın; Blogger canonical eşlemesi başarılı feed senkronizasyonunda güncellenir.
- Sahip olduğunuz gerçek yazar/proje/sosyal profillerde ana alan adını kullanın. Alan adı yönlendirmelerini ve site içi bağlantıları yeni ana kaynağa güncelleyin.
- Search Console ve Bing raporlarında 404, redirect zinciri, seçilen canonical ve dizine alınmayan URL nedenlerini düzenli inceleyin.
- Satın alınmış bağlantı, yapay trafik, anahtar kelime doldurma veya indeks garantisi vaat eden yöntemler kullanmayın.

## Önemli sınır

Bu paket kodu ve dağıtım yönergelerini hazırlar; canlı hosting/DNS ayarlarını, Google Search Console veya Bing Webmaster Tools hesabını sizin yerinize değiştirmez. Son doğrulamada tam test paketi 58/58 geçti; buna SEO, sektör analizleri, Blogger kanonik eşlemesi, gerçek analytics verileri ve çeviri uç noktası beklentileri dahildir. Eski testlerin 15 dakikalık Blogger senkronizasyonu ve 12 Ekim 2026 miladıyla çelişen beklentileri güncellendi. `node --experimental-strip-types --check server.ts` ve statik JavaScript kontrolleri geçti. Bu çalışma ortamında Vite ve `vite-plugin-pwa/client` bağımlılıkları bulunmadığından `npm run build` ve tam TypeScript tip doğrulaması tamamlanamadı; canlıya almadan önce bağımlılıkları kurulu bir Node ortamında üretim derlemesini doğrulayın.
