# Finans — Şirket Bazlı İzole Finans Yönetimi ve Muhasebe Entegrasyonu

Tarih: 2026-10-23
Durum: **Karar 44, 45, 46 ve 47 onaylandı** — Firma bazında bağımsız/entegre Finans ve veri aktarım yönü; farklı şirketlerin tüm Finans verileri ayrı; bankaya e-postayla gönderilebilecek ödeme listesi indirme. **Gündem 48**: belge eksikliği ve fiilî ödemeler/bordro uyuşmazlığı için denetlenebilir kayıt önerisi, kullanıcı değerlendirmesinde.
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
- **Karar 46 ile onaylandı:** Finans'ta farklı yasal şirketler/tenantlar ne fiilî ne muhasebe bakiyesinde **birleştirilmez**. Cari, banka, kasa, POS, finans ve personel kayıtları şirket başına ayrıdır. Aynı yasal şirketin şube/proje/masraf merkezi takibi ancak kendi içinde olabilir; ayrı yasal şirketlerin finansı tek bakiyeye veya konsolide yönetim raporuna alınmaz.

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

## 6. Karar 45 — Entegrasyon yönü de şirket bazında seçilir (2026-10-23, C / S3 ONAYLANDI)

**Kullanıcı C seçeneğini açıkça onayladı.** Finans'ın F2 muhasebe entegrasyonunu kullanan her firma, **S1 kontrollü veri içe alma + onaylı dışa aktarma** veya **S2 desteklenen muhasebe sistemiyle otomatik iki yönlü senkronizasyon** yöntemini seçebilir. Birincil kayıt sisteminin türü (F1/F2, Karar 44) ile aktarım yönü (S1/S2, Karar 45) birbirinden bağımsız ama uyumlu politikalardır. **İlk geliştirme S1 ile başlar; S2 yalnız teknik erişim, yetkilendirme ve güvenilir testlerden sonra ilgili şirket için açılır.**

### S1 — Kontrollü içe alma ve onaylı dışa aktarma

- Yetkili muhasebe programı veya dış dosyadan cari, fatura, borç/alacak, banka, tahsilat ve ödeme kayıtları; veri kaynağı ve nesne bazlı yetki haritasına göre Finans'a **taslak/önizleme** ile alınır.
- Finans'ta hazırlanmış muhasebeye aktarılacak uygun kayıtlar, onay sonrası desteklenen dosya şablonu veya belgelenmiş entegrasyon arayüzüyle **dışarı sunulabilir**. Dışa aktarmak, muhasebe programının gerçekten işlediği anlamına gelmez: **gönderildi / muhasebede onaylandı / reddedildi / mutabakat bekliyor** durumları ayrı tutulur.
- İçe aktarma (manual/batch) ve dışa aktarma yetkileri, işlem onayı, satır bazlı hata, geri alma veya finansal ters kayıt, import job ID ve kayıt sahibi görüntülenir. Kullanıcı açık yetki vermeden dış finans sisteminde yeni bir kaydı sessiz oluşturma.

### S2 — İki yönlü otomatik senkronizasyon (sağlayıcı olanaklıysa)

- Her veri sınıfında kayıt otoritesini belirt: örneğin cari kartı kaynak sistemde açılmışsa Finans'dan yapılan değişikliği oraya yazma yetkisi ve çakışma çözümü açık olmalı. **İki yönlü iletişim, iki bağımsız muhasebe defterine aynı olayı iki kere işlemek anlamına gelmez.**
- Mevcut yazılımın **belgelenmiş / izin verilmiş API veya resmî entegrasyon yöntemi** gerekli. Webhook varsa olay aboneliği, güvenli zamanlanmış eşzamanlama varsa polling, değişiklik imleri/sürüm numaraları ve sağlayıcı limitleri kullanılabilir. Webhook/API/zamanlama yeteneği bulunmayan yazılımlar için teknik imkân varmış gibi gösterme; firmaya S1 sun.
- Giden ve gelen değişimlerde **aynı kaynak olayının geri yansıyıp sonsuz çoğalmaması** için origin ID, external ID, idempotency key, source_version, correlation ID ve senkronizasyon yön izi sakla. Kuyruk, tekrar deneme, concurrency lock, outbox/inbox veya denk güvencelerle tek olay tek finans hareketi üretir.
- **Çakışma kuyruğu:** İki tarafta eşzamanlı değiştirilen vade/ödeme/borç kaydı, kapanmış döneme güncelleme, eksik kur/cari eşleme, tutarsız fatura veya çoklu kayıt belirsizliği otomatik silinip birleştirilmez. Kaynak yetkilisi, yetkili kullanıcıya eski-yeni kaynak farkını ve çözümünü gösterir.
- Başlangıçta **önce salt-okuma / dry-run / staging** ve geriye dönük kayıt eşleme testi; sonra kısıtlı kullanıcı/işlem kapsamı, izlenen artımlı rollout ve şirket onayı. Canlı entegrasyon anahtarı/secrets sunucuda şifreli korunur, tenant hesabı ve yasal şirket ayrımı sağlam olmalı. Gerçek muhasebe sistemine yazma veya gerçek para transferi için ayrı erişim/işlem onayları gerekir.
- S2 için **otomatiklik yetkisiz finans işlemi demek değildir**. Gönderim, finansal onay, kapanmış dönem kilidi, yüksek tutar kontrolü ve ayrı onaycı gerektiren istisnalar aynen uygulanır. Kuruluş düzeyinde izleme/uyarı ile senkronizasyon kopması, gecikme, başarısız kayıt ve nakit/cari farkı ayrı gösterilir.
- Her muhasebe sağlayıcısı için gerçek yetenek profili tanımlanır: `read_capabilities`, `write_capabilities`, desteklenen kayıt türleri, aktarım sıklığı, last sync, hata ve mutabakat; **API yoksa otomatik iki yönlü canlı senkronizasyon garanti edilmez**. Özellikle Zirve Ticari için API veya otomatik yöntem teknik olarak doğrulanmadan vaat edilmez.

### Yönetim ve test kabul koşulları

- Firma yönetici ayarı: S1 veya S2, sağlayıcı, kullanıcı ve uygulama yetkisi, nesne başına kayıt otoritesi, kapsam/hesap/şube, başlangıç tarihi, dönem kilidi; seçenekler yalnız gerçek sağlayıcı kapasitesiyle etkin.
- Mod değişimi S1→S2 veya S2→S1: kayıt eşleştirme, bakiye mutabakatı, bekleyen aktarım kontrolü, test/simülasyon, onaylı geçiş tarihi, rollback planı ve audit zorunlu. S2 devreden çıkarıldığında kuyruktaki işler çift gönderim yaratmaz.
- Testler: aynı dosyanın iki kez import edilmesi, aynı webhook'un iki kez gönderilmesi, başarısız yazmadan sonra retry, aynı faturanın Finans ve muhasebede ayrı görünmesi, kaynak origin echo loop, concurrent update, sır dışı olay, yanlış şirket/yanlış tüzel kişi, ay kapanışı, cari eşleme çakışması, veri aktarılamaması ve API erişimi olmaması → S1'e güvenli dönüş. Çift borç/alacak, ikinci tahsilat veya eksi/çift bakiye kesinlikle oluşmamalı.
- S2 yalnız şirket onaylı ve teknik olarak doğrulanmış entegrasyon sağlayıcısında sunulur; üretimde canlı para/muhasebe yazımı için kullanıcıdan ayrıca açık onay alınır.

