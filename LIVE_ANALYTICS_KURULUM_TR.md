# Canlı Analytics Kurulumu (Türkçe)

Bu projede üst menüdeki **Live Analytics** düğmesi `/analytics.html` panelini açar. Panel; Umami üzerinden benzersiz ziyaretçi, sayfa görüntüleme, oturum ve ülkelere göre benzersiz ziyaretçi sayılarını getirir. API anahtarı yalnızca sunucuda kullanılır; tarayıcıya aktarılmaz.

## 1. Umami sitesini oluşturun

1. https://cloud.umami.is/ adresinde bir Umami Cloud hesabı açın veya giriş yapın.
2. Websites bölümünde yeni web sitesi oluşturun ve hostname alanına tam olarak `sci-phil.ai.studio` yazın.
3. Oluşan **Website ID** değerini kopyalayın.
4. Umami hesap ayarlarından bir **API key** oluşturun. API anahtarı gizlidir; GitHub'a, HTML dosyalarına veya öz koda koymayın.

Umami Cloud, sayfa görüntüleme ve ülke bazlı ziyaretçi metriklerini sağlar. Resmî API dokümanları: https://docs.umami.is/docs/api ve https://docs.umami.is/docs/api-reference/get-website-metrics

## 2. Barındırma ortamında gizli değişkenleri ekleyin

Uygulamanın sunucu/AI Studio yayın ortamındaki Environment Variables / Secrets alanına şunları ekleyin:

- `UMAMI_WEBSITE_ID` = Umami'de oluşturulan Website ID
- `UMAMI_API_KEY` = Umami API anahtarı (yalnızca sunucu gizli değişkeni)
- `UMAMI_API_BASE_URL` = `https://api.umami.is/v1`
- `UMAMI_SCRIPT_URL` = `https://cloud.umami.is/script.js`
- `ANALYTICS_START_AT` = `2026-10-12T00:00:00+03:00`

Ardından uygulamayı yeniden dağıtın. Bu ZIP dosyasının tek başına indirilmesi canlı siteyi veya hosting ayarlarını değiştirmez.

## 3. Doğrulama

Dağıtımdan sonra:
- `https://sci-phil.ai.studio/api/analytics/config` adresi `enabled: true` ve Website ID döndürmelidir.
- `https://sci-phil.ai.studio/api/analytics/summary` adresi `configured: true`, sayılar ve `countries` listesi döndürmelidir.
- Ana sayfa ve makale sayfalarındaki `analytics-tracker.js` Umami izleyicisini başlatır.
- Üst menüdeki **Live Analytics** düğmesi `/analytics.html` panelini açar; panel veriyi 60 saniyede bir yeniler.

API anahtarı eklenmeden panel gerçek ülke istatistiği uydurmaz; kurulum gereksinimini açıkça gösterir.

## Raporlama miladı ve doğruluk

Raporlama aralığının başlangıcı 12 Ekim 2026 saat 00.00 Türkiye saati olarak tanımlıdır. Gerçek veri, izleyici kodu dağıtıldıktan ve Umami yapılandırıldıktan sonra toplanmaya başlar; önceki günler için geriye dönük ziyaret verisi üretilemez.

IP tabanlı ülke bilgisi yaklaşık konumdur; VPN, proxy, kurumsal ağlar ve gizlilik araçları ülke sonucunu etkileyebilir. Ziyaretçi sayısı analiz sağlayıcısının benzersiz ziyaretçi tanımına göredir; mutlak kişi kimliği/kimlik tespiti değildir.
