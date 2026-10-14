# Public Analytics panelini yayına alma

Bu paket, `sci-phil.ai.studio` projesindeki herkese açık ve salt okunur Analytics panelinin güncellenmiş kaynak dosyalarını içerir.

## Erişim adresleri

- `https://sci-phil.ai.studio/analytics.html`
- Kısa yol: `https://sci-phil.ai.studio/analytics` (sunucu yönlendirmesi)

## Neler değişti?

- React üst menüsüne ve alt bilgisine Analytics bağlantısı eklendi.
- Panel; birleşik net okuma, toplam görüntüleme, Blogger / web / GitHub Pages / uygulama sayaçları ile makale kataloğu özetini gösterir.
- Sayısal değerler başlangıç verisi ve canlı sayacın birlikte hesaplanmasıyla gösterilir. Canlı sayaca erişilemediğinde o metrik `—` olur; eksik değerler sıfır veya uydurma bir değer gibi sunulmaz.
- Dil dağılımı katalogdan hesaplanır. Kaynaktan doğrulanamayan ülke, tekil kullanıcı, ortalama okuma süresi ve net sıralamalar üretilmez.
- Panel 60 saniyede bir güncellenir; kullanıcı arayüzünde yazma/silme veya site yapılandırması değiştirme kontrolü yoktur.

## Yayınlama

Bu ZIP, kaynak dosyaları içerir; dosyanın hazırlanması tek başına canlı AI Studio yayınına değişiklik göndermez. AI Studio/hosting projesinde bu paketin kaynaklarını uyguladıktan sonra projeyi yeniden build edip yayımlayın. Yayından sonra `/analytics.html` ve `/analytics` adreslerini tarayıcıda kontrol edin.

GitHub üzerindeki `emrepelit109/science-philosophy` deposu, bu React/Vite kaynak paketinin aynı kaynak arşivi değildir; bu nedenle yanlış uygulamayı tetiklememek için o depoya otomatik commit yapılmadı.

## Güvenlik notu

Panel arayüzü salt okunurdur. Ancak mevcut canlı sayaçlar genel erişime açık CountAPI servisine dayandığı için bu arayüz tek başına sayaçlara yazılmasını teknik olarak engellemez. Sayaçlar için gerçek yazma yetkisi koruması gerekiyorsa, gizli anahtarı tarayıcıya göndermeyen sunucu tarafı doğrulamalı API ve Redis/Worker katmanı gerekir.
