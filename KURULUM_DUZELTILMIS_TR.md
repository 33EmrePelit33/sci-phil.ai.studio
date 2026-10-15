# DÜZELTİLMİŞ KAYNAK KODU — KURULUM VE DOSYA YERLEŞİMİ

Bu paket, `sci-phil.ai.studio` için React/Vite uygulamasını ve Express sunucusunu içerir.
**Projeyi parça parça başka bir projeye yapıştırmayın.** ZIP'i bir klasöre tamamen çıkarın; kök dizindeki dosyalar tek bir uygulama olarak birlikte çalışır.

## Düzeltilen temel dosyalar

1. `src/SocraticPartner.jsx`
   - Tarayıcı tarafındaki `process.env.REACT_APP_GEMINI_API_KEY` bağımlılığı kaldırıldı.
   - Gemini anahtarını doğrudan tarayıcıdan Google'a göndermek yerine `/api/gemini/socratic` sunucu uç noktasına istek yapar.
   - Gemini anahtarı tanımlı değilse güvenli bir yerel/kuralsal Sokratik yanıt verir.
   - Pano API'si kullanılamadığında kopyalama için alternatif açılır. Kopyalama işleyicisinin JSX/JavaScript satır sonu sözdizimi de düzeltildi.

2. `server.ts`
   - `POST /api/gemini/socratic` uç noktası eklendi.
   - `GEMINI_API_KEY` yalnızca sunucu ortam değişkeninden okunur; istemciye gönderilmez.
   - Girdi uzunluğu sınırlandırılır, boş iddia reddedilir ve model yanıtı doğrulanır.

3. `src/App.tsx`
   - Sokratik bileşen `./SocraticPartner` üzerinden `src/SocraticPartner.jsx` dosyasından yüklenir. Bu dosyanın `src` altında kalması gerekir.

4. `.env.example`
   - Ortam değişkenleri için örnek şablondur. Gerçek anahtarları bu dosyaya veya frontend kaynak koduna koymayın. Hosting panelinin Secrets/Environment Variables alanını kullanın.

5. `test/`
   - Var olan otomatik test paketi çalıştırıldı: **46 test başarılı, 0 başarısız**.

## Nereye yerleştireceksiniz?

### ZIP'i uygulama olarak dağıtıyorsanız (önerilen)
1. ZIP'i tamamen çıkarın.
2. Terminali `package.json` dosyasının bulunduğu **kök klasörde** açın.
3. Node.js 20.19+ veya 22.12+ kurulu olmalı.
4. Komutları sırayla çalıştırın:

```bash
npm install
npm test
npm run build
npm start
```

5. Hosting/AI Studio ortamında aynı kök klasörün uygulama kaynağı olduğundan emin olun. Yalnızca bir `.jsx` dosyasını site editörüne yapıştırmak, Express API'sini ve SEO/Analytics rotalarını kurmaz.

### Mevcut kaynak kodunuza dosya bazında taşıyacaksanız
- `src/SocraticPartner.jsx` → React bileşenlerinin bulunduğu `src/` klasörüne.
- `src/App.tsx` → mevcut uygulamanızın `src/App.tsx` dosyasına; bu dosyada `import SocraticPartner from './SocraticPartner';` satırı bulunmalı ve bileşen gerektiği yerde `<SocraticPartner lang={...} />` olarak çağrılmalı.
- `server.ts` → `package.json` ile aynı kök klasöre. API uç noktaları sunucuda çalışır; sadece frontend'e eklenemez.
- `.env.example` → yalnızca örnek olarak kullanılır. Gerçek `GEMINI_API_KEY`, hosting panelinin gizli değişkenler alanına eklenir.
- `public/`, `seo.js`, `catalog.json`, `blogger-sync.js`, `src/data/`, `src/components/` ve `package.json` dosyalarını da birlikte koruyun; bunlar sitenin geri kalan özellikleri için gereklidir.

## Canlıya almadan önce
- `npm test` sonucu bu çalışma ortamında 46/46 başarılıdır.
- Bu çalışma ortamında `node_modules` bağımlılıkları kurulu olmadığı için `npm run build` burada doğrulanamadı; TypeScript/JSX kaynaklarının sözdizimi kontrolü yapıldı. Bu çalışmada bağımlılık kurulumu ağ/DNS erişimi nedeniyle yapılamadığından tam üretim derlemesi çalıştırılamadı. Canlıya almadan önce npm kayıt deposuna erişebilen bilgisayar/CI ortamında `npm install`, `npm test` ve `npm run build` komutlarının başarılı olduğunu doğrulayın.
- `GEMINI_API_KEY` ayarlanmamışsa Sokratik partner temel yedek yanıtlarla çalışır; gerçek Gemini analizi için sunucu Secrets alanına anahtar ekleyin.
- Analytics için Umami değişkenlerini de hosting ortamında ayrı ayrı tanımlayın.
- ZIP'i hazırlamak canlı siteyi otomatik değiştirmez; değişiklikleri hosting/AI Studio projesine dağıtmanız gerekir.