**Henüz ayrı karara bağlanmadı:** Hangi muhasebe sağlayıcılarının ilk sürümde destekleneceği, her sağlayıcının bağlantı yöntemi (resmî teknik belgelere göre), hangi nesnelerin iki yönlü yazılabilir olduğu ve ilk canlı geçiş tarihi bu onaydan çıkmaz. Şirketi/tüzel kişilikleri ve cari kayıt birincil kaynağını doğru modelleyerek önce güvenli bağımsız Finans çekirdeği ve S1'e hazırlan.

## 7. Karar 46 — Finans şirket başına tamamen ayrı; çoklu şirket finans toplamı yasak (2026-10-23, ONAYLANDI)

**Kullanıcı kararı:** Farklı şirketlerin cari, banka, kasa, kredi kartı, fatura, borç/alacak, tahsilat/ödeme ve personel ücret bilgileri **asla çapraz şirket toplamlarına, ortak cari kartına, birleşik ödeme listesine veya konsolide finans paneline** girmez.

- Şirket kullanıcı kimliği ortak sistemde bulunabilse bile her Finans API sorgusu, işlemi, import/export, PDF/Excel çıktısı, banka ödeme listesi ve raporu **tek yetkili şirket bağlamı** ile çalışır. Tenant ID istemci seçimine körlemesine güvenilerek belirlenmez. DB RLS/API kontrolü, audit ve tenant-scoped idempotency zorunludur.
- Aynı kullanıcının birden çok şirkette yetkisi varsa açık şirket seçimi sonrası eski şirket verisi önbellekten, aramadan, indirilebilir dosya adlarından ve yetki durumundan sızmamalıdır. Şirket A hesabı şirket B alıcısına yanlışlıkla bağlanmamalıdır.
- Platform Yönetimi yalnız şirket ve uygulama erişimi/izin yönetir; finans detaylarını sırf platform admin olduğu için göremez. Şirket içinde tanımlı masraf merkezi/şube/proje, farklı tüzel kişilikleri tek deftere birleştirme izni değildir.
- Test: aynı kullanıcı iki şirkete üye; veri tabanı/API/CSV/PDF/arama/oturum cache ile şirketler arası bakiye ya da hesap açığa çıkmaz; şirketler arası konsolidasyon UI veya API mevcut değildir.

## 8. Karar 47 — Bankaya e-posta ekinde iletilebilir ödeme listesi (2026-10-23, ÖZELLİK ONAYLANDI)

**Kullanıcının kesin talebi:** Yetkili Finans kullanıcısı **Ödeme Listesi** oluşturabilsin ve bankaya e-posta ile gönderilecek **dosya** olarak indirebilsin. Bu, uygulamanın bankaya kendiliğinden mail atması, banka entegrasyonuyla EFT/havale yapması veya herhangi bir bankanın kendi yükleme dosyasını kesin kabul edeceğinin garantisi değildir.

### Önerilen ekran ve işlem yaşam döngüsü

- **Yeni Ödeme Listesi:** Yalnız aktif tek firma içinde, yetkili ödeme taleplerinden/cari borçlardan satır seçimi veya gerekli izni olan kullanıcı için manuel satır ekleme. Taslak ve onaylı kayıtlar ayrı. Liste tek **kaynak şirket banka hesabı**, tek ilgili para birimi veya bankanın şablonuna göre alt listeler ile oluşturulmalı.
- **Liste başlığı:** şirkete ait unvan/banka, çıkış hesabı IBAN, ödeme işleme tarihi, oluşturucu, liste kodu, ödeme türü, toplam, satır adedi, para birimi ve seçilen banka şablonu. **Liste satırı:** alıcı cari/kanuni ad-unvan, IBAN/hesap numarası, banka/BIC/şube gerekirse, açıklama, ödeme tutarı, para birimi, kaynak belge/talep ID ve vade/ödenecek tarih. Başlıklar bankanın gerçek formatı doğrultusunda yapılandırılabilir.
- **Taslak → Önizleme/Kontrol → Onay Bekliyor → Onaylandı → Dosyası Oluşturuldu/İndirildi → Bankaya İletildi (yalnız kullanıcı teyidi veya doğrulanmış kanal) → Banka Sonucu Bekleniyor → Ödendi/Reddedildi/İade/İptal.** Bankaya gönderildi veya dosya indirildi, **gerçekleşmiş ödeme** sayılmaz ve ikinci cari-banka muhasebe hareketi oluşturmaz.
- **Önerilen indirme türleri:** okunaklı PDF ödeme talimatı/listesi ve Excel (XLSX)/CSV yapılandırılabilir toplu ödeme dosyası. PDF'ye antet/talimat/imza alanı banka tarafından istenirse eklenebilir. **Bankaya özel gerçek şablon** gelmeden dosyayı o bankanın sistemine yüklenecek otomatik teknik dosya diye etiketleme; alıcı adı/IBAN sütunları, tarih ve para biçimi, karakter kodlaması, para birimi, onay/imza şartları bankanın belgelerine göre düzenlenmeli. Bankaya e-posta adresi veya banka hesap bilgisi uydurulmamalı.
- **Güvenlik:** IBAN TR formatı ve mod97 teknik doğrulaması; bunun alıcı adının bankaca doğrulandığı anlamına gelmemesi; tutar/IBAN/unvan değişikliği sonrasında yeniden yönetici onayı; onaylı liste sürümleri/silme yasağı, RBAC, limit ve gerekli iki kişi onayı; kişisel/ücret bilgisi ve hesap numaralarının maskeleme/erişim denetimi. Link ve dosya erişimi şirket bazlı ve kayıtlı; CSV/Excel formula injection koruması, Türkçe karakter, farklı para birimleri ve ondalık biçimler test edilmeli.
- **Çift ödeme engeli:** Bir faturaya bağlı aynı ödeme talebinin tekrar satıra konması, listelerin kopyalanması, başka banka dosyasının gönderilmesi ve banka sonucunun iki kez import edilmesi idempotent/eşleme/uyarı kontrolleriyle izlenir. Mükerrer/eksik dayanak veya beklenen belge için onay politikasını bypass etme. Ödeme listesi oluşturulması mal/hizmet alışının belge ihtiyacını ortadan kaldırmaz.
- **Kontrol:** Gidiş/banka kabulü/ödeme sonucu ve Finans defterindeki gerçek hareketi ayrı sakla; bankadan dönen gerçekleşen ödeme referansı mutabakatı bir kez yansıt. Aynı firmadaki başka banka hesabına virman ve üçüncü kişiye havale ayrımı doğru tutulur.
- **Testler:** birden çok alıcı, aynı alıcı iki ayrı faturaya ödeme, tek belgenin listeler arasında çift tahsis riski, geçersiz IBAN, liste değiştirilince onay sıfırlanması, PDF/XLSX satır ve toplam eşitliği, CSV güvenliği, şirket dışı erişim reddi, bankaya gönderildi ≠ ödendi.

**Açık tasarım ayrıntıları:** Kullanıcının bankalardan gelen örnek ödeme talimat formatları veya kurumun zorunlu şablonu henüz sunulmadı; kesin banka formatı, çıktı türünün önceliği, e-posta başlığı/talimat metni ayrıca netleştirilebilir.

## 9. Gündem 48 — Belge bekleyen alım, fiilî kasa/banka hareketi ve ücret/bordro farkını görünür takip (2026-10-23, TASARIM ÖNERİSİ / ONAY BEKLİYOR)

### İş ihtiyacı ve güvenli sınır

