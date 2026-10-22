# SÖZBİR Finans + Operasyon — Şirket Bazlı Maliyet Politikaları

**Durum:** Karar 35 — şirketlerin farklı maliyet hesaplama yöntemlerini seçebilmesi **ONAYLANDI** (2026-10-22). Aşağıdaki yöntemler **ürün seçenekleri / kademeli uygulama tasarımıdır**; yasal muhasebe değerleme esasları ve firma-özel parametreler yetkili kullanıcı ve muhasebe uzmanı onayına tabidir. Bu belge `docs/SAAS_4_UYGULAMA_KAPSAM.md`, Karar 33–34, Karar 27–32 ve üretim→depo kabul→sevkiyat sırasıyla birlikte okunacaktır. Kod geliştirmede **canlı veri şeması, üretim veya deploy değiştirilmez**; ayrı geliştirme branch'i, test ve rollback zorunludur.

## 1. Kesin sınırlar: üç ayrı sonuç, tek veri temeli

1. **Gerçek muhasebe/stok maliyeti:** Fiili onaylı malzeme sarfı, değerleme politikası, işçilik, SGK, üretim genel gideri, dış işlem ve ilgili muhasebe standartlarıyla dönem, stok, yarı mamul, mamul ve satılan mamul maliyeti. Stok değerlemesi ve resmî kayıt için sadece geçerli firma muhasebe politikası kullanılabilir; satıştaki koruyucu taban bu kayıtları değiştirmez.
2. **Yönetim için öngörülen maliyet:** Cari dönem için bütçe/tahakkuk, mevcut fiziksel stok, geçerli fiyatlar ve normal kapasiteye dayanan tahmini değer; bilinmeyen maliyet kesin sayı gibi sunulmaz.
3. **Satış için teklif referans maliyeti:** Satış yöneticisinin marj ve fiyat kontrolünde kullandığı, firmanın tercih ettiği ihtiyatlı fiyatlandırma maliyeti; gerçek maliyetten yüksek veya düşük olabilir; **asla muhasebe maliyeti diye etiketlenmez**.

Dönemsel gelir-gider, fatura/kira/SGK tahakkuku ile nakit ödemenin farklı olaylar olduğu korunur. Finans/İK kaynaklı gizli bordro detayları Operasyon'a açılmaz; maliyet merkezi veya onaylı toplu işçilik verisi paylaşılır. Satış, yönetim, faiz/vade farkı ve finansman giderleri üretim maliyetine koşulsuz eklenmez; farklı kârlılık katmanlarında gösterilir.

## 2. Bağımsız şirket ayarları

Firma yapılandırması tek bir `maliyet_modu` değildir; şu **bağımsız eksenler** vardır:
- `pricing_reference_method`: satışa esas maliyet kaynağı.
- `pricing_floors`: aşağı/yukarı fiyat koruması, seçili malzeme grubu ve ekstra maliyet tetikleyicileri.
- `overhead_allocation_method`: genel üretim gideri dağıtımı; gider merkezi / gider türü / hat bazında değişebilir.
- `interim_cost_estimate_method`: ay içinde eksik tahakkuklar için tahmin yöntemi ve kapanış politikası.
- `valuation_policy`: muhasebe uzmanı onaylı stok değerleme/hesap politikası, **fiyatlandırma ayarlarından ayrıdır**.
- `data_quality_rules`: eksik veri, rapor durumu, tolerans, fiyatın onay sınırları.
- Ürün ailesi veya malzeme grubu bazında şirket ayarını ezme, ancak gerekçeli/yetkili onayla.

Tüm ayarlar **şirket (tenant)** ve varsa tüzel kişi/tesis kapsamına aittir; platform admin şirketin gizli ticari verilerini görmeden yalnız yetki/uygulama erişimi yönetir. Değişiklik; kim, ne zaman, neden, önceki/yeni ayar, geçerlilik tarihi ve onay bilgisiyle sürümlenir. Fiyat teklifi/sipariş kendi tarihindeki uygulanan sürümü, kaynak kg fiyatını, maliyet fotoğrafını ve gerektiğinde kur bilgisini korur.

