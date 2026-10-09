# Şirket kimliği ve uygulama incelemesi

9 Ekim 2026 · Sürüm 0.5.0

## Eklenen kullanım

Yönetici menüsündeki **Şirket bilgileri** bölümünden şirket adı, ticari unvan, logo, şirket fotoğrafı, telefon, e-posta, web sitesi, adres ve vergi bilgileri girilir. Görsel seçildikten sonra önizleme görünür; **Şirket bilgilerini kaydet** ile tüm sayfalara uygulanır. Logo/fotoğraf kaldırma da kaydedilince uygulanır.

Her sayfada şirket adı ve logo; karşılama alanında şirket fotoğrafı, kullanıcının kendi ad soyadı ve görevine uygun açıklama gösterilir. Ad soyad yönetici tarafından **Kullanıcılar** bölümünde düzenlenir. Şirket kimliğini yalnızca yönetici değiştirebilir; bu kural sunucuda da kontrol edilir.

Teklif, sipariş ve sevkiyat fişlerinde şirket logosu ve iletişim bilgileri yer alır. Logo yüklenmeden yazdırma başlamaz. Şirket bilgileri görsellerle birlikte JSON yedeğine dahil edilir. Eski, şirket bilgisi içermeyen yedekler desteklenir.

PNG/JPEG/WebP kabul edilir; dosya başına en fazla 8 MB. Uygulama görselleri küçültüp yeniden kodlar; SVG ve dış görsel bağlantıları kabul edilmez. Logo ve fotoğraf toplamı kayıt içinde yaklaşık 310 KB ile sınırlandırılmıştır.

Giriş ekranında bu tarayıcıda en son kaydedilen şirket adı ve logo hatırlanır. İlk defa kullanılan cihazda, girişten önce varsayılan isim görünür; yetkili girişten sonra şirket kimliği gelir. İletişim/vergi bilgileri giriş ekranı önbelleğine yazılmaz.

## İnceleme sonucu

| Alan | Mevcut durum | Sonraki ihtiyaç |
|---|---|---|
| Sipariş akışı | Müşteri ve yönetici onayı, iptal, kısmi üretim ve kısmi sevkiyat var | Onaylı sipariş revizyonu için değişiklik gerekçesi ve tekrar onay politikası belirlenmeli |
| Yetkiler | Satıcı kendi oluşturduğu siparişi görür; üretim/sevkiyat fiyat görmez; şirket ayarları yöneticiye özel | Gerçek hesaplarla iki cihaz testi, merkezi kurulumdan sonra |
| Müşteriler | Ortak müşteri havuzu kullanılır; satış siparişleri kişiye göre ayrılır | Müşterilerin de satıcıya özel olması istenirse sahiplik kuralı ayrıca eklenmeli |
| Fiyat/iskonto | Satır %/TL, ardından genel iskonto, ürün bazında KDV, kuruş hesabı | Bayi fiyat listesi ve iskonto üst sınırları iş kuralı gerektirir |
| Üretim | Tek ortak hat, ürün kapasitesi, günlük doluluk, teslim riski var | Diğer ürünlerin günlük adetleri; duruş/arıza ve malzeme bekleme için ayrı kayıtlar |
| Sevkiyat | Gönderilen adet ve geçmiş kaydı var | Kargo/araç, takip no, teslim alan ve gerçek teslim teyidi; sevk edildi ile müşteriye teslim edildi ayrı durumlara dönüşmeli |
| Stok | Tek depo, stok ayırma, sayarak üretim kabulü, yönetici onaylı sayım var | Hammadde, reçete, barkod ve iade henüz yok |
| Finans | Sipariş toplamları ve CSV var | Ödeme/tahsilat, cari bakiye, vade ve iade henüz yok; sipariş toplamı tahsilat değildir |
| Raporlama | Durum, tarih, arama ve toplamlar var | Satıcı/ürün/ay bazında satış, gecikme ve üretim performansı raporları |
| Bildirim | Ekranda kayıt/uyarı mesajı var | Onay bekleyen ve geciken işler için uygulama içi bildirim; dış mesaj gönderimi ayrıca yapılandırılmalı |
| Yedek | Dosya yedeği ve boş sisteme kontrollü aktarım var | Otomatik günlük yedek ve geri yükleme tatbikatı merkezi kurulumdan sonra |
| Veri hacmi | Küçük ekip için tek çalışma alanı, 2 MB kayıt sınırı var | Kayıtlar büyümeden sipariş/ürün/görselleri ayrı veritabanı tabloları ve depolamaya ayırmak |

Önerilen sıra: şirket bilgileri ve ürün kapasitelerini doldurmak; sevkiyat/teslim teyidini iyileştirmek; satış/üretim raporlarını eklemek; ardından iş ihtiyacına göre hammadde ve tahsilat modülleri. Supabase kurulumu kullanıcının isteğiyle sonraya bırakılmıştır.

## Kontrol kapsamı ve sınırlar

87 otomatik test ile yetkiler, şirket kaydı, yedek, çıktı güvenliği, iskonto, kapasite ve iş akışları kontrol edildi. Tür kontrolü ve üretim derlemesi geçti. Yerel tarayıcıda örnek PNG yükleme/küçültme, şirket adı ve logo kaydı, dört rolün karşılaması incelendi.

Merkezi Supabase bağlantısı henüz kurulmadığı için çok cihazlı gerçek ekip kullanımı ve gerçek hesap e-postaları doğrulanmış değildir. Deneme kayıtları tarayıcıya özeldir. Mevcut canlı sürüm korunur; bu geliştirmeler önizleme dalında hazırlanır. Kaynak kod ZIP dosyası tarayıcıdaki müşteri/sipariş kayıtlarının yedeği değildir.
