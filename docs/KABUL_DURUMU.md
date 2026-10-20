# Kurulum ve kabul durumu

Son güncelleme: 20 Ekim 2026. Uygulama 0.9.2.

## Tamamlanan

- Ön izleme dalı: codex/order-workflow-v2. Ana yayınla birleştirilmedi.
- Ayarlar stil eksikliği 0.9.1'de düzeltildi; iki stil dosyasının yayımlanan kaynakla eşleşmesi kontrol edildi. Kişisel / Şirket ve ekip / Tanımlar / Veri ve kayıtlar grupları; telefon ve bilgisayar görünümü.
- 130 otomatik test ve üretim derlemesi. Yerel tarayıcıda sipariş, müşteri onayı, toplu yönetici onayı, üretim, depo kabulü, sevkiyat, PDF indirme ve görünüm tercihleri denendi.
- Kullanıcı geçiş öncesi yedeğin indiğini bildirdi.
- Kullanıcı Supabase SQL Editor'de 002_record_storage.sql çalıştırdı; sonuç “Success. No rows returned”.
- Kullanıcının gerçek uygulama ekranında kayıt bazında merkezi depolama etkin; 0,03 MB / 32 MB uygulama sınırı; 32 ürün, 0 sipariş, 0 müşteri görüldü. Bu, ikinci cihazdan yazma/senkronizasyon testi değildir.
- 0.9.2: 401/403 ile çalışma alanı ekrandan kaldırıldığında bilinen veri sürümü de sıfırlanır. İzin/oturum yeniden düzeldiğinde yalnız “değişmedi” yanıtıyla boş ekranda kalmak yerine tam veri alınır.

## Kullanıcı döndüğünde

1. Gerçek hesapla Ayarlar → Veri ve yedekleme üzerinden geçiş sonrası güncel yedeği indirip öncekinden ayrı saklayın. Bu adım henüz doğrulanmadı.
2. Aynı ekip hesabıyla bilgisayar ve telefondan giriş yapın; 32 ürünü ve aynı kayıtları kontrol edin. Gerçek sipariş oluşturmadan önce örnek işlem için açıkça deneme kaydı seçin.
3. Deneme kaydında müşteri onayı → yönetici onayı → üretim → sayarak kabul → sevkiyat akışını iki cihazla doğrulayın. Yerel deneme alanı merkezi senkronizasyon kanıtı değildir.
4. Gerçek telefonda ana ekrana kurulum, klavye açılırken adet girişleri, görünüm, yakınlaştırma davranışı, PDF paylaşımı ve yazdırmayı deneyin.

## Erişim sınırları

Agent gerçek kullanıcı parolasıyla oturum açmadı ve doğrudan Supabase'e bağlanmadı. Korumalı Vercel API erişimi 403 verdi; yayın sonucu GitHub'daki Vercel kontrolünden doğrulanır. Ön izleme erişim koruması değiştirilmedi. Otomatik yedek zamanlaması veya ücretli hizmet kurulmadı.
