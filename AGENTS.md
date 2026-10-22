# Codex / AI geliştirici talimatı

**Mutlaka oku ve uygula:** [Dört uygulamalı ana şartname](docs/SAAS_4_UYGULAMA_KAPSAM.md).

Bu repo içinde çalışma dalı: `operasyon-gelistirme`. Mevcut çalışan ürün 0.13.0, güncel kod tabanı `codex/order-workflow-v2` kökenlidir; `main` güncel uygulama değildir.

**Ayrı iş uygulamaları:** **Operasyon**, **Finans**, **İnsan Kaynakları (İK)**, **Müşteri Portalı (MP)** = **4 bağımsız ticari iş uygulaması**. Eski özel şirket markası artık uygulama adı veya önek olarak kullanılmaz. Hepsini tek uygulama menüsüne, tek `App.tsx` dosyasına veya dört sekmeye doldurma. Bağımsız UI, giriş noktası, yetki ve deploy hedefleri; ortak kimlik/tenant/paylaşılan paketler.

**Beşinci yönetim ekranı — talep edildi:** Şirketleri, hangi uygulamaları kullanabildiklerini ve platform yetkilerini idare edecek **ayrı Platform Yönetimi** arayüzü. Güvenli, mobil uyumlu, tarayıcıdan kullanılan ayrı **web uygulaması** önerildi ancak sunum biçimi **kullanıcı onayı bekliyor** (ana şartname Karar 43). Statik bilgi sitesi değil. Platform adminin şirket maaş/risk/finans/sipariş verisini sırf platform rolüyle görmesi yasak. Ana dört ticari modül ayrılığı ve Faz 1 öncelikleri korunur.

**Sıfır veri/fonksiyon kaybı:** Operasyon'un mevcut işlevlerini, mobil kolaylığını, PDF/Excel, 4 dil, kullanıcılarını ve canlı verisini koru. Özellik silme veya iş akışı basitleştirme yok.

**Platform ADMİNİ** sadece platform/şirket/modül/yetki yönetir; sırf bu rolle şirket ticari/maaş/risk verisine erişmez.

**İlk görev:** mevcut kodu incele; Faz 1'in güvenli iskeletini ve tenant/rol/onay temellerini ayrı app entrypoint'leriyle uygula, otomatik testleri koru ve artır. Kullanıcı onayı olmadan production deploy, canlı veri şeması mutasyonu, SQL yeniden çalıştırma yok. `database/002_record_storage.sql` daha önce uygulanmış, tekrar çalıştırma.

Doğrulama: `pnpm test` + `pnpm check` + `pnpm build`. Kabul, güvenlik, migration/rollback raporla. Kodlamaya başla; yalnız tavsiye metniyle yetinme. Açık ürün kararlarını yıkıcı varsayımlarla doldurma.
