# 0.6.0 deneme rehberi — 13 Ekim 2026

## Bu sürümde denenecekler

1. Deneme alanını açın. Üstteki rol seçiciden **Depo ve Sevkiyat** seçin.
2. **Stok talepleri** ekranından ürün, adet, ihtiyaç tarihi ve gerekçe girin. Bu kayıt henüz stoğu artırmaz ve kapasite ayırmaz.
3. **Yönetici** rolünde aynı talebi açın. Adedi ve tarihi değiştirebilir, kapasite uyarısını değerlendirip onaylayabilirsiniz.
4. **Üretim programı** onaylı stok talepleriyle müşteri siparişlerini aynı hatta planlar. Stok talebinin tarihi depoda ihtiyaç tarihidir; müşteri teslimindeki taşıma günü buna eklenmez.
5. **Üretim** rolünde talebin üretilen adedini bildirin. Parça parça bildirim yapılabilir.
6. **Depo ve Sevkiyat > Depo ve stok** ekranında üretimi sayarak teslim alın. Fiziksel stok ancak bu kabulden sonra artar. Tüm miktar üretilip teslim alınınca talep tamamlanır.

## Belgeler ve numaralar

Her başarılı kayıt işlemi bir belge kaydı oluşturur. Kategori ve yıl için ayrı sıra kullanılır: SIP-2026-000001 sipariş, STT stok talebi, STO stok talebi onayı, URT üretim, DKA depo kabulü, SVK sevkiyat, SAY sayım, SON sayım kararı. Diğer yönetim işlemlerinin de ayrı kategorileri vardır.

Ekrandaki işlem belgesi, PDF ve işlem geçmişi aynı numarayı taşır. İlişkili talep/sipariş/üretim numarası belgede ayrıca gösterilir. Başarısız işlem numara tüketmez; aynı sunucu isteğinin tekrar gönderilmesi ikinci belge oluşturmaz. Yıl değişince ilgili kategorinin sayacı yeniden 1'den başlar.

İşlem anındaki içerik ve şirket bilgileri değişmeyen bir belge kaydı olarak saklanır. PDF işlemden sonra tarayıcıda hazırlanır; **Belgeler** ekranından tekrar oluşturulabilir. Daha sonra fiyat veya logo değiştirmek eski belgeyi değiştirmez. PDF ikili dosyaları ayrı bulut deposuna arşivlenmez; belge kayıtları JSON yedeğine dahildir. Eski sürüm kayıtları geriye dönük yeni numara almaz; mevcut yazdırma seçenekleri korunur.

**PDF indir** bilgisayara kaydeder. **Paylaş · WhatsApp / e-posta**, cihazın dosya paylaşımı destekleniyorsa uygulama seçicisini açar. Desteklenmiyorsa PDF indirilir; WhatsApp veya e-postaya dosya eki olarak kullanıcı ekler. Sistem kendiliğinden alıcıya mesaj göndermez. Bunlar işlem raporlarıdır; e-fatura/e-irsaliye entegrasyonu değildir.

Satıcı yalnızca kendi sipariş belgelerini görür. Üretim ve depo rolleri kendileriyle ilgili operasyon belgelerini görür; satış fiyatlarını görmez.

## Bilgisayardan Excel ürün yükleme

**Yönetici > Ürünler > Excel şablonunu indir** yolunu kullanın. Dosyanın **Ürünler** sayfasını doldurun, `.xlsx` olarak kaydedin, **Excel dosyası** düğmesiyle seçin. Önizlemeyi kontrol edip **ürünleri kaydet** düğmesine basın. Tek bir satır hatalıysa tüm yükleme durur; kısmi kayıt yapılmaz.

| Sütun | Örnek | Kural |
|---|---|---|
| Sıra | 1 | Pozitif tam sayı |
| Stok Kodu | SCC22 | Benzersiz kod; hücre biçimi Metin |
| Ürün Adı | 2 + 2 Çift Çıkışlı Merdiven | Ürün açıklaması |
| Birim Fiyat | 1360,50 | KDV hariç TL; yalnızca sayı |
| KDV | 20 | 20 yazın; % işareti/yüzde hücre biçimi kullanmayın |
| Günlük Kapasite | 150 | Tam gün yalnız bu ürün üretilirse adet; bilinmiyorsa boş |
| Üretim Birimi | Ortak üretim hattı | Uygulamadaki birim adı; tek hat varsa boş kalabilir |

Başlıkları değiştirmeyin; örnek ORNEK01/ORNEK02 satırlarını silin veya kendi ürünlerinizle değiştirin. Formülleri önce değer olarak yapıştırın. Baştaki sıfırların korunması için stok kodu metin olmalı. Aynı stok kodu mevcut ürünü günceller ve arşivdeyse aktif eder; eski sipariş fiyatları değişmez. Boş kapasite mevcut kapasiteyi silmez. Depo adedi bu dosyayla girilmez; **Stok Sayımı** kullanılır.

Dosya en fazla 5 MB, 10.000 ürün satırı olabilir. Çalışma alanının toplam 2 MB sınırı da geçerlidir; katalog ve belge toplamı bu sınırı aşarsa işlem kaydedilmez ve mevcut kayıtlar korunur.

## Doğrulama ve sınırlar

103 otomatik kontrol, tür kontrolü ve üretim derlemesi geçti. Yerel tarayıcıda depocu talebi → yönetici onayı → 10 adet üretim → 10 adet depo kabulü denendi. Stok 101'den 111'e, satılabilir miktar 0'dan 10'a çıktı; eski kabul bekleyen 4 adet korunuyor. Depo kabul PDF'si indirilip Türkçe karakterleri, logo ve bağlantılı numaraları kontrol edildi. Excel şablonundaki iki örnek ürün tarayıcıdan yüklenip doğru fiyat ve kapasiteyle kaydedildi. Uzun PDF tablosu 13 sayfada taşmadan oluştu.

Supabase kurulumu ertelendiği için bu sürümdeki deneme verileri yalnızca kullanılan tarayıcıda saklanır. Farklı telefonlar henüz aynı kayıtları paylaşmaz. Gerçek ekip kullanımı, merkezi kurulum ve gerçek hesaplarla kabul testlerinden sonra başlayacak. Mağaza uygulaması/PWA ve müşteri girişi sonraki aşamadadır.