## 3. Satışa esas referans maliyet yöntemleri — firma seçebilir

### PR-01 Önceki ayın kesin maliyeti + alüminyum artışına karşı koruma
**SÖZBİR için kullanıcı tarafından önerilen ve varsayılan aday yöntem.**
- Önceki ayın **kapanmış** ürün bazlı tam üretim maliyeti ve ilgili malzeme bileşeni bazdır.
- Alüminyum kg maliyeti bazdan güncel fiyatına yükseldiyse **yalnız ilgili alüminyum bileşeninin net artışı** teklif referansına eklenir. Örn. önceki 1.000 TL = alüminyum 600 + diğer 400; alüminyum bedeli %10 yükselirse teklif referansı 1.060 TL. Toplam 1.000 TL'ye %10 artış uygulanmaz.
- **Şirket isterse `downward_floor_enabled=true`**: alüminyum ucuzladığında teklif için koruyucu referans otomatik düşmez. Başka şirket için `false` seçilebilir; gerçek maliyet iki durumda da gerçek verilere göre hesaplanır.
- Artışın referans fiyatı, kg/ürün başına fiilî/standart sarf ve boy/kg dönüşümü, geçerli para birimi/tarih/satınalma fiyat kaynağı kaydedilir. İlgili ürünün reçetesinde değişiklik varsa yalnız alüminyum fiyat değişimini yansıtmak yetersiz olabilir; teknik reçete/cins değişimi ayrı hesap ve uyarı gerektirir.
- Tekrar eden fiyat olayı iki kez uygulanamaz. 600→660→630 örneğinde koruma açıkken taban **en az 660** düzeyindeki aynı referans bileşenini korur, yeni artış ancak önceki geçerli en yüksek koruyucu tabanı aşınca ilave edilir. Aylık önceki kesin maliyete geçişte daha önce eklenmiş artış yeniden toplanmaz.
- Maaş/SGK/kira/enerji veya taşeron fiyatlarında ciddi artış varsa ayrı onaylı `cost_shock_adjustment` yahut yeniden fiyat hesaplaması gerekir; sırf alüminyum sabit diye satış maliyeti sabit varsayılamaz.
- Piyasa fiyatı kalıcı düştüyse yetkili satış/finans yöneticisi koruyucu tabanı gerekçeli ve onaylı manuel sıfırlayabilir; **otomatik fiyat indirimi şart değil**.

### PR-02 Güncel malzeme fiyatı + bütçeli üretim giderleri
- Geçerli onaylı BOM × güvenilir güncel malzeme fiyatları + işçilik/SGK ve genel gider için bütçe/normal kapasite tarifesi + üretim dış işlem maliyeti.
- Zam ve indirimler iki yönde hesaplanabilir; eksik kg fiyatı, kur veya geçersiz reçete varsa rapor `Eksik veri` olarak görünür. Gerçek muhasebe stok maliyetiyle karıştırılmaz.

### PR-03 Son 3 veya 6 kapanmış ayın ağırlıklı ortalaması
- Dönemlere göre üretim miktarı/eşdeğer kapasite kullanımına uygun, şirketçe seçilmiş ağırlıklı maliyet ortalaması. Aritmetik ortalamanın anlamsız olacağı az üretimli dönemler için uyarı.
- 3/6 ay geçmiş yoksa fallback sırası: eldeki kapanmış aylar → yetkili standart maliyet → manuel onaylı referans; uydurma değer yok. Alüminyum fiyat güncelleme/koruma isteğe bağlı ek politika.

### PR-04 Standart reçete + işçilik ve gider bütçesi
- Yeni ürün/ilk dönem/üretilmemiş ürün: onaylı standart BOM, işçilik/kaynak kapasitesi, üretim genel gider bütçesi ve taşeron fiyatından standart hesap. `Tahmini` etiketi zorunlu.
- Reçete versiyonu ile geçmiş tüketim revizyonundan etkilenmeden korunur.

