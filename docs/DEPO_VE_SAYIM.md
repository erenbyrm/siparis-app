# Depo, stok ve sayım — 0.5.0

9 Ekim 2026. Tek depo kullanılır. Sevkiyat görevinin adı **Depo ve Sevkiyat** olarak genişletildi.

## İlk stok girişi ve dönem sayımı

1. Eski sürümden gelen açık siparişlerin hazır ürünleri varsa önce Siparişler bölümünde sayarak depoya teslim alın. Bunlar otomatik fiziksel stok sayılmaz; depo kabulü bekler.
2. Depocu Stok Sayımı bölümünde raflardaki toplam gerçek adedi yazar. Siparişe ayrılmış ama henüz gönderilmemiş ürünler de toplamın içindedir. Henüz teslim alınmamış üretim ayrı tutulur.
3. Boş bırakılan ürün değişmez; 0 depoda hiç bulunmadığını belirtir. Açıklama zorunludur. Birden çok ürün birlikte onaya gönderilebilir.
4. Yönetici aynı ekranda önceki miktarı, sayılan miktarı, farkı, kişiyi ve açıklamayı görüp onaylar veya reddeder. Onaydan önce stok değişmez.
5. Sayımdan sonra kayıtlı stok değişirse onay engellenir: sayım reddedilip yeniden sayılır. Sayım sonucu ayrılan stoktan azsa yönetici ilgili siparişte “Siparişe ayrılan stoğu düzelt” bölümünden gerekçeyle ayırmayı azaltır; sonra sayımı onaylar. Fiziksel stok bu ayırma işlemiyle değişmez; siparişin karşılanacak ihtiyacı artar.

Sayım formundaki arama değişince girişler korunur; sayfadan ayrılmadan onaya gönderin. Form taslağı sayfa yenileme veya menü değiştirme sonrasında saklanmaz.

## Sipariş, üretim ve sevkiyat

- Yönetici siparişi onaylayınca kullanılabilir stok siparişe ayrılır. Müşteri onayı tek başına stok ayırmaz. Aynı stok iki siparişe ayrılamaz.
- Sonradan stoğa giren ürünler açık onaylı siparişte “Mevcut stoktan ayır” ile kullanılabilir.
- Üretim yalnızca eksik miktara göre planlanır. Tamamlanan üretim depoya bildirilir; bu bildirim tek başına stok oluşturmaz.
- Depocu ürünleri sayar, “Depoya alınan” adedini girip teslim alır. Kısmi kabul mümkündür; kalanı kabul bekler. Siparişe bağlı kabul edilen ürün o siparişe ayrılır.
- Gönderilecek adet kaydedilince hem fiziksel stok hem ayrılan adet azalır. Kalan ürün varsa sipariş kapanmaz.
- Siparişten bağımsız tamamlanan üretim Depo ve stok ekranında kaydedilir. Depocunun kabulünden sonra satılabilir stok olur. Bugün tamamlanan bu üretim ortak hattın günlük doluluğuna dahil edilir.
- İptal edilen siparişin ayrılmış stoğu serbest kalır. Depo kabulü bekleyen ürün varsa önce sayarak teslim alınmalıdır. Kısmen gönderilmiş sipariş iptal edilemez.

Depoda toplam = kabul edilen üretim + onaylı sayım farkları − sevkiyatlar. Satılabilir = depoda toplam − açık siparişlere ayrılan miktar.

## Yetkiler ve izlenebilirlik

Depocu sayım, depo kabulü ve sevkiyat yapar; sayım sonucunu yalnızca yönetici onaylar. Üretim çalışanı üretim bildirir. Satıcı kendi siparişlerini ve ortak stok özetini görür; diğer satıcıların siparişlerini, depo hareketlerini ve sayım kayıtlarını görmez. Üretim ve depocu fiyat görmez. İşlemler kim ve ne zaman bilgisiyle kaydedilir. Depo kayıtları JSON yedeğine dahildir.

## Kontroller ve sonraki ihtiyaçlar

87 otomatik test, tür kontrolü ve üretim derlemesi geçti. Yerel tarayıcıda depocunun sayım gönderimi → yönetici onayı → stok ayırma → 10 adet üretim bildirimi → 6 adet kabul → 5 adet sevkiyat denendi: başlangıç 100 stok sonunda 101 fiziksel, 101 ayrılmış ve 4 kabul bekleyen oldu. Telefon genişliğinde sayfa taşması görülmedi; geniş tablolar kendi içinde yatay kaydırılır.

Henüz hammadde/reçete, raf/lot/seri, barkod, iade, üretim firesi ve teslim eksikliği kapatma akışı yok. Stok için gelecekteki üretim iş emri henüz planlanmaz; burada tamamlanmış stok üretimi bildirilir. “Tamamlandı” tüm ürünlerin sevk edildiğini ifade eder; müşterinin gerçek teslim teyidi ayrı bir sonraki geliştirmedir.

Supabase kurulumu kullanıcının isteğiyle ertelendi. Deneme verileri yalnızca ilgili tarayıcıdadır; gerçek çok cihazlı ekip çalışması henüz devrede değildir. Tek çalışma alanının 2 MB kayıt sınırı vardır. Kaynak kod ZIP dosyası işletme verisi yedeği değildir; gerçek kayıtlar Yedekleme ekranından ayrıca indirilir.
