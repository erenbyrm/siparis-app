# Finans — Çok Şirketli Finans Yönetimi ve Muhasebe Entegrasyonu

Tarih: 2026-10-23
Durum: **Karar 44 onaylandı** — Bağımsız kullanım + mevcut muhasebe yazılımı entegrasyonu her şirketçe seçilebilir; ayrıntıdaki aktarım yönleri/bağlantı yöntemi ayrıca onay bekliyor.
Bağlı ana belge: [İş Uygulamaları Platformu Ana Şartnamesi](SAAS_4_UYGULAMA_KAPSAM.md).

## 1. Karar 44 — Finans iki çalışma biçimini de desteklemeli (C ONAYLANDI)

**Kesin kullanıcı kararı:** Her şirket Finans uygulamasını ister **kendi cari/ödeme/tahsilat/banka ve diğer finans kayıtlarını yöneten bağımsız uygulama** olarak, ister **Zirve Ticari veya diğer uyumlu ticari muhasebe sistemleriyle entegre** çalışacak şekilde kullanabilir. Bu tercih platform düzeyinde herkese zorunlu tutulmaz. Bir şirket sonradan çalışma biçimini güvenli, onaylı veri geçişi ile değiştirebilir. **Aynı finans hareketi iki kez kaydedilmemeli.**

### İki kullanım biçimi

**F1 — Bağımsız Finans:**
- Şirketin yetkili Finans kullanıcıları kendi cari kartlarını, tahsilat/ödeme, banka/kasa/kredi kartı/POS, çek-senet, belge ve gider kayıtlarını izin sınırlarına göre oluşturur ve düzenler.
- Finans, kendisi tarafından oluşturulan finans hareketleri için açık kayıt/olay kimliği ve birincil ticari veri kaynağı olabilir; ancak e-fatura, e-defter, vergi beyannamesi, resmî muhasebe fişleri gibi alanlarda yasal sistemin yerine geçtiği kullanıcıya **iddia edilmez**. Hangi resmî belge özelliğinin bulunacağı ayrıca entegrasyon/mevzuat çalışmasına bağlı.
- Cari bakiyeler belge ve hareketlerden hesaplanır; ekstre/yaşlandırma/ödemeler makul doğruluk kontrollerinden geçer. Çift işlem, ters kayıt ve düzeltme süreçleri denetlenebilir.

**F2 — Muhasebe Entegre Finans:**
- Şirket muhasebe uygulamasını/sağlayıcıyı ve hangi nesnelerin **kayıt otoritesi** olduğunu tanımlar. Her veri türü için bağımsız kaynağa karşı entegre sistemden gelen kayıtların hangi tarafça oluşturulup hangisince güncelleneceği belirlenir.
- Olası veri kümeleri: cari kartları, fatura/borç/alacak hareketleri, tahsilat/ödeme, banka hareketi, çek/senet, masraf ve masraf merkezi, belge numarası, kapanmış muhasebe dönemi. Modül/alan bazında sistemler arası ortak veri modeli tanımlanır.
- Bağlantı yalnız **entegrasyon sağlayıcısının belgelenmiş ve yetkilendirilmiş erişimi varsa** doğrudan API olabilir; API yoksa veya sınırlıysa **izinli CSV/Excel dosya içe/dışa aktarma** ile başlayabilir, uygun resmî dosya/servis arabirimleri değerlendirilebilir. Kullanıcı tarafından onaylanmamış entegrasyon kabiliyeti icat edilmez, Zirve'nin herkese açık zorunlu API'sı varmış gibi varsayılmaz.
- Kaynağı belirsiz, hatalı veya eşleştirilemeyen kayıt otomatik kalıcı finans hareketi oluşturmaz; **import önizleme, hata satırı, manuel eşleme, işleme alma onayı, mutabakat ve denetim** kurallarına tabidir.
- F2, gerçek kayıtları mevcut sistemden alıp Finans'ta operasyonel raporlayan **tek yönlü** yapı da olabilir; çift yönlü senkronizasyon ise ayrıca entegrasyon sözleşmesi, geri alma ve çakışma çözümü olmadan devreye alınmaz.

## 2. Çift kayıt önleme ve kayıt sahipliği — zorunlu

