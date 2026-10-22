# SÖZBİR Yazılım Ailesi — Codex ana geliştirme şartnamesi
Tarih: 2026-10-22 · Durum: Onaylanmış kararlar + açık detaylar · Uygulama kaynağı: SÖZBİR Operasyon 0.13.0

> **BAĞLAYICI:** Dört ayrı iş uygulaması yapılacak. Özelliklerin tamamını mevcut Operasyon'un menülerine doldurmak, dört uygulamayı sadece dört sekme olarak sunmak veya mevcut çalışan uygulamayı sıfırdan yazmak **YASAK**. Ayrı giriş noktaları, bağımsız arayüzler, ayrı derleme/yayınlama hedefleri ve bağımsız şirket/modül erişim kontrolleri olacak. Ortak kimlik, iş verisi entegrasyonu ve teknik paketler paylaşılabilir.

## 0. Codex'e doğrudan görev — işe başla

Mevcut `erenbyrm/siparis-app` deposunda **yalnızca** `operasyon-gelistirme` dalında çalış. Kaynak doğru dal `codex/order-workflow-v2`; varsayılan `main` eski prototiptir, geliştirme temeli olarak alma. Önce kodu, testleri, sunucu yetki modelini, veri şemasını, iş akışlarını ve belgeleri gerçek koddan incele. `README.md`, `docs/KABUL_DURUMU.md`, `docs/DEPO_VE_SAYIM.md`, `docs/URETIM_VE_ISKONTO.md`, `database/`, `api/`, `server/`, `src/` ve `tests/` kritik referanslardır.

Sadece analiz raporu üretip durma: **ilk güvenli geliştirme dilimini** uygula, test ekle, `pnpm test`, `pnpm check`, `pnpm build` doğrula; değişiklikleri küçük ve gözden geçirilebilir commit/PR'lar hâlinde sun. İlk dilim, kodu kırmadan çok uygulamalı mimari iskeleti + rol/tenant tasarım ve test altyapısı + Operasyon için uyumluluk katmanı olmalı. Önceden kararlaştırılmamış ödeme sağlayıcısı, SGK/e-bildirge erişimi, canlı veritabanı migrasyonu veya production yayını uygulama. Açık ürün kararları yapılandırılabilir olarak modellenip ayrıca işaretlensin.

## 1. DÖRT AYRI UYGULAMA — kesin mimari kuralı

1. **SÖZBİR Operasyon:** Mevcut uygulama temel alınacak; satış/sipariş/onay, ürün, üretim, depo, stok, sayım, rezervasyon, yükleme, sevkiyat, araçlar, teslimat, iadeler ve operasyon raporları.
2. **SÖZBİR Finans:** Ayrı arayüz ve dağıtım; cari hesap, alacak/borç, kredi/risk politikası, tahsilat/ödeme, nakit/kasa, banka, kredi kartı, POS, vade, finansal raporlar. Sadece finans yetkili kullanıcı görür.
3. **SÖZBİR Müşteri Portalı:** Ayrı arayüz ve dağıtım; her müşteri sadece kendi firma/cari yetkisi kapsamındaki sipariş, sevkiyat, teslimat, ekstre ve belgeleri görür, izin verilmişse sipariş/ödeme talebi oluşturur ve ileride gerçek online ödeme yapar.
4. **SÖZBİR İnsan Kaynakları:** Ayrı arayüz ve dağıtım; personel kayıtları, organizasyon, puantaj, vardiya, izin, fazla mesai, ücret, bordro, prim, avans, masraf, belge, eğitim, performans ve personel talepleri. İK verisi sıkı gizli.

**Tercih edilen teknik hedef:** mevcut kodu koruyarak aşamalı modüler monorepo (örnek: `apps/operasyon`, `apps/finans`, `apps/musteri-portali`, `apps/insan-kaynaklari`, `packages/auth`, `packages/permissions`, `packages/contracts`, `packages/db`, `packages/audit`, `packages/ui`). Klasör şemasını inceleme sonrası uyarlayabilirsin; DEĞİŞMEZ koşul dört ayrı gerçek uygulama ve birbirinden bağımsız deploy/route entrypoint olmasıdır. Tümünü bir `App.tsx` içinde dört koşullu sayfaya dönüştürme. Her uygulamanın ayrı navigasyonu, giriş/erişim denetimi, kendi sürümlemesi ve testleri bulunsun. Platform yönetim konsolu ortak altyapı yönetim aracı olabilir; beşinci ticari ürün olarak sayılmaz.

Ortak veritabanı mümkün, fakat şirket/tenant sınırları sunucuda ve veritabanı katmanında güvenle uygulanmalı. Her iş kaydı açık ve doğrulanmış `company_id`/tenant bağlamı taşımalı; tenant değeri istemciden güvenilerek alınmamalı. Uygulamalar arasında paylaşılan cari/ürün/sipariş/kimlik gibi nesnelerde tekil kaynak ve bütünlük sözleşmeleri tasarla, veri çoğaltma/tutarsızlık yaratma.

## 2. Canlı Operasyon'u koruma — sıfır özellik kaybı

- Sürüm 0.13.0'da bulunan ve testlenen bütün davranışları koru: teklif → müşteri onayı → yönetici onayı → üretim → depo kabulü → kısmi/tam sevkiyat; stok sayımı ve yönetici onayı, stok rezervasyonu, sipariş dışı stok üretim talebi, iş geçmişi, PDF/Excel/CSV, mobil deneyim, firma kimliği, şifre yenileme, telefon/masaüstü eşleşmesi, Türkçe/İngilizce/Arapça/Almanca, mevcut roller ve ekranların kullanışlılığı, iskonto/KDV hesapları.
- Mevcut kaynakta `pnpm test`, `pnpm check`, `pnpm build` çalışıyor; 0.13.0 kabul belgesinde 152 test yazıyor. Mevcut testleri kaldırma; yeni test ekle.
- `database/002_record_storage.sql` zaten uygulanmış; **yeniden çalıştırma**. Üretim Supabase verisine dokunma, şema sıfırlama veya yıkıcı migration yapma. Test veritabanı ayrımı, dry-run, yedek/restore provası, geri alma ve kademeli geçiş planı zorunlu. Canlıya geçiş için kullanıcıdan açık onay al.
- Mevcut kanonik ADMİN hesabının iki doğrulanmış e-posta girişinin aynı kullanıcıya bağlanması korunmalı; ikinci ayrı personel hesabı yaratılmamalı. Geçişte ADMİN kilitlenmemeli.
- Şimdiye kadar çalışan veri, ürün, müşteri, kullanıcı, sipariş, sipariş geçmişi ve stok hareketleri korunmalı. İK/Finans için varsayılan veri uydurma.
- Ayrı uygulamalara geçiş eski `src`/tek app yapısını bir anda silerek değil geçici uyumluluk/yönlendirme ve testli dilimlerle yapılmalı.
- `main` dalını veya canlı Vercel production ayarlarını doğrudan değiştirme. Ayrı önizleme ve izole staging DB kullan.

## 3. Platform, şirket ve uygulama erişimi

- En üst **PLATFORM ADMİNİ** (başlangıçta mevcut yetkili hesap), firmaların başvurusunu onaylar/reddeder; şirketi açar, askıya alır, kapatır; uygulama/modül erişimi, platform rol şablonları ve devredilebilecek yetki sınırlarını yönetir. Ancak **platform ADMİNİ şirketin siparişini, finansını, çalışan ücretini veya diğer ticari içeriğini sırf platform yetkisiyle görmez veya değiştirmez**.
- Şirketlerin verileri birbirinden izole. Gereken destek erişimi ayrıca şirket yetkisi/onayı, süre kısıtı ve denetim altında; platform rolü otomatik ticari erişim vermiyor.
- Şirket internetten kendi başvurusunu yapar, kurumsal bilgiler + ilk yönetici + e-posta doğrulama alınır; platform onayından önce uygulama kullanılmaz.
- Firma hangi dört uygulamayı kullanacağını talep edebilir; platform ADMİNİ şirket bazında açar/kapatır. Sonradan eklenebilir; kapatmak geçmiş kayıtları silmez.
- Her kişinin tek kimliği vardır, yetkili olduğu ayrı uygulamalara geçebilir. Her uygulama kendi yetki setini uygular. Personel özlük kaydı ayrı; her personele yazılım kullanıcı hesabı açmak zorunlu değil.
- Şirkette işler yürütülürken en az **iki farklı gerçek yetkili kullanıcı** bulunur; asgari ast–üst/ayrı onaycı ilişkisi. Başvuru/ilk kurulum tek hesapla yapılabilir ama uygun ikinci kişi tanımlanmadan kritik canlı işlemler açılamaz. Geçişte mevcut canlı SÖZBİR'i kilitleme.

## 4. Rol hiyerarşisi, çoklu görev, sınır ve onay

Her yetkinin dört bağımsız boyutu olmalı: **görev/rol; eylem (view/create/edit/delete/approve/reject/export/manage); kapsam (tenant, departman, depo, müşteri grubu, kendi kayıtları); limit/onay seviyesi (TL, %, vade, adet, risk vb)**.

