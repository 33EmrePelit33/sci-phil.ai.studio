# Sci-Phi ↔ Blogger Türkçe makale senkronizasyonu ve indeksleme kurulumu

## Bu pakette düzeltilenler

- `POST /api/sync-blog` gerçek Blogger feed eşitlemesini tetikler.
- `GET /api/articles` korunmuş Türkçe arşivi canlı Blogger yazılarıyla birleştirir; kısa feed özetleri uzun, mevcut makalelerin üstüne yazılmaz.
- `GET /api/sync-status` son denemeyi, sonucu, hata bilgisini ve bulunan yazı sayılarını verir.
- Sunucu çalışırken Blogger akışı başlangıçta ve her 15 dakikada bir okunur.
- Ana sayfanın HTML içindeki makale arşivi her istekte `catalog.json` dosyasından yeniden üretilir. Yeni Blogger makaleleri, istemci JavaScript'i olmadan da taranabilir gerçek `<a href>` bağlantıları olarak görünür.
- Yeni/değişen makaleler katalog ve sunucu tarafı makale sayfalarına işlenir. Değişiklik gerçekten varsa ana sayfa, site haritası ve ilgili makale URL'leri IndexNow'a bildirilir. Google için ayrıca Search Console gerekir.
- `/robots.txt` ve `/sitemap.xml` sunucu tarafından dinamik verilir. Yeni senkronize edilen makaleler site haritasına eklenir.
- Blogger teması ana Sci-Phi arşivine geri bağlantı ekler ve katalogda eşleşen yazılar için `blogger-canonical.js` üzerinden Sci-Phi makale canonical sinyalini uygular.

## 1. Blogger yayın akışı

1. https://www.blogger.com/ adresini açıp doğru blogu seçin.
2. **Ayarlar → Site feed'i** bölümüne gidin.
3. Blog feed'ini tam içerik sunacak şekilde **Tam** yapın; feed'i kapalı bırakmayın.
4. Her yazının herkese açık olduğundan emin olun. Taslaklar aktarılmaz.
5. Blog adresi şu olmalı: `https://emrepelit7337.blogspot.com/`.

## 2. Ana uygulamayı dağıtma

1. `fixblog.zip` dosyasını ve içindeki `fixblog/` klasörünü açın. Doğrudan dağıtım `sci-phil-ai-studio-blogger-turkish-sync-deploy.zip` paketinde `package.json` ZIP kökündedir.
2. Node.js 20+ destekleyen hosting/AI Studio uygulama dağıtımına tüm proje dosyalarını yükleyin. Yalnızca ZIP'i indirmek canlı siteyi değiştirmez.
3. Kurulum ve kontrol komutları:
```bash
npm install
npm test
npm run build
NODE_ENV=production npm start