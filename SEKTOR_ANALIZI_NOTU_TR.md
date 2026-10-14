# Makale başına sektör tanımı ve sektör değerlendirmesi

## Yapılan değişiklikler

- Makale kartlarına **Sektör Tanımı** ve kısa **Sektör Değerlendirmesi** bölümleri eklendi.
- Makale detay sayfasındaki eski profesyonel/uzman bakış paneli kaldırıldı; yerine sektör analizi sekmesi eklendi.
- Analiz; konunun sektörünü, makalede savunulan tezi, olası katkıyı, kanıt ve yöntem ihtiyacını, sınırları, riskleri ve uygun kontrol ölçütlerini kapsar.
- Doğrudan açılan 289 makale URL'sindeki sunucu taraflı sayfalara da sektör tanımı ve sektör değerlendirmesi eklendi. Türkçe, İngilizce, Almanca, Fransızca ve İspanyolca katalog girdileri için yerelleştirilmiş bölüm başlıkları ve açıklamalar kullanıldı.
- Kaynak kodundaki isim/kurum atıflı eski örnek uzman görüşleri ile onlara ait fikir birliği puanları ve veri modeli kaldırıldı.
- Sitede hiçbir sektör değerlendirmesi, belirli bir uzmanım veya kuruluşun gerçek görüşü olarak sunulmaz. Bu içerik temelli analitik bir çerçevedir.

## Test

`node --test` ile sektör paneli, eski kayıtların kaldırılması ve beş dilde doğrudan makale sayfaları kontrol edilir. Üretim derlemesi için proje ortamında `npm install` ve ardından `npm run build` çalıştırılmalıdır.