- Her işlemde tenant/şirket, gerektiğinde **yasal tüzel kişi**, kaynak sistem kimliği, kaynak kaydı değişmez kimliği, belge türü, belge numarası, tarih, hesap/cari eşleme ve `external_id` tutulur. Sağlayıcı kalıcı ID vermiyorsa kullanıcı gözetiminde (kaynak+belge no+tarih+net tutar+cari vb.) **güvenilir bileşik eşleme** kullanılır; sahte kesin benzersizlik iddiası olmaz.
- **Tekil kaynağa ait işlem anahtarı** ve idempotent içe aktarma/upsert, aynı dış kayıt tekrar işlendiğinde ikinci borç/alacak, ikinci kasa/banka veya ikinci tahsilat yaratmayı engeller. Şüpheli eşleşmeler otomatik birleştirilmez; onaylı karşılaştırma kuyruğuna gönderilir.
- Farklı sistemlerde aynı cari fatura veya tahsilat çift oluşturulmuşsa **kayıt otoritesi** politikası kazanır. Bağımsız Finans'taki eski kayıt birden silinmez; eşleşme bağlantısı, iptal/ters fiş veya doğrulanmış düzeltme ile denetlenebilir mutabakat yapılır.
- Kaynak tarafından silinmiş/değiştirilmiş finans kaydı sessiz silinmez veya üstüne yazılmaz. Belge tarihçesi ve onaylı finans düzeltme kuralları korunur; kapanmış döneme dış senkronizasyon müdahalesi özel yetki/onay olmadan yapılamaz.
- Uyuşmazlık statüleri: `eşleşti`, `yeni`, `çelişki`, `yetersiz bilgi`, `hatalı veri`, `onay bekliyor`, `iptal/ters kayıt`. Her aktarım işinde işlenen, eklenen, güncellenen, atlanan, çakışan/hatalı kayıt sayıları ve satır/sistem kaynakları loglanır.
- F1 ↔ F2 geçişi için **kapanış ve açılış bakiye mutabakatı**, cari ve hesap kodu eşleştirme, önceki işlem kaynağı ve geçiş tarihi, test importu, yedek/geri alma ve yetkili onayı şarttır. İki gerçek kişinin kritik onay ve eşzamanlı gönderim ilkesi devam eder.
- Bir şirkette **iki ayrı resmî tüzel kişilik**, birden fazla şube veya inşaat projesi/iş kolu varsa; bunlar tek bakiyede körlemesine birleştirilmez. Tüzel kişilik arası transfer ile aynı işletmenin departmanlar arası masraf aktarımı farklı finans kayıtlarıdır. Mevzuata uygun defter/entegre kaynağa göre ayrım yapılır.

## 3. Modüller arası rol ve sorumluluk

- **Operasyon:** Sipariş, onay, teslim/irsaliye ve gerçek stok/depo olayı üretir. Finans sipariş tutarını kendi fatura/ödeme hareketi diye otomatik ikinci kez eklemez; ilgili satış tahakkuk olayı ve belge türüyle bağlanır. Üretim ve ürün maliyetlerinden gelen muhasebe maliyeti ile koruyucu ticari fiyatlandırma referansı ayrı tutulur.
- **Finans:** Cari hesap, tahsilat, ödeme, kasa, banka, kredi kartları, POS, çek/senet, vadeler, belge, finansal risk, gider, bütçe, rapor ve gerçekleşen maliyet sistematiğini yürütür.
- **İnsan Kaynakları (İK):** Çalışan özel ücret/bordro bilgisi burada yetkili kalır; Finans'a gerekiyorsa ödenecek toplam veya yetkili bireysel ödeme emri gider; ücretin tüm detayları Operasyon/MP/Platform Yönetimi rollerine açılmaz.
- **Müşteri Portalı (MP):** Müşteriye yalnız izinli kendi cari/ekstre, sipariş/ödeme görünümü ve ilgili ödeme akışı sağlanır; müşteri başka müşteriyi veya şirketin alış/maliyet/işçilik kayıtlarını göremez.
- **Platform Yönetimi:** Şirket kaydı, dört uygulamanın erişim/paket izinleri ve platform hesaplarının sınırlarını yönetir; sırf platform admin rolüyle ilgili şirketin hesap ekstrelerini/maaşlarını/hesap bakiyelerini görmez.

## 4. Başlangıçta ele alınacak Finans fonksiyonları — kapsam, ayrıntı henüz sıralanmamış