- Hazır/özel roller: Patron/Şirket Sahibi, Genel Müdür/Yardımcı, Satış Müdürü/Danışmanı, Üretim Müdürü/Şefi/Elemanı, Depo Müdürü/Sorumlusu/Elemanı, Lojistik Müdürü/Sevkiyat/Şoför, Finans Müdürü/Muhasebe/Tahsilat, Satın Alma, İK Müdürü/Sorumlusu/Bordro/Personel.
- Bir kullanıcı Üretim+Depo+Sevkiyat gibi birden çok rol taşıyabilir; kullanıcıya özel **açık kısıtlama** rol birleşiminden doğan izinlere baskındır. Uygulamalar arası otomatik erişim yok.
- **Patron:** şirket yönetim raporları ve denetim; belirlenen yüksek tutarlı/stratejik/istisnai taleplerde son onay. Varsayılan günlük sipariş veya sevkiyat yapması gerekmiyor; izinler ayrıca atanabilir. Salt okuma profili mümkün.
- **Genel Müdür:** günlük operasyonlarda nihai yetkili onaycı; departman müdürlerini denetler, limiti aşan talepleri Patron'a gönderir.
- **Departman müdürü:** kendi departmanındaki hareketi, üretim miktarı/fire/dara, stok sayımı, satış iskonto, yükleme, kısmi kabul vb. işlemleri yetkisi çerçevesinde yönetir ve onaylar; eşikleri aşan talebi yükseltir.
- **Çalışan:** yetkisi dahilinde rutin işi başlatıp tamamlayabilir; istisnai durumu onaya yollar.
- Onay zinciri ihtiyaca göre Çalışan→Departman Müdürü→Genel Müdür→Patron; gereksiz aşamalar uygulanmaz. **İşlemi başlatan kişi, onay gerektiren kendi istisna/kritik işlemini onaylayamaz**, çoklu rol veya yönetici hesabı bunu aşamaz. Önceden onaylı kural sınırındaki rutin işlemler her seferinde ikinci onay beklemez.
- Kısmi onay ve ret desteklensin; kalan miktarlar/kısımlar izlenebilir olsun, hiçbir şey sessizce kapanmasın. Üst kullanıcı kısmi onay ardından üst seviyeye sevk edebilir.
- İskonto limiti, satış tutarı, kredi koşulu, vade, ödeme, fire toleransı vb. işlem bazlı eşikler tanımlanır. Yetki değişiklikleri ve tüm kritik işlemler kullanıcı/zaman/eski-yeni değer/gerekçe ile denetlenir. Onay bekleyen işlem onaysız stok, kesin sevkiyat veya cari hareketi doğurmaz.
- Yetki listesi sadece ekranda gizleme değildir; sunucu ve sorgu seviyesinde uygulanır. `deny` kısıtları açık `allow` ile bypass edilmez.

## 5. Çoklu depo, şirket/kiralık araç, dağıtım ve araçtan satış

- Her şirketin birden çok deposu; depolar arası transferler, stok ayrımı, sayım, ürün kabulü, hasarlı/karantina stok, taşıma sırasındaki zimmet ve hareket geçmişi.
- Araç **şirket aracı** (tekrarlanan mobil stok/depo) veya **dışarıdan kiralık/taşıyıcı araç** (sefer bazlı, emanet/zilyetlik ve gönderi takibi) olabilir. Dış araçların şirket demirbaşı olması şart değil. Şoför/taşıyıcı, plaka, yükleme listesi, güzergâh, taşıma bedeli ve belgeler.
- **Planlı dağıtım:** Bir seferde birden fazla müşterinin siparişi ve ayrı yükleme/teslimat listesi; depodan araca aktarma müşteriye teslim edildi anlamına GELMEZ. Müşteri bazında ayrılan miktar, yükleme, yolda, teslim, ret/iade statüleri ayrıdır.
- **Serbest dağıtım/araçtan satış:** Araç önceden stokla yüklenebilir; ön siparişi olan veya olmayan müşteri ziyaretinde yeni sipariş oluşturulup yetki ve stok sınırları içinde aynı anda teslim edilebilir. Aracın stok bakiyesi ve satışa ayrılmış kısmı izlenir. Yetki limitini aşan anlık satış onaya düşer.
- **Eksik/fazla teslim:** Sipariş miktarı ≠ gerçek teslim miktarı ayrımı. Eksik kalan açık kalır. Fazla teslimde müşteri kabulü, fiyat/kredi limiti ve gerekli onay/ek satış işlemi olmadan kayıt otomatik büyümez.
- Teslimat kanıtı: alan kişi, saat, varsa imza/fotoğraf/belge; kullanıcı ve şirket izinlerine göre. İade, hasar, satılabilir/satılamaz ayrımı.
- Sefer açık kalabilir; akşam merkeze dönüş zorunluluğu yok. Sefer kapanışında beklenen–sayılan araç stoku, depoya dönüş, müşteriye teslim, iade ve yetkili tahsilatlar mutabık.
- Sipariş/üretim/depo/sevkiyat rollerinin fiyat görünürlüğü geçmiş davranışları korunmalı.

## 6. Finans, risk, cari hesap, ödeme ve tahsilat

- Finans **ayrı uygulama**; cari kartlar, müşteri ve tedarikçi, borç/alacak hareketi, tahsilat/ödeme, kasa/banka/POS/kredi kartı, vade planı, geçmiş, rapor, kısmi ve çoklu kapama.
- Müşterilerde şirket bazlı özel **kredi limiti** ile bağımsız **risk sınıfı**: Peşin, Düşük, Normal, Yüksek, Bloke ve özel şirket sınıfları. Risk kontrolü serviste daima çalışır.
- Risk grubu, iç risk puanı/gerekçesi ve yönetici özel notları **yalnızca açık yetkili Patron, Genel Müdür, Finans Müdürü, Satış Müdürü** tarafından görülebilir. Müdür unvanı otomatik yetki sağlamaz; diğer departman müdürleri, satış danışmanı, şoför, müşteri, PLATFORM ADMİNİ göremez. Satış kullanıcıları için nötr mesaj: **“Bu işlem için yönetici onayı gerekiyor.”** Risk alanları yetkisiz API, dışa aktarım, bildirim, PDF ve aramalara sızmamalı.
- Risk grubunu/kredi limitini değiştirme ve bloke kaldırma: yetkili Satış/Finans Müdürü gerekçeli talep oluşturabilir, Genel Müdür kendi sınırı içinde onaylar, yüksek tutar/istisna Patron'a yükselir. Onaylanana kadar eski değer geçerlidir. Talep sahibi kendi talebini onaylamaz. Bütün eski/yeni değerler kaydedilir.
- **20. kesin karar:** kredi limiti yalnız mevcut cari borca göre değil, **onaylanmış ve henüz teslim/fatura edilmemiş açık sipariş taahhütlerine** göre de kontrol edilir. Yeni sipariş girerken uygunluk önizlenir; sipariş onaylanırken kredi payı **atomik** ayrılır. İptal/azaltma uygun kredi payını serbest bırakır. Sipariş fatura/cari borca dönüştüğünde aynı yükümlülük çift sayılmaz. Eşzamanlı farklı satıcı işlemlerinde oversell/overcredit engeli ve idempotency şart.
- Önceden belirlenen personel satış/iskonto/vade/açık hesap sınırı dahilinde çalışabilir, aşınca onay ister. Müşteri kredi limiti çalışan limitiyle birbirinin yerine geçmez; ikisi de uygulanır. Vadesi geçmiş borç ve bloke için esnek yönetici kuralı gerekir.
- Önceki plan kapsamında şirket ADMİN/yönetici/satış ve müşteri rollerinde ödeme başlatma talepleri düşünülüyor. Müşteri yalnız kendi carisi için; personel yalnız atanmış cariler için; yetkili Finans yöneticileri gözlemler/onaylar. **Ödeme sağlayıcısı, gerçek sanal POS, iade ve muhasebe entegrasyonu henüz seçilmedi**: yetkili ödeme talebi/ödeme niyeti ile gerçek ödeme tahsilini ayrı modelle; sağlayıcı seçilmeden gerçek parayı tahsil etmiş gibi kaydetme veya canlı işlem başlatma. Yönetici/satışın yönetim ekranlarındaki erişimi şirket içi yetkiyle sınırlı.

## 7. Müşteri Portalı

- Müşteri kendi şirket/cari hesap yetkilerine bağlı ürün/sipariş durumu, onay gerektiren teklifler, üretim ve teslimat durumu, sevkiyat, teslim tutanakları, fatura/ekstre belgeleri ve izin verilmiş ödeme ekranlarını görür.
- Başka müşteriyi, personel maaşını, iç risk sınıfını, diğer şirketleri ve üretimdeki gizli fiyat/maliyetleri göremez.
- Yetkili müşteri temsilcisi tek müşteri şirketindeki alt kullanıcıları yönetebilirse yalnızca devredilmiş izinler kapsamında olabilir.
- Sipariş vermek/teslim alındığını doğrulamak/ödeme yapmak ayrı izinlerdir.

## 8. İnsan Kaynakları — ayrı uygulama ve mahremiyet

- Çalışan özlük kartı ≠ giriş yapabilen yazılım kullanıcısı. Şirkette 100 personel varken sadece 15 aktif kullanıcı olabilir.
- Organizasyon ve bağlı yönetici, işe giriş/çıkış, görev, sözleşme/belgeler, izin talebi ve onayı, puantaj, vardiya, devamsızlık, fazla mesai, performans, eğitim, sertifika, ücret/prim/avans/masraf, bordro.
- Üretim puantajı ve görevlendirme verileri Operasyon'daki maliyet/verimlilik alanlarına, onaylı maaş/avans/masraf yükümlülükleri Finans'a veri sözleşmesi üzerinden aktarılabilir.
- **Maaş, bordro, prim, kesinti, hassas özlük bilgileri** otomatik olarak departman müdürlerine açılmaz. Yalnız açık yetkili Patron, Genel Müdür ve İK/Bordro yetkilisi görür. PLATFORM ADMİNİ göremez. Finans'ta maaş ödemek bordro ayrıntılarını görme yetkisi sağlamaz. Personel kendi belgelerini görmek için ayrıca yetki alabilir.
- Türkiye KVKK, saklama, mevzuata uygun bordro/SGK ve veri minimizasyonu ayrı hukuki/entegrasyon değerlendirmesine tabidir; resmî entegrasyon erişimi yoksa otomatikmiş gibi gösterme.

## 9. Güvenlik, kalite ve veri bütünlüğü

