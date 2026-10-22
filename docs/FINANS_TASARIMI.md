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

- Veri önerisi: cari tekil kimlik; her ekonomik olayın tenant, cari, tutar, para birimi, belge durumu ve kaynak kimliği; ödeme için tek gerçek hareket kimliği ve bu harekete bağlı mahsup satırları (hedef açık borç kimliği, kategori, tutar, tarih/versiyon). Bir kez gönderilen veya banka sonucu doğrulanan ödeme, aynı belgeye ikinci kez mahsup yaratamaz. Nakit/banka ödeme kanalı **belgeli/belgesiz durumundan farklı bir alandır**.
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
