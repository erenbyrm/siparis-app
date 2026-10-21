[Güncel kurulum/kabul durumu — 21 Ekim 2026](docs/KABUL_DURUMU.md). Kullanılan test projesinde 002 geçişi tamamlandı; yeniden çalıştırmanız gerekmiyor.

## 0.9.0 güncellemesi

[Ayarlar, mobil kullanım, toplu onay ve veri geçişi](docs/AYARLAR_MOBIL_VE_VERI.md). Kayıt bazında 32 MB depolama geçişi tamamlanmıştır; `database/002_record_storage.sql` yeniden çalıştırılmamalıdır.

# Mobil Sipariş 0.13.0

Satış teklifi → müşteri onayı → yönetici onayı → üretim → kısmi/tam sevkiyat.

**Durum:** Supabase kayıt depolama geçişi ve iki cihazda veri eşleşmesi kullanıcı tarafından doğrulandı. Güncel geliştirme dalı `codex/order-workflow-v2` dalıdır. SQL geçişlerini yeniden çalıştırmayın. Güncel kabul durumu için [kabul belgesini](docs/KABUL_DURUMU.md) kullanın.

Depo ve stok, yönetici onaylı sayım ve üretim kabulü: [kullanım rehberi](docs/DEPO_VE_SAYIM.md).

## Hazır olanlar

- Tam sayı miktarlar, kısmi sevkiyatta doğru durum, üretim/sevkiyat miktar tutarlılığı.
- Değişmeyen ürün kimliği, stok kodu kontrolü, arşivleme, Türkçe ve kısmi ürün araması.
- Ürün bazında KDV, kuruş bazında iskonto dağıtımı, güvenli yazdırma ve CSV.
- Müşteri kaydı, sipariş taslağı, tarih/durum araması, işlem geçmişi.
- JSON yedek, eski v20 kayıtlarını kontrol ederek aktarma; eski parolalar aktarılmaz.
- Supabase Auth + sunucuda rol kontrolü + özel PostgreSQL şeması için hazır altyapı.
- Eşzamanlı değişiklikte sürüm kontrolü ve aynı istek kimliğiyle tekrar gönderimde çift işlem engeli.
- Ayrı ve açıkça etiketlenmiş yerel deneme alanı.
- Kullanıcı hesabına kaydedilen Türkçe, Arapça, İngilizce ve Almanca arayüz; Arapçada sağdan sola yerleşim.

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
- `.env.example`: gerekli ortam değişkenleri; gerçek değerleri GitHub'a koymayın.

## Mimari ve sınırlar

Tarayıcı → Vercel `/api/workspace` → doğrulanmış Supabase kullanıcısı → sunucu rol kontrolü → PostgreSQL işlemi. İş verileri Supabase'in genel REST API'sine açık değildir. `DATABASE_URL` yalnızca sunucudadır. Doğrulanmış `BOOTSTRAP_ADMIN_EMAIL` ve `RECOVERY_ADMIN_EMAIL` adresleri aynı kanonik EREN BAYRAM / ADMİN uygulama hesabına bağlanır.

Küçük ekip başlangıç mimarisidir: veriler kayıt bazında saklanır, yazmalar kilitlenerek sıralanır ve açık ekran 15 saniyede bir yenilenir. Büyük veri/ekip için sunucu sayfalaması ve yük testi gerekir. Çevrimdışı merkezi kayıt yoktur. Kayıt depolama modunda çalışma alanı 32 MB uygulama sınırına ulaşırsa yeni yazma reddedilir; mevcut veri korunur.

JSON aktarımı boş çalışma alanına ürün, müşteri ve siparişleri taşır. Kullanıcı yetkileri ve eski işlem geçmişi geri yüklenmez; siparişler seçilen aktif kişiye bağlanır. Tam felaket kurtarma için Supabase veritabanı yedeği ve ayrı bir geri yükleme denemesi gerekir. JSON dosyası orijinal geçmişi arşiv amaçlı içerir; güvenli saklayın.

Ürün bazında iskonto, takvimli teslim onayı ve ortak hat doluluğu: [kullanım rehberi](docs/URETIM_VE_ISKONTO.md).

Numaralı PDF, stok üretim talepleri ve Excel yükleme: [0.6.0 deneme rehberi](docs/BELGELER_STOK_TALEPLERI_EXCEL.md).


Telefona kurulum: [rehber](docs/TELEFONA_KURULUM.md).

Mobil ürün kartları ve eksik kabul: [rehber](docs/MOBIL_VE_EKSIK_KABUL.md).