Kullanıcı aynı cari/tedarikçi için **hem faturası olan hem faturası olmayan işlemleri**, aynı şirket içindeki fiilî nakit hareketleri ile yasal/muhasebe kayıtlarını, personelde resmî bordro ve gerçekleşen toplam ücret veya nakit ödemeleri ayrı takip etmeyi sordu. Tasarım **kayıt eksikliği ve farkları görünür kılan mutabakat/uyumluluk** çözümü önerebilir; bir şirketin vergi ve ücret primlerini gizlemek üzere paralel "gizli/gayriresmi muhasebe defteri" veya çalışan maaşının vergi/SGK dışında tutulmasına yarayan fonksiyon kurulmamalıdır.

### Önerilen üçlü ayrım (bir işlem üzerinde üç ayrı eksen)

1. **Ekonomik olay / nakit gerçekliği:** sipariş/alış teslim edildi mi, ödeme planlandı mı, hangi kanal kullanıldı (banka/havale/kasa-nakit/POS), **gerçek para çıkışı veya girişi kesinleşti mi**? Fiziksel nakit sayımı ile banka ekstreleri ayrı mutabakat edilir. Nakit kanalı tek başına 'kayıt dışı' tanımı değildir.
2. **Belge durumu:** geçerli belge mevcut; belge talep edildi / bekleniyor; eksik / uyuşmazlık; geçersiz; düzeltildi. Belgesiz hareket otomatik olarak resmî satış/alış faturası veya KDV indirimi yaratmaz.
3. **Muhasebe/İK mutabakat durumu:** usulüne uygun kaydedilmiş; doğru belge/tahakkuk veya sınıflandırma bekliyor; bordro kayıt farkı; muhasebe düzeltmesi gerekli; tamamlandı. Muhasebe/SGK/vergi işlemi yetkili uzman tarafından çözülür; sistem gizli üçüncü kayıt kümesine yönlendirmez.

### Aynı cari için iki tür alış — örnek

- A tedarikçisinden bir **belgeli 60.000 TL alış** ve **henüz faturası gelmemiş 20.000 TL teslim/borç bildirimi** varsa: tek cari ID, belgeli muhasebe durumu 60.000; belge bekleyen inceleme havuzu 20.000. **Yönetim amaçlı takip edilen toplam 80.000** ancak varsayılan resmî muhasebe/cari bakiye diye sunulamaz. Belge gelince 20.000 TL'lik bekleyen kayıt ilgili fatura veya gerekli yasal belgeye **bağlanır**, yeniden ikinci alacak/borç yaratılmaz. Daha önce gerçekleşmiş ödeme varsa aynı olayla mahsup/mutabakat edilir.
- Ayrı belge olayının gerçek tarih/belge tipi/vergi işlemleri ilgili firma muhasebe uzmanı tarafından belirlenir. Yasal dayanak yoksa sahte fatura, tarihe geriye dönük gizli düzeltme, belge yokluğunu görünmez yapma veya KDV indirimi işlemi yapılmaz.
- Tek cari kartında **'muhasebece doğrulanmış bakiye', 'belge bekleyen işlem tutarı', 'mutabakat bekleyen fiilî hareket'** alanları önerilir. Toplam takip edilen yükümlülük ayrı ve belirgin **operasyonel/öngörülen** nitelikte olabilir; aynı ödenmiş satırın borca ikinci kez katılması engellenir.

### Kasa / banka

- Kasa sayımı (fiziksel TL) ve bankanın gerçek ekstresi esas para gerçekliği katmanıdır. Deftere işlenmemiş 15.000 TL nakit ödeme gerçekleşmişse fiziksel kasa 15.000 TL azalır; ilgili muhasebe belge/kayıt eşleşmesi bulunmadığında **mutabakat farkı** oluşur. Bu fark kasadan veya rapordan gizlenmez.
- **Açık kasa eksiği, belge eksikliği, geçmiş farka yetkisiz geriye dönük düzeltme, tedarikçi IBAN'ı değişimi** yetkili Finans inceleme kuyruğu ve varsa ek yönetici onayına gider. Belgesiz nakit işlemi hukuka aykırı bir 'kara kasa' gibi normalleştirilmez.

### İK / ücret

- Hak edilmiş ücret ve iş sözleşmesi, bordro tahakkuku, bankadan/net nakit yapılmış **gerçek ödeme kanalı** ve SGK/vergi/bildirim eşlemesi yetkili İK sistemi üzerinden ilişkilendirilir. Banka/nakit ayrımı, ücretin kanunî bildirim statüsünü belirlemez.
- Örnek: çalışana bordroya göre 40.000 TL görünürken ayrıca 10.000 TL nakit ödenmişse sistem **10.000 TL bordro–gerçek ödeme uyuşmazlığını** gösterir; İK/finans uzmanı bunun hukuki mahiyetini değerlendirip doğru bordro/tahakkuk/prim/vergi düzeltmesini yapmalıdır. **10.000 TL'lik beyan dışı tutarı gizli 'gayriresmî maaş' defterinde ücret mevzuatından kaçıran yapı oluşturulmaz.** Ücret net/brüt ve bordro ilişkisi rastgele denklenmez.
- Çalışanın tüm maaş detayları Finans'ın ödeme listesi ekranı, şirket dışı kullanıcı, satış personeli, diğer şirket veya platform admin için otomatik görünür olmaz. Bankaya maaş dosyası hazırlanacaksa ayrı gizlilik/onay kapsamı tanımlanır.

### Veri modeli önerisi

- `economic_event`: tenant_id, source ID, cari/personel bağlantısı, olay türü, tahmini/gerçekleşmiş tutar, vade/ödeme kanalı ve olay tarihi.
- `document_verification`: belge türü, referans, doğrulama statüsü, teslim tarihi, ilişkilendirilmiş olay, doğrulayan finans/muhasebe yetkilisi.
- `accounting_reconciliation`: şirket, olay ID, entegrasyon/muhasebe kaynak kimliği, muhasebeleştirme/ön tahakkuk/değerlendirme durumu, fark, açıklama, kapanış ve denetim.
- `payroll_reconciliation`: çalışan ve bordro dönemi, hak edilmiş/brüt/net ve fiilî ödeme bileşenleri yetkili erişimle, mevzuat uzmanı sonucu ve düzeltme referansı.
- `movement_reference`: tekil ödeme ve fatura kaynak IDs; gelen belgeyi bekleyen borca ve banka ödeme sonucuna bir kez bağlayan idempotent kayıt ilişkisi.
- UI'ya **'resmî para / gayriresmî para'** adında ikinci gizli banka/kasa defteri eklenmez. Bunun yerine **Belgesi Tamam, Belge Bekliyor, Mutabakat Gerekiyor, Bordro Farkı** filtreleri. Şirket karşılaştırma/total ekranı yok (Karar 46).

### Mutabakat ve kabul

- Eksik belgelerin yasal olarak tamamlattırılması, gerekli defter/beyan/prim işlemleri yalnız yetkili muhasebe/İK değerlendirmesiyle. Beyan edilmesi gereken tutarlar daha sonra da gider/ücret kaydına usulüne uygun yansıtılır; sistem dışı bırakılamaz. Bu yazılım bir vergi/SGK kaçırma otomasyonuna dönüşmeyecek.
- Faturası henüz gelmeyen 20.000 TL'nin aynı faturayla bir kez eşlenmesi; gerçekleşen 15.000 TL kasa çıkışının doğru fiilî kasa durumu ve hesap mutabakatı göstermesi; bordro 40.000 ile fiilî ek 10.000 TL arasındaki farkın yalnız yetkiliye görünmesi ve düzeltme bağlantısı; şirket izolasyonu, belge/borç mükerrerliği, vergi-KDV/salary payroll ifşası ve yanlış ödeme listesine gönderim kontrolü testleri.
- Canlı prod veya gerçek şirket verisi işlenmez; karar sonrası önce veri modeli + bağımsız staging ve testli geçiş planı.

