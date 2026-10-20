# 0.9.0 — mobil kullanım, ayarlar ve veri

19 Ekim 2026.

## Günlük kullanım

- Telefon alt menüsünde sık kullanılan işler; Menü içinde Onaylar, Belgeler ve Ayarlar bulunur. Yönetici alt menüsü Siparişler, Üretim, Depo şeklindedir.
- Ayarlar: Görünüm, Hesabım. Yönetici ayrıca Şirket kimliği, Kullanıcılar ve yetkiler, Çalışma takvimi, Ürün ve Müşteri tanımları, Veri ve yedekleme, İşlem geçmişine erişir. Bu araçlar ana menüde yinelenmez.
- Görünüm: Açık / Karanlık / Sistem. Tercih bu cihazda korunur. Kurulum açıklaması yalnızca giriş ekranındadır.
- Şirket kimliğinde logo yüklenince baskın renk seçilir; yönetici renk seçicisinden değiştirebilir. Çok açık ana renkler beyaz düğme yazısının okunması için koyulaştırılır. Uyarı renkleri anlamlarını korur.
- Telefonda ürün adı, üretilecek / kabul bekleyen / sevke hazır / gönderilen adetler ve giriş alanı birlikte görünür. Yönetim listeleri de telefonda kartlara dönüşür. Arama görünür; tarih/durum filtreleri açılır alan içindedir.
- Yakınlaştırmayı engelleyen mobil görünüm ve en az 16 px girişler kullanılır. İşletim sisteminin erişilebilirlik tercihi bu kısıtı geçersiz kılabilir; gerçek Android/iPhone kontrolü ayrıca gerekir.
- Üretim gününe dokununca ilgili günün sipariş sıralı ön izlemesine gidilir. Çalışma takvimi ayarları Ayarlar bölümündedir.

## Yönetici kararları

Onaylar, sipariş / stok üretim talebi / sayım / eksik teslim kararlarını birleştirir. Tümünü seç veya tek tek seç ile en fazla 100 karar tek işlemde uygulanır; daha çok kayıtta sonraki grup alınır. Tarihler her kayıt için ayrı düzenlenir. Kapasite riski kabul kutusu kendiliğinden seçilmez. Adet değiştirilecek stok talepleri kendi ekranından ayrıntılı onaylanır. Reddet seçeneği kayıt altında bulunur. Müşteri onayı satış sürecindedir.

Bir karar geçersizse grup tamamen geri alınır; başarılı grubun her kararı ayrı sıra numaralı belge üretir. Sunucu yetki ve güncel sürüm denetimi devam eder. Eksik teslim onayı yalnız kabul bekleyenden düşer; kabul edilen stok korunur.

Son belge kutusu kaldırıldı. Belgeler menüsünden veya ilgili sipariş, stok üretimi, sayım, eksik teslim, talep ve yönetim kaydı altından PDF açılır, paylaşılır, indirilir. Yazdırma PDF görüntüleyicisinden yapılır. Paylaşım cihaz destekliyorsa sistem penceresini açar; destek yoksa dosya indirerek WhatsApp/e-posta eki olarak gönderilir. Otomatik mesaj gönderilmez. PDF yalnız ilgili belge alanı açılınca hazırlanır.

## Giriş ve veri yükleme

Eş zamanlı giriş/odak yenilemeleri tek okumada birleşir. Geçici okuma sorunu bir kez yeniden denenir; yükleme sürerken eski hata gösterilmez. Çıkış veya hesap değişiminden önce başlayan okumalar yeni hesabı değiştiremez. Yetki hataları gizlenmez. Yazma işlemleri otomatik tekrarlanmaz; belirsiz sonuçta aynı istek kimliği kullanılır.

## Merkezi veri geçişi — yönetici adımı gerekli

Bu sürüm eski depolamayla da çalışır. 20 Ekim 2026: kullanıcı 002 geçişini Supabase SQL Editor üzerinde çalıştırdı. Gönderdiği sonuç “Success. No rows returned”; uygulama ekranı “Kayıt bazında merkezi depolama etkin”, 0,03 MB / 32 MB, 32 ürün, 0 sipariş, 0 müşteri gösterdi. Geçiş ve uygulamanın yeni depolamayı okuyabildiği bu ekranlarla doğrulandı. Agent doğrudan veritabanına bağlanmadı. Aşağıdaki adımlar yeni kurulumlar içindir; mevcut projede yeniden uygulanması gerekmiyor.

