# Canlı Analytics Kurulumu (Türkçe)

Bu projede üst menüdeki **Live Analytics** düğmesi `/analytics.html` panelini açar. Panel; Umami üzerinden benzersiz ziyaretçi, sayfa görüntüleme, oturum ve ülkelere göre benzersiz ziyaretçi sayılarını getirir. API anahtarı yalnızca sunucuda kullanılır; tarayıcıya aktarılmaz.

## 1. Birleşik istatistikte yer alacak siteleri oluşturun

Tek panel birden fazla Umami Website ID'sini destekler. Her alan adı Umami'de ayrı website olarak eklenmelidir; tek bir ID birden fazla domaine ait istatistiği otomatik olarak birleştirmez.

- Sci-Phi: `sci-phil.ai.studio` → `UMAMI_WEBSITE_ID`
- Blogger: `emrepelit7337.blogspot.com` → `UMAMI_BLOGGER_WEBSITE_ID`
- Science & Philosophy Grok.me: `science-philosophy.grok.me` → `UMAMI_GROKME_WEBSITE_ID`
- İsteğe bağlı GitHub Pages: `UMAMI_GITHUB_PAGES_WEBSITE_ID` ve `UMAMI_GITHUB_PAGES_DOMAIN`

Her sitede gerçek veri toplanması için o sitenin izleyici betiği de etkin olmalıdır. Blogger XML teması `analytics-tracker.js?site=blogger` bağlantısını içerir. Grok.me kaynak koduna şunu ekleyin:

```html
<script defer src="https://sci-phil.ai.studio/analytics-tracker.js?site=grokme"></script>
```

Grok.me üzerinde şablon/kod düzenleme olanağı yoksa o alan adından canlı Umami ölçümü alınamaz; yalnızca ID girmek geçmiş veriyi veya izlemeyi kendiliğinden oluşturmaz.

## 2. Umami sitesini oluşturun

1. https://cloud.umami.is/ adresinde bir Umami Cloud hesabı açın veya giriş yapın.
2. Websites bölümünde yeni web sitesi oluşturun ve hostname alanına tam olarak `sci-phil.ai.studio` yazın.
3. Oluşan **Website ID** değerini kopyalayın.
4. Umami hesap ayarlarından bir **API key** oluşturun. API anahtarı gizlidir; GitHub'a, HTML dosyalarına veya öz koda koymayın.

Umami Cloud, sayfa görüntüleme ve ülke bazlı ziyaretçi metriklerini sağlar. Resmî API dokümanları: https://docs.umami.is/docs/api ve https://docs.umami.is/docs/api-reference/get-website-metrics

## 3. Barındırma ortamında gizli değişkenleri ekleyin

Uygulamanın sunucu/AI Studio yayın ortamındaki Environment Variables / Secrets alanına şunları ekleyin:

- `UMAMI_WEBSITE_ID` = Sci-Phi için Umami Website ID
- `UMAMI_BLOGGER_WEBSITE_ID` = Blogger için ayrı Website ID
- `UMAMI_GROKME_WEBSITE_ID` = Grok.me için ayrı Website ID (varsa)
- `UMAMI_GITHUB_PAGES_WEBSITE_ID` ve `UMAMI_GITHUB_PAGES_DOMAIN` = isteğe bağlı GitHub Pages kaydı
- `UMAMI_API_KEY` = Umami API anahtarı (yalnızca sunucu gizli değişkeni)
- `UMAMI_API_BASE_URL` = `https://api.umami.is/v1`
- `UMAMI_SCRIPT_URL` = `https://cloud.umami.is/script.js`
- `ANALYTICS_START_AT` = `2026-04-24T00:00:00+03:00`

Ardından uygulamayı yeniden dağıtın. Bu ZIP dosyasının tek başına indirilmesi canlı siteyi veya hosting ayarlarını değiştirmez.

## 4. Doğrulama

Dağıtımdan sonra:
- `https://sci-phil.ai.studio/api/analytics/config` adresi `enabled: true` ve Website ID döndürmelidir.
- `https://sci-phil.ai.studio/api/analytics/summary` adresi `configured: true`, sayılar ve `countries` listesi döndürmelidir.
- `https://sci-phil.ai.studio/api/analytics/sites-summary` her site için bağlantı durumu ve gerçek sayıları döndürmelidir. `not_configured` veya `api_key_missing` durumları için sayı uydurulmaz.
- Ana sayfa ve makale sayfalarındaki `analytics-tracker.js` Umami izleyicisini başlatır.
- Üst menüdeki **Live Analytics** düğmesi `/analytics.html` panelini açar; panel veriyi 60 saniyede bir yeniler.

API anahtarı eklenmeden panel gerçek ülke istatistiği uydurmaz; kurulum gereksinimini açıkça gösterir.

## Raporlama miladı ve doğruluk

Raporlama aralığının başlangıcı 24 Nisan 2026 saat 00.00 Türkiye saati olarak tanımlıdır. Gerçek veri, izleyici kodu dağıtıldıktan ve Umami yapılandırıldıktan sonra toplanmaya başlar; önceki günler için geriye dönük ziyaret verisi üretilemez.

IP tabanlı ülke bilgisi yaklaşık konumdur; VPN, proxy, kurumsal ağlar ve gizlilik araçları ülke sonucunu etkileyebilir. Ziyaretçi sayısı analiz sağlayıcısının benzersiz ziyaretçi tanımına göredir; mutlak kişi kimliği/kimlik tespiti değildir.

## Gemini çeviri hatası için anahtar yapılandırması

Canlı çeviri sunucu tarafında `GOOGLE_API_KEY` veya `GEMINI_API_KEY` değişkenini okur; `GOOGLE_API_KEY` tanımlıysa öncelik ondadır. Model varsayılanı `GEMINI_MODEL=gemini-3.8-flash` şeklindedir. Hosting/AI Studio Secrets alanına geçerli bir Google AI Studio Gemini Auth/authorization anahtarı girip uygulamayı yeniden başlatın. `.env.example` yalnızca örnek şablondur; gerçek anahtarı Git'e, ZIP'e veya frontend koduna eklemeyin.

`GET /api/gemini/status` yalnızca sunucuda bir anahtar tanımlı olup olmadığını, hangi değişken adının seçildiğini ve modeli gösterir; anahtar değerini döndürmez. Anahtar Google tarafından geçersiz/reported-leaked diye reddedilirse yeni geçerli anahtar oluşturmak gerekir; kod mevcut anahtarı geçerli hâle getiremez. 401/403, kota ve model sorunları çeviri yanıtında ayrı açıklanır.