**Karar 48 ve 49 ile onaylandı:** Her cari Belgeli ve Belgesiz (Belge Bekleyen) alt bakiyelerle takip edilir, ödemenin hangi açık türden düşüleceği seçilir, Platform Yönetimi admini şirket özelliğini açıp kapatır. Belge beklerken KDV ayrıştırılmaz, KDV: Belge Bekleniyor olarak gösterilir. Ayrıntılar aşağıdadır.


## 10. Karar 48 — Cari bazında Belgeli/Belgesiz bakiye ve mahsup seçimi (2026-10-23, ONAYLANDI)

**Kullanıcı şartı:** Tek cari hesabında birbirinden ayrı **Belgeli** ve **Belgesiz (Belge Bekleyen)** açık bakiye ve hareket dökümü görünür. Bir tahsilat/ödeme kayıt edilirken yetkili kullanıcının **hangi bakiye türünden düşüleceğini** seçmesi zorunludur; uygun açık borç/olay kimliği ve tutar doğrulanır. Bu işlem başka bir cari veya şirket verisine mahsup yapılamaz.

- Veri önerisi: cari tekil kimlik; her ekonomik olayın tenant, cari, tutar, para birimi, belge durumu ve kaynak kimliği; ödeme için tek gerçek hareket kimliği ve bu harekete bağlı mahsup satırları (hedef açık borç kimliği, kategori, tutar, tarih/versiyon). Bir kez gönderilen veya banka sonucu doğrulanan ödeme, aynı belgeye ikinci kez mahsup yaratamaz. **Karar 50:** Bir hareketin aynı anda Belgeli ve Belgesiz grup borçlarına dağıtılması YASAK; tek hareket tek belge sınıfını kapsar. Nakit/banka ödeme kanalı **belgeli/belgesiz durumundan farklı bir alandır**.
- Belgeli bakiye muhasebece teyitli belgeye bağlı işlemleri; belgesiz bakiye belgesi beklenen hareketlerin yönetim amaçlı açık tutarını gösterir. Kanunen tahakkuku gereken işlemi belgede gecikme var diye zorunlu defter/beyan dışında tutmaya olanak verme. Yetkili uzmanların belge ve vergi farklarını düzeltme kuyruğu olmalı.
- Örnek: cari Belgeli 60.000 TL, Belgesiz 20.000 TL. Belgesiz borca 10.000 TL gerçek ödeme yapılırsa Belgesiz 10.000 TL açık kalır, Belgeli 60.000 TL. Sonradan 20.000 TL toplam tutarlı doğrulanmış fatura geldiğinde önceki 10.000 TL ödeme korunur; kalan 10.000 TL açık tutar Belgeli tarafına geçer. Belgeli açık bakiye 70.000, Belgesiz açık bakiye 0 olur; hiçbir ikinci borç/ödeme gerçekleşmez. Fatura farklı tutardaysa otomatik çifte kayıt yerine fark kontrolü.
- Firma bazında **Platform Yönetimi admini tarafından açılıp kapatılan izin bayrağı** (ör. finance_document_bucket_tracking_enabled). Admin bayrak durumunu, tarihi ve gerekçeyi yönetir ama şirketin banka/cari/maaş ayrıntılarını göremez. Kapalı firmada iki ayrı görünüm özelliği sunulmaz; varsa geçmiş eksik belgelere ilişkin düzeltme iş akışı ve kayıtlar silinemez.
- Cari toplamı, aynı ekonomik olayı iki defa saymayan açıklamalı operasyonel gösterimdir; vergiye esas resmî cari bakiyesi başlığında iki tutarı mutlak doğru olarak birleştirme. Yetki, tenant/RLS, export, audit, nakit mutabakatı ve bankaya gönderilebilir ödeme listesi kontrolleri zorunlu.
- Test: doğru alt bakiye seçimi, yanlış tutar reddi, eşzamanlı iki ödeme, belge gelince mevcut borcu taşıma, kısmi ödeme, düzeltilen belge, yanlış şirket/cari, bayrak açık-kapalı, admin finans içeriğini göremez.

## 11. Karar 49 — Belge bekleyen işlemde KDV henüz gösterilmeyecek (2026-10-23, ONAYLANDI)

**Kullanıcı şartı:** Faturası/fişi veya geçerli vergi belgesi gelene kadar belgesiz geçici işlem **KDV ayrıştırılmadan** görünecek. Vergi alanı **KDV: Belge Bekleniyor** olmalı; **KDV %0 veya istisna** sayılamaz.

- Belge bekleyen harekette bir adet takip tutarı vardır; bu tutarın matrah ya da KDV dahil brüt olduğu henüz belgeden kesinleşmiş sayılmaz. Teknikte vat_rate=null, vat_amount=null, vat_status=awaiting_document; 0.00 KDV'den farklı durumdur. Belge gelmeden varsayımsal oranla matrah/KDV çıkarmak, indirim raporu veya fatura oluşturmak yok.
- Belge geldiğinde yetkili muhasebe/finans doğrulamasıyla belge türü, gerçek brüt, matrah, vergi oranı/tutarı ve hukuken indirim/düşüm uygunluğu belirlenir. Her fişin indirilebilir KDV hakkı sağladığı varsayılmaz. Geçici 20.000 TL takibi, gerçek belgede 20.000 TL toplam olarak görünüyorsa 20.000 TL üzerine ikinci defa KDV eklenmez.
- Gerçek banka/kasa ödemeleri ve önceki mahsup kayıtları, belge türü güncellenirken bozulmaz; sadece doğrulanmış fark yetkili düzeltmeyle işlenir. Belge bekleyen statüsü vergi/SGK/bordro yükümlülüklerini gizleme veya süresiz erteleme aracı olarak kullanılamaz.
- Test: KDV boş, belge bekleniyor etiketli, KDV %0/istisna raporlarında yer almıyor, belge bazlı doğru oran, tek borç tek ödeme, dönem/vergi mutabakatı ve tenant ayrımı.

Geliştirme yalnız tasarım aşamasında: canlı sistem veya gerçek muhasebe kayıtları etkilenmedi.

## 12. Karar 50 — Tek hareket, tek belge grubu; ayrı kasa ve çek/senet portföyleri (2026-10-23, ONAYLANDI)

**Kullanıcı Karar 48 kapsamındaki "bir ödemenin iki tür borca ayrılabilmesi" alternatifini açıkça reddetti.** Finans'ta tek bağımsız ödeme, tahsilat, havale/EFT, nakit çıkış/giriş, kredi kartı/POS hareketi, çek veya senet işlemi **yalnız tek belge grubunu** kapsar: `DOCUMENTED` (Belgeli) ya da `PENDING_DOCUMENT` (Belgesiz/Belge Bekleyen). Kayıt türü tek olan herhangi bir işlemde `document_bucket` ayrılmaz. Tek banka ödeme referansı iki gerçek ödeme gibi kopyalanmaz.

### Nakit kasaları
- Şirketin yetkili Finans ekibi, fiziksel/gerçekten ayrı tutulan nakit varlıklarını **iki ayrı kasa tanımı** ile izleyebilir: `Belgeli Kasa` ve `Belgesiz (Belge Bekleyen) Kasa`. İsimler ekran/operasyonel belge takibi içindir; ikinci gizli muhasebe veya kayıt dışı nakit defteri değildir. Kasa kodu, tek firma, para birimi, açılış, fiilî sayım, sorumlu, rol/limit, kasa hareketleri, tutanak ve fark mutabakatı gerekir.
- Aynı fiziksel nakit iki kasada çoğaltılamaz. Kasalar arası gerçek para aktarımı olursa kaynak kasadan çıkış, hedef kasaya giriş aynı benzersiz virman kimliğiyle bağlanır ve iki taraf mutabık olur. Kasa sayımında fark/eksik belge için yetkili muhasebe incelemesi devam eder.