- AuthN/AuthZ sunucuda; şirket izolasyonu, satır bazında veri erişim kontrolü, risk/maaş gibi hassas alanda field-level filtreleme; dolaylı ID erişim testleri.
- İstek bazında idempotency, concurrency kontrolü, versiyon/revizyon çakışması, transaction, audit log, mantıksal iptal ve yetki geri alma senaryoları.
- İki kişi şartı ve self-approval engeli API düzeyinde zorunlu; fiyat gizliliği roller bazında korunmalı.
- Yerel deneme alanıyla gerçek veriyi karıştırma. Önizleme/staging için izole DB. Gizli anahtar, `DATABASE_URL`, parola, erişim token'ı, kişisel ve canlı müşteri verisi dokümana/issue/test fixture'a koyma.
- Eklenen modüller mevcut ekranları kullanılmaz kılmasın; telefon öncelikli, Türkçe varsayılan ve halihazırdaki arayüz dilleri korunsun. Basit işlere gereksiz onay akışı dayatma.

## 10. Geliştirme sırası / Codex kontrol listesi

**Faz 0 — keşif ve emniyet:** Mevcut davranış/endpoint/DB ve test envanteri, branch doğrulama, canlı/staging ayrımı, kritik regresyon testleri; mimari risk ve açık karar listesini belgele. Kod incelemesine dayan; README'yi varsayım olarak görme.

**Faz 1 — şimdi kodlamaya başlanacak ilk güvenli dilim:**
1. Dört bağımsız app yapısı için gerçek build/entrypoint, ayrı navigasyon/authorization skeleton; mevcut Operasyon'a uyumlu geçiş planı. Finans/Portal/İK'da sahte canlı işlem yok.
2. Ortak tipler: tenant, uygulama entitlement, kullanıcı/çalışan ayrımı, permission/role/department/scope/limits, approval request/state, audit ve iş nesneleri bağlantıları.
3. Platform ADMİNİ ile şirket kullanıcısı yetkisini güvenli biçimde ayıran altyapı ve test; mevcut ADMİN'e geçiş uyumluluğu.
4. Tenant/data isolation ve yetki testi: bir kullanıcı diğer firma verisini göremez; platform ADMİNİ ticari veriye erişemez; gizli risk/bordro alanları yetkisiz yanıtlarına düşmez; self-approval reddedilir.
5. `pnpm test`, `pnpm check`, `pnpm build` başarı; belge değişiklikleri + sonraki faz planı. Mevcut production deployment ile otomatik bağlama YOK.

**Faz 2:** Şirket başvuru/onay, dört uygulamaya entitlement, kullanıcı çoklu rol, kapsamlı izin ve kademeli onay sistemi; mevcut Operasyon fonksiyonlarını migration ile koru.

**Faz 3:** Çoklu depo, araç/rota, kiralık araç planlı sevkiyat, şirket aracı mobil stok, sefer, teslim/iade, araçtan satış.

**Faz 4:** Finans çekirdeği, cari/kredi limiti rezervasyonu, gizli risk politikaları, onaylar, kasa/banka/ödeme kayıtları; Müşteri Portalı ile yetki bağlantıları.

**Faz 5:** İK çekirdeği ve izin/puantaj/Finans–Operasyon entegrasyonları; hassas alan RBAC; onaylı bordro kapsamı.

**Faz 6:** Üretim iş emirleri, fire/dara, maliyet, maliyet merkezi, gelişmiş raporlama; ödeme sağlayıcısı gibi açık tercihleri kullanıcıyla tamamladıktan sonra gerçek entegrasyon.

Her fazda veri geçiş/rollback ve kabul testlerini ver, mevcut fonksiyonları kaldırma, user-facing ekranların tutarlılığını koru. Yeniden tasarımı sırf estetik için yapma. Faz 1'de kullanıcıya gerçekten çalışır ayrı uygulama girişleri/önizleme göster; henüz hayata geçirilmemiş işlemleri çalışıyormuş gibi sunma.

## 11. Henüz sorulup kesinleştirilecek ayrıntılar (geliştirmeyi bloklamasın, tehlikeli varsayım da yapılmasın)

Ödeme sağlayıcısı ve gerçek paranın tahsil/iade akışı; bordro hesaplama/yasal entegrasyon kapsamı; alan adı ve proje adları; tam kredi borcu değerleme (teslim, fatura, iade gibi olay sıraları); rol başına TL/% varsayılanları; gerçek stok birimleri/fire/dara sektör şablonları; offline mobil işlem yetkisi; üretim maliyet muhasebesi ve üçüncü taraf entegrasyonları. Varsayılan değerleri gerçek kurum verisi veya politika kararıymış gibi dayatma; yapılandırılabilir tasarla ve karar gerektirenleri açık işaretle.

## 12. Çıktı ve kabul

Her PR/commit için değişikliklerin özeti, dokunulan alanlar, dört ayrı uygulamanın gerçek entrypoint/build durumu, mevcut Operasyon regresyon özeti, test sonuçları, güvenlik kontrolleri, canlı veriye dokunulup dokunulmadığı, gereken ek kararlar ve sonraki adımlar raporlanmalı.

**Kabul edilmez:** dört uygulama yerine tek mevcut uygulamaya dört sekme eklenmesi; eski çalışan özelliklerin kaybolması; diğer tenant verisinin görünmesi; platform ADMİNİ'ne firma içi tüm erişimin verilmesi; risk/maaş verisinin sales ekranı/API'de sızması; kendi kritik talebini kendi onaylama; onaysız kredi/stock hareketleri; gerekli izole ortam olmadan canlı SQL veya release.


## 13. Karar 21 — Tek siparişin birden fazla depodan karşılanması (2026-10-22, ONAYLANDI)

- **Seçim B:** Aynı müşteri siparişi birden fazla depoda ayrı ayrı hazırlanıp ayrı sevkiyatlarla teslim edilebilir. Ürünleri önce tek merkez depoya transfer etme zorunluluğu **yoktur**.
- Tek bir kanonik `order_id` / kullanıcıya görünen sipariş numarası korunur. Altında depoya özgü hazırlama/rezervasyon (`fulfillment`) ve sevkiyat/teslimat kayıtları tutulur. Örn. SIP-001, Merkez Depo 60 + Şube Deposu 40 = toplam 100.
- Her depo sorumlusu yalnız yetkili olduğu depoya atanmış miktarı hazırlar, sayar ve depodan çıkarır; siparişin tamamını veya başka deponun miktarlarını yanlışlıkla kapatamaz.
- Stok rezervasyonu **depo bazında ve eşzamanlı işlem güvenliğiyle** yapılır; iki depo, iki satıcı veya iki cihaz aynı fiziksel adedi ikinci kez ayıramaz. Rezervasyon/üretim/transfer/araç yükleme/teslimat birbirinden ayrı stok hareketidir.
- Hazırlanan, araca yüklenen, depodan çıkan, müşteriye fiilen teslim edilen, iade edilen, açık kalan ve iptal edilmiş miktarlar ayrı durumlarda saklanır. **Depodan sevk edildi = müşteriye teslim edildi değildir.**
- Müşteri isterse iki farklı zamanda ve iki ayrı araçla teslimat alabilir; müşteri portalında tek sipariş ve altında ayrı teslimat durumları görünür. İrsaliye/teslimat fişi depo ve sefer bazında ayrılabilir; ortak sipariş ilişkisi kaybolmaz.
- Her alt sevkiyatta gerçek teslim miktarı siparişe işlenir. Sipariş ancak toplam net teslim, kapanış/iptal gibi açıkça tanımlı koşulları karşıladığında tamamlanır; kısmi teslimatta açık kalan miktar korunur. Fazla teslim ayrı yetkilendirme ve gerekçe gerektirir.
- Satır bazında farklı ürünler de farklı depolara, aynı satırdaki aynı üründen miktar parçaları da farklı depolara atanabilir.
- Maliyet, sevkiyat ve ödeme raporları hem tek sipariş toplamını hem depo/sevkiyat detaylarını göstermeli; fatura/cari/kredi limiti hesabında çift sayım olmamalı.
- Eski tek depolu sipariş ve stok verisi geriye dönük uyumlu biçimde **varsayılan Merkez Depo** kapsamına taşınabilmeli; mevcut kullanıcılar/siparişler ve üretim-depo-sevkiyat akışı kaybolmamalı.
- **Henüz kararlaştırılmadı:** Siparişin depolara miktar dağıtımı sistemce otomatik mi önerilecek, yetkili kişi mi yapacak? Bu açık karar sonraki görüşmede netleştirilecektir.

## 14. Karar 22 — Depo dağılımı önerisi (2026-10-22, GEÇİCİ TERCİH — tekrar değerlendirilebilir)

- Kullanıcı **B seçeneğini şimdilik tercih etti**; bu karar nihai/kesin değil.
- Sistem, onaylı siparişin ürünlerini ve adetlerini depoların **kullanılabilir (fiziksel − ayrılmış)** stoklarına göre birden fazla depoya dağıtmayı **önerir**.
- Öneri otomatik olarak kesin rezervasyon veya sevkiyat oluşturmaz. Yetkili kullanıcı/müdür öneriyi inceleyip değiştirip onaylayabilir; mevcut şirket/depo/işlem yetkileri ve gerekirse onay zinciri uygulanır.
- Depo bazında stok ve diğer siparişlere ayrılmış miktarlar eşzamanlı kontrol edilir; olumsuz stok/çifte rezervasyon yapılamaz.
- Ön siparişin tek sipariş numarası ve çoklu sevkiyat/kısmi teslimat ilişkileri korunur (bkz. Karar 21).
- **Açık tasarım sorusu:** Önerinin öncelik algoritması (en yakın depo, stok miktarı, en az sayıda sevkiyat, maliyet, teslim tarihi gibi) daha sonra kullanıcıyla belirlenecek. Henüz belirlenmemiş kriteri otomatik kesin kabul etme.

