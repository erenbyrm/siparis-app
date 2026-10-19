# Mobil kullanım ve eksik kabul — 0.8.0

19 Ekim 2026

Sipariş içindeki ürünler artık ayrı kartlardır. Ürün kodu, adı, üretilecek, kabul bekleyen, sevke hazır ve gönderilen adetler aynı kartta görünür. Üretim, depo kabulü ve sevkiyat adetleri ürünün hemen altından girilir. Fiyat ayrıntıları açılır bölümde bulunur. Depo ve sayım tabloları telefonda etiketli dikey kartlara dönüşür. Telefona kurulum yalnızca giriş ekranındadır.

Üretim programında güne dokununca günlük ön izlemeye gidilir. İşler programın öncelik sırasıyla, sipariş numarası altında gruplanır. Her ürünün planlanan veya üretilen miktarı ve hat payı görünür. Sayılar kapasite tahminidir; otomatik sevkiyat veya üretim kaydı oluşmaz.

## Eksik üretim teslimi

1. Gerçekten gelen miktarı Siparişler veya stok üretimi kabulünden sayarak teslim alın.
2. Depo ve stok → Eksik üretim teslimi bölümünde ilgili sipariş/üretim ve ürünü seçin.
3. Gelmeyen miktarı ve açıklamayı girip yönetici onayına gönderin.
4. Yönetici aynı bölümde Kabul bekleyenden düş veya Reddet seçer.

Örnek: üretim 100 bildirdi, depo 80 kabul etti, 20 gelmedi. Onaya kadar 80 depoda, 20 kabul bekleyendir. Yönetici onayında kabul bekleyen 0, yeniden üretilecek 20 olur. Kabul edilmiş 80 ve varsa sevkiyat geçmişi korunur. Siparişsiz stok üretimi eksikleri de kabul edilmiş stoğu azaltmaz; onaylı stok talebi varsa kalan üretim ihtiyacı tekrar açılır. Talebe bağlı olmayan stok üretiminin eksiği gerektiğinde yeni stok üretimi olarak kaydedilir.

Bildirimin ardından kabul bekleyen miktar değişmişse eski bildirim onaylanmaz; reddedilip güncel miktarla yeniden bildirilir. Aynı kaynak/ürün için ikinci bekleyen bildirim ve ikinci kez karar engellenir. Eksik miktar kabul bekleyeni aşamaz. Depocu onaylayamaz; yönetici yetkisi sunucuda da kontrol edilir.

Bildirim EKP, karar EKO kategorisinde sıra numarası ve işlem anına ait PDF kaydı alır. Eski yedekler yeni alanlar olmadan açılabilir. Kod arşivi merkezi işletme verisinin yedeği değildir.

## Sunucu düzeltmesi ve kontrol sınırı

Derlenmiş API'nin doğrudan Node ESM ile açılmasını engelleyen uzantısız yerel importlar düzeltildi. Geliştirme yükleyicisi olmadan derleyip başlatan regresyon testi eklendi. Sunucu hataları yalnızca aşama, hata adı ve koduyla kaydedilir; bağlantı dizesi ve parola loglanmaz.

113 otomatik test, TypeScript kontrolü ve üretim derlemesi doğrulanır. Yerel tarayıcıda 100 üretim → 80 kabul → 20 eksik bildirim → yönetici onayı akışı ve telefon görünümü kontrol edilir. Vercel'de Supabase bağlantısı, gerçek kullanıcı oturumu ve fiziksel telefon kabul testi ayrıca doğrulanmalıdır; yerel test bunları doğrulamaz.
