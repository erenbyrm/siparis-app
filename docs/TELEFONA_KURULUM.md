# Telefona kurulum — 0.7.0

15 Ekim 2026. Uygulamada Menü → Telefona kur bölümünü açın. Giriş ekranında da kurulum açıklaması bulunur.

## iPhone / iPad

Safari ile HTTPS bağlantısını açın. Paylaş → Ana Ekrana Ekle seçin. Görünüyorsa Web Uygulaması Olarak Aç seçeneğini açık tutup Ekle seçin.

## Android / tablet

Chrome ile HTTPS bağlantısını açın. Kurulum düğmesi sunulursa kullanın; aksi halde Chrome menüsünden Uygulamayı yükle / Ana ekrana ekle seçin.

## Kullanım sınırları

- Ana ekran adı Mobil Sipariş, simge genel uygulama simgesidir. Şirket adı ve logosu uygulama içeriğini kişiselleştirir.
- Bilgisayardaki 127.0.0.1 adresi telefonda çalışmaz. Kalıcı kullanım için sabit HTTPS adresi gerekir. Vercel deneme bağlantısı Vercel hesabıyla giriş isteyebilir.
- Kurulum cihazlar arasında veri eşitlemez. Supabase ertelendi; demo verileri ilgili tarayıcı ve internet adresinde kalır. Adres değiştirmeden önce Yedekleme bölümünden yedek alın.
- Gerçek ekip işlemleri için internet gerekir. Bağlantısız işlem kuyruğu yoktur. Sonucu belirsiz işlemi tekrar yapmadan önce kaydı kontrol edin.
- Bağlantısız ekran ilk başarılı çevrimiçi ziyaretten sonra kullanılabilir. Yalnızca genel simgeler ve bu ekran önbelleğe alınır; siparişler, API yanıtları ve PDF belgeleri alınmaz.
- Güncelleme açık formu zorla kapatmaz. Bildirim görünürse işinizi tamamlayıp bütün uygulama pencere ve sekmelerini kapatın, yeniden açın.

## Doğrulama

107 otomatik test, TypeScript kontrolü ve üretim derlemesi geçti. Yerel üretim sürümünde kurulum sayfası görüntülendi; sunucu durdurulduktan sonra bağlantısız ekranın açıldığı tarayıcıda doğrulandı. Gerçek iPhone/Android cihaz kurulumu ve merkezi çok kullanıcılı kabul testi henüz yapılmadı.

Apple: https://support.apple.com/en-eg/guide/iphone/iphea86e5236/ios