## 15. Karar 23 — Depo ve üretim birlikte değerlendirilen dağıtım optimizasyonu (2026-10-22, C SEÇENEĞİ ONAYLANDI)

- **C seçildi:** Siparişi depolara paylaştırırken teslim tarihi, mevcut kullanılabilir stok, depo-müşteri mesafesi ve nakliye maliyeti **birlikte değerlendirilsin**. Sabit tek bir "en yakın"/"en yüksek stok" kuralı zorunlu olmasın. Yetkili müdür öneriyi görebilsin, gerekçe/izin sınırları dahilinde değiştirebilsin.
- Ürünlerin bir kısmı depolarda hazır, bir kısmı ise henüz **üretilecek** olabilir. Planlama aynı sipariş için (a) hazır stoktan karşılama, (b) üretimden karşılama ve (c) gerekiyorsa transfer/çoklu sevkiyat seçeneklerini birlikte göstermeli.
- Örnek: 200 adet sipariş, depolarda kullanılabilir 80 adet, eksik 120 adet üretim ihtiyacı. 80 adet depo bazında gerçekten ayrılabilir; 120 adet **üretim ihtiyacı/planı** olarak takip edilir ve üretim bitip depocu kabul edene dek **fiziksel satılabilir stok olmaz**. Gelecekteki üretim miktarı mevcut stokmuş gibi müşteriye teslim edilmez.
- Sistem, üretim tamamlama tahminini kapasite/iş takvimi/halihazırdaki iş yükü ve daha sonra eklenecek malzeme/reçete yeterliliği gibi bilinen girdilere dayandırmalı; eksik girdiler varsa tahmini "kesin" gibi sunmamalı. Nakliye süresi ve fiyatı kaynağı belli değilse uydurmamalı.
- Mümkün olan kısmın erken/ayrı sevkiyatı ile tamamının hazır olmasını bekleme alternatifleri sunulabilmeli. Hangi alternatife göre sevk edileceği müşteri kabulü ve yetkili şirket politikasıyla belirlenecek (son karar açık).
- **Aşamalı geliştirme:** Önce doğru veri modelini, mevcut kullanılabilir stok ve planlanan üretim ayrımını, basit kurala dayalı öneri + yönetici müdahalesini ve güvenli sayısal kontrolleri geliştir. Karmaşık rota optimizasyonu, gerçek zamanlı mesafe/nakliye fiyatları, çok ölçütlü ağırlık optimizasyonu ve kapasite/ham madde simülasyonunu ancak gerek duyuldukça sonraki fazlarda uygula. Çok büyük ve kırılgan ilk sürüm yapma. Kaybedilmemesi gereken davranışları şartnamede tut ama gereksiz tüm detayları aynı anda kodlama.
- **Açık karar:** Hazır stok kısmen mevcutken erken kısmi teslimat varsayılan olarak önerilsin mi, yoksa müşteri tüm siparişin birlikte teslimini seçebilsin mi? (kullanıcıyla netleştirilecek).

## 16. Karar 24 — Sevkiyat karar yetkisi (ONAYLANDI)

Siparişin hazır kısmının erken/kısmi ya da topluca sevkiyatına müşteri ekranı otomatik karar verdirmez. Yetkili Sevkiyat Müdürü veya yetki ve limitleri uygun Sevkiyat Sorumlusu/Sevkiyatçı karar verir. Sistem stok, üretim tahmini, müşteri teslimat taahhüdü, sefer ve nakliye maliyetini göstererek öneri sunar. Yetki sınırını aşan veya müşteriye verilen teslimat sözünü etkileyen değişiklikler üst onay ve gerektiğinde müşteri teyidi gerektirir. Üretilecek mallar fiziksel stok sayılmaz; yükleme, sevk, gerçek teslim ve kalan miktar ayrı izlenir. Onay gerektiren kendi istisna işlemini kimse kendi onaylayamaz. Hangi sevkiyat değişikliklerinin müdür onayı gerektirdiği firma bazında ayrıca belirlenecek.

## 17. Karar 25 — Üretimden çıkan mal depo kabulü olmadan sevk edilemez (2026-10-22, ONAYLANDI)

- **Kesin kural:** Üretim Elemanı bir ürünün üretimini tamamlandığına dair bildirim yaptığında bu bir **üretim bildirimi**dir; **fiziksel depo stoku, satışa uygun stok, sevkiyata hazır mal veya sevkiyat izni DEĞİLDİR**.
- Depo Elemanı/Depo Sorumlusu ürünleri fiziksel sayar ve kendisine verilen yetkiler içinde depo kabulü yapar. Kısmi kabul mümkündür; kabul edilmeyen miktar **Depo kabulü bekleniyor** durumunda kalır ve sevk edilemez.
- Sadece **depo kabulü tamamlanmış** ve varsa mevcut sipariş/rezervasyon kurallarına göre sevk için kullanılabilir ürünler yüklenip sevk edilebilir. Üretimden doğrudan araca veya müşteriye depo kabulünü atlayan stok çıkışı olmamalı; API ve veritabanı düzeyinde engellenmeli.
- Teslim alma/kabul miktarları, eksik/fazla farkları, üretim bildirimiyle eşleşmesi, kabulü yapan gerçek kişi ve zaman bilgisi izlenebilir olmalı. Üretim bildiren ve depo kabulü yapan roller çoklu atanabilir; bu durum, ayrı onay gerektiren kritik bir işlemi kişinin kendisinin onaylamasına imkân vermez.
- **Depocunun işi zamanında yapması işletme kuralıdır.** Bekleyen kabul listesinde üretim bildirim zamanı, ilgili depo/sorumlu, kaç adet beklediği ve bekleme süresi görünür; depo müdürü geciken işleri takip edebilir. Hatırlatma/eskalasyon süresi ve kanalına kullanıcıyla sonra karar verilecek; gecikme **otomatik depo kabulü** doğurmaz.
- Sevkiyat birimi, üretimi tamamlanmış ama henüz kabul edilmemiş malları **bilgi amaçlı bekleyen üretim** olarak görebilir; bu miktarlar yüklenebilir/sevk edilebilir stokla karıştırılmaz. Yetkisiz doğrudan sevkiyat kaydı yapılamaz.
- Mevcut Operasyon 0.13.0'da bulunan üretim bildirimi → depo kabulü → sevkiyat ayrımı **korunacak**, yeni çoklu depo ve araç stoklarıyla da aynı kural geçerli olacak.


## 18. Karar 26 — Depo kabul süresi, sorumluluk ve gecikme uyarıları (2026-10-22, ONAYLANDI)

- Üretim bildirimi kaydedilir kaydedilmez ilgili depoda **Depoya Kabul Bekleyenler** görev kaydı otomatik oluşur; işin doğuş zamanı, ürün/adet, iş emri/sipariş, hedef depo, sorumlu kişi veya ekip, durum ve bekleme süresi izlenir.
- Şirket/depo yöneticileri **beklenen kabul süresi (SLA)** tanımlayabilir. Üretim/mesai takvimi ve iş günü kuralları desteklenebilecek biçimde tasarla; varsayılan kesin dakika/saat tüm sektörlere dayatılmasın.
- Süre sınırı aşıldığında görev **Gecikti** olarak işaretlenir ve ilgili depocu, depo sorumlusu/müdürü için rol/yetki bazlı uygulama içi bildirim ve yönetici geciken işler görünümü oluşturulur. Bildirimler tekrar tekrar spam'e dönmesin; hatırlatma ve gerektiğinde üst yönetime yükseltme yapılandırılabilir.
- Depo Müdürü, hangi çalışanın hangi kabulü ne zamandır beklettiğini, kaç ürün bulunduğunu ve gecikme geçmişini takip eder; farklı depolarda yalnız yetkili olduğu kapsamı görür. Kabul görevinin başka yetkili personele devri / vardiya devri geçmişi kaybolmadan gerçekleşebilir.
- Kısmi kabul yapıldığında yalnız kabul edilen miktar stok olur; geri kalan miktar için bekleyen görev sürer ve gecikme izlemesi durmaz. Ret, eksik/kusurlu ürün ve açıklama alanları denetlenebilir.
- **Gecikme hiçbir şekilde ürünleri otomatik depoya kabul ettirmez** ve üretimden doğrudan sevkiyata izin vermez. Sevkiyat yalnızca fiilen kabul edilmiş ve kullanılabilir stoktan yapılır (Karar 25).
- Olaylar işlem geçmişine eklenir; sonradan filtrelenebilir gecikme raporları oluşturulabilir. Bildirim kanalı/tekrar sıklığı, şirket tercihine göre sonraki aşamada yapılandırılabilir.
- Mevcut SÖZBİR Operasyon üretim→depo kabulü→sevk sırası değiştirilmeyecek; mevcut testler korunacak, gecikme ve yetkisiz kabul/sevk için yeni testler eklenecek.

## 19. Üretim, reçete, fire, dara ve maliyet — TASARIM TASLAĞI (henüz kullanıcı onayı bekliyor)

> Bu bölüm kullanıcı "başla" diyerek üretim tasarımına geçince oluşturulmuş **öneridir**, nihai onaylı gereksinim değildir. Codex bu bölümü mimari gereksinim/gelecek faz hazırlığı olarak değerlendirsin; kritik muhasebe ve reçete politikalarını kullanıcıdan onay almadan gerçek üretim verisine uygulamasın.

