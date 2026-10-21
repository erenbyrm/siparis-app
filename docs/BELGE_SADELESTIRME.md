# 0.9.3 — yalnız iş belgeleri

20 Ekim 2026. Kullanıcı talebi: müşteri/ürün tanımı ve benzeri yönetim işlemleri için PDF gerekmiyor.

Oluşturulan ve Belgeler ekranında listelenen fişler:

- SIP: Sipariş fişi.
- STT: Depo siparişi (stok üretim talebi).
- URT: Sipariş üretim fişi veya depoya üretim fişi. İlgili stok talebi bağlantısı korunur.
- DKA: Sayarak depo kabul fişi.
- SVK: Sevkiyat fişi.

Müşteri ve ürün ekleme/düzenleme/arşivleme, Excel içe aktarımı, kullanıcı/şirket/üretim takvimi ayarları, yedek aktarımı, müşteri/yönetici onayı, teslim tarihi değişikliği, sayım ve eksik teslim kararları ayrı PDF oluşturmaz. İşlem geçmişi, yetki denetimi, onay akışı ve stok hesapları korunur. Tanım ekranlarından belge bölümleri kaldırıldı.

Eski ek belge kategorileri şema ve yedek okumasında desteklenir; numaralar ve eski kayıtlar veritabanından silinmez. Ancak Belgeler ekranında, kategori seçeneklerinde ve ilgili kayıt altındaki PDF listelerinde yalnız yukarıdaki beş tür görünür. Bu değişiklik için SQL geçişi gerekmez.

## Vercel Toolbar

Araç çubuğu uygulama kodunda bulunmuyor; Vercel ön izleme ortamı ekliyor. Kalıcı kapatma: ilgili Vercel projesi → Settings → General → Vercel Toolbar, Preview: Off, Production: Off, Save. Ön izleme erişim koruması değiştirilmemeli.

Resmi rehber: https://vercel.com/docs/vercel-toolbar/managing-toolbar

Bu oturumda aynı proje/takım kimliğiyle enablePreviewFeedback=false ve enableProductionFeedback=false güncellemesi denendi; Vercel API 404 Project not found döndürdü. Proje adıyla okuma da erişemedi. Bu yüzden ayarın kapatıldığı doğrulanmadı; hesap yetkisi olan kullanıcının ayarı yapması gerekir. CLI mevcut değil. Uygulamaya CSS gizleme veya güvenlik politikasını değiştiren bir geçici çözüm eklenmedi.

## Doğrulama

133 test, TypeScript ve üretim derlemesi geçti. Tanım değişikliklerinde PDF/sıra numarası oluşmaması; işlem geçmişinin korunması; sipariş→üretim→kabul→sevkiyat ve depo siparişi→üretim→kabul numaraları; eski belge yedeği uyumluluğu ve filtrelemesi test edildi. Yerel tarayıcıda beş kategorinin kaldığı, eski ek belgelerin listeden çıktığı ve sipariş PDF seçeneklerinin kullanılabildiği doğrulandı.

## v0.9.4 — Telefon ekranındaki araç çubuğu

Platform ayarına erişilemediği için uygulama HTML başlığına yalnız `vercel-live-feedback` özel öğesini gizleyen CSS eklendi. Etiket Vercel resmi feedback.js kaynağından doğrulandı. Sonradan eklenen öğelere de uygulanır; iframe, giriş ve belge görüntüleyicilere dokunmaz. Bu görsel gizlemedir; Vercel proje ayarını kapattığımız anlamına gelmez. Telefonda açık eski sayfa tamamen kapatılıp yeni sürüm yeniden açılmalıdır.