### PR-05 Güncel dönemin gerçekleşen + tahmini kalan maliyeti
- Bugüne kadar doğrulanmış sarf/üretim gideri ile dönemin henüz faturalanmamış fakat bütçeli/tahakkuk eden giderlerinin **mükerrer olmayan** tahmini birleştirilir.
- Giderler ilk 15 gün girilmedi diye fiyat yapay düşük olmaz; büyük sapmalar işaretlenir. Bu yöntem gerçek kapanış maliyeti değildir.

### PR-06 Yetkili manuel referans
- Yönetici özel ticari durum, yeni ürün veya fiyat oynaklığı için manuel satış referansını gerekçesi ve geçerlilik tarihiyle belirler; sistem hesapladığı alternatif referansları, varsa maliyet altı riski ve geçersiz referans uyarılarını göstermeye devam eder. Onaysız şirket geneline yayılmaz.

### Kaynak ve koruma ayarları
Her yöntemde izin verilebilecek **opsiyonel** koruma kontrolleri:
- Alüminyum kg fiyatında yalnız yukarı yönlü yansıtma; düşüşe otomatik cevap seçeneği; spesifik ürün/malzeme bazlı taban.
- Sabit/nispi ek teklif tamponu (`risk_buffer`), hedef brüt marj ve asgari kârlılık uyarısı. Tampon **maliyet değil fiyatlandırma düzeltmesidir**.
- Gider türü bazında zam tetikleyicisi: ücret/SGK, kira, enerji, servis/yemek, taşeron. Sapma eşikleri şirketçe belirlenir, yetkili onayı olmadan maliyet geçmişini değiştirmez.
- Satış ekibi için fiyat indirimi/iskonto yetkisi önceden kararlaştırılan rol ve limitlerle kısıtlanır. Müşteri veya üretim personeli gizli alış fiyatını/bordroyu görmez.

## 4. Ortak üretim gideri dağıtımı — seçilebilir, maliyet havuzuna bağlı

**AL-01 Ürün kapasitesi / eşdeğer hat zamanı — SÖZBİR için tercih edilen ve Karar 34'te ONAYLANAN yöntem.**
Ürün/hattın geçerli günlük kapasitesi `K` adet/gün, dönem içinde ilgili hatta üretim miktarı `Q` ise `eşdeğer hat günü = Q/K`. Aynı maliyet havuzundaki ürünlere gider payı `ürün hat günü / toplam uygun hat günleri` ile önerilir. Normal kapasite ve atıl kapasite karşılaştırması ayrıca zorunludur; az üretim yapılınca tüm kira birkaç parçaya yığılmaz. Farklı hatlar ayrı gider havuzu tutar.

**AL-02 Gerçek makine saati:** Üretim iş emri makine süresi kanıtlı kayıtlı ise saat ağırlığı kullanılır. Süre eksikse sessizce 0 kabul edilmez.

**AL-03 Gerçek işçilik saati:** Üretim/puantaj/İK izinli toplu süre ile dağıtım. Ücret bordro gizliliği korunur; işçilik doğrudan + endirekt pay çift sayılmaz.

**AL-04 Üretim adedi:** Yalnız yeterince homojen/benzer üretim yapan işletmelerin bilinçli seçimi; ayrı kapasiteye sahip farklı ürünler için sistem uyarı verir.

**AL-05 Üretim ağırlığı veya uygun teknik miktar:** Teknik gerekçesi bulunan hammadde işleme/enerji vb. giderlerde kullanılabilir; kg/adet/metre birimleri karıştırılmaz.

**AL-06 Gider türü / merkez / karma:** Doğrudan sayaçlı elektrik o hattın gerçek tüketimine; fabrika ortak kirası önce uygun alana veya diğer güvenilir anahtara; işçilik ilgili çalışma saatine; geri kalan genel üretim gideri hat kapasitesi ağırlığına göre. Aynı gider kalemi birden fazla havuzda **ikinci kez dağıtılamaz**.