### Çek ve senet portföyleri
- Çek için **iki ayrı portföy** (Belgeli / Belge Bekleyen), senet için de **iki ayrı portföy** (Belgeli / Belge Bekleyen) desteklenir. Bir fiziksel kıymetli evrakın kimliği, alınan/verilen, seri-numara, taraf, tutar, para birimi, keşideci/lehtar, vade, ciro/tahsile verme/teminat/ödeme/iade/karşılıksız, mevcut sorumlu ve fiziksel saklama yeri izlenir.
- `Belgesiz` etiketi çek/senedin kendisinin *geçersiz* olduğu anlamına gelmez; ticari alış/satışın dayanak belgesinin henüz tamamlanmadığını gösterir. Çek/senet bir defa doğar, eşzamanlı iki portföyde ayrı tutar sayılmaz; evrak bir kez tahsil edildiğinde cari alacak/banka olayı iki kez oluşmaz. Belge geldiğinde sınıfı güncellemek evrakın yeniden verilmesi veya mükerrer tahsil değildir.
- Çek ve senet portföylerinde ayrı yaşlandırma, vade, bekleyen/ciro edilmiş/tahsilde/teminatta ve fiilî kasa teslimi raporları olabilir; kullanıcının hangi yetkili rolün hangi kasa/portföyü göreceği ayrıca rol kapsamına tabidir.

### Banka, kart ve POS için aynı kategorileme
- Gerçek bir banka hesabı, kredi kartı hesabı veya POS mutabakatı **tek gerçek fiziksel/finansal hesap**tır. Belge statüsü her **hareket üzerinde** ayrı tutulur; aynı IBAN veya banka ekstre hareketinden iki adet resmî gerçek bakiye yaratılmaz. Gerçekte iki ayrı banka/pos varsa iki hesap tanımlamak mümkündür.
- Kart/çek/senet/gelen-giden havalede tek işlemde iki kategoriye bölünme teknik olarak reddedilir. Bu, banka bakiyelerinin doğru tutulması ve hukuki kayıtların saklanmaması ile uyumludur.

### Ödeme mahsup ve raporlama
- `financial_movement`: tenant, company, `document_bucket`, payment_method, instrument ID/account ID, amount/currency, counterparty, source reference, status and audit. `document_bucket` **tam bir adet**; `movement_id` benzersiz.
- `settlement_allocation`: hedef borç/alacak belgelilik grubu kaynak hareketiyle uyuşmalı. Bir hareketin iki farklı belge kategorisine dağıtılmasını yasakla. Aynı kategori içinde birden fazla borcu kapatma iş kuralı ayrıca netleşebilir; kullanıcının reddettiği örnek **çapraz iki kategoriye** paylaştırmadır.
- İki gerçek bağımsız havale veya iki ayrı nakit ödeme yapılmışsa her biri kendi benzersiz fiilî hareketiyle kaydedilir. Gerçekte tek havale varsa ikinci havale taklidi yaratılmaz; sınıf düzeltmesi için onaylı/izli mutabakat kullanılır.
- Bankaya e-posta eki olarak indireceğimiz listeler birçok bağımsız ödeme içerebilir; **her ödeme satırı tek gruba** bağlıdır. Banka sonucu tek ödeme referansıyla eşlenir; dosya çıkarmak bakiye düşürmez.
- Belgeler sonradan gelince mevcut cari/finans hareketleri tek kimlikle doğrulanır ve gerekiyorsa kategorisi kontrollü güncellenir; çek/senet ve kasa gerçeği ikinci kez kaydedilmez. Karar 49'un KDV:null ve belge bekleniyor ayrımı geçerlidir.

### Platform admin ve yasal kayıt sınırları (kullanıcının devam sorusu)
- Şirket bazlı `finance_document_bucket_tracking_enabled` özelliğini **yalnız Platform Yönetimi admini** açabilir/kapatabilir. Bu sadece Finans'taki belgeli/belge bekleyen iş akışı ve gösterim yetkisidir; admin diğer şirketin cari/risk/maaş/IBAN detaylarını görmez.
- Kullanıcının "belgeler gelene kadar yasal kayıtlardan saklansa" düşüncesi **hukuken gerekli işlemlerin kaydedilmesini engelleyen bir sistem davranışı olarak kabul edilemez**. Belge bekleyen ticari kayıtlar otomatik **KDV indirimi, tamamlanmış fatura veya kesin resmî belge** değildir; fakat muhasebe/tahakkuk/SGK/vergi kaydının gerekli olup olmadığı yalnız fatura varlığına göre değil gerçek ekonomik olay ve mevzuata göre belirlenir.
- Belgelerin zamanında temini için uyarı/mutabakat; muhasebe uzmanının doğru belge/sınıflama ve gerekiyorsa düzeltme girişi; yetkisiz geçmişi silme/geriye dönük gizleme engeli; etkin özelliğin şirket için kapatılmasıyla mevcut olayların kaybolmaması. Elden ücret gerekiyorsa kanuni bordro/SGK yükümlülüğü ayrı uygulanır; gizli beyan dışı maaş hesabı oluşturma.

**Kabul:** Tek hareket iki belge kategorisine bölünmez; alacak/borç + havale, nakit, kart, POS, çek, senet hepsinde aynı; iki ayrı fiziksel nakit kasası birbirini iki kez saymaz; çek/senet her biri tek portföyde ve tek tahsilatta; bir IBAN = bir gerçek bakiye; belge sonradan gelince tek ekonomik borç korunur; platform izin kapansa bile rapor/audit/düzeltme durur değil, erişimi korunan yasal geçmiş olarak kalır; RLS ve yetki testleri uygulanır.

**Karar 51 ile ONAYLANDI:** Her iki belge grubu altında şirket istediği kadar ayrı kasa, çek portföyü ve senet portföyü oluşturabilir; **belge grubu ve tekil kasa/portföy bazında ayrı raporlama zorunludur**. İki sayısı yalnız örnekti, limit değildir. Ayrıntılar sonraki bölümde.

## 13. Karar 51 — Belgeli/Belge Bekleyen gruplarında çoklu kasa ve çoklu çek/senet portföyleri; ayrı raporlama (2026-10-23, ONAYLANDI)

**İş kararı:** Firma başına iki **belge grubu** (özellik açıksa) vardır: Belgeli ve Belgesiz (Belge Bekleyen). Bunlar **yalnız iki kasa** veya **yalnız iki çek/senet portföyü** demek değildir. Her grup altında firma ihtiyaç duyduğu sayıda gerçek ayrı kasayı ve çek/senet portföyünü tanımlayabilir. **Kasa, çek ve senet raporları hem belge grubu hem tekil kasa/portföy bazında ayrı ayrı olmalı.**

### Finans kartı/portföy veri modelinde zorunlu alanlar