### İş akışı
- Mevcut onaylı müşteri siparişine veya depoya stok üretim talebine bağlı **üretim iş emri**; üretim planı ve ürün/miktar/hat/termin bilgisi.
- Her bitmiş ürün için şirket/tesis bazında **versiyonlanmış üretim reçetesi (BOM)**: malzeme kodu, standart tüketim ve birimi (adet/metre/kg vb.), fire toleransı, alternatif malzeme, geçerlilik tarihi, varsa yarı mamul ve dış işlem adımları.
- İş emri açıldığında kullanılan reçete versiyonu o işe bağlanır. Daha sonraki reçete revizyonu tamamlanmış iş emrinin tarihsel tüketimini değiştirmez. İş emrine özel reçete/fiili tüketim değişikliğinin yetkisi ve onayı ayrı belirlenir.
- **Hammadde kullanılabilirliği:** miktar ve birim dönüşümleri doğru hesaplanır; stok rezervasyonu fiziksel tüketim değildir. İşe sarf etme, depodan çıkış, üretim tüketimi, kalan malzemeyi iade ve hurda hareketleri ayrı muhasebe/stok olaylarıdır; tek işlem tekrar gönderilince ikinci kez stok eksilmez.
- **Planlanan vs fiili:** Üretim elemanı üretilen sağlam adet, hatalı/yeniden işlenecek adet, kullanılan hammaddeler, fire sebepleri, varsa tartı brüt ağırlık/dara/net ağırlık kaydeder. Dara (kap/ambalaj ağırlığı) ile fiziksel fire birbirine eşit değildir ve aynı alanı kullanamaz.
- **Fire türleri:** normal kesim kaybı, geri kazanılabilir hurda, kusurlu ürün, yeniden işleme ve telafi edilemez fire ayrı. İstisnai fire oranı şirket tarafından belirlenmiş yönetici onayına düşer. Hurda satılabilir/yeniden kullanılabilir stok olarak ayrı sınıflanabilir; çifte sayım olamaz.
- **Dış işlem:** büküm, galvaniz, boya vb. taşeron işlemleri ve yarı mamul dışarı gönderme, dönüşte sayım/kalite kabulü, dış işlem miktar ve bedeli; kaybolan, reddedilen, geri dönen malzemeler izlenebilir.
- **Üretim→depo:** Üretim tamamlandı kaydı sevk edilebilir stok yaratmaz. Sadece depocunun sayarak fiziksel kabul ettiği miktar ilgili depoya girer; Karar 25 ve kabul SLA'sı Karar 26 aynen geçerlidir.
- **Maliyet:** İş emrinde planlanan/gerçekleşen malzeme, fiili veya standart işçilik, dış işlem, enerji/genel üretim gideri, hurda geri kazanımı ve varsa fire maliyetleri ayrı raporlanır. Üretim toplam maliyeti ile sağlam kabul edilen ürün başına maliyet belirlenebilir; yarı mamul/WIP, iade ve hurda değerlemesi sonradan Finans yetkileri ve şirket politikasıyla kesinleştirilecek. Veri kaynağı yoksa uydurulmuş maliyet veya gerçek kâr gösterilmez.
- **Finans entegrasyonu:** fiyatlandırma/maliyet kaynağı Finans; üretim veri kaynağı Operasyon. Muhasebeye kayıt gönderme ve çift kayıt oluşmasını engelleyen olay/idempotency tasarımı gerekir. Üretim elemanı gizli alış fiyatını, işçilik ücretini veya kâr marjını otomatik görmez.
- **Raporlar:** plan/fiili tüketim, ürün/parti/iş emri bazında fire, hurda, üretim maliyeti, birim maliyet, kapasite, kalite, gecikme, işçilik ve taşeron takibi. Her şey firma ve rol bazında filtrelenir; izlenebilir geçmiş tutulur.
- **Aşamalı geliştirme:** Önce malzeme kartı, temel BOM, stokta yeterlilik, iş emrinde üretim bildirimi ve depo kabulü, fiili tüketim/fire. Daha sonra çok kademeli BOM, lot/seri izleme, çok süreçli üretim, gelişmiş maliyet/işçilik, dış işlem ve varyans raporları. Mevcut 0.13.0 üretim planı ve depo kabulü silinmez.
- **Karar 27 ile onaylandı:** Standart reçete korunur; iş emrine özel reçete değişikliği yetkili Üretim Müdürü onayına tabidir. Ayrıntılar aşağıda.

## 20. Karar 27 — Standart ve iş emrine özel üretim reçetesi (2026-10-22, ONAYLANDI)

- **Her mamulün standart bir üretim reçetesi (BOM) bulunacak.** Standart reçete revizyonlanabilir ve geçerlilik tarihleriyle takip edilebilir; mevcut iş emri açılırken hangi reçete sürümünün esas alındığı kaydedilir.
- Müşteriye özel ürün, malzeme alternatifi veya istisnai üretim ihtiyacında **yalnız ilgili üretim iş emrine özel reçete/tüketim değişikliği** yapılabilir. Bu değişiklik standart reçeteyi veya başka bir üretim emrini otomatik olarak değiştirmez.
- İş emrine özel reçete değişikliği **ilgili işlemi yapmaya yetkili Üretim Müdürü onayına** tabidir. Müdürün onay yetkisi, çoklu rol, yetki sınırı ve kendi başlattığı istisnayı kendi onaylayamama kuralları (Karar 9, 12, 13) korunur; gerekirse Genel Müdür'e yükseltilir.
- Orijinal standart reçete, üretime uygulanan onaylı iş emri reçetesi, talep eden/onaylayan kullanıcılar, değişiklik sebebi, değişen malzeme/adet/metre/kg gibi miktarlar, eski-yeni değerler, tarih ve onay geçmişi ayrı saklanır.
- İş emrine özel değişiklik, beklenen hammadde ihtiyacını ve **planlanan maliyeti** günceller; gerçek tüketim ve **fiili maliyet** ayrıca kaydedilip karşılaştırılır. Üretim elemanı gizli alış fiyatlarını otomatik görmez.
- Onaysız değişiklikle hammadde çıkışı veya kesin üretim kaydı oluşturulamaz; bu kural API/sunucu tarafında uygulanır. Önceden tamamlanan ve depo kabul edilen üretim kayıtları geçmişe dönük sessizce yeniden hesaplanmaz.
- **Karar 28 ile onaylandı:** Reçete sarfı otomatik önerir, üretim elemanı fiili tüketimi doğrular; tolerans aşımı Üretim Müdürü onayına gider. Ayrıntılar Karar 28'de.

## 21. Karar 28 — Reçeteye göre önerilen ve fiilen doğrulanan hammadde sarfı (2026-10-22, ONAYLANDI)

- Üretim iş emri için hammadde ihtiyacı, o iş emrine bağlanmış geçerli standart/özel onaylı **reçeteden otomatik hesaplanır**. İş emri miktarı ile reçete birimleri (adet, metre, kilogram vb.) tutarlı biçimde çarpılıp gösterilir. Hesaplanan tüketim **planlanan sarftır**; kendiliğinden stok eksiltmez.
- Üretim elemanı malzeme türü ve planlanan miktarı görür; **gerçekte kullanılan miktarı doğrular** ve ihtiyaç varsa değiştirir. Her malzemeyi zorunlu olarak sıfırdan manuel yazmak gerekmez. Yetkisiz çalışan bir malzeme kartını/reçeteyi değiştiremez.
- Planlanan ve fiili miktar ile aradaki **pozitif/negatif sapma**, açıklama, fire nedeni, bildiren kullanıcı, tarih/saat, iş emri, kullanılan depo/parti ve ilgili üretim adedi kayıtlı olur. **Sapmanın tamamı otomatik olarak fire sayılmaz**; fire, hurda, düzeltme, geri dönen kullanılabilir malzeme ve teknik sebepler ayrı sınıflandırılabilir.
- Şirket/ürün/malzeme veya üretim süreci bazında yapılandırılabilir **fire ve tüketim sapma toleransları** uygulanır. Limit içindeki rutin fiili sarf uygun yetkilerle kesinleştirilebilir. Eşik aşımında gerekçeli talep Üretim Müdürü'ne, gerekiyorsa Genel Müdür'e onaya gider; talep sahibi kendi istisnasını onaylayamaz.
- **Hammaddeyi işe rezerve etmek stok tüketimi değildir.** Planlanan/ayrılan, depodan üretime verilen (zimmet/transfer), fiilen tüketilen, elde kalan/iade edilen ve fire/hurda hareketleri ayrı aşamalar olarak izlenir; fiziksel stoktan düşüm yalnız tanımlı yetki/onay koşullarını sağlayan kesinleşmiş sarf/ilgili gerçek depo çıkış hareketiyle, çift düşüm olmadan yapılır.
- Kullanılabilir fiziksel stok ve rezerve miktarlar negatif değer oluşturamaz; yetersiz stokta yetkili tedarik/transfer/istisna iş akışı gerekir. Aynı isteğin tekrarı, iki kullanıcıyla eşzamanlı işlem ve kısmi üretim durumlarında **idempotency ve işlem bütünlüğü** korunur.
- Bir iş emrinde birden fazla üretim partisi/ vardiya bildirimi yapılabilir; fiili sarf ve kalan rezervasyonlar kısmi üretime orantılı ve izlenebilir bağlanır. Onay sonrası gerekli düzeltmeler sessiz veri değiştirme yerine geri alma/düzeltme hareketiyle denetlenir.
- Sarfın fiili miktarı **gerçek maliyet** hesabında, standart reçete tüketimi ise **planlanan maliyet** hesabında kullanılır; Finans fiyat/kur/alış değerleme politikaları henüz ayrıca kararlaştırılacaktır. Üretim elemanı maliyet ve gizli alış bedellerini sırf sarf bildirdiği için göremez.
- **Mevcut üretim→depo kabulü→sevkiyat sırası aynen korunur** (Karar 25); hammaddenin sarf edilmesi tek başına mamul için depoya kabul ya da sevkiyat yetkisi yaratmaz.
- **Sonraki karar:** Kesim firesi ve hurda malzemenin geri kazanılabilir stok olarak ayrı izlenmesi ve tekrar üretimde kullanılması şartları kullanıcıyla netleştirilecek.


## 22. Karar 29A — Bağımsız hammadde/fire mutabakatı ve yanlış bildirimi yakalama (2026-10-22, ONAYLANDI)