Politika uygulaması: Önce doğru dönem ve gider sınıfına dahil olan tahakkuklar sınıflanır → üretim gider havuzuna bağlanır → uygun anahtara göre ürün/hat bazına dağıtılır → normal/atıl kapasite kontrolü ve muhasebe politikasına uygun kayda dönüştürülür. Yönetim maliyeti ile standartlara göre finansal stok değerlemesi farklıysa fark ve neden raporda görünür. Sabit/değişken ayrımı ile kullanılmayan kapasite maliyeti belgelendirilir.

## 5. Ay içi maliyet tahmin politikası

**IN-01 Önceki ayın kapanmış maliyetinden devreden tahmin:** PR-01 veya PR-03 ile birlikte kullanılabilir. Ayın ilk günü boş gider girişi yüzünden 0 maliyet olmaz.

**IN-02 Aylık gider bütçesi + güncel hammadde:** Kira, ücret ve SGK, servis, yemek, bakım, enerji tahminleri ay başından eklenir; onaylı gerçek tahakkuk geldiğinde tahmini miktarın yerini alır. **Bütçe + gerçek aynı gider için çift eklenmez.**

**IN-03 Karma tahmin + dönem ortası sapma:** Aylık bütçe, kapanmış önceki ay, gerçekleşen güncel giderler ve büyük fiyat/kapasite farklarının karşılaştırmalı uzlaştırması. Hedef: ayın ilk/son 15 günü arasında yapay maliyet şoku oluşmaması. Gerçek yükselişin gizlenmesi yasaktır.

**IN-04 Yalnız kapanmış maliyetle fiyatlandırma / güncel fiiliyi sadece izleme:** Özellikle çok az işlem giren işletmelerin Pratik profili; fiyatlandırma tabanı geçen ay olabilir, cari ay gider verisi eksikse kesin fiili diye raporlanmaz.

**Dönem kapanışı:** Aylık kontrol listesinde malzeme/fason/bordro/SGK/kira/servis/yemek/enerji/amortisman ve gider merkezi mutabakatı. Kapalı döneme geriye dönük sessiz düzenleme yasak, düzeltme belgeli ve onaylı; satış anındaki fiyat fotoğrafı korunur. Oluşan sapma ürün grubu/hat/gider türü bazında raporlanır. Yasal kayıt/standart uygulaması için uzman değerlendirmesi gereklidir.

## 6. Kullanıcı arayüzü taslağı

**Finans > Ayarlar > Maliyet Politikaları** (şirket yöneticisinin erişim ve para/ücret yetkilerine tabi):
1. **Teklif referans yöntemi:** PR-01..PR-06; şirket varsayılanı ve ürün grubu override.
2. **Fiyat koruması:** alüminyum fiyatı artarsa ekle, düşerse düşürme aç/kapat; eşik ve fiyat kaynağı. İsteğe bağlı maliyet şoku/ek marj uyarısı.
3. **Genel üretim gideri dağıtımı:** AL-01..AL-06; gider türü/hat/merkez bazında ek kural.
4. **Ay içi tahmini maliyet:** IN-01..IN-04, veri tamlığı ve kapanış politikası.
5. **Simülasyon ve karşılaştırma:** Aynı ürün ve veri setiyle alternatif fiyatlandırma yöntemleri, dağıtım seçenekleri, önceki ay/maliyet şoku, gerçek maliyet ve kârlılık ayrı sütunlarda. 'Uygula' işlemi işletme yetkilisi onayı ve etkili tarih istemeli.
6. **Politika ve dönem geçmişi:** Eski/yeni parametre, kullanıcı, tarih, gerekçe ve teklif geçmişi görünür. Değişiklik önceki kesilmiş siparişleri, depolanan belgeyi veya geçmiş resmî maliyeti yeniden yazmaz.