1. Önce 0.9.0 ön izleme yayını hazır olsun; uygulamadan güncel JSON yedeğini indirin.
2. Kullanılan Supabase test projesinde SQL Editor açın. `database/002_record_storage.sql` dosyasının tamamını yeni sorguya yapıştırıp Run seçin. İlk kurulumdaki 001 aynı projede önceden çalışmış olmalı.
3. Uygulamayı yenileyin. Ayarlar → Veri ve yedekleme altında “Kayıt bazında merkezi depolama etkin” ve 32 MB görünmeli.
4. Yönetici ile kayıt oluşturup başka hesap/cihazda güncellemenin geldiğini kontrol edin; yeni yedek indirin.

Geçiş tek işlem içindedir ve tekrar çalıştırılabilir. Önceki çalışma alanı özel `migration_backup` tablosunda kurtarma kopyası olarak tutulur. Bu dosya yetkileri genişletmez; yeni tablolarda RLS ve anonim/normal oturum erişim engeli vardır.

Kayıtlar genel özel tabloda ayrı satırlar halinde saklanır, değişen kayıtlar yazılır. Bu tam ilişkisel ürün/sipariş tablo şeması değildir. Uygulama işlem başına hâlâ tüm çalışma alanını okur ve doğrular. Geçiş sonrası uygulama sınırı 32 MB, eski merkezi yapı ve yerel deneme 2 MB'dır. Bunlar sağlayıcının toplam veritabanı kotası değildir. Büyük yanıtlarda sürüm kontrollü parçalama kullanılır; parçalar arasında veri değişirse karışık veri uygulanmaz. Sınırsız ölçek/çok büyük ERP iddiası yoktur.

## Yedekler

Ayarlar → Veri ve yedekleme, sunucudan güncel veriyi yeniden okuyarak JSON ve SHA-256 bütünlük kontrolü oluşturur. Bu kontrol bozulmayı saptar; şifreleme veya kimlik doğrulama imzası değildir. Eski yedekler uyarıyla okunabilir. Parolalar yedekte bulunmaz; müşteri/iletişim verileri bulunur.

Yerel yönetici aracı: `.env.local` içinde mevcut veritabanı bağlantısı tanımlıyken `pnpm db:backup` çalıştırılır. Varsayılan `private-backups/` klasörü Git ve teslim paketinin dışındadır. Otomatik/zamanlanmış yedek kurulmadı.

Ekrandan aktarım en fazla 4 MB'dır. Daha büyük doğrulanmış yedek için, kayıt bazında depolama etkin ve aktif yöneticisi olan boş hedefte `pnpm db:restore yedek.json yonetici-eposta --confirm-empty-target` kullanılır. Araç var olan iş verisinin üzerine yazmaz; eski hesapların yetkilerini taşımaz. Dosya üst sınırı 40 MB, içe aktarılan çalışma alanı sınırı 32 MB'dır. Gerçek veride bu araç bu oturumda çalıştırılmadı.

## Doğrulama ve kalan kabul

130 otomatik test; gerçek PostgreSQL motorunda (PGlite) 001→002 veri koruma, tekrar geçiş, RLS, yalnız değişen kayıtların yazılması, geri alma, 2 MB üstü veri; API yetki / tekrar istek / sürüm kontrolü; toplu onay atomikliği; eksik kabulde 80 kabul edilen + 20 yeniden üretim; yedek bütünlüğü ve giriş yükleme yarışları doğrulandı.

Yerel tarayıcıda sipariş oluşturma, müşteri onayı, üç kayıt toplu yönetici onayı, üretim, sayarak kabul, sevkiyatla kapanış, PDF indirme, logo yükleme, renk seçimi, açık/karanlık görünüm ve rol bazında Ayarlar denendi. Telefon 360/390 px ve tablet 820 px incelendi; görseller delivery/screens altındadır.

Tamamlanan: kullanılan Supabase'de 002 geçişi, gerçek hesapla yeni depolama/kapasite ekranının okunması ve 32 ürünün varlığının ekran görüntüsüyle doğrulanması. Kullanıcı geçiş öncesi yedeğin indiğini bildirdi. Geçiş sonrası yeni yedeğin indirilmesi henüz doğrulanmadı.

Kalan: gerçek iki cihaz arasında kayıt oluşturma/yenileme senkronizasyonu; fiziksel Android/iPhone kurulum, klavye, paylaşım ve yazdırma kabulü. Korumalı yayının sunucu kayıtlarına bağlantı 403 verdiğinden gerçek sunucu hatasının kök nedeni doğrudan doğrulanamadı. Ana yayın değiştirilmez; çalışma ön izleme dalındadır.
