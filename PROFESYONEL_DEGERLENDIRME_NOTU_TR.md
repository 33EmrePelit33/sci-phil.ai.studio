# Profesyonel Tez Değerlendirmesi Entegrasyonu

## Neler Eklendi?

Her React makale kartında makalenin tez ve özetinden oluşturulan kısa mesleki değerlendirme gösterilir.

Kart üzerinde **Detaylı Değerlendirmeyi Aç** denildiğinde uygulama; kanıt, yöntem ve risk/yönetim perspektiflerini ayrı ekranda açar.

Makalenin detay ekranındaki **Sektör Değerlendirmesi** paneli aynı değerlendirmeyi geniş görünümde gösterir. Doğrudan `/makale/<slug>` sayfa şablonunda da sektör tanımı ve değerlendirmesi vardır.

Sunucu taraflı makale sayfaları katalogdaki 289 çok dilli makale için değerlendirme bölümü içerir. Türkçe, İngilizce, Almanca, Fransızca ve İspanyolca içerikler yerelleştirilmiş başlıklar kullanır.

## Şeffaflık İlkesi

Bu paneller gerçek kişilerle görüşüldüğü veya adı geçen bir uzmanı belirli bir makaleyi onayladığı iddiasında bulunmaz. Değerlendirme makalenin başlık, özet ve içeriği üzerinden sektörel önem, yöntem, kanıt ve riskleri çerçeveler. Gerçek uzman görüşleri ancak kaynaklar doğrulanarak eklenmelidir.

## Kontroller

`node --test` otomatik testleri çalışır. Yayın öncesinde bağımlılık kurulumu sonrası `npm run build` ve `npm run lint` komutları proje ortamında çalıştırılmalıdır.