Pratik/Kontrollü/Ayrıntılı çalışma profilleri bu kontrollerin ekran derinliğini belirler; muhasebe güvenliğini/gerçek veri durumunu değiştirmez. Seçilen politika bir şirketin başka şirketinde uygulanmaz.

### Örnek görünüm (tamamen örnek TL değerleri)
| Alan | Fiyatlandırma | Yönetim tahmini | Muhasebe fiili |
| --- | ---: | ---: | ---: |
| Önceki ay üretim maliyeti | 1.000 | — | — |
| Alüminyum maliyet bileşeni +%10 | +60 | Güncel BOM fiyatıyla | Fiili stok değerlemeyle |
| Ayın 5'i — kira/SGK henüz gelmedi | **1.060 koruyucu** | **Bütçeye göre** | **Kesin değil** |
| Ay sonu | Eski teklif fotoğrafı korunur | Öngörü–fiili sapması | **Kapanış kontrolünden sonra kesin** |

## 7. Test ve kabul kriterleri (Codex)

- Firma A'nın `downward_floor_enabled=true` seçeneği firma B'yi etkilemez; platform admin ticari veriye erişmez.
- 600 TL alüminyum + 400 TL diğer maliyet; yalnız alüminyumda %10 zam ⇒ 1.060 TL teklif referansı; toplamda %10 uygulanmaz.
- 600→660→630 ve ardından 650 güncellemeleri floor açık/kapalı testleri; aynı fiyat olayının ikinci kez işlenmemesi; ay kapanışı ve baz değişiminde artışın çifte eklenmemesi.
- Cari ay kira henüz girilmediyse bütçeli maliyet fiiliye karıştırılmaz; gelen gerçek faturanın aynı dönem tahmininin üstüne iki kez eklenmemesi.
- Farklı günlük kapasiteli iki ürünün aynı toplam adette eşit ortak gider payı almaması (AL-01). Kapasitesi eksik/sıfırsa hesap kesin sonuç üretmez; çok hatlı ürün sadece kullandığı havuzdan yük alır.
- Sabit giderin normal kapasite / atıl kapasite ayrımı; nakit ödeme tarihiyle gider tahakkuku karışmaz.
- Kapalı dönem ve geçmiş teklif/müşteri onaylı satış fiyatları korunsun. Sürüm/denetim/erişim testleri: gizli bordro ücretleri ve alım fiyatları yetkisiz kullanıcılara API üzerinden sızmasın.
- Maliyet modülü ileride dört ayrı uygulama (Operasyon, Finans, Müşteri Portalı, İK) arasında **Finans veri sahibi, Operasyon üretim veri sahibi** olacak şekilde paylaşılır. Dört uygulama tek UI'ye dönüştürülmez; mevcut Operasyon 0.13.0 özellikleri ve canlı verileri korunur.

## 8. Uygulama aşamaları ve açık detaylar

**İlk iterasyon:** ayrı tenant ayarları ve sürüm modeli, basit PR-01/PR-02, AL-01/AL-04, IN-01/IN-02; gerçek/teklif ayrımı, üretim kapasitesi, aylık bütçe, veri eksikliği görünümü ve testler. **Sonraki iterasyonlar:** 3/6 ay ağırlıklı maliyet, gider merkezi bazlı karma dağıtım, özel fiyat koruma, gelişmiş kapasite/tahmini-fiili mutabakat ve detaylı simülasyon. **Önce dört gerçek ayrı uygulama için Faz 1 altyapı önceliği** ve canlı sistemin korunması.
**Açık sorular:** Alüminyum fiyatı kaynağı (satınalma faturası, onaylı liste, sözleşme, borsa/endeks), kur/para birimi dönüşümü, ürün bazında kg sarfı, mükerrer fark önleme, planlanan/normal kapasitenin dayanağı, yasal maliyet sistemi/TMS-VUK farkları ve maliyetin netleştirilmesi için yetkili imza. Bunları gerçek veriyi değiştirmeden netleştir.
