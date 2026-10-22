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