- Kullanıcı, üretim personelinin fiili tüketimi veya fireyi gerçekte farklı olduğu halde reçetedeki teorik değerle onaylama riskine karşı **bağımsız fiziksel kontrolü onayladı**.
- **Kontrol zinciri:** Depodan üretime fiilen verilen hammadde kaydı, üretim elemanının tüketim/fire bildirimi ve üretimden depoya dönen kullanılabilir malzeme/hurdanın sayım veya tartı kaydı birlikte değerlendirilir. Bunların farkı stok mutabakatı sorunu olarak izlenir; otomatik olarak fire, hırsızlık veya suç sayılmaz.
- Üretim çalışanının kendi bildirimini tek başına onaylaması fiili tüketimi **bağımsız doğrulanmış** yapmaz. Sorumlu depo yetkilisi fiziksel kabulü/iadeyi doğrular; sınır üstü farkı yetkili Üretim Müdürü inceler. Kritik istisna onayında işlemi başlatan kişi kendi onayını veremez.
- Miktar muhasebesi ürüne ve birime göre doğru olmalı. Örn. 500 kg verilen − 20 kg kullanılmamış iade − 15 kg tartılmış hurda = 465 kg başka şekilde açıklanması gereken net sarf/diğer ayrımlar; bildirilen 450 kg ise 15 kg **araştırılacak farktır**. Tartı, miktar ve çevrim kontrolleri olmadan kesin fire hesabı yapılmamalıdır.
- Doğrulanmış, personel tarafından bildirilmiş, reçeteden hesaplanmış ve mutabakat bekleyen miktarlar raporda açıkça farklı veri güvenilirliği/durum etiketleriyle gösterilir; hiçbir tahmin veya tek taraflı onay **fiziksel olarak doğrulanmış gerçek** diye sunulmaz.
- Hammadde/fire kontrolleri üretimden çıkan mamulün fiziksel **depo kabulü zorunluluğunu** ortadan kaldırmaz (Karar 25); üretim→depo kabul→sevk kuralı korunur.

### Karar 30 — Esnek işletme profilleri ve vardiya sonu toplu mutabakat (2026-10-22, ONAYLANDI)

- Kullanıcı özellikle tek depocunun bütün işlere yetişememesi ve bazı firmaların henüz süreç disiplini kuramamış olması endişesini dile getirdi. Sistemin personeli sahte/ezbere onaya teşvik edecek kadar ağır bir süreç dayatmaması **tasarım hedefidir**.
- **Kullanıcı tarafından ONAYLANDI:** Aynı uygulama içerisinde şirketçe seçilen **Pratik / Kontrollü / Ayrıntılı** kullanım profilleri. Bunlar yeni uygulamalar değil, kontrol sıklığı ve arayüz derinliği ayarlarıdır:
  - Pratik: BOM önerisi + üretim beyanı; mümkün olan hammadde/hurda hareketleri toplu vardiya/gün sonu bağımsız mutabakata sunulur. Ön doğrulama tamamlanmadığı sürece miktarlar 'beyan/teorik' olarak işaretlenir.
  - Kontrollü: Fiziksel hammadde çıkışları ve iadeler, vardiya mutabakatı ve sınır aşımı onayı; kritik ürün/iş emirleri için sıkı kontrol.
  - Ayrıntılı: İş emri/lot/parti bazında tüketim, fiziksel tartım, hurda, neden kodları, tam izlenebilirlik; opsiyonel barkod/terazi entegrasyonu.
- Kısmi/birden çok iş için toplu kayıt ile bildirim yükü düşürülebilir; yetkili kişi kontrol etmediği veriyi 'doğruladım' diye işaretlememeli. Toplu işlemde kişi/zaman/kaynak/parti ilişkileri ve geri izlenebilirlik kaybolmamalı.
- Firmada bağımsız depo unvanlı bir çalışan bulunmaması, yetkilendirilmiş depo görevi olan personelin depo kabulü yapabilmesini engellemez; ancak kritik işlemlerde **kendi istisnasını onaylayamama** ve şirketin iki gerçek kullanıcıya dayalı güvenlik kuralları atlanamaz.
- Şirket yetkilileri çalışma profilini zamanla değiştirebilir; mevcut kayıtların doğrulama statüsü, tarihsel mutabakat geçmişi ve onay bilgisi geçmişe dönük değişmez. Kontrol yükü azaltılabilir; doğrulanmamış tüketim gerçeğe uygun ölçülmüş gibi etiketlenemez. Her profilde **bitmiş üründe fiziksel depo kabulü olmadan sevkiyat yasak**.
- **Karar:** Şirkete göre seçilebilir işletme profilleri, vardiya/gün sonu toplu hammadde-fire mutabakatı, izlenebilirlik ve kritik istisna onayı kabul edildi. Kuruma özel SLA/tolerans ve yetki detayları geliştirme aşamasında özelleştirilecektir.
- **Karar 31 ile onaylandı:** Yeniden kullanılabilir kesim parçaları, satılabilir hurda ve geri kazanılamayan kayıp ayrı izlenir; ayrıntılar Karar 31'de.


## 23. Karar 31 — Yeniden kullanılabilir parça, satılabilir hurda ve geri kazanılamayan kayıp (2026-10-22, ONAYLANDI)

**Kullanıcı üçlü ayrımı onayladı.** Fire ve artık malzeme tek bir belirsiz "kayıp" miktarına toplanmayacak:

1. **Tekrar kullanılabilir parça:** Kesimden kalan, başka üretimde kullanılabilecek nitelikteki malzeme. Tür, malzeme/alaşım, ölçü/boy, kesit ve miktar/birim gibi yeniden kullanım için gerekli özellikleriyle izlenebilecek; kontrollü depo kabulü sonrası yeniden kullanılabilir malzeme stoku olarak tutulabilecek. Örnek: 120 cm alüminyum profil. İş emrinden kaynak partiye ve sonraki üretimde fiili tüketime kadar ilişki kurulabilmeli.
2. **Satılabilir hurda:** Mevcut üretimde kullanılamayan, ancak ticari değeri olan alüminyum vb. hurda. Malzeme türü, net ağırlık/ölçüm, hurda deposu, kaynak üretim/iş emri ve yetkili fiziksel kabul kaydedilir. Finans uygulamasındaki cari, fatura, tahsilat ve hurda satış işlemine ilişkilendirilebilir; muhasebe kayıtları çift oluşmaz. Hurdanın stoka alınması **satış veya tahsilat değildir**.
3. **Geri kazanılamayan kayıp:** Yeniden kullanılamayan ve satılamayan fiziksel kayıp; ilgili üretim emri, malzeme, gerekçe, miktar ve maliyet etkisi ayrı raporlanır. Teorik sarf ile gerçek sarf arasındaki her sapma kendiliğinden bu kategoriye girmez.

### İşletme kolaylığı ve stok güvenliği

- Üretim personeli gerçekleşen miktarları ve önerilen kategorileri bildirir; depo veya yetkilendirilmiş bağımsız görevli yeniden kullanılabilir parçaları/hurdaları fiilen sayıp-tartarak kabul eder. Bildirilen, bekleyen, fiziksel doğrulanmış ve ihtilaflı kayıtlar karıştırılmaz; sahte doğrulamayı teşvik eden otomatik kabul olmaz.
- Karar 30'daki **Pratik / Kontrollü / Ayrıntılı** profiller korunur: küçük işletme toplu vardiya/gün sonu malzeme-hurda kaydı yapabilir, ayrıntılı işletme parça/parti/boy bazında izleyebilir. Çok sayıda küçük artık parçayı zorunlu olarak tek tek girmek gerekmez. Kontrol yöntemi fiziksel gerçekliği olduğundan daha kesin göstermemeli.
- Aynı malzemenin yeniden kullanılabilir parça, satılabilir hurda ve kayıp kategorilerine bölünen miktarları iş emri/ana malzeme miktarıyla **miktarsal mutabakata** tabi tutulur. Geri kullanılabilir stok ile hurda stokunda çift sayım ve orijinal hammadde stokunda mükerrer artırma olmamalı. Kategori değişiklikleri ve stok hareketleri yetkiyle ve denetlenebilir düzeltme hareketiyle yapılır.
- Her firma için malzeme grupları, depo noktaları, hurda takibi derinliği ve toleranslar yapılandırılabilir. Şirketten şirkete aynı maliyet yöntemini dayatma; yeniden kullanılabilir parça/hurda değerlemesi ve fire maliyetinin hangi maliyet merkezine nasıl yansıtılacağı Finans ile birlikte aşamalı olarak kararlaştırılacak.
- Karar 25'in **bitmiş ürünün depo kabulü olmadan sevk edilmemesi** şartı geçerlidir. Bu madde hurdanın müşteriye ürün olarak sevki için muafiyet oluşturmaz. Hurda satışı ve hurda depo çıkışı, kendi ticari belge/teslim yetkisi ve fiziki kayıt zinciriyle yürütülür.

**Sonraki açık karar:** Tekrar kullanılabilir alüminyum profil parçalarını firma seçimine göre *boy/ölçü bazında* ayrı stoklayıp kesim planlamasında kullanılabilir önerilere dahil edelim mi? Bu kadar ayrıntının Pratik profilde opsiyonel olması öneriliyor; kullanıcı görüşü alınacak.

## 24. Karar 32 — Artan profillerin yeniden kullanımı ve kesim optimizasyonu (2026-10-22, ONAYLANDI)

