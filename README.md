# Mobil Sipariş 0.2.0

Satış teklifi → müşteri onayı → yönetici onayı → üretim → kısmi/tam sevkiyat.

**Durum:** Yerel deneme ve otomatik kontroller tamamlandı. Supabase hesabı/veritabanı henüz kurulmadı. Gerçek ekip kullanımı için [kurulum rehberini](docs/KURULUM.md) uygulayın; canlı kabul testleri geçmeden eski sürümün yerine almayın.

## Hazır olanlar

- Tam sayı miktarlar, kısmi sevkiyatta doğru durum, üretim/sevkiyat miktar tutarlılığı.
- Değişmeyen ürün kimliği, stok kodu kontrolü, arşivleme, Türkçe ve kısmi ürün araması.
- Ürün bazında KDV, kuruş bazında iskonto dağıtımı, güvenli yazdırma ve CSV.
- Müşteri kaydı, sipariş taslağı, tarih/durum araması, işlem geçmişi.
- JSON yedek, eski v20 kayıtlarını kontrol ederek aktarma; eski parolalar aktarılmaz.
- Supabase Auth + sunucuda rol kontrolü + özel PostgreSQL şeması için hazır altyapı.
- Eşzamanlı değişiklikte sürüm kontrolü ve aynı istek kimliğiyle tekrar gönderimde çift işlem engeli.
- Ayrı ve açıkça etiketlenmiş yerel deneme alanı.

## Bilgisayarda çalıştırma

Node.js 24 ve pnpm 11.19.0 ile doğrulandı. Node.js en az 22.12 gerekir.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

http://127.0.0.1:5173 adresinde **Deneme alanını aç** düğmesini kullanın. Bu mod cihazlar arasında paylaşılmaz. `pnpm dev` yalnızca arayüz sunucusudur; `/api/workspace` için Vercel önizlemesi gerekir.

```sh
pnpm test
pnpm build
```

Build, testleri ve TypeScript kontrolünü de çalıştırır. Testler hosted Supabase bağlantısı gerektirmez. API testleri gerçek HTTP işleyicisini sahte Auth/DB sınırlarıyla çalıştırır; gerçek PostgreSQL testi sayılmaz.

## Dosyalar

- [Kurulum ve size kalan işler](docs/KURULUM.md)
- [Değişiklikler ve doğrulama](docs/SURUM_NOTLARI.md)
- [Veritabanı kurulumu](database/001_workspace.sql)
- [Eski sürümden veri çıkarma](scripts/export-legacy.js)
- `.env.example`: gerekli dört değişken; gerçek değerleri GitHub'a koymayın.

## Mimari ve sınırlar

Tarayıcı → Vercel `/api/workspace` → doğrulanmış Supabase kullanıcısı → sunucu rol kontrolü → PostgreSQL işlemi. İş verileri Supabase'in genel REST API'sine açık değildir. `DATABASE_URL` yalnızca sunucudadır. İlk yönetici yalnızca doğrulanmış `BOOTSTRAP_ADMIN_EMAIL` hesabıdır.

Küçük ekip başlangıç mimarisidir: çalışma alanı tek JSON kaydıdır, yazmalar kilitlenerek sıralanır, açık ekran 15 saniyede bir yenilenir. Büyük veri/ekip için tabloların ayrılması, sunucu sayfalaması ve yük testi gerekir. Çevrimdışı merkezi kayıt yoktur. Çalışma alanı 2 MB sınırını aşarsa yeni yazma reddedilir; mevcut veri korunur.

JSON aktarımı boş çalışma alanına ürün, müşteri ve siparişleri taşır. Kullanıcı yetkileri ve eski işlem geçmişi geri yüklenmez; siparişler seçilen aktif kişiye bağlanır. Tam felaket kurtarma için Supabase veritabanı yedeği ve ayrı bir geri yükleme denemesi gerekir. JSON dosyası orijinal geçmişi arşiv amaçlı içerir; güvenli saklayın.