- **Cari hesaplar:** müşteri/tedarikçi, aynı tarafın alıcı+satıcı oluşu, cari gruplar, cari kodları, ayrı yasal şirket ve şube, açılış bakiyesi, borç/alacak bakiyesi, vade hareketleri ve ekstre, satış personeli kapsamı, entegrasyon cari eşleştirmesi.
- **Ödeme ve tahsilat:** banka/kasa/kredi kartı/POS/sanal POS (sağlayıcıdan bağımsız), hesap/işlem türü, aktarım/virman, müşteri/tedarikçi tahsilat/ödeme belgeleri, avans, kısmi ödeme, tarih/vade, komisyon ve kesintiler, mükerrer tahsilat kontrolleri. Gerçek para aktarımında ödeme sağlayıcısı/yetki ayrıntıları ayrıca onaylanacak; kullanıcı onayı olmadan canlı para hareketi gerçekleştirilmeyecek.
- **Vade, nakit akışı ve risk:** geciken/gelecek alacak-ödeme, çek/senet portföyü, tahsilat olasılığı, müşteri kredi/risk ve güncel kasa/banka/POS bakiyeleri; ileriye dönük nakit akışı kesin bakiye diye gösterilmeyecek.
- **Faturalar ve masraflar:** gelen/giden faturalar, masraf merkezi, üretim/satış/finansman gideri ayrımı, KDV/kur ve tahakkuk dönemi; Zirve gibi sistemlerle dışa aktarma veya e-belge servisi ancak gerçek erişim ve hukuki yetki ile.
- **Üretim maliyeti ve kârlılık:** [Maliyet Hesaplama Politikaları](MALIYET_HESAPLAMA_POLITIKALARI.md) Karar 33–41; gider havuzları ve nakit hareketi, muhasebe maliyeti ve satış referans maliyeti karıştırılmaz.
- **Finans kontrolleri:** günlük yapılacak muhasebe/gider iş listesi; işlem onay yetkileri, veri kaynağı, mutabakat, masraf merkezi, mali müşavir için güvenilir çıktı, günlük ve aylık kapanış raporları.

## 5. Tasarım ve uygulama aşamaları

1. F1/F2 şirket bazlı politika/entitlement ve veri sahipliği sözleşmesi, cari/hesap/finans hareketi modelleri, izole test verisi, idempotency ve audit testlerini önce tasarla. Dört ayrı iş uygulaması + ayrı Platform Yönetimi kararı ve mevcut Operasyon işleyişini koru.
2. Bağımsız Finans temel cari, banka, ödeme/tahsilat hareketlerinin güvenli ilk çekirdeği; daha sonra izinli **CSV/Excel içe aktarma ve dışa aktarma** için belge türü/tanımlı mapping, taslak, onay ve mutabakat ekranı. Bu sıralama **asistan önerisidir**, henüz kullanıcı tarafından gelişim önceliği olarak seçilmemiştir.
3. Sağlayıcıdan yetkili teknik dokümantasyon ve uygulama erişimi netleşirse API/entegrasyonlar ayrı test planı ve şirket bazlı onayla. Çift yönlü senkronizasyon ancak işlem sahipliği, çakışma, geri alma, tarihçe ve canlı finans veri güvenliği sağlanınca.
4. İçe aktarma testleri: aynı fatura ikinci kez gelirse tek kayıt, banka ödeme ve cari tahsilat aynı olay olduğunda ikinci ödeme yok, dış cari ile mevcut cari eşleşmesi, satır numarasıyla hata bildirimi, fiyat/kur/KDV doğrulama, firma ve tüzel kişilik ayrımı, onaysız değişiklik yok, ay kapanışı korunur; veriler şirketler arasında sızmaz.
5. Mevcut `operasyon-gelistirme` dışında main/prod sistemine dokunma; Supabase canlı DB migrasyonu, production deploy veya gerçek finans işlemi kullanıcıdan ayrıca açık onay gerektirir.

## 6. Sonraki tek önemli karar — entegrasyondaki senkronizasyon yönü

- **S1 — Kontrollü tek yön + güvenli dışa aktarma (önerilen ilk etap):** Muhasebe programından cari, fatura ve hareket bilgisi Finans'a import edilir, Finans'ta hazırlanan gerekli fişler dosya/uygun servis formatında muhasebeye **onaylı olarak aktarılabilir**; çift yönlü gerçek zamanlı arka plan senkronizasyonu yoktur. Hangi kaydın hangi sistemde yetkili olduğu net tutulur.
- **S2 — Çift yönlü senkronizasyon (gelişmiş):** Değişiklikler iki taraftan gelir ama tekil kayıt sorumluluğu, conflict queue, idempotency, geri alma ve testli entegrasyon sözleşmesi zorunludur. Sağlayıcı yetenekleri araştırılmadan vaat edilmez.
- **S3 — İki yönlü seçenek de firma bazlı seçilebilir:** S1 varsayılan ve güvenli başlangıç; S2 yalnız teknik olanaklar, doğru yetkiler ve şirket onayından sonra etkin olur.

**Henüz karar verilmedi:** Kullanıcı F1/F2 kullanım modlarını firma bazında seçilebilir olarak onayladı. S1/S2/S3 ayrımı ayrı karardır; otomatik canlı çift yönlü senkronizasyon onayı olarak yorumlanamaz.
