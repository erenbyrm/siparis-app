# Kurulum ve kabul durumu

Son güncelleme: 20 Ekim 2026. Uygulama 0.9.3.

## Tamamlanan

- Ön izleme dalı: codex/order-workflow-v2. Ana yayınla birleştirilmedi.
- Ayarlar stil eksikliği 0.9.1'de düzeltildi; iki stil dosyasının yayımlanan kaynakla eşleşmesi kontrol edildi. Kişisel / Şirket ve ekip / Tanımlar / Veri ve kayıtlar grupları; telefon ve bilgisayar görünümü.
- 130 otomatik test ve üretim derlemesi. Yerel tarayıcıda sipariş, müşteri onayı, toplu yönetici onayı, üretim, depo kabulü, sevkiyat, PDF indirme ve görünüm tercihleri denendi.
- Kullanıcı geçiş öncesi yedeğin indiğini bildirdi.
- Kullanıcı Supabase SQL Editor'de 002_record_storage.sql çalıştırdı; sonuç “Success. No rows returned”.
- Kullanıcının gerçek uygulama ekranında kayıt bazında merkezi depolama etkin; 0,03 MB / 32 MB uygulama sınırı; 32 ürün, 0 sipariş, 0 müşteri görüldü. Bu, ikinci cihazdan yazma/senkronizasyon testi değildir.
- 0.9.2: 401/403 ile çalışma alanı ekrandan kaldırıldığında bilinen veri sürümü de sıfırlanır. İzin/oturum yeniden düzeldiğinde yalnız “değişmedi” yanıtıyla boş ekranda kalmak yerine tam veri alınır.

## 20 Ekim ek kullanıcı doğrulaması

- Kullanıcı geçiş sonrası güncel yedeğin indiğini bildirdi.
- Aynı hesaptan telefonda 32 ürünün göründüğü bildirildi.
- Telefonda oluşturulan TEST — Senkronizasyon müşterisi bilgisayara geldi; bilgisayarda eklenen not telefonda görüldü. Kullanıcı test müşterisini arşivlediğini bildirdi. Böylece gerçek iki cihazda iki yönlü kayıt güncellemesi kullanıcı beyanıyla doğrulandı.
- Ana ekrana kurulumun daha önce yapıldığı ve açık/karanlık görünüm kontrolünün tamamlandığı kullanıcı tarafından bildirildi.
- PDF paylaşım kontrolü sırasında belgelerin sadeleştirilmesi istendi. 0.9.3 yalnız sipariş/depo siparişi/üretim/kabul/sevkiyat fişlerini korur. Gerçek telefon PDF paylaşımı ve yazdırma henüz doğrulanmadı.
- Vercel Toolbar kapatma API isteği bağlı hesapta 404 döndü; kalıcı kapatma için kullanıcı proje ayarına erişmeli.

## Sonraki kullanıcı kontrolü

1. Uygulamayı yenileyip Belgeler menüsünde yalnız beş iş belgesi kategorisinin göründüğünü doğrulayın. Yeni SQL çalıştırmak gerekmez.
2. Vercel projesi → Settings → General → Vercel Toolbar altında Preview ve Production seçeneklerini Off yapıp kaydedin.
3. Gerçek telefonda bir iş belgesinin PDF açma/indirme/paylaşım ve gerekiyorsa yazdırma seçeneklerini deneyin. Kimseye mesaj gönderilmesi gerekmez; paylaşım penceresinin açılması kontrol edilebilir.

## Erişim sınırları

Agent gerçek kullanıcı parolasıyla oturum açmadı ve doğrudan Supabase'e bağlanmadı. Korumalı Vercel API erişimi 403 verdi; yayın sonucu GitHub'daki Vercel kontrolünden doğrulanır. Ön izleme erişim koruması değiştirilmedi. Otomatik yedek zamanlaması veya ücretli hizmet kurulmadı.