- Kullanıcı **kesimden kalan sağlam profil parçalarının tekrar kullanılması** özelliğini onayladı. Bu parçalar firma tercihine göre ayrı yeniden kullanılabilir parça stoğunda; malzeme/profil kodu, kesit, alaşım veya teknik kalite, kullanılabilir boy (mm/cm), miktar, hedef depo, kaynak kesim/iş emri ve mevcut durum bilgileriyle izlenir. Barkod/lot gibi ayrıntılar ihtiyaca göre opsiyoneldir.
- **Kesim optimizasyonu önerileri:** Üretim iş emirlerinin kesim ihtiyaçları hesaplanırken malzeme uyumluluğu ve ölçü uygunluğu doğrulanmış mevcut artan parçalar da yeni tam boy profil stoklarıyla birlikte değerlendirilir; mümkün olduğunda eldeki artan parçayı kullanmayı önerir. Seçim tek bir katı kural değildir: fire miktarı, parçanın kullanılabilirliği, gerekli kesim payı (testere kerf), üretim ihtiyacı ve malzeme/kalite koşulları birlikte gözetilir.
- Örnek: 145 cm kullanılabilir profil parçasından 140 cm parça çıkarmak için 3 mm kesim payı varsa yeterli olabilir; sistem **parça boyu ≥ hedef boy + gerekli kesim payı** kontrolünü yapar. Toleranslar ve süreçteki diğer kesimler işletme/ürün bazında yapılandırılmalıdır. Örnekler gerçek reçete yerine geçmez.
- **Fiziksel doğrulama ve rezervasyon:** Üretimden kalan parçanın kaydedilmiş olması tek başına satılabilir veya kullanıma uygun fiziksel stok oluşturmaz; ilgili depo/atanmış fiziksel kontrol yetkilisi kullanılabilir miktarı, sağlamlığını ve ölçüsünü doğrular. Ardından kesim planı artan parçayı **önerir**; yetkili kişi onaylamadan ve gerçek stok/iş emri ilişkisi kurulmadan tüketim kesinleşmez. Aynı parça iki kesim iş emrine ayrılmaz; eşzamanlı güvenli rezervasyon ve sarf hareketleri zorunludur.
- **Kalanın kalanı:** Yeniden kesimde ortaya çıkan yeni kullanılabilir parçalar (ve satılabilir hurda/geri kazanılamayan kayıp), fiziksel ölçüm ve onay gereğine göre yeniden sınıflandırılır; parçanın ilk kaynak kaydından son kullanımına kadar bağlantı izlenir. Birimi farklı değerler gelişigüzel toplanmaz, stok/maliyet çift sayılmaz.
- **Esnek işletme profilleri:** Pratik profilde kullanılabilir artık malzemenin toplu/özet kaydı yapılabilir ve detaylı parça-boy envanteri **zorunlu değildir**; detay yoksa sistem kesin kesim uygunluğu iddia etmez. Kontrollü/Ayrıntılı profillerde istenirse tek tek uzunluk/ölçüye göre izleme ve optimize kesim önerileri kullanılabilir. Firmanın bu özelliği etkinleştirmesi veya profili değiştirmesi tarihsel stok hareketlerini silmez.
- **Fazlama ve koruma:** İlk fazda veri modeli, fiziksel kabul, boy-kesit eşleştirme ve basit kesim önerisi yeterlidir. Gelişmiş çok çubuklu/çok hedefli optimizasyon, otomatik nesting ve maliyetli rota kararları sonraki fazlardır. Mevcut üretim planı, stok rezervasyonları, malzeme sarfı ve depo kabul→sevk zorunluluğu bozulmayacaktır.

## 25. Karar 33 — İşçilik, SGK, kira, servis, yemek, vade farkı ve tüm genel giderler (2026-10-22, KAPSAM ONAYLI; DAĞITIM POLİTİKASI AÇIK)

**Kullanıcı açıkça üretim/şirket maliyetlerine fabrika kirası, maaş, işveren SGK, vade farkı, personel servisi ve yemek giderlerini de dahil etmeyi talep etti. Bu giderlerin kayda ve rapora dahil edilmesi ONAYLI kapsamdır; hangi giderin hangi maliyet sınıfına, ürüne, döneme ve hangi dağıtım anahtarıyla alınacağı işletme/muhasebe politikası bakımından henüz ayrıca netleştirilecektir.**

### Gider sınıflandırma ve bağlama
- **Doğrudan ilk madde ve malzeme:** Alüminyum profiller, basamaklar, plastik, perçin, yardımcı ve ambalaj malzemesi; ilgili iş emri/parti reçetesi ve fiili sarf hareketi.
- **Doğrudan üretim işçiliği:** Üretim personelinin brüt ücret, işveren SGK primi/işsizlik primi ve uygulanabilir diğer işveren yükleri; izin, prim, fazla mesai, kıdem/izin karşılıkları gibi unsurlar açık muhasebe politikasına göre; doğrudan iş/hat maliyetine çalışılan süre veya güvenilir alternatif ölçütle bağlanabilir.
- **Genel üretim gideri:** Üretim tesisi kirası, üretim alanı elektrik/doğal gaz/su, üretim makinelerinin bakım onarımı/amortismanı, üretim endirekt personelinin ücret/SGK ve işveren maliyetleri, ilgili işçi yemeği/servisi ve iş güvenliği, üretim yeri temizlik/malzeme giderleri; tesis/hat/gider merkezi ve dönem bazında tutulur.
- **Dış üretim hizmetleri:** Boru büküm, galvaniz, boya, fason işçilik ve benzeri taşeron kalemleri; ilgili iş emrine veya uygun dağıtım anahtarına bağlanır; Operasyon ve Finans aynı işlemi ikinci kez giderleştirmez.
- **Satış, sevkiyat ve yönetim giderleri:** Satış personeli gideri, pazarlama, satışa ilişkin nakliye ve dağıtım, idari ofis kirası, muhasebe/yönetim ücretleri, idari yemek-servis gibi kalemler üretim maliyetine körlemesine eklenmez; ilgili dönem/satış siparişi/masraf merkezi düzeyinde **satış sonrası kârlılık** analizlerinde ayrıca gösterilir.
- **Finansman ve vade farkları:** Banka faiz/komisyon, kredi/pos finansman maliyeti, tedarikçiye ait vade farkı ve iskonto etkisi ayrı maliyet kodu ve sözleşme/fatura/ödeme bağlantısıyla izlenir. Üretim maliyetine aktarılan kısmın olup olmadığı geçerli muhasebe standardı, işlem niteliği, vergi/finans politikası ve muhasebe uzmanı değerlendirmesine göre ayrı kararlaştırılır; **her vade farkı otomatik hammadde veya stok maliyeti sayılmaz**.
- **Vergi/ücret gizliliği:** KDV indirimi/indirilemeyen KDV, nakit ödeme tarihi ile tahakkuk dönemi, avans/karşılık/amortisman, teşvik/SGK indirimleri ve ücretin kapsamı kaynak belgeye bağlı olarak doğru muhasebeleştirilmeli; bordro bazında kişisel ücret bilgisi yalnız yetkili Finans/İK/üst yönetim rolüne açılır. Operasyon üretim personeli raporunda gerekiyorsa gizli bordro detayları yerine dönemsel toplulaştırılmış işçilik maliyetleri kullanılır.

### Sonuç raporları ve hesaplama
- Birim ürün için **(A) malzeme + doğrudan işçilik + üretim genel gider payı + ilgili taşeron maliyeti = uygun muhasebe politikasına göre üretim maliyeti**; bitmiş ürün/parti, iş emri, depo ve aylık dönem bazında planlanan / fiili ve sapma ayrımı.
- Ayrı ekran/raporda **(B) brüt kâr veya satış katkısı**, **(C) satış + sevkiyat + yönetim giderlerinden sonraki operasyonel kârlılık**, **(D) finansman ve vade farkları dahil nete yakın yönetim kârlılığı** gösterilebilir. Bunlar birbirine karıştırılmaz; veriler eksikse *kesin gerçek kâr* iddia edilmez.
- Ürün bazlı kira/elektrik/endirekt işçilik dağıtımı için firmanın seçebildiği ve zamanla revizyon geçmişi korunan yöntemler: makine saati, işçilik saati, hat kapasitesi, üretim adedi/ağırlığı veya tanımlı gider merkezi anahtarı. Çok farklı ürünleri **sadece adede eşit bölerek** otomatik kesin maliyet hesaplama varsayılanı olmasın; atıl kapasite ve eksik üretim etkileri görünür olsun.
- Gider, ücret ve faturalar **Finans/İK'da tek kaynak kaydı** ve rol bazlı yetkiyle girilir; Operasyon toplam/dağıtılmış maliyeti yetki düzeyine göre görüntüler. Tahakkuk, gider dağıtımı ve ödeme birbirinden ayrı olaylardır; tekrar senkronizasyon mükerrer kayıt oluşturmaz.
- **Üç kullanım profili** ile uyumlu: Pratik — basit gider merkezi + ay sonunda toplu gider girişi/dağıtımı; Kontrollü — fabrika/hat/bölüm bazında maliyet; Ayrıntılı — makine/iş emri/süre/parti ve maliyet varyansı. Firma eksik veriyle başlamaya devam edebilir ancak eksik alanlar raporda gösterilir.
- **Koruma:** Mevcut SÖZBİR Operasyon 0.13.0 akışı, çalışan personel ve müşteri hesapları, kabul→sevk emniyeti, canlı veriler korunur. Gider dağıtımı ilk aşamada test verisinde uygulanır; kullanıcı onayı olmadan canlı maliyet tarihçesi yeniden hesaplanmaz.

### Bir sonraki kullanıcı kararı
Üretim genel giderleri hangi temel anahtarla dağıtılsın? **Öneri:** Üretim hattı/makine veya işçilik süresi ölçülebilen firmalarda bu süreler, ölçülemeyen küçük firmalarda şirketçe seçilen pratik anahtar. Bu dağıtım politikası kullanıcıyla netleşmeden tüm firmalara tek yöntem zorlanmayacak.

## 26. Karar 34 — Ürün bazlı üretim kapasitesiyle genel üretim gideri dağıtımı (2026-10-22, ONAYLANDI)

