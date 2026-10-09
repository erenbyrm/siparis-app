# 0.5.0 — tek depo, sayım ve stok ayırma

9 Ekim 2026. Depocu sayımı, yönetici onaylı fark düzeltme, sayarak üretim kabulü, stoktan sipariş karşılama ve stok üretimi. 87 test geçti. [Kullanım rehberi](DEPO_VE_SAYIM.md).

# 0.4.0 — şirket kimliği ve kişiye özel karşılama

8 Ekim 2026. Yönetici şirket bilgileri, logo/fotoğraf yükleme, tüm rollerde ad soyad ile karşılama, markalı çıktılar ve yedek uyumluluğu. 73 test geçti. [Kullanım ve inceleme raporu](SIRKET_VE_INCELEME.md).

# 0.3.0 — ürün iskontosu ve ortak hat planlaması

7 Ekim 2026. 67 test geçti. Yeni kullanım kuralları ve sınırlar: [Üretim ve iskonto](URETIM_VE_ISKONTO.md).

# 0.2.0 — geliştirme ve doğrulama kaydı

7 Ekim 2026. Temel alınan eski sürüm: `0a4bfd6467c36ea66f043b62223ce371140f2e0c`.

## Düzeltmeler

| Önce | Şimdi |
|---|---|
| Kısmi gönderim hazır ürün kalsa da siparişi kapatabiliyordu | Bütün satırlar tamamen gönderilmeden kapanmaz |
| Yarım/negatif/taşan adet riski | Sunucuda tam sayı/sınır kontrolü |
| Kod değişikliği ürün kimliğini bozabiliyordu | Kimlik sabit; stok kodu benzersiz |
| Genel KDV ve eksik iskonto çıktısı | Ürün KDV'si, kuruş hesabı ve çıktı dökümü |
| Sabit düz metin parolalar | Merkezi modda doğrulanmış e-posta; sunucuda rol kontrolü |
| Her cihazın ayrı iş verisi | Merkezi API ve şema hazır; hesap kurulumu bekliyor |
| Kullanıcı metni yazdırma HTML'ine doğrudan ekleniyordu | HTML kaçışları uygulanıyor |
| Yedek/geri dönüş kontrolü yok | Dosya doğrulama, önizleme, boş alana aktarım |
| Değişikliklerin takibi yok | Kullanıcı, zaman ve işleme göre kayıt |

## Doğrulama

- Otomatik testler: iş akışı, roller, miktarlar, hesaplama, CSV, eski veri, yedek ve API protokolü.
- API: kimlik doğrulama, rol filtreleme, eski revizyon reddi, tekrarda tek yazma, hatada geri alma. Auth/DB sınırları test ikizidir; canlı bağlantı iddiası değildir.
- TypeScript ve üretim build kontrolü.
- Tarayıcı: 2 × 1.360 TL, %10 iskonto, %20 KDV = 2.937,60 TL; iki onay; 2 hazır; 1 + 1 sevkiyat. İlk gönderim açık, ikincisi tamamlandı.
- 0,5 adet reddi Türkçe mesajla görüldü. 390 × 844 telefon görünümü kontrol edildi; akışta tarayıcı hata kaydı görülmedi.

## Kullanıcı kurulumu sonrası doğrulanacaklar

- Gerçek Supabase giriş, doğrulama ve parola sıfırlama.
- PostgreSQL, RLS erişim sınırı, iki cihaz eşzamanlılığı ve yük testi.
- Gerçek verinin aktarımı, veritabanı yedeğinden kurtarma ve Production yayını.

## Bilinen sınırlar

- Tek işletme/çalışma alanı; JSON tabanlı küçük ekip başlangıcı. İş verisi 2 MB ile sınırlı; büyümede ayrı tablolar/sunucu sayfalaması gerekir.
- Demo yerel ve açık rol seçicilidir; gerçek müşteri verisi için kullanılmaz.
- İade, stok rezervasyonu ve muhasebe/e-fatura entegrasyonu yoktur. Gönderilen sipariş iptal edilmez.
- Farklı eski cihaz yedekleri otomatik birleştirilmez. Eski hesaplar ve işlem geçmişi canlı sisteme aktarılmaz; arşiv dosyası korunur.
- İstek kimliği aynı açık oturumda korunur. Sonucu belirsiz işlemden sonra sayfayı kapatmadan aynı bilgilerle yeniden deneyin. Sayfa kapandıysa yeni işlem yapmadan önce mevcut kayıtları kontrol edin.