- `cashbox`: `tenant_id`, `cashbox_id`, `cashbox_code`, `name`, `document_bucket` (tek), `currency`, `location/branch`, `responsible_user_id`, `active`, `opening_count`, `count_date`, `audit`. Şirket içi kasa kodu tekil veya açık scope ile benzersiz; yalnız ad/etiket üzerinden gerçek bakiye bağlama. Aynı fiziksel para iki ayrı kasanın nakit varlığı sayılamaz.
- `cheque_portfolio` ve `promissory_note_portfolio`: `tenant_id`, `portfolio_id`, `code`, `name`, `document_bucket`, `status`, `responsible_user_id`, `branch`, `audit`. Kategori evrakın dayanak ticari belgesinin tam/eksik statüsüdür, kendisi hukuk dışı bir çek/senet türü değildir. Aynı çek/senet tek benzersiz fiziksel kimlikle portföyler arasında **transfer olay geçmişiyle taşınır**, iki portföyde iki kez bakiye oluşturmaz.
- `cashbox_movement`, `portfolio_event`: transfer/durum değişikliği, kaynak-hedef tek hareket grubu, yön, tarih, para, vade, cari ve ilgili belge ID'leri, aktaran/teslim alan, onay, kaynak belge durumu, idempotency/denetim. Tek gerçek para çıkışını iki farklı belge grubundan bölme (Karar 50) yok. Ayrı kasa sorumluları sayım tutanaklarına göre fiilî bakiye kontrolü yapar.

### Ayrı raporlar — kabul kriterleri

1. **Kasa raporu** belge grubu başına ayrı; ardından istenirse her kasa için açılış, tahsilat/giriş, ödeme/çıkış, net akım, fiziksel sayım/kapanış, fark ve onaylanmamış belge mutabakat uyarıları. TL ve döviz tutarlarını kur belirtilmeden toplama; şirket içi kur kaynağı ayrı.
2. **Çek portföy raporu** Belgeli ve Belgesiz (Belge Bekleyen) ayrı; alt portföy başına verilen/alınan çek, vade, borçlu/alacaklı, tutar, ciro, teminat, banka tahsilde, tahsil edildi, iade/karşılıksız ve bekleyen durumları. Aynı çekin birden çok statüsü/portföy hareketi olsa da **tek mevcut pozisyon** sayılır.
3. **Senet portföy raporu** aynı biçimde; senet no, karşı taraf, vade, tutar, ciro, tahsilat/ödenen/ödenmeyen ve portföy/şube/sorumlu filtreleri.
4. **Rapor erişimi ve çıktı:** `tenant_id`, bir tane `document_bucket` ve tek kasa/portföy filtresi veya o gruba ait yetkili **grup toplamı**; döneme göre tarih, sorumlu, döviz cinsi, kasa tipi, çek/senet durumu, cari ve şube filtreleri. Ekran, PDF/XLSX/CSV/API/export **aynı veri filtreleri** uygular. Bir kullanıcının başka firmaya geçişi önceki firmanın raporunu cache veya browser export ile sızdırmaz.
5. **Yasal ve yönetim özeti:** Belgeli ve Belgesiz belge bekleyen tutarlar varsayılan ayrı gösterilir; ancak aynı gerçek kasanın parasını, aynı çekin değerini veya aynı belgeden doğan alacağı **çift sayan hiçbir ara toplam oluşturulmaz**. Muhasebe kayıt/tahakkuk, kanunî defter, vergi/bordro bildirimleri doğru usulüne göre ayrıca sürer; belgesiz etiketini kayıt gizleme olarak kullanma.
6. **Örnek test:** Belgeli grupta Merkez TL, Şube TL, Döviz TL; Belgesiz grupta Merkez TL, Şantiye TL, Şube TL, Proje TL kasaları. Her birinin raporu ayrı, grup raporu yalnız o grubun gerçek alt kasaları, diğer grup karışmıyor. Çek portföyleri ikiden fazla; bir çek Tahsilde portföyüne aktarıldığında iki kez tahsil alacağı doğmuyor. Ayrı şirketler arasında rapor birleştirme yok (Karar 46); admin belge takibi özelliğini kapatsa önceki rapor geçmişi silinmiyor.

**Karar 52 ile netleşti:** Kasalar arası gerçek virman yapılabilir. Virmanın kaynak/hedef kaydı tek transfer kimliği ve fiilî para hareketiyle bağlanır. Belge grupları arasında geçişin **izin/onay, muhasebe mutabakatı ve tek finans hareketi tek belge grubu** ilkeleri aşağıdaki Karar 52'de ayrıca tanımlandı.


## 14. Karar 52 — Kasa virmanı, çek/senet tahsilatı, bankaya tahsile verme, ciro, yeni evrak ve vade takibi (2026-10-23, ONAYLANDI)

**Kullanıcının kesin istediği işlevler:** Kasalar arası virman yapılması; alınan çek/senet bedelinin nakit kasaya veya bankaya tahsil edilebilmesi; bankaya tahsile gönderilen çek/senedin **eldeki portföyden çıkarılıp Bankada Tahsilde olarak izlenmesi**; alınan çek/senedin alacaklı cariye **ciro edilmesi**; yeni alınan/verilen/kendi düzenlenen çek ve senet açılması; vade, ödeme, tahsil, iade/karşılıksız ve durum raporları.

