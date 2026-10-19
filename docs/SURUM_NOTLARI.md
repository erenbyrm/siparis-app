# 0.9.0 — birleşik ayarlar, toplu onay ve veri kapasitesi

19 Ekim 2026. Tek Ayarlar menüsü, açık/karanlık/sistem görünümü, logoya göre renk, sade mobil filtreler ve dikey yönetim listeleri. Merkezi yönetici onayları, kayıt altında belge işlemleri; Son belge kaldırıldı. Giriş yükleme yarışları, kayıt bazında özel depolama geçişi ve bütünlük kontrollü yedek araçları. [Kullanım ve geçiş rehberi](AYARLAR_MOBIL_VE_VERI.md). Supabase geçişi ve gerçek cihaz kabulü yönetici adımı bekler.

# 0.8.0 — mobil ürün kartları ve eksik kabul

19 Ekim 2026. Yatay adet tablosu yerine ürün kartları, dikey depo/sayım görünümü, sipariş bazında günlük üretim ön izlemesi ve yalnızca girişte kurulum eklendi. Yönetici eksik kabul kararı kabul bekleyeni azaltır, kabul edilmiş stoğu korur ve eksiği yeniden üretime açar. EKP/EKO numaralı belgeler oluşturulur. Derlenmiş sunucunun Node ESM açılışı düzeltildi. [Kullanım rehberi](MOBIL_VE_EKSIK_KABUL.md).

# 0.7.0 — ana ekrana kurulabilen uygulama

15 Ekim 2026. Kurulum rehberi, uygulama simgeleri, bağlantısız açılış ekranı ve güncelleme bildirimi eklendi. 107 test ve üretim derlemesi geçti. Yerel tarayıcıda sunucu kapalıyken bağlantısız ekran doğrulandı. Gerçek cihaz kurulumu ve Supabase kabul testi bekliyor. [Rehber](TELEFONA_KURULUM.md).

# 0.6.1 — telefon görünümü

14 Ekim 2026. Role göre alt menü, erişilebilir tüm işlemler penceresi, büyük dokunma alanları ve telefon için sipariş kartları eklendi. 360/390 piksel telefon ve 820 piksel tablet genişliğinde kontrol edildi; sayfa taşması görülmedi. 103 test ve üretim derlemesi geçti. Gerçek iPhone/Android cihaz kabul testi, merkezi Supabase kurulumu ve ana ekrana kurulabilen PWA paketi henüz tamamlanmadı.

# 0.6.0 — numaralı PDF, stok talepleri ve Excel

13 Ekim 2026. Kategori/yıl bazında sıra numarası, işlem anına ait PDF kayıtları, cihaz destekli paylaşım, yönetici onaylı stok üretim talepleri ve .xlsx ürün yükleme. 103 test geçti. [Deneme ve Excel rehberi](BELGELER_STOK_TALEPLERI_EXCEL.md).

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