**Kullanıcı ürünlerin aylık toplam adetlerine eşit genel üretim gideri yüklenmesi yerine, her ürünün üretim kapasitesini ayrı tanımlayıp kapasiteyi tüketme oranına göre dağıtımı onayladı.** Daha hızlı üretilen ürün aynı miktarda üretildiğinde daha az ortak üretim gideri payı; yavaş üretilen ürün ise daha fazla pay almalıdır.

### Temel yöntem

- Her mamul ve üretim hattı/kaynak kombinasyonunun standart **günlük üretim kapasitesi** veya eşdeğer çevrim süresi kaydedilir. Hangi vardiya süresi, personel/makine düzeni ve tarih aralığında geçerli olduğu belirlenir. Zaman içinde revize edilen kapasite tarihi geçmiş işlerin hesabını sessizce değiştirmez.
- Aynı üretim hattında ilgili dönem ürün yükü: **üretilen sağlam/hesaba katılan adet ÷ o ürünün günlük üretim kapasitesi = eşdeğer hat günü (kapasite kullanım ağırlığı)**. Örneğin SCC22 günlük 120 adet, ay içinde 120 üretim = 1 hat günü; SCC66 günlük 40 adet, ay içinde 120 üretim = 3 hat günü. İki ürünün toplam eşdeğer iş yükü 4 hat günü ise SCC22 %25, SCC66 %75 ortak üretim yükü oluşturur.
- Örnek olarak tamamen dağıtılabilecek **80.000 TL** ve iş yüküne göre dağıtım politikası varsayılırsa SCC22 20.000 TL (120 adet için ~166,67 TL/adet), SCC66 60.000 TL (120 adet için 500 TL/adet) genel üretim gideri payı alır. Bu **örnektir**, gerçek reçete/kapasite veya kesin finansal muhasebe oranı değildir.
- **Önce gider merkezi/hat bazında havuz oluştur:** Kira, elektrik, bakım, amortisman, endirekt üretim personeli ücreti, işveren SGK, servis/yemek vb. doğrudan bağlı oldukları üretim alanına; ortak fabrika giderleri de kurumun açık dağıtım anahtarına göre hatlara ayrılır. Her hattın gider havuzu o hattı fiilen kullanan ürünlere kapasite ağırlığıyla dağıtılır; başka hattın giderini rastgele ürünlere yükleme.
- **Doğrudan maliyetler ayrı:** Hammadde, doğrudan işçilik ve ilgili taşeron/dış işlem maliyetleri uygun şekilde ilgili ürün/iş emrine atanır. Finansman maliyeti, vade farkı, satış ve genel yönetim giderleri üretim havuzuna otomatik alınmaz; ayrı dönem/satış kârlılığı katmanında muhasebe politikasına göre ele alınır (Karar 33).
- **Atıl kapasite ve sabit/değişken gider ayrımı:** Ay içindeki üretim az ise tüm sabit üretim giderlerini çok az üretilmiş ürünlere sınırsız yükleyip hayali yüksek birim maliyet hesaplama. Normal kapasite, boşta çalışma, bakım/duruş ve normal-anormal fire farklarını yönetim raporunda göster; finansal tabloya yansıtma geçerli muhasebe standardına ve muhasebe uzmanı onaylı şirket politikasına göre yapılır. Değişken giderlerde gerçekleşen kullanım/ölçüm olan yerde onu önceliklendir.
- **Gerçekleşen süre farkı:** Hesap önce standart ürün kapasitesiyle yapılabilir; firma gerçek makine/işçilik saati ölçüyorsa sapmaları ayrıca izle ve istenirse yetkili maliyet politikasıyla fiili süre ağırlığını kullan. Bir ürün birden çok hatta işlem görüyorsa, her hattaki eşdeğer kullanım ayrı hesaplanır. Girdisi eksik/0 kapasite olan ürünün maliyetini uydurma; uyarı/eksik veri raporu oluştur.
- **Dönem ve kayıt bütünlüğü:** Finans'tan gelen döneme ait tahakkuk edilmiş uygun giderler, İK'dan gelen gizlilik korumalı personel maliyetleri ve Operasyon'daki kabul/üretim verileri aylık dönem kapanışında eşleştirilir. Çift gider kaydı oluşmaz; kapanmış dönem yönetici onayı ve düzeltme/audit kaydı olmadan geriye dönük değiştirilmez.
- **Pratik / Kontrollü / Ayrıntılı profiller:** Küçük işletmede ürün başına günlük kapasite + tek ortak hat seçimi yeterli olabilir; daha büyük işletmede hat/mesai/vardiya ve gerçek çalışma süresi ayrı tanımlanabilir. Ürün bazında kapasiteyle orantı her üç profilde aynı doğru iş mantığına dayanır. Mevcut üretim planı kaynak/kapasite alanlarını kullanırken değerlerin bağlamını doğrula; mevcut üretim ve depo kabulü özelliklerini silme.
- **Açık ayrıntı:** Kira gibi ortak fabrika giderlerini önce üretim hatlarına dağıtırken varsayılan anahtar (normal kapasite saatleri, kullanılan alan, sayaç ölçümü vb.) şirketçe belirlenebilir olmalı; kullanıcı henüz tek anahtarı kesinleştirmedi.

## 27. Gündem: Ay içi maliyet dalgalanması ve eksik giderlere karşı koruma (2026-10-22, KARAR BEKLİYOR)

**Kullanıcı endişesi:** Ayın ilk 15 gününde henüz kaydedilmemiş maaş, SGK, kira, servis, yemek, enerji, taşeron ve diğer önemli giderler nedeniyle ürün maliyeti yapay olarak düşük çıkabilir; ayın ikinci yarısında faturalar eklendiğinde maliyet çok yükselip ilk yarı satışları yanlış kârlı görünebilir. Bu riskin önlenmesi zorunlu tasarım hedefidir; kullanıcı çözümü henüz son haliyle onaylamadı.

**Önerilen çözüm — kullanıcı onayına sunuldu, henüz kesinleştirilmedi:**
- **Üç maliyet durumu:** (a) ay başı bütçeli/tahmini maliyet, (b) ay içinde güncellenmiş öngörülen maliyet, (c) dönemin giderleri uzlaştırılınca kesinleşmiş fiili maliyet. Arayüzde etiketleri ve güvenilirlik/gider tamlığı ayrı görünür; tahmin kesin maliyet veya kesin kâr diye gösterilemez.
- **Fatura girişine göre değil tahakkuk/bütçeye göre aylık yük:** Sözleşmeye dayalı aylık kira, bordro ve işveren SGK maliyeti, servis/yemek, enerji (tahmini), amortisman ve benzeri üretime ait düzenli giderler için ay başında gider bütçesi veya önceki dönemlerden öngörü oluşturulur. Sözleşme/önceki veri yoksa yetkiliden makul başlangıç bütçesi istenir, güvenilir olmayan tahmin belirtilir.
- **Çifte gideri önle:** Gerçek fatura/bordro geldiğinde tahmini giderin yerine veya karşısına gerçek tahakkuk kaydı alınır; bu iki tutar toplanarak gider şişirilmez. Bir faturanın finansal ödeme tarihi ilgili giderin hangi dönemde doğduğuyla karıştırılmaz. Birden fazla fatura/ay ve gecikmiş belge uygun döneme bağlanmalı.
- **Ürün yüklemesinde normal kapasite:** Karar 34'e göre ürün/hat standart kapasite tüketim ağırlığı kullanılır. Maliyetli genel üretim gideri bütçe havuzu, beklenen/normal hat kapasitesi üzerinden tarifelenir; ayın başındaki düşük üretim adedi yüzünden tüm aylık kira ilk gün üretilen birkaç ürüne yüklenmez. Atıl kapasite ve normal/anormal sapmalar ayrı görünür.
- **Ay ortası sürpriz gider:** Bütçe ile gerçekleşen arasındaki önemli fark görünür uyarı ve dönem sonu **gider sapması** raporuyla izlenir. Satış birimine güncel maliyet ve önerilen satış fiyatı eşiği yetkiyle gösterilebilir; riskli/eski fiyatlar revizyon onayına gidebilir, geçmişte kesilmiş müşteri faturası veya anlaşma otomatik geriye dönük değiştirilmez.
- **Satış anı kârlılık fotoğrafı:** Satışın yapıldığı tarihte kullanılan onaylı tahmini birim maliyet ve fiyat/marj bilgisi tarihsel kayıt olarak korunur. Ay kapanışındaki fiili sonuç, tahmini ve gerçekleşen farkını ayrı gösterir; aylık yönetim raporu açıldığında eski kârlılık yanlış bir 'kesin gerçekleşen' değer gibi saklanmaz.
- **Dönem kapanışı:** Eksik bordro, fatura, amortisman, miktar/hammadde ve taşeron mutabakatları için kapanış kontrol listesi; belirli tolerans altı tahmini tahakkukların kontrollü kapanış politikası; büyük fark varsa uyarı ve yetkili finans yöneticisi onayı. Kapanmış dönem düzeltmeleri audit/sürüm/ilgili muhasebe yetkileriyle yürür.
- **Ücret gizliliği ve fonksiyon ayrımı:** Operasyon ekranı yalnız yetkili toplam/tarife maliyetini görür; kişisel maaş/bordro detayları İK/Finans'ın kapalı alanında kalır. Finansman/vade farkı ve satış/idari giderler ürün üretim maliyetine otomatik katılmaz; katmanlı kârlılık analizine yansır.
- **Açık onay sorusu:** Ürün satış fiyatı belirlerken **ay başından itibaren yıllık/önceki aylara dayalı tahmini sabit gider payını kullanıp**, gerçekleşen farkları aylık kapanışta ayrıca gösterme politikasını tüm şirketler için başlangıçta öneri olarak sunalım mı? Kullanıcı onaylayınca karar numarası verilecek.
