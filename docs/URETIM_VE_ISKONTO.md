# Ürün iskontosu ve üretim planı — 0.3.0

Sipariş sepetinde her ürün için yüzde veya TL iskonto girilebilir. TL tutarı satırın tamamından düşer. Önce ürün iskontoları, sonra kalan tutardan genel iskonto, ardından ürünün KDV'si hesaplanır. Sipariş detayları ve yazdırma çıktısı iki iskontoyu ayrı gösterir.

Yönetici onayında takvimden **müşteriye teslim tarihi** seçilir. Sistem üretim ve çıkışın en geç hangi gün yapılması gerektiğini, mevcut kapasiteye göre tahmini teslimi gösterir. Kapasite eksikse veya bir sipariş gecikecekse açık uyarı ve yönetici kabulü gerekir. Açık, onaylı siparişin teslim tarihi sonradan değiştirilebilir; işlem geçmişine kaydedilir.

## Sizin çalışma düzeniniz

- Tek ortak üretim hattı; tüm ürünler aynı günlük kapasiteyi paylaşır.
- Pazartesi–cuma çalışma; cumartesi/pazar kapalı.
- Hazır ürünün aynı gün çıktığı varsayılır; teslimat sonraki iş günüdür. Cuma çıkış pazartesi teslim olur.
- SCC22 tam kapasite: 150 adet/gün. Yeni deneme alanında bu değer hazırdır. Önceden kaydedilmiş katalogda Ürünler ekranından bir kere girilmelidir.
- Diğer ürünlerin kapasitesi bilinmiyor; uydurma değer atanmaz. Ürünler ekranından her birinin yalnız başına bir tam günde üretilebilen adedini girin.

## Doluluk nasıl okunur?

75 SCC22 / 150 = %50 hat doluluğu. Aynı gün başka ürün için de kendi günlük kapasitesine göre hesaplanan pay eklenir. Örneğin 225 SCC22, boş bir hatta ilk iş günü %100 ve sonraki iş günü %50 kapasite kullanır.

Önce teslim tarihi yakın olan onaylı siparişler planlanır. Günlük görünümde planlı ve üretilmiş adetler ayrı gösterilir. Bugün yapılan üretim, sipariş sevk veya iptal edilse bile bugünün kapasitesini tüketir. Hazır ve gönderilmiş ürünler gelecekteki kapasiteyi tüketmez.

Takvim 120 gün ileri hesaplanır. Bu bir tam gün kapasite tahminidir; vardiya saati, kalıp değişimi, arıza ve hammadde beklemesini otomatik modellemez. Geçmiş sürümdeki hazır miktarlar için üretim zamanı bilinmediğinden ilk gün doluluk eksik hesaplanabilir. Eksik kapasitesi/tarihi olan satırlar oranlara dahil edilmez ve açıkça listelenir. Resmî tatiller otomatik yüklenmez; Çalışma takvimi bölümüne kapalı tarihleri ekleyin.

## Kontrol ve kullanım durumu

67 otomatik test: ürün/genel iskonto, KDV ve kuruş hesabı, ortak hat, hafta sonu/tatil, cuma–pazartesi teslim, üretim kaydı, kapasite riski, roller ve yedek uyumluluğu dahil. Yerel tarayıcıda iskonto, ürün kapasitesi, tarihli onay ve %100/%50 plan dağılımı doğrulandı.

Bu özellikler yerel deneme ve geliştirme dalındadır. Merkezi ekip kullanımı için KURULUM.md içindeki Supabase kurulumu ve gerçek hesaplarla iki cihaz testi tamamlanmalıdır. Kaynak kod arşivi tarayıcıdaki sipariş kayıtlarının yedeği değildir.