- **Kasa virmanı:** Bir gerçek transfer \`transfer_id\` ile iki kasa hareketini (kaynak çıkış, hedef giriş) bağlar. Tek şirket/para birimi veya gerçek döviz dönüştürme referansı, tutar, tarih, kaynak-hedef, gönderen/alıcı, onay, fiilî teslim, sayım ve audit izlenir. Gerçek şirket toplam fiziki nakdi virman yüzünden artmaz. Belge grubunu değiştiren kasa hareketleri **iki ayrı gerçek para hareketi taklidi veya kayıt gizleme** amacıyla kullanılamaz; gerekli muhasebe sınıflaması/onay ve işlem kökeni korunur.
- **Evrak modeli:** \`instrument_id\` (tek değişmez), \`tenant_id\`, \`type=cheque|promissory_note\`, \`received|issued\`, \`document_bucket\`, seri/no, taraf/cari, keşideci, lehtar, tutar/para birimi, düzenleme/teslim/vade, banka/hesap (ilgiliyse), saklayan, fiziki konum, portföy, son durum, ek kaynak belgesi ve işlem/audit tarihi. Aynı evrak iki portföyde bakiyeye katılmaz.
- **Bankaya tahsile gönderme:** \`ELDEKI_PORTFOY\` → \`BANKAYA_GONDERILDI / BANKADA_TAHSILDE\`. Evrak **eldeki fiziksel portföy listesinden düşer**, fakat bankada emanette/alacak tahsilini bekleyen kayıt olarak görünür, alacak ve risk ortadan kalkmış sayılmaz. Banka işlemi gerçekleştiğinde \`TAHSIL_EDILDI\` ve tek banka tahsil hareketi; karşılıksız/iade için bankadan dönen evrak tek eski ID ile \`IADE\` durumuna ve gerektiğinde eldeki portföye döner. Sadece bankaya teslim aşamasında banka parası gelmiş sayılmaz.
- **Kasaya tahsil:** Çek/senet bedeli fiilen nakit ödendiğinde, bu **nakit tahsilatın belgelendirilmesi ve şirketin ilgili kasa bakiyesine tek gerçek giriş** olarak izlenir; aslında nakde çevrilmeyen kıymetli evrak kasaya para gibi eklenmez. Nakit veya banka ödeme kanalı, evrakın belge grubu ve ilgili cari idempotent referansla eşleşir.
- **Ciro:** Eldeki çek/senet hukuken uygun ciro/teslim ile başka bir cari alacaklıya devredilir: kime, hangi borç karşılığında, tarihte ve tutarda, evrakın fiziki teslimi ve sorumluluk geçmişi izlenir. Evrak eldeki portföyden çıkar, \`CIRO_EDILDI\` olarak cari hareketine bağlanır. Karar 53 cari kapanışını yönetir. Ciro hukuki sorumluluğu kendiliğinden sona erdirmeyebilir.
- **Yeni verilen/alınan çek-senet:** Düzenlenme, verilme, teslim, vade, ödeme ve iade yaşam döngüsü; açık verilen çek/senet ödeme planı ve gecikme/karşılıksız alarmları; durum, vade ve banka/portföy bazında raporlar. Onaylı işlem düzeltme ve kaynak muhasebe entegrasyonu çift banka/cari hareketi yaratmaz.

**Bağlayıcı önceki kurallar:** Karar 46 şirketler ayrı; Karar 48/49 belge bekleme/KDV; Karar 50 tek ödeme/tahsilat tek belge grubu; Karar 51 birden fazla kasa/çek/senet portföyü ve ayrı rapor. Hukuken gerekli kayıt/bildirim gizlenmez; çek/senet verildi, ciro edildi, bankaya tahsile gönderildi ve bankada gerçekten ödendi anları ayrılır.

## 15. Karar 53 — Ciro: tedarikçi cari borcu teslimde kapanır, iade alınırsa yeniden açılır (2026-10-23, A ONAYLANDI)

**Kullanıcı açıkça A'yı seçti:** Müşteriden alınan çek veya hukuken devredilebilir senet, tedarikçiye/başka alacaklıya ciro edilip teslim edildiğinde **ilgili tedarikçi cari açık borcu operasyonel olarak kapanacak**. Çek/senet tahsil edilene kadar caride açık borç olarak bekletilmeyecek. İlgili evrak \`CIRO_EDILDI\` kayıt/raporuna geçecek.

Örnek: Tedarikçiye 100.000 TL borç varken portföydeki 100.000 TL müşteri çeki ona ciro edilip teslim edilir → tedarikçi açık carisi 0; eldeki portföyden tek evrak çıkar; ciro/karşı cari bağlantısı korunur. Evrak ödenmez ve **gerçekten iade alınırsa** \`IADE_ALINDI\` hareketi eski ciroyu tersler; tedarikçi açık borcu 100.000 TL yeniden oluşur ve **aynı** çek tek evrak olarak portföye döner. İade sonrası karşılıksız çekin hukuki rücu riski ve tahsil edilebilirliği ayrıca izlenir.

**Kritik çift sayım sınırı:** Ciro ve iade, aynı çekten ikinci alacak/borç veya ikinci nakit çıkışı üretmez; gerçek iade kanıtı ve yetkili onay gerekir; mevzuattaki ciro sorumlulukları ve yasal muhasebe kayıtları ayrıca korunur. Kategoriler arasında tek ciro/ödeme ikiye bölünmez.

## 16. Karar 54 — Kendi verilen çek: cari kapanır, Verilen Çekler yükümlülüğü kalır (2026-10-23, B ONAYLANDI)

**Kullanıcı B seçeneğini onayladı:** Şirket kendi çekini tedarikçiye düzenleyip teslim edince ilgili tedarikçi **cari açık borcu kapanır**, onun yerine **Verilen Çekler / Ödenecek Çekler** yükümlülüğü doğar ve vadesinde gerçekten bankadan ödendiğinde kapanır. Çekin teslimi tek başına bankada para çıkışı değildir.

**100.000 TL örnek:** cari borcu 100.000 → çek verildiğinde tedarikçi açık cari 0, verilen çek 100.000, banka değişmedi → bankada çek ödendiğinde banka çıkışı 100.000 **bir kez**, verilen çek yükümlülüğü 0. Banka çek ödemediyse \`ODENMEDI/KARSILIKSIZ\` ve gerekirse yetkili onaylı iade, uzlaşma, yenileme ve cari yeniden açma kaydı; verilen çek yükümlülüğü ve yeniden açılmış cari aynı tutarı iki defa toplam borca eklemez.

Çek no/seri, hesap, banka, karşı cari, belge grubu, düzenlenme/teslim/vade, tutar/para birimi, banka ödeme sonucu, karşılıksız ve iptal geçmişi tek kimlikte izlenir. Verilen Çekler vade raporu, banka bazlı gelecek ödeme planı ve nakit akışı tahmininde ayrı gösterilir. Hukuki/muhasebe sınıflama ve risk kaydı mevzuat esaslarına tabidir.

## 17. Karar 55 — Kendi verilen senet de Verilen Senetler hesabında aynı şekilde izlenir (2026-10-23, ONAYLANDI)

**Kullanıcının açık talebi:** "Aynı şeyi senette de takip edelim." Şirketin **kendi düzenlediği senet** tedarikçiye/borçlu olduğu cariye teslim edildiğinde, tedarikçinin **cari açık borcu kapanır** ve **Verilen Senetler – Ödenecek** hesabına/vade portföyüne aktarılır. **Nakit kasa veya banka bakiyesi senet verildiğinde değişmez.**

**100.000 TL örnek:** tedarikçi cari borcu 100.000 → 100.000 TL kendi senedini teslim → cari 0, Verilen Senetler 100.000, banka/kasa aynı. Senet vadesinde **gerçekten ödeme yapıldığında** banka veya fiziki nakit kasadan **bir kez** 100.000 TL düşülür; Verilen Senetler yükümlülüğü 0 olur. Ödeme hangi gerçek kanaldan yapıldıysa aynı gerçek hareketi iki kanalda yazma. Senedin tahsile verilmesi veya vadesinin gelmesi tek başına ödeme kanıtı değildir.

**Ödenmez/iade edilirse:** \`VADESI_GECTI\`, \`ODENMEDI\`, \`IADE\`, \`IPTAL\`, \`YENILENDI\`, \`UZLASMA\` durumları; fiilî/kanıtlı iade veya geçerli işlemde cari borcun yeniden açılması, verilen senet yükümlülüğünün doğru kapatılması ve eskisinin geçmişinin tutulması. Hem cari hem Verilen Senetler aynı borcu iki kez toplam yükümlülük yapamaz. \`instrument_id\`, senet no, lehtar, karşı cari, para, tarih, vade, teslim, imza/onay, ödeme/banka/kasa sonucuna idempotent bağlantı gerekir.

**Raporlar:** Verilen Senetler açık tutarı ve vade planı, senet bazında ödenen/ödenmeyen, bankadan/kasadan ödeme çıkış tarihi, tarihe/kişiye/duruma göre rapor, çeklerden bağımsız kasa/portföy ve belge grubu raporları. Muhasebe ve senet hukuku bakımından geçerli tahakkuk yükümlülüğü özel uzman denetiminde.

## 18. Karar 56 — POS komisyon hesabı ve tek çekim/taksit bazında manuel oranlar (2026-10-23, ONAYLANDI)

**Kullanıcının kesin talebi:** POS'tan geçen **brüt tahsilat**, kesilen **banka/POS komisyonu** ve hesaba yatan **net tutar** ayrı izlenecek. POS komisyonları özel hesapta raporlanacak. Komisyon oranları **manuel** tanımlanabilecek; **tek çekim ve taksitli satışlarda farklı komisyonlar** uygulanabilecek.

**Kullanıcının örneği (aynı mantıkla):** POS'tan 10.000 TL çekildi, 500 TL komisyon kesildi → **Brüt POS tahsilatı 10.000 TL**, **POS Komisyon Gideri 500 TL**, **Banka Net Giriş 9.500 TL**. 500 TL ikinci bir müşteri borcu veya ikinci gerçek banka çıkışı değildir; POS mutabakatında brüt ile neti uzlaştıran ayrı gider/kesintidir. Brüt satış geliri/tahsilat ile banka net girişi birbirine karıştırılamaz.

### Tanımlar ve oranlar

- Her şirket kendi POS/sanal POS veya banka üye işyeri anlaşmasını ayrı tanımlar: \`pos_id\`, bağlı banka ve gerçek hesaba yatış yeri, para birimi, kart tipi/planı (gerekiyorsa), kesinti politikası, geçerlilik tarih aralığı, hesap/kayıt yetkisi. Aynı firmanın 4 veya daha fazla POS'u bağımsız izlenebilir. **Şirketler arası tek ortak POS hesabı yoktur** (Karar 46).
- **Manuel oran tablosu:** \`tek çekim\`, \`2 taksit\`, \`3 taksit\`, ... \`N taksit\` için şirketin yetkili Finans kullanıcısı **farklı yüzde komisyon oranları** belirleyebilir; bankaya/POS'a göre, başlangıç/geçerlilik tarihi, oran ve varsa sabit işlem masrafı ayrı. **Taksit sayısı ile oran eşlemesi** geçmiş kayıtları geriye dönük değiştirmez. Kart tipine/tahsilat gününe/erken bloke çözümüne özel oranlar sonraki şirket ihtiyacına göre ayarlanabilir, zorunlu varsayılmamalı.
- Tek POS işlemi yaratılırken \`gross_amount\`, \`installment_count\`, \`commission_rate\`, \`fixed_fee\` (varsa), \`commission_amount\`, \`expected_net_deposit\`, \`expected_deposit_date\`, \`document_bucket\`, \`linked_cari_or_sales_event\`, \`merchant_transaction_id\`, \`bank_deposit_reference\` ve \`status\` izlenir. Oran işlemin kaydına **snapshot** olarak alınır; yetkili kullanıcı gerektiğinde işlem özelinde manuel oran/tutar düzeltmesi yaparsa sebep/onay/tarihçe zorunlu.
- **Temel hesap:** \`Komisyon = Brüt Tahsilat × (Komisyon Yüzdesi / 100) + varsa sabit masraf\`; \`Beklenen Net Banka Yatışı = Brüt − Kesinti\`. Brüt 10.000 ve oran %5 → komisyon 500, banka 9.500. Belgeye göre komisyona ilişkin ayrıca BSMV/KDV veya ek tahsilat kesintisi varsa **gerçek sağlayıcı ekstresi ve mevzuata** göre ayrıca modellenir; banka kesintisini sessiz varsayma.
- **POS Takas/Bloke Takip Hesabı:** Kart işlemi onaylanınca 10.000 TL gerçek banka bakiyesine peşinen eklenmez; **beklenen POS alacağı/takas tutarı** 10.000 TL olur. Banka POS çözümü onaylandığında 9.500 gerçek banka girişi ve 500 komisyon gideri ile toplam 10.000 alacak kapatılır. Böylece müşteriden 10.000 tahsilat ve bankaya 9.500 yatış ayrı görünür, **iki ayrı satış veya iki ayrı tahsilat yapılmaz**.
- Bankaya ertesi gün, belirli blokaj sonrası veya taksitli/çoklu transferle ödeme yapılan anlaşmalarda **beklenen yatış tarihleri / parçalı banka yatırmaları** planlanabilir; tek POS tahsilat olayı tekrarlanmaz. Gerçek banka ekstresi daha farklı komisyon gösterirse otomatik silip değiştirme değil **beklenen-gerçekleşen komisyon farkı** ve yetkili mutabakat yapılır.
- İade/iptal/chargeback, başarısız provizyon ve iptal edilen POS işlemi için ters olay; bankanın komisyon iadesi/iade etmeme durumu fiilî banka kaydına göre ayrıdır. İşlem henüz bankaya geçmemişken durumu \`bekleniyor\`; gerçek yatış teyidi sonrası \`hesaba geçti\`.
- Karar 50: tek POS işlemi **bir** Belgeli veya Belgesiz (Belge Bekleyen) belge grubuna bağlanır, iki gruba paylaştırılmaz. POS komisyonunun bu tahsilata bağlı **maliyet alt kaydı** olması farklı gruba bölünmüş ikinci bağımsız ödeme olduğu anlamına gelmez. Belgeli/Belgesiz şirket özelliği yalnız Platform Yönetimi admininin firma bazlı aç/kapat kontrolündedir; asıl hukuki işlem belgelendirme ve vergi kayıt sorumluluğu korunur.

### Ayrı hesaplar ve raporlar

- \`POS Tahsilatları / Bekleyen POS Alacakları\`, \`POS Komisyon Giderleri\`, \`POS Net Banka Yatışları\`, \`POS Banka Mutabakat Farkları\` **ayrı** gösterimler ve ilgili Finans gider/kaynak hesaplarıdır. Bunlar aynı nakdi iki kere sayan fiziksel banka hesabı değildir.
- Her banka/POS, tek çekim veya taksit sayısı, tarih aralığı, belge grubu, ödenecek banka hesabı, tahsilat/beklenti/kapanış, komisyon ve net tutar filtreleri. Raporlarda **brüt işlem toplamı, beklenen komisyon, gerçek komisyon, fark, beklenen net, fiilî bankaya yatan net, henüz yatmayan tutar** ayrı sütunlar. Belgeli/Belgesiz raporları karışmaz; şirketler birleşmez.
- Özellikle banka toplu POS mutabakatında yüzlerce satır tek net banka yatırma hareketine denk gelebilir; toplu referans ID ve satır eşleştirmeleri ile toplam kesinti farkı izlenir. \`bank_deposit_event_id\` aynı tahsilatın ikinci kez banka bakiyesi artırmasını engeller. Excel/PDF/CSV rapor ve tarihsel komisyon oranları saklanır.

### Kabul örnekleri

1. **Tek çekim %5:** 10.000 TL brüt; 500 TL kesinti; 9.500 TL banka net. Cari müşterinin ödeme durumunda tek 10.000 TL tahsilat olayı; bir POS alacağı/takas mahsup, bir net banka giriş; 500 TL gider.
2. **Taksit farklı oran:** Aynı POS'ta tek çekim oranı %2, 3 taksit oranı %6 olarak **örnek şirket ayarı** girilebilir; 10.000 TL / 3 taksit için beklenen komisyon 600, beklenen net 9.400. Bu oranlar **banka tarifesi iddiası değil**, manuel girilecek örneklerdir.
3. **Oran revizyonu:** Yeni tarihte 3 taksit komisyonunu %7 seçince geçmiş %6 işlemi geriye dönük değişmez. Gerçek POS ekstresinde 650 TL kesilmişse beklenen-gerçek 50 TL fark raporu, yetkili onayı ve doğru kayda göre kapatma.
4. **Çift sayım ve haklar:** Aynı POS işlemi yeniden import edildiğinde ikinci 10.000 TL tahsilat yok; bankanın toplu yatan 9.500 TL kaydı iki kez bankaya girmez; Belgeli/Belge Bekleyen ve farklı şirket verisi izole, maliyet/komisyon yetkileri kullanıcı rollerine uygun.

**Kullanıcıdan sonraki detay kararı:** POS tahsilatları için **banka ne zaman yatırır** (anlık, ertesi iş günü, N günlük bloke) ve **taksitli işlemlerin neti tek seferde mi, taksit taksit mi yatar** soruları ayrı konfigürasyon politikası olarak netleştirilecek. Karar 56, herhangi bir bankanın fiilî aktarım planına ilişkin hazır entegrasyon bulunduğu iddiası değildir.

**Kritik iş akışı ayrımı:** POS komisyonu gider kaydı mali müşavirce doğrulanmış belge/BSMV/KDV/usul kurallarına göre işlenmelidir; belge bekleyen kayıt yasal bildirimi gizlememelidir. Kararlar yalnız tasarım belgelerini günceller; uygulama koduna, canlı muhasebe verilerine veya production sisteme müdahale izni vermez.
