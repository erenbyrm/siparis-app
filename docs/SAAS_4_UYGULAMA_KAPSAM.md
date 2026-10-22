# İş Uygulamaları Platformu — Codex ana geliştirme şartnamesi
Tarih: 2026-10-22 · Durum: Onaylanmış kararlar + açık detaylar · Uygulama kaynağı: Operasyon 0.13.0

> **BAĞLAYICI:** Dört ayrı iş uygulaması yapılacak. Özelliklerin tamamını mevcut Operasyon'un menülerine doldurmak, dört uygulamayı sadece dört sekme olarak sunmak veya mevcut çalışan uygulamayı sıfırdan yazmak **YASAK**. Ayrı giriş noktaları, bağımsız arayüzler, ayrı derleme/yayınlama hedefleri ve bağımsız şirket/modül erişim kontrolleri olacak. Ortak kimlik, iş verisi entegrasyonu ve teknik paketler paylaşılabilir.

> **GÜNCEL İSİMLENDİRME (Karar 42, 2026-10-23):** Ticari iş uygulamalarının adları yalnızca **Operasyon, Finans, İnsan Kaynakları (İK), Müşteri Portalı (MP)**. Eski şirket markası artık **uygulama adı/önek olarak kullanılmayacak**. Ayrıca şirketler arası hesap/izin yönetimi için **beşinci ayrı yönetim arayüzü** talep edildi; sunum biçimi olarak **ayrı, güvenli web uygulaması** Karar 43 kapsamında kullanıcı tarafından kesin olarak onaylanmıştır. Tarihsel depolama/uyumluluk ve mevcut gerçek müşteri şirket kimliği bu adlandırma değişikliğinden ayrı ele alınır.

## 0. Codex'e doğrudan görev — işe başla

Mevcut `erenbyrm/siparis-app` deposunda **yalnızca** `operasyon-gelistirme` dalında çalış. Kaynak doğru dal `codex/order-workflow-v2`; varsayılan `main` eski prototiptir, geliştirme temeli olarak alma. Önce kodu, testleri, sunucu yetki modelini, veri şemasını, iş akışlarını ve belgeleri gerçek koddan incele. `README.md`, `docs/KABUL_DURUMU.md`, `docs/DEPO_VE_SAYIM.md`, `docs/URETIM_VE_ISKONTO.md`, `database/`, `api/`, `server/`, `src/` ve `tests/` kritik referanslardır.

Sadece analiz raporu üretip durma: **ilk güvenli geliştirme dilimini** uygula, test ekle, `pnpm test`, `pnpm check`, `pnpm build` doğrula; değişiklikleri küçük ve gözden geçirilebilir commit/PR'lar hâlinde sun. İlk dilim, kodu kırmadan çok uygulamalı mimari iskeleti + rol/tenant tasarım ve test altyapısı + Operasyon için uyumluluk katmanı olmalı. Önceden kararlaştırılmamış ödeme sağlayıcısı, SGK/e-bildirge erişimi, canlı veritabanı migrasyonu veya production yayını uygulama. Açık ürün kararları yapılandırılabilir olarak modellenip ayrıca işaretlensin.

## 1. DÖRT AYRI İŞ UYGULAMASI — kesin mimari kuralı

1. **Operasyon:** Mevcut uygulama temel alınacak; satış/sipariş/onay, ürün, üretim, depo, stok, sayım, rezervasyon, yükleme, sevkiyat, araçlar, teslimat, iadeler ve operasyon raporları.
2. **Finans:** Ayrı arayüz ve dağıtım; cari hesap, alacak/borç, kredi/risk politikası, tahsilat/ödeme, nakit/kasa, banka, kredi kartı, POS, vade, finansal raporlar. Sadece finans yetkili kullanıcı görür.
3. **İnsan Kaynakları (İK):** Ayrı arayüz ve dağıtım; personel kayıtları, organizasyon, puantaj, vardiya, izin, fazla mesai, ücret, bordro, prim, avans, masraf, belge, eğitim, performans ve personel talepleri. İK verisi sıkı gizli.
4. **Müşteri Portalı (MP):** Ayrı arayüz ve dağıtım; her müşteri sadece kendi firma/cari yetkisi kapsamındaki sipariş, sevkiyat, teslimat, ekstre ve belgeleri görür, izin verilmişse sipariş/ödeme talebi oluşturur ve ileride gerçek online ödeme yapar.

**Tercih edilen teknik hedef:** mevcut kodu koruyarak aşamalı modüler monorepo (örnek: `apps/operasyon`, `apps/finans`, `apps/musteri-portali`, `apps/insan-kaynaklari`, `packages/auth`, `packages/permissions`, `packages/contracts`, `packages/db`, `packages/audit`, `packages/ui`). Klasör şemasını inceleme sonrası uyarlayabilirsin; DEĞİŞMEZ koşul dört ayrı gerçek uygulama ve birbirinden bağımsız deploy/route entrypoint olmasıdır. Tümünü bir `App.tsx` içinde dört koşullu sayfaya dönüştürme. Her uygulamanın ayrı navigasyonu, giriş/erişim denetimi, kendi sürümlemesi ve testleri bulunsun. Şirketler arası **Platform Yönetimi**, dört ticari iş uygulamasından bağımsız beşinci, güvenli ve mobil uyumlu **web uygulaması** olacak (Karar 43, ONAYLANDI). Kendi giriş noktası, arayüzü, deploy hedefi, yetki kontrolleri ve denetim kayıtları bulunur; beşinci ticari iş modülü değildir.

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
- Şirkette işler yürütülürken en az **iki farklı gerçek yetkili kullanıcı** bulunur; asgari ast–üst/ayrı onaycı ilişkisi. Başvuru/ilk kurulum tek hesapla yapılabilir ama uygun ikinci kişi tanımlanmadan kritik canlı işlemler açılamaz. Geçişte mevcut canlı Operasyon uygulamasını kilitleme.

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
- Mevcut Operasyon üretim→depo kabulü→sevk sırası değiştirilmeyecek; mevcut testler korunacak, gecikme ve yetkisiz kabul/sevk için yeni testler eklenecek.

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
- **Koruma:** Mevcut Operasyon 0.13.0 akışı, çalışan personel ve müşteri hesapları, kabul→sevk emniyeti, canlı veriler korunur. Gider dağıtımı ilk aşamada test verisinde uygulanır; kullanıcı onayı olmadan canlı maliyet tarihçesi yeniden hesaplanmaz.

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

## 28. Gündem: Önceki ay maliyeti baz alan koruyucu fiyatlandırma referansı (2026-10-22, KULLANICI ÖNERİSİ; AYRINTI ONAY BEKLİYOR)

**Kullanıcının önerisi:** Ay içindeki eksik kira, SGK, yemek, servis, elektrik vb. giderler yüzünden o ayın ilk günlerinde maliyet yapay olarak düşük çıkmasın. **Önceki ayın kapanmış/uzlaştırılmış ürün bazlı birim üretim maliyeti** bu ay fiyatlandırma için referans alınsın. **Alüminyum kilogram birim fiyatı yükselmişse fiyat artışı oranı kadar yalnızca ürünün alüminyum maliyet bileşeni artırılsın; kilogram fiyatı düşmüşse satış fiyatı hesaplanırken koruyucu referans maliyet otomatik düşürülmesin.** Kullanıcı "nasıl olur" diyerek değerlendirme istemiştir; uygulamanın temel yaklaşımı olarak önerilmiştir, henüz tüm ayrıntılara kesin onay alınmamıştır.

### Önerilen güvenli hesap ve iki ayrı maliyet

- **A) Koruyucu fiyatlandırma referansı:** Firma tercih ederse önceki ayın **kesinleşmiş ürün birim maliyetini** veya önceki onaylı koruyucu tabanı esas alır. Malzeme değişimi yalnız alüminyum bileşenine uygulanır: `yeni teklif referansı = önceki koruyucu/baz maliyet + max(0, kg fiyatındaki net pozitif değişiklik) × ürün başına ilgili alüminyum net maliyet hesabına uygun kg miktarı` (girdi/ürün ağırlığı, fire, hurdadan geri kazanım ve reçete farklılıkları için doğru bileşen). Alternatif eşdeğer hesabın başlangıç fiyat tabanı kayıtlı olmalı. Genel toplam fiyatına doğrudan alüminyum artış yüzdesi uygulanmaz.
- Örnek: Önceki kesin maliyet 1.000 TL (alüminyum 600, diğer maliyet 400); ilgili alüminyum birim bedeli %10 artarsa alüminyum bileşeni +60 ve **önerilen koruyucu maliyet 1.060 TL**. Fiyat %10 düşerse sadece bu düşüşten ötürü koruyucu referans otomatik indirilmez. **Bu teklif/satış kararı korumasıdır; muhasebe maliyeti değildir**.
- **B) Fiili muhasebe/üretim maliyeti:** Gerçek üretim döneminde oluşan hammadde maliyeti (onaylı değerleme yöntemi), gerçekleşen işçilik, SGK, genel üretim payı vb. üzerinden hesaplanır; alüminyum fiyatı düşerse gerçek fiili maliyet de uygun şekilde düşebilir. Stok değerlemesi, finansal rapor, gerçek kâr ve hukuki/mali tablo için koruyucu satış tabanı kullanılmaz. Fiyatlandırma, gerçekleşen maliyet, bütçeli tahmin ve ay kapanışı çıktıları ayrıdır.
- **Çifte fiyat güncellemesi önle:** Artış, önceki kapanmış maliyete dahil olan kg fiyatı ile güncel geçerli tedarik kg fiyatı arasından sadece yeni fark için hesaplanır; gün içinde aynı fiyat olayı tekrar girildi diye +60 tekrar eklenmez. Referansın sürümü ve alüminyum fiyatı değişim zamanları tutulur. Her ay bir önceki kesinleşmiş maliyete geçerken önceki artışı iki kez yükleme; otomatik düşürmeme politikasını koruyan **önceki onaylı koruyucu taban** ayrıca izlenebilir. Tabanlar malzeme ve para birimine göre doğru normalize edilir.
- **Diğer zamlar:** Asgari ücret/SGK, kira, enerji, taşeron, işçilik veya üretim kapasitesi değişimi büyükse yalnız alüminyum fiyatı artışına bakmak yetersiz olur. Yetkili Finans/Genel Müdür tarafından maliyet referansı yeniden hesaplansın veya beklenen önemli gider artışları önceden görünür uyarı ile yansıtılsın; önceki ay tek başına garanti edilmiş doğru güncel maliyet sayılmaz.
- **Fiyat düşüşü ve ticari esneklik:** Otomatik aşağı yönlü düzeltme YOK; yetkili ticari/finans yöneticisi rekabet/fiyat stratejisi için gerekçeli manuel indirim veya yeni taban onaylayabilir. Bunun için mevcut satış fiyatı/iskonto/karar yetkileri korunur. Sürekli düşen piyasa koşullarında referansın yıllarca yüksek kalıp fiyatlandırmayı anlamsızlaştırdığı durumda rapor/uyarı gösterilir.
- **Eksik geçmiş:** Geçen aya ait kapanış eksikse, ilk kullanım dönemiyse veya ürün yeni ise sistem kesin referans uydurmaz; güvenilir kaynaklı standart maliyet/bütçe, yetkili başlangıç değeri ve veri-tamlık uyarısı kullanılır. Geçmiş maliyet revizyonları sürümlenir; müşteri onaylı eski sipariş fiyatları geriye dönük değiştirilmez.
- **Rapor:** Ürün bazında "önceki ay gerçek maliyet", "güncel alüminyum kg bedeli", "alüminyum fiyat artış etkisi", "fiyatlandırmaya esas koruyucu maliyet", "bu ay tahmini fiili maliyet", "ay kapanınca gerçek maliyet", "satış fiyatı" ayrı gösterilsin. Önceki satış anındaki referans ve fiyat tarihsel olarak korunur.
- **Üretim kapasitesiyle ortak gider dağıtımı** (Karar 34) gerçek aylık maliyette uygulanmaya devam eder; fiyatlandırma koruması bu hesapları bozmaz. "Pratik/Kontrollü/Ayrıntılı" şirket profilleriyle sade ekran veya detaylı maliyet kırılımı seçilebilir.

**Karar 35 ile çözüldü:** Koruyucu referansın aşağı yönlü alüminyum fiyat hareketinde otomatik düşmemesi **şirket bazında seçilebilir**, tüm şirketlere dayatılmaz. Detaylı yöntemler yeni [Maliyet Hesaplama Politikaları](MALIYET_HESAPLAMA_POLITIKALARI.md) belgesinde tanımlıdır.

## 29. Karar 35 — Şirket bazında farklı maliyet hesaplama politikaları (2026-10-22, ONAYLANDI)

**Kesin kullanıcı kararı:** Alüminyum kg fiyatı düşüşünü satışa esas koruyucu maliyete otomatik yansıtmama seçeneği **tüm şirketlere zorunlu DEĞİLDİR**. Kullanıcı ayrıca Karar 33–34, ay içi gider eksikliği ve önceki ay referans maliyeti yaklaşımını ayrıntılandırarak şirketlere **birbirinden farklı maliyet yöntemleri seçtirmemizi** istedi. Ürün/firma/finans raporu geçmişini ve 4 ayrı uygulamanın ayrımını bozmadan yapılacak.

**Codex'in okuyacağı ayrıntılı teknik tasarım:** [Maliyet Hesaplama Politikaları — Seçenekler ve Güvenlik](MALIYET_HESAPLAMA_POLITIKALARI.md). Bu belgedeki P/G/T yöntem kodları, hesap örnekleri, koruyucu fiyat tabanı, ay devri, kapasite ve gider havuzu ayrımı, veri güvenilirliği, yetkiler, aşamalı yol haritası ve test koşulları ana şartnamenin parçasıdır.

### Şirketin birbirinden bağımsız olarak seçebileceği üç eksen

1. **Satış fiyatına esas referans maliyet (P):** P1 önceki kapalı ay + yalnız yukarı yönlü alüminyum fiyat koruması (**kullanıcı tarafından önerilen yöntem; şirket seçebilir**); P2 iki yönlü güncel hammadde güncellemesi; P3 güncel reçete ve tahmini işçilik/üretim gideri; P4 3/6 aylık ağırlıklı ortalama; P5 bütçeli/standart maliyet; P6 yetkili manuel ve süreli referans.
2. **Genel üretim gideri dağıtımı (G):** G1 ürün/hat günlük üretim kapasitesiyle eşdeğer hat günü (**Karar 34, önerilen**); G2 gerçek makine saati; G3 standart saat; G4 fiili işçilik saati; G5 gider türüyle ilgili alan/sayaç/personel gibi fiziksel anahtar; G6 yalnız benzer/homojen ürünlerde pratik adet/ağırlık/katsayı. Bu, gelir tablosuna istenilen giderin rastgele üretim maliyeti yazılması anlamına gelmez; doğru sınıflama ve normal kapasite ilkeleri korunur.
3. **Ay içi beklenen maliyet yöntemi (T):** T1 önceki kapanmış dönem ve bilinen zamlar; T2 aylık bütçe/tahakkuk planı, gerçek kayıt geldiğinde yerini alması; T3 ağırlıklı dönem ortalaması; T4 standart maliyet ve fiili sapma karşılaştırması.

**Vazgeçilmez ayrım:** P politikası **ticari teklif/fiyatlandırma içindir**; muhasebe/fiili maliyet, mali tablolarda geçerli değerleme ve kâr raporlarını manipüle edemez. İndirim, fiyat yönetimi, maaş gizliliği, firmalar arası tenant izolasyonu, rol/onay ve geçmiş işlem sürüm güvenliği devam eder. Her maliyet sürümü şirket, tarih ve yöntemiyle izlenir; eski onaylı sipariş/fatura sonradan değiştirilmez.

**Önerilen başlangıç kombinasyonu (henüz özel olarak seçilmiş şirket ayarı değildir):** Önceki ay esaslı koruyucu P1 + kapasite tabanlı G1 + bütçeli gider T2. Her firma kurulumda kendi yöntemini seçebilir, sonra yetkili onayıyla değiştirebilir. Daha karmaşık yöntemleri Faz 1'de zorla kodlama: önce dört ayrı app mimarisi ve veri güvenliği, sonra hesaplayıcılar/aşamalı testler.

**Karar 36 ile onaylandı:** Üç alüminyum kg fiyat kaynağı da desteklenir: son doğrulanmış alış faturası, tedarikçi güncel fiyat listesi ve yetkili yöneticinin onaylı referansı. Şirket kendi kaynağını seçer; ayrıntılar Karar 36 ve [Maliyet Hesaplama Politikaları](MALIYET_HESAPLAMA_POLITIKALARI.md) belgesindedir.

## 29. Karar 35 — Şirketlerin seçebildiği çok yöntemli maliyet politikaları (2026-10-22, ONAYLANDI)

- **Firma bazlı seçilebilir yöntemler onaylandı.** Kullanıcı önceki ay maliyet + alüminyum yalnız yukarı yönlü fiyat ayarını bütün şirketlere zorunlu yapmak yerine, şirketin **seçip açıp kapatabileceği bir fiyatlandırma politikası** olarak onayladı. Ayrıca önceki maliyet/kapasite/genel gider/ay içi tahmin kararlarının ayrıntılandırılıp **alternatif hesaplama yöntemleri** olarak sunulmasını istedi.
- Üç ayrı tutar: (a) finansal standartlara ve şirketin muhasebe politikasına uygun **gerçek üretim/stok maliyeti**, (b) cari dönem için **tahmini/öngörülen yönetim maliyeti**, (c) satıcı/yönetici için **koruyucu teklif referans maliyeti**. **(c) muhasebe/stok değerlemesini değiştiremez; (b) gerçek maliyet gibi sunulamaz.**
- **Satışa esas referans yöntemleri:** Önceki ay kapanmış maliyet + yalnız alüminyum zam etkisi (isteğe bağlı fiyat düşüş koruması); güncel malzeme + gider tahmini; son 3/6 kapanmış ay ağırlıklı maliyet; standart reçete + gider bütçesi; cari ay gerçekleşen ve kalan tahmini; yetkili manuel referans. Bunlar firma/ürün ailesi bazında seçilebilir ve ayrı ayrı yapılandırılabilir.
- **Gider dağıtımı yöntemleri:** Kullanıcının Karar 34'te onayladığı **ürün kapasitesinin tersine dayalı eşdeğer hat günü** yöntemi önerilen başlangıç şirketi için önerilen varsayılandır. Firma diğer yöntemlerden gerçek makine saati, gerçek işçilik saati, üretim adedi, ağırlık/teknik birim ve gider merkezi bazında karma dağıtım seçebilir; aynı gider iki kez dağıtılamaz; normal/atıl kapasite ayrımı gerekir.
- **Ay içi tahmin yöntemleri:** Önceki ay devreden maliyet; aylık tahakkuk/bütçe + güncel malzeme; önceki ay ve cari güncel tahminlerin karma modeli; yalnız kapanmış maliyetle fiyatlandırma ve cari fiiliyi ayrı gösterme. İlk 15 gün gider faturası gelmedi diye maliyet sıfıra/inandırıcı olmayan düzeye düşmez.
- **Büyük maliyet şokları:** Kirada, ücret/SGK'da, servis/yemekte, enerjide ve taşeronda önemli artışlar için fiyatlandırma tabanı uyarı/yeniden onay seçeneği; alüminyum artışı yalnız alüminyum bileşenine yansır; aylık baz revizyonunda aynı zam etkisi yeniden eklenmez.
- **Yetki ve geçmiş:** Firma yöneticisi yöntem seçip değişiklik yapar; kritik fiyatlandırma/muhasebe politikası değişikliği yetkili onayına tabi; etkili tarih ve eski siparişte kullanılan teklif maliyeti/değişiklikler denetlenebilir. Platform admin şirket ücret, maliyet, müşteri/finans verisini sırf platform rolüyle okuyamaz.
- **Geliştirme sırası:** Önce dört bağımsız uygulama Faz 1 iskeleti ve sıfır veri kaybı. Maliyet için ayrı model ve gerçek/öngörülen/koruyucu tutar ayrımından başla, basit politikalar ve testler ekle; gelişmiş karma dağıtım/simülasyon sonraki faz. Şirketten şirkete yasal muhasebe kuralı seçimi onaylı değerleme standardı ile sınırlandırılır.
- **AYRINTILI TEKNİK TASARIM VE KABUL TESTLERİ (zorunlu okuma):** [docs/MALIYET_HESAPLAMA_POLITIKALARI.md](MALIYET_HESAPLAMA_POLITIKALARI.md). Belgedeki yöntem örnekleri ürün seçenekleridir; ücret, stok değerleme, maliyet politikası ve fiyat kaynağına dair açık uygulama parametreleri gerçek sisteme geçmeden önce yetkiliyle netleştirilecektir.

## 30. Karar 36 — Alüminyum kg fiyatı için üç farklı şirket kaynağı (2026-10-22, ONAYLANDI)

- **Üç fiyat kaynağı da kullanılabilir ve şirket kendi aktif kaynağını seçer:** (A1) Finans'taki **son doğrulanmış alış faturası**, (A2) **tedarikçinin geçerli fiyat listesi/teklifi**, (A3) **yetkili yönetici tarafından belirlenip onaylanmış referans kg fiyatı**. Bütün şirketler için aynı fiyat kaynağı zorunlu değildir; firmanın politikası değiştirilebilir ve geçmiş sürümler korunur.
- Her fiyatın hangi alüminyum türü/profil/alaşıma, hangi kg ölçüsüne, para birimine, tarih ve kaynağa ait olduğu açık tutulur. Fatura düzeltmeleri, teklifin süresinin dolması ve eski/alakasız fiyatın yanlışlıkla seçilmesi karşılaştırma ve uyarıyla yönetilir. Geçerli fiyat yoksa sistem sıfır veya hayalî kg fiyatı kullanmaz.
- P1'in **yalnız yukarı yönlü alüminyum artışının** hesabı seçilen onaylı fiyat kaynağına göre yapılır, ancak sadece ürünün ilgili alüminyum maliyeti bileşeni değişir; aynı zam iki kez uygulanmaz. Alüminyum düşüşünü ticari referansın otomatik düşüşüne yansıtmama şirket bazlı tercihtir. P2 gibi iki yönlü yöntemler firma seçiminden etkilenir; **gerçek stok/muhasebe maliyeti bu ticari referansa göre değiştirilemez**.
- Politikayı değiştiren şirket yetkilisinin kimliği, kaynak belge, onay tarihi ve eski/yeni seçimin etkisi denetlenir; önceki kesinleşmiş teklif ve siparişlerin fiyatlandırma fotoğrafı korunur. Tenant izolasyonu ve ilgili gizli maliyetlerin rol temelli erişimi zorunludur.
- **Kaynaklar ve kabul testleri, Codex için ayrıntılı teknik tasarım:** [Maliyet Hesaplama Politikaları / Karar 36](MALIYET_HESAPLAMA_POLITIKALARI.md). Dört bağımsız uygulama, mevcut Operasyon işlevleri ve canlı veri güvenliği şartları değişmez.
- **Karar 37 ile çözüldü:** Şirketler geçerli kg fiyatı değişimlerini satışa esas maliyet referansına otomatik veya yetkili müdür onayıyla uygulamayı seçebilir. Büyük değişikliklerde uyarı ve tanımlanabilir ikinci kontrol vardır; ayrıntılar aşağıda.

## 31. Karar 37 — Alüminyum fiyatı değişimlerinde şirket bazlı otomatik veya yönetici onayı (2026-10-22, C SEÇENEĞİ ONAYLANDI)

- Kullanıcı **C** tercihini onayladı: A1 son doğrulanmış alış faturası, A2 geçerli tedarikçi listesi, A3 onaylı yönetici referansı (Karar 36) kaynağındaki geçerli kg fiyat hareketleri için her firma **(U1) otomatik yürürlüğe alma** veya **(U2) yetkili Finans/Satış Müdürü ya da tanımlı üst yönetici onayıyla yürürlüğe alma** politikasını seçebilir. Firma bazında yöntem ve geçmiş sürüm izlenir, bütün şirketlere tek işlem tarzı dayatılmaz.
- **Büyük fiyat hareketleri:** Firma, yüzdelik veya mutlak tutar bazında uyarı/onay eşiği tanımlayabilir. U1 açık olsa bile karşılaştırılamayan fiyat birimi/döviz, geçersiz/eskimiş teklif, tutarsız veri veya firmanın tanımladığı kritik değişimler uyarı ve inceleme gerektirir. Kullanıcı somut yüzde/TL limitini henüz belirlemedi; sabit varsayılan eşik dayatma.
- U2 modunda fiyat değişimi onay beklerken eski maliyet referansı yürürlükte kalır, fakat yeni tekliflerin düşük maliyetle hazırlanması riskine karşı açık uyarı gösterilir; şirket isterse onaylanana kadar yeni tekliflerde yetki kontrolü uygular. Ayrı onay gerektiren istisnada teklif eden/onaylayan farklı kişiler olur.
- **Maliyet referansı ≠ müşteriye yayınlanmış satış fiyatı:** Bu karar fiyatlandırmada kullanılan **koruyucu/öngörülen maliyet referansının** ne zaman güncelleneceği hakkındadır. Onaylı fiyat listelerinin, verilen tekliflerin, siparişlerin, faturaların, gerçek stok değerlerinin, muhasebe kayıtlarının doğrudan değişmesi anlamına gelmez.
- Birim fiyatın kaynak tarihi, kurlar ve birimler, ürün/alaşım kapsamı, maliyet politikası P1/P2, baz sürümü, artış/düşüş politikası ve tekil olay id ile geçmiş sürüm saklanır. Aynı zam olayı iki kez uygulanmaz. Maaş/SGK/kira/gider veri gizliliği, tenant ayrımı, gerçek/tahmini/koruyucu maliyet ayrımı ve mevcut uygulamanın işlevleri korunur.
- **Codex teknik ayrıntılar ve testler:** [Maliyet Hesaplama Politikaları — Karar 37](MALIYET_HESAPLAMA_POLITIKALARI.md) belgesinin 10. bölümü. Kodlama ve prod uygulama yalnız Faz 1 ve mevcut işleyen sistemin veri güvenliği kuralları gözetilerek aşamalı yapılır.
- **Karar 38 ile netleşti:** Liste fiyatı maliyet artsa da otomatik değişmeyecek; sadece yetkili yönetici fiilen güncellediğinde yayınlanacak. Müşteri bazlı nakit/vadeli iskontolar ve maliyet artışı üzerine yönetici onaylı toplu iskonto revizyonu gündeme alındı. Ayrıntılar Karar 38'da.

## 32. Karar 38 — Sabit liste fiyatı ve yönetici onaylı net fiyat oranı bazlı toplu iskonto (2026-10-22, ONAYLANDI)

**KESİN KULLANICI KARARI:** Ürünlerin **liste fiyatları maliyet artışı, alüminyum kg fiyatı güncellemesi veya fiyatlandırma referansının yenilenmesiyle otomatik olarak değişmez**. Fiyat listesini yalnızca şirket içindeki bu işe yetkili yöneticinin açık işlemi ve rol/onay sınırlarıyla değiştir. Kullanıcının ifadesi: "Liste fiyatı sabit kalsın yönetici değiştirene kadar."

**İş kuralı bağlamı:** Her müşterinin ayrı **nakit iskontosu** ve **vadeli iskontosu** olabilir. Teklif/sipariş tutarı, müşteri ve ürün/fiyat listesi kapsamında geçerli iskontoya göre hesaplanır. Vade koşulu (gün, finansman farkı vb.) ve ürün bazlı liste/KDV/uygulanan diğer iskonto sırası netleşmeden sistem aynı oranı her ürün/işleme sorgusuz uygulamamalı. Nakit/vadeli arasındaki fiyat farkını müşteri sözleşmesi, geçerlilik ve yetkilendirme kurallarıyla koru.

**KULLANICI ONAYI (2026-10-22):** Maliyet referansı artarsa, liste fiyatını değiştirmeden her müşterinin ayrı iskonto oranlarını **yetkili yönetici onayıyla topluca** yeniden hesaplamak ve böylece net fiyatları maliyet artışını telafi edecek biçimde yükseltmek. Bu işlemi satışın kâr/marj kontrolüyle beraber tasarla; yetkili onayından önce yalnızca bir **önizleme/taslak simülasyon** oluştur.

**ONAYLANAN MATEMATİKSEL KURAL:** İskonto yüzdesini *aynı yüzdeyle düşürmek* yerine, aynı ürünün bütün uygun müşterilerinin **net satış fiyatını** o ürün için aynı göreli maliyet artış oranıyla artırmak daha tutarlı. Örnek liste fiyatı L=1.000 TL; A iskonto %20→net 800 TL; B iskonto %10→net 900 TL. İlgili ürünün fiyatlandırma referans maliyeti %10 artarsa hedef A 880 TL (iskonto %12), B 990 TL (iskonto %1). Formül: `önceki_net_fiyat = liste_fiyatı × (1 − eski_iskonto_oranı)`; `hedef_yeni_net = önceki_net_fiyat × (1 + ürün_referans_maliyet_artış_oranı)`; `yeni_iskonto_oranı = 1 − hedef_yeni_net / liste_fiyatı`. Para birimi, KDV hariç/birim ve iskonto kademelerinin uygulama sırası tutarlı olmalı. **Kullanıcı bu hesaplama biçimini açıkça kabul etti.**

**Önemli istisnalar:**
- Bir üründe maliyet %10 artıp diğerinde %2 artmışsa tüm ürünlere tek küresel yüzde uygulama; **ürün/ürün grubu bazlı maliyet artış oranını** esas al, yönetici kapsamı değiştirebilsin.
- Liste fiyatı sabit kalırken yeni hedef net fiyat liste fiyatını aşıyorsa `yeni_iskonto<0` veya fiyat=liste üstü ortaya çıkar. **Sessiz negatif iskonto, eksi bakiye, otomatik müşteri zammı veya iskonto %0'da gizli sıkıştırma yapma**. İlgili müşteri/ürün/ödeme şeklini 'uygulanamıyor — liste fiyatı tavanı' olarak göster; yetkili yönetici liste fiyatını ayrıca revize etsin veya gerekçeli istisna kararı versin. Listeye örtülü zam getirme.
- Nakit ve vadeli müşteri oranlarını **bağımsız** hesapla, vadeye bağlı kâr/finansman etkilerini ve her müşterinin cari/risk/onay koşullarını koru. Özel sözleşmeler, sabit fiyat garantileri, devam eden kampanyalar, satış limitleri ve açık onaylı siparişler otomatik değiştirilmez; kapsam dışında işaretlenir veya ilgili yetkili ticari onayı bekler.
- **Yönetici onaylı toplu revizyon akışı (ONAYLANDI):** Uygun dönem maliyet referansı değişimi tetiklenir → yönetici etkilenen ürünler, müşteriler, nakit/vadeli iskonto, eski/yeni net fiyat, müşteri bazlı değişim, hedef marj, fiyat tavanı ve özel sözleşme istisnalarını **toplu önizlemede** inceler → kapsamlı gerekçeli onay verir → yeni iskonto sürümü **yalnız yeni işlem/teklifler için ve etkin tarihten sonra** yayınlanır. Müşteri bazında istisna/manuel düzeltme ve gerekirse iki gerçek kişinin onayı korunur.
- Fiyatlandırmada seçili P/G/T ve A1/A2/A3/U1/U2 politikalarının **maliyet referansı güncellemesi**, gerçek muhasebe maliyeti, liste fiyatı yayınlama işlemi ve müşteri iskonto toplu revizyonu **dört ayrı olaydır**. Birindeki otomatiklik diğerine yayılamaz.
- Eski kabul edilen siparişlerin, fatura ve tahsilatların fiyatı/iskontosu, geçmiş müşteri anlaşması ve muhasebe stok maliyeti yeni işlemden etkilenmez. Onay veren yönetici ve tarih, uygulanacak şirket/ürün/müşteri/ödeme koşulları, önceki ve sonraki değerler, etkin sürüm ve değişiklik gerekçesi denetlenebilir.

**Ayrıntılı uygulama önerileri ve testler:** [Maliyet Hesaplama Politikaları — Karar 38](MALIYET_HESAPLAMA_POLITIKALARI.md). **Onay:** Toplu iskonto değişimi, aynı ürünün kapsamdaki tüm müşterilerinin net fiyatını aynı yüzde artıracak şekilde hesaplanır. Liste fiyatını veya eski müşteri işlemlerini değiştirmez. **Karar 39 ile netleşti:** İskonto yönetiminde tekil ürün yerine çok kademeli ana/alt kategori hiyerarşisi kullanılacak. Aynı kategoride farklı maliyet artışlarını ortak iskonto oranına dönüştürmenin matematiksel yöntemi henüz açık; detaylar Karar 39'da.

## 33. Karar 39 — Ürünlerde ana/alt kategori hiyerarşisi ve kategori bazlı müşteri iskontosu (2026-10-22, HİYERARŞİ ONAYLANDI)

**Kullanıcının açık tercihi:** Tek tek ürün bazlı genel müşteri iskonto tablosu kurmak yerine ürünleri **üst kategori → alt kategori → gerekirse daha alt kategoriler** olarak sınıflandır. Her firma kendi kategori ağacını oluşturabilsin. Kullanıcının verdiği örnekler:
- **Alüminyum Merdivenler**
  - Alüminyum Çift Çıkışlı Merdivenler
  - Gerektiğinde diğer alüminyum merdiven alt grupları
- **Profil Merdivenler**
  - Çift Çıkışlı Profil Merdivenler
  - Tek Çıkışlı Profil Merdivenler
- **İskeleler**
- **İthal Merdivenler**
Bu ağaç **örnektir**, kullanıcı tüm kategorilerin resmi nihai yerleşimini/onaylı stok listesini henüz vermedi. Yeni üst/alt gruplar eklenebilir, yeniden adlandırılabilir, alt seviyelere ayrılabilir; **kategori ağacı iki seviyeye sabitlenmez**. Bir ürünün hangi aktif birincil dala bağlı olduğu belirsiz kalmamalı.

### Kategoriyle bağlantılı iş hedefi — onaylanan yön ve teknik öneriler

- **Kullanıcı Karar 38'de müşterilerin nakit ve vadeli net satış fiyatlarını maliyet artışına göre yönetici onayıyla topluca düzeltmeyi onayladı. Karar 39'da bireysel ürün yerine kategori hiyerarşisini tercih etti.** Böylece müşteri × kategori / alt kategori bazında **nakit ve vadeli iskonto** tanımlanabilmesi hedefleniyor; her stok kartı için ayrı iskonto girme zorunluluğu oluşmamalı.
- **Karar 40 ile ONAYLANDI — iskonto mirası:** Müşterinin genel nakit/vadeli varsayılanı bulunabilir. Bir kategoriye verilen iskonto, o kategoriye bağlı **tüm alt kategorilere otomatik miras kalır**. Daha alt kategoride ilgili ödeme şekli için özel oran varsa sadece o alt dalda **en yakın / en spesifik geçerli oran** kullanılır; üst ve alt oranlar üst üste eklenmez veya çarpılmaz. Nakit ve vadeli oranlar **birbirinden bağımsız** miras alınır: örneğin çocuk kategoride yalnız nakit iskonto tanımlandıysa vadeli oran üstten gelir. Vergi, vade farkı ve kampanya önceliği ayrı değerlendirilir.
- **Tasarım önerisi:** Yönetici maliyet artışı sonrası kategori/alt kategori seçip o gruba bağlı ürünleri ve müşterilerin eski/yeni **nakit / vadeli iskontolarını, net fiyatlarını ve tahmini kârlarını** önizler; **yönetici onayı** olmadan hiçbir müşterinin iskonto oranı yayınlanmaz. Önceki teklif/sipariş/fatura/özel anlaşmalar ve sabit liste fiyatı değiştirilmez.
- **Önemli matematik sınırı:** Aynı kategoride ürün X'in maliyeti %5, Y'nin %15 artmışsa **tek bir kategori iskonto oranıyla** her ürüne tam olarak kendi maliyet yüzdesi kadar ayrı net fiyat artışı sağlamak genel olarak mümkün değildir. Karar 38'deki **aynı ürün için müşteriler arasında eşit göreli artış** korunabilir; fakat kategori oranı kullanıldığında ürünler arasındaki farklı yüzdeler için bir **kategori genel değişim endeksi / yönetici seçimi** gereklidir. Bu yüzdelerin nasıl birleştirileceği (satış miktarı/cirosu ağırlıklı, en yüksek artış, yönetici manuel) **henüz açık karardır**. Tek bir grup zammını ürünler tek tek o kadar zamlanmış gibi göstermeyin. Kritik/zarar riski taşıyan ürünlerde uyarı verin.
- **Kategori değişimi/kontrol:** Her firma için `tenant_id`, kategori kimliği, `parent_id` (ana kategori null), ad, sıralama, aktif/pasif, geçerlilik/sürüm ve denetim alanı; ürünün geçerli kategori üyeliği sürümlü izlenir. Kategori oluşturma, taşıma, yeniden adlandırma ve silme/arsivleme yetkiyle olur. Ürünleri, geçmiş sipariş ve maliyet raporlarını veya mevcut iskonto anlaşmalarını sessiz yeniden yazan kategori taşıma yapılmaz. Döngüsel üst/alt ilişki yasaklanır, sonsuz seviye pratik derinlik/sorgu performansı korumasıyla desteklenir.
- **Operasyonel bağlantılar:** Ürün katalog/listeleri, sipariş ekranı arama/filtre, stok raporları, satış/kâr raporları ve müşteri portalında rol yetkisi içindeki ürünler kategoriyle bulunabilir. Kategori üzerinden ürün fiyatı, reçete, kapasite veya stok otomatik değiştirilmez. Mevcut 0.13.0 ürün kodları/üretim/siparişler bozulmadan aşamalı kategori geçişi yap; mevcut ürünü yanlış kategoriye tahminle taşıma.
- **Önerilen kullanıcı akışı:** Şirket kategori ağacını kurar; stok kartlarıyla eşler; cari/müşteri bazında genel nakit/vadeli iskonto ve gerektiğinde kategoriye özel oran tanımlar; yeni siparişte sistem en spesifik aktif oranı hesaplayıp hangi kategori politikasının uygulandığını gösterir. Güncellemeler rol, yürürlük tarihi, iki ayrı kişi onayı gerektiren kritik durumlar ve audit ile izlenir.
- **Uygulama güvenliği:** Fiyat listesinin tek başına maliyet değişimiyle güncellenmemesi (Karar 38), finansal muhasebe maliyetinin teklif referansından ayrı tutulması, gizli müşteri/maaş verileri, şirketler arası RLS izolasyonu ve depo kabulü olmadan sevk etmeme (Karar 25) değişmez.

**Codex teknik devam belgesi:** [Maliyet Hesaplama Politikaları — Kategori iskonto tasarımı](MALIYET_HESAPLAMA_POLITIKALARI.md). **Karar 41 ile ONAYLANDI:** Kategori genel net fiyat artışı için **satış ağırlıklı ortalama / en yüksek ürün maliyet artışı / yöneticinin belirlediği oran** seçenekleri sunulacak; yönetici ürünlerin kârlılık etkisini karşılaştırıp onaylayacak. Ayrıntılar Karar 41'dedir.

## 34. Karar 40 — Alt kategoriye üst kategorinin müşteri iskontosu miras kalır (2026-10-22, ONAYLANDI)

**Kesin kullanıcı onayı:** Firma/müşteri özelinde bir üst kategoriye tanımlanmış **nakit ve vadeli iskonto**, alt kategori için ayrıca oran belirlenmemişse bütün aşağı dallarda geçerli olur. Alt kategoriye özel oran kaydı açıldığında **yalnız o alt dalda** özel oran geçerli olur; üst kategorinin kendi iskontosu veya kardeş alt kategoriler etkilenmez. Çok seviyeli ağaçta en yakın geçerli üst/alt kategorinin kaydı kazanır; iki iskonto asla üst üste toplanmaz.

- **Örnek:** Müşteri A için "Profil Merdivenler" nakit %20, vadeli %15. "Çift Çıkışlı Profil Merdivenler" yalnız nakit %12 ise o alt kategoride nakit %12, vadeli üstten gelen %15; "Tek Çıkışlı Profil Merdivenler" için nakit %20, vadeli %15. Alt kategoriye yeni özel vadeli %10 girilirse yalnız o dalın vadeli oranı %10 olur. Sayılar açıklama amaçlıdır.
- Fiyatlandırma hesaplama kuralı müşteri × ödeme türü × ürünün aktif kategori ağacından **en derin geçerli onaylı iskonto politikasını** seçer. En az spesifik, firma genel/müşteri genel default ancak uygun özel kayıt yoksa devreye girer. Eksik politika ile %0 iskonto varsayımı kullanıcının tanımlı şirket ayarına bağlı olmalı; otomatik olarak hatalı fiyat çıkarılmamalı.
- Kategori düzenleme/taşıma, müşteri oranı, geçerlilik tarihi veya politika sürümü değişimleri beklenmedik yeni fiyat yaratabileceği için yetki, etki önizlemesi ve tarihçe ile yapılır. Önceden onaylı teklif/sipariş ve faturaların fiyatı değişmez. Liste fiyatı yalnız yetkili yönetici açık işlemle değiştirir (Karar 38); toplu iskonto revizyonu yönetici onaylıdır.
- **Test:** (1) üstten miras, (2) üçten çok kategorili ağacın en yakın özel oranı, (3) sadece nakit override ve vadeli miras, (4) kardeş alt kategori etkilenmez, (5) üst+alt oranlar toplanmaz, (6) rol/tenant izolasyonu, (7) eski teklif/sipariş fiyatları sabit.
- **Karar 41 ile ONAYLANDI:** Kategoriye önerilen ortak net fiyat artış oranı üç yöntemden seçilebilir: satış ağırlıklı ortalama, en yüksek ürün maliyet artışı veya yetkili yöneticinin belirlediği oran. Önizlemede her ürünün maliyet/marj etkisi gösterilir; herhangi bir oran kendi kendine yayına alınmaz.

## 35. Karar 41 — Kategori geneli net fiyat artışı için üç seçenek ve kârlılık önizlemesi (2026-10-22, ONAYLANDI)

**Kullanıcı onayı:** Ürünlerin maliyet artışları birbirinden farklı olduğunda ana/alt kategoriye uygulanacak **tek ortak net satış fiyatı artış yüzdesi** için firma/yetkili yönetici şu üç yöntem arasından seçim yapabilsin: (K1) **satış ağırlıklı ortalama artış**, (K2) **kategorideki en yüksek ürün maliyet artışı**, (K3) **yetkili yöneticinin elle belirlediği artış**. Ekran her üç yöntemle oluşacak net fiyat, müşteri iskonto ve ürün kârlılık etkilerini karşılaştırmalı göstermeli. Kullanıcı tek bir yöntemin bütün şirketler için zorunlu olmasını değil, **seçenekler sunulmasını** onayladı.

- **K1 — Ağırlıklı ortalama:** Kategoriye bağlı kapsamdaki her ürünün, seçilen geçerli dönemdeki onaylı önceki/güncel fiyatlandırma referansı arasındaki oransal maliyet artışı `r_i`; uygun önceki dönem *net satış cirosu* gibi ortak karşılaştırılabilir birimden ağırlık `w_i` alınarak `r_kategori = Σ(w_i × r_i)/Σ(w_i)` hesaplanır. Geçmiş dönem (örn. 3/6 ay) firmanın ayarı olabilir. Belgesiz/stale maliyet verileri ve sıfır/eksik ciro için güvenilir oran uydurma; uyarı, başka yöntem veya onaylı ayrı kural gerekir. Aynı ürünün tekrarlı satışları, iadeler ve indirimi doğru işlenmeli.
- **K2 — En yüksek artış:** Kapsamdaki geçerli ürün artışlarının en büyüğü önerilir; fiyat/marj korumasına öncelik veren firma için fakat diğer ürünlerde rekabet/iskonto tavanı riskleri olabilir. Büyük, olağan dışı artışlar gizlenmeden listelenir. Eski veya hatalı tek ürün maliyeti tüm kategoriyi sessizce yükseltmemeli; uç değer için görünür doğrulama.
- **K3 — Yöneticinin oranı:** Yetkili yönetici uygun kategoride tek oransal net fiyat artış yüzdesini elle seçer. Mevcut maliyet artışları ve K1/K2 hesaplarıyla karşılaştırılır; riskli/düşük marjlı ürünler işaretlenir. Yüzde 0 gibi seçenekler ticari olarak bilinçli yönetici kararıyla mümkündür.
- **Kategori iskonto revizyonu:** Seçilen `r_kategori`, Karar 38'deki `eski_net × (1+r_kategori)` hedef net fiyat yaklaşımıyla, **her müşterinin ilgili kategorideki nakit ve vadeli iskontolarını ayrı ayrı** öneri olarak yeniden çözer. Ana kategoriden miras alınan/alt kategoride özel tanımlanan oranlar Karar 40'ın **en yakın geçerli kayıt** önceliğine tabidir; üst kategoride onaylanan değişiklik ayrı özel oranı bulunan alt kategoriyi **sessizce ezemez**. Yöneticinin hangi alt dalları dahil ettiği ve mevcut özel iskonto kayıtlarının etkisi önizlemede açıkça gösterilir.
- **Kritik matematik sınırı:** Bir kategori genel oranı, ürünlerin farklı maliyet artışlarını **birebir karşılayamaz**; tüm ürünleri aynı yüzdeyle fiyatlandırırken ürün bazında brüt marj, üretim/satış giderleri ve maliyetin karşılanma durumlarını ayrı incele. Ürün/alt kategori için gerektiğinde ayrı kategori revizyonu oluşturulabilir; onaysız ürün bazlı gizli iskonto kuralı ekleme.
- **Zorunlu önizleme:** K1, K2 ve K3 seçenekleri için; kapsam ve seçilen üst/alt kategori, ilgili ürünler, önceki/güncel korunmuş referans maliyet, ürün başına maliyet artışı, eski-yeni net satış fiyatı ve tahmini birim/katkı marjı, maliyet altına düşen ürünler, müşteri nakit/vadeli eski-yeni iskonto oranları, liste fiyatı tavanı, negatif iskonto, sabit müşteri anlaşması ve onaylı mevcut sipariş etkisizliği gösterilir. Şirkete göre müşteri sayısı çoksa özet + filtreli detay, toplu onay güvenliği sağlanır.
- **Onay/yayın:** Hesaplar **öneridir**; yetkili ticari yönetici önizleme, kapsam, gerekçe ve geçerlilik tarihini onaylamadıkça müşteri iskontoları değişmez. Kritik riskli durumlarda önceden onaylanan iki gerçek kişi/onay kuralları uygulanır. Bir kategoriye K1, diğerine K3 seçilebilir; seçimler firma, kategori ve geçerlilik sürümünde saklanır. Liste fiyatı **yönetici ayrıca değiştirmedikçe sabit** (Karar 38); onaylı eski sipariş/fatura ve sözleşmeler değişmez.
- **Testler:** K1 20/80 ciro ağırlığı ve %5/%15 artış için %13 verir; K2 %15; K3 yönetici %10 olabilir. Düşük marj/zarar uyarısı, yanlış/eksik ağırlık, sıfır toplam ağırlık, negatif iskonto, liste tavanı, nakit/vadeli ayrı, kategori mirası/alt istisna, eski sipariş snapshot, RBAC/tenant ve tekrar eden onayın çift uygulanmaması güvence altına alınır.
- **Ayrıntılı uygulama ve test tanımı:** [Maliyet Hesaplama Politikaları — Karar 41](MALIYET_HESAPLAMA_POLITIKALARI.md).

**Sonraki açık ayrıntı:** Satış ağırlıklı ortalamanın geçmiş dönem penceresi (son 3 ay/6 ay/12 ay gibi) şirket ayarından seçilebilir; tek bir rakam kullanıcı tarafından henüz zorunlu kılınmadı. Ayrıca müşteri özel sözleşme/kampanya istisnaları yukarıdaki önizleme ve onay kurallarıyla korunacak.

## 36. Karar 42 — Ürünlerin kesin kısa adları ve Finans tasarımına geçiş (2026-10-23, ONAYLANDI)

**Kesin kullanıcı kararı:** Ürünlerin isimlerinde daha önce kullanılan özel şirket markası **artık önek veya uygulama adı olarak YER ALMAYACAK**. Kullanıcı tercihine göre dört müşteri/şirket iş uygulaması sırasıyla:
1. **Operasyon**
2. **Finans**
3. **İnsan Kaynakları (İK)**
4. **Müşteri Portalı (MP)**

Ana kullanıcı menüsü, başlıklar, modül etiketleri, giriş ekranları, rapor başlıkları, teknik gereksinimler ve yeni dokümantasyon bu isimleri kullanacak. Eski repo/doküman dosyası adları ve mevcut canlı kod/URL/Vercel tanımları teknik uyumluluk nedeniyle hemen yeniden adlandırılmayabilir; **eski kod/işlem ve tarihsel veriler kırılmadan** planlı geçiş yapılır. Aynı şirkete ait örnek cari/kurumsal bilgi markası, uygulama adlandırma kararıyla değiştirilmez. Başvuran diğer şirketlerin ekranlarında tek müşterinin özel markası uygulama adı olamaz.

**Çalışma sırası:** Kullanıcı sıradaki ayrıntılı iş akışı tasarımının **Finans** modülünde başlamasını açıkça istedi. Dört iş uygulamasının tamamı ve aşağıda kapsamı tanımlanan beşinci platform yönetim arayüzü birbirinden ayrı sorumluluklarda tasarlanır. Finans analizini mevcut cari, banka, POS, ödeme, tahsilat, senet/çek, fatura, hesap ve bordro/hammadde maliyeti kurallarıyla tutarlı tasarla; veri/özlük erişimleri korunur.

## 37. Karar 43 — Beşinci uygulama: Platform Yönetimi bağımsız güvenli web uygulaması (2026-10-23, ONAYLANDI)

**Kullanıcının talebi:** Dört iş uygulamasına ek olarak **tüm kayıtlı şirketleri ve uygulama izinlerini yöneten beşinci ayrı admin ekranı** olmalı. Kullanıcı bunun "uygulama mı web sayfası mı" olması gerektiğini sordu. **KULLANICI TARAFINDAN ONAYLANDI:** Bu, halka açık statik web sayfası veya dört uygulamanın içindeki gizli menü değil; **beşinci bağımsız, tarayıcıdan erişilen, mobil uyumlu güvenli WEB UYGULAMASI** olacak. Adı: **Platform Yönetimi**. Bu beşinci uygulama müşterilerin satın aldığı beşinci ticari iş modülü değil, platform operatörüne ait *control plane* / yönetim konsoludur.

**Web uygulaması ile web sayfası ayrımı:** Web sayfası yalnız tanıtım/bilgi sunabilir; gerçek şirket ve yetki yönetimi kimlik doğrulama, kalıcı kayıtlar, sunucu/API yetki kontrolü, denetim ve çok faktörlü güvenlik istediği için tam web uygulamasıdır. Masaüstü ve telefonda tarayıcı üzerinden çalışabilir; yerel iOS/Android app geliştirme zorunlu değildir. Güvenlik politikaları uygun görülürse ileride PWA/masaüstü kısayolu eklenebilir ama bu bir gereksinim değildir.

**Onaylanan beşinci uygulamanın tasarım kapsamı (uygulama detayları aşamalı geliştirilecek):**
- Şirket başvurusu inceleme/onay/ret; şirket açma, etkin/pasif, askıya alma ve geri açma; veri silme/kalıcı kapatma yalnız ayrıca tasarlanmış yasal ve çoklu onay süreçleriyle.
- Her şirketin **Operasyon / Finans / İK / MP** uygulama erişimini, lisans/paket, etkin servis ve gerektiğinde kapasite/limit parametrelerini ayırarak yönetme. Şirketin hangi modüle sahip olduğunu değiştirmek var olan veri kayıtlarını silmez.
- Şirket ilk yetkili kullanıcı daveti, rol/izin şablonları, uygulama erişimi ve üst limitleri; şirketin kendi yetkili yöneticisinin yönetebileceği izinler ile **platform operatörünün belirlediği erişim sınırları** kesin ayrılmalı.
- Şirket/uygulama durumu, teknik sağlık ve **sadece gerekli üst düzey metadata** görünümü; hassas sipariş, müşteri bakiye, maliyet, bordro/maaş, şirket içi risk raporu, kişisel bilgi sırf platform admin rolüyle görünmez.
- Merkezi platform audit: başvuru kararları, şirket erişim değişiklikleri, kritik yetki değişiklikleri, admin oturumları, engellenen denemeler, onaylayan gerçek kişi, zaman ve gerekçe; loglar görev ayrımı ve KVKK veri minimizasyonuyla.
- Teknik güvenlik: özel alan adı/deploy/entrypoint ve rol, MFA (güçlü doğrulama), düşük yetki ilkesi, kısa yönetici oturumu ve yeniden doğrulama, rate limit, CSRF/oturum güvenliği, DB/RLS ve sunucu kontrolleri, sistem yöneticisi hesabına gelişigüzel rol atamayı engelleme, önemli yetki/şirket kapatma değişikliklerinde gerektiğinde iki ayrı gerçek kişi onayı.
- Platform desteği için bir şirketin iş verilerine geçici erişim zorunlu olursa ayrı **şirket yetkisi ve süre sınırlı, denetlenen destek erişimi** gerekir; kalıcı süper kullanıcı üzerinden otomatik içerik erişimi **YASAK**. Şirket içi yetki yönetimi için esas iş uygulamasının yetkili firma yöneticisi rolü kullanılır.
- Tek ortak kimlik/tenant güvenlik altyapısı altında ayrı beş arayüz planlanabilir. Önerilen monorepo beşinci entrypoint: `apps/platform-yonetimi` veya `apps/platform-admin`; 4 iş uygulaması entitlements, yayınlama, test ve gizlilikleri ayrı kalır. `apps/platform-admin` içeren beş ayrı kullanıcı deneyimi **tek mega uygulamada 5 sekmeye** indirilmez.
- Mevcut Operasyon 0.13.0 davranışları, veri ve yetkili hesap geçişi kırılmadan aşamalı inşa; production deploy ve canlı veritabanı değişikliğine kullanıcı onayı olmadan geçiş yok.

**KESİN ONAY:** Kullanıcı **"Evet"** diyerek beşinci ekranı **"Platform Yönetimi" adlı ayrı, güvenli, responsive web uygulaması** olarak kesinleştirdi. Beş bağımsız arayüz/giriş noktası oluşturulması onaylı mimari hedeftir: dört ticari uygulama (Operasyon, Finans, İK, MP) + bir platform işletim web uygulaması (Platform Yönetimi). Platform Yönetimi kendi yetkileri ve dağıtımıyla ayrı kalmalı; herhangi bir şirkete otomatik iş verisi erişimi açılmamalı. Şu anda doküman kararıdır; kod, DB migrasyonu veya production deploy yapılmış sayılmaz.

## 38. Finans tasarımına başlama — karar süreci (2026-10-23, GÜNDEM)

Kullanıcı modüller arasında sıradaki ayrıntılı ürün tasarımını açıkça **Finans** olarak seçti. Karar 43 ile beşinci **Platform Yönetimi** ayrı güvenli web uygulaması kesinleşti. Finans dört ticari uygulamadan biridir; Platform Yönetimi yalnız şirket ve yetki/uygulama erişimi yönetir, şirket içi muhasebe/ödeme kayıtları Finans'a aittir.

**Finans tasarımının başlangıç kapsamı (önceki gereksinim ve iş kurgularından):** şirket bazlı ve tenant izolasyonlu cari hesaplar/alacak-borç, müşteri ve tedarikçi ilişkileri, nakit/banka/kredi kartı/POS, tahsilat/ödeme, çek-senet, vade ve finansal risk, fatura/belge, gider merkezleri, üretim maliyetiyle entegrasyon, onay zinciri, rapor ve nakit akışı. Şirket içi birden fazla yasal işletme/şube ve firma içi para aktarımı ihtimali ayrı doğru muhasebeleştirmeyle değerlendirilir; tek şirketin iki yasal tüzel kişiliğini yanlış birleştirme. Operasyon'dan gelen sipariş/irsaliye/stok olaylarını ikinci kez tutarsız şekilde kaydetme; İK ücret detaylarını yalnız yetkili görür, MP yalnız kendi cari ve izinli ödeme verisini görür.

**Karar 44 ile kesinleşti:** Finans, şirketin tercihine göre (F1) **bağımsız finans hareketleri/cari kayıtları sistemi** veya (F2) **Zirve Ticari gibi mevcut muhasebe yazılımlarıyla uygun yetkili entegrasyona dayalı finans yönetim sistemi** olarak çalışacak. Kullanıcı C seçeneğini onayladı. Aynı fatura/tahsilat/ödeme/cari kaydının iki kez oluşmaması, veri kaynağı, senkronizasyon, mutabakat ve kayıt sahipliği esasları [Finans Tasarımı](FINANS_TASARIMI.md) dosyasında ayrıntılıdır.

## 39. Karar 44 — Finans'ın bağımsız veya muhasebe entegre çalışması firma bazında seçilir (2026-10-23, C ONAYLANDI)

**Kullanıcı açıkça C seçeneğini onayladı:** Her firma **Finans** uygulamasını, yalnız kendi finans hareketlerini tutarak bağımsız çalışacak şekilde ya da **Zirve Ticari gibi mevcut muhasebe yazılımlarıyla entegre** çalışacak şekilde kullanabilsin. İkinci yöntem seçildiğinde aynı işlem iki kez kaydedilmesin. Tüm şirketler için tek muhasebe sağlayıcısı zorunlu tutulmayacak.

### Zorunlu iş/veri ilkeleri

- **F1 Bağımsız Finans:** Cari, alacak/borç, ödeme/tahsilat, banka/kasa/kart/POS, çek-senet, gider/masraf merkezi ve finans raporları; şirketin kendi yetkili kullanıcıları ve finans olay modeliyle yönetilir. Resmî e-fatura/e-defter ve beyanname yeteneği ayrıca yasal/teknik kapsam gerektirir, uygulamanın bunları otomatik ikame ettiği iddia edilmez.
- **F2 Entegre Finans:** Her veri türünde tek açık yetkili ana kaynak ve şirket/sistem kayıt eşleşmesi olmalı. Zirve dahil yalnız gerçekten mümkün/izinli entegrasyon yöntemleriyle (API mevcutsa yetkili API, aksi hâlde kontrollü ve onaylı CSV/Excel gibi aktarım), dış kayıt Finans'a getirilebilir; kaynakta sonradan değişen/silinen finans hareketi sessizce silinmez veya üzerinde değişiklik yapılmaz.
- **Mükerrer kayıt önleme:** Şirket+tüzel kişilik+kaynak sistem+dış ID/belge anahtarı ve finans işlem kimliğiyle idempotent import; aynı fatura, tahsilat veya ödeme ikinci kez borç/alacak yaratamaz. Eşleştirme belirsizse yönetici incelemesi ve mutabakat kuyruğu gerekir. Düzeltme, onay, tarihçe ve geri alma gerçek finans güvenliğiyle yapılır.
- **Firma ayarları/sürüm:** Bağımsız/entegre seçimi, kayıt türü bazında sorumluluk, entegrasyon sağlayıcısı, işlem yönü, veri kaynağı, aktarım onayı, kapanış ve risk yetkileri firma düzeyinde ve yetkili değişiklik kaydıyla yönetilir. Platform Yönetimi şirketin Finans'a erişimini açabilir/kapatabilir ama şirketin ticari banka/maaş/cari verisini sırf platform rolüyle göremez.
- **Ayrı modüller:** Operasyon'dan gelen sipariş/teslimat olayını cari tahsilatla karıştırma; İK'dan çıkan bordro ve maaşta gizliliği koru; MP müşterisinin sadece kendi cari/ekstre/ödeme alanlarını görmesini sağla; çok şirket/çok tüzel kişi izolasyonunu ve müşteri verilerini koru.
- **Geçiş ve canlı sistem güvenliği:** F1↔F2'de açılış bakiyesi, geçmiş kayıt eşleştirme, fark raporu, test aktarımı, yetkili onay, yedek ve rollback gerekir. `operasyon-gelistirme` dalında aşamalı geliştirme ve regresyon testleri; production database, SQL veya yayın onaysız değişmez.
- **Codex için ayrıntılı işlem sözleşmesi, aşamalı kabul testleri ve açık entegrasyon yönü kararı:** [Finans Tasarımı](FINANS_TASARIMI.md). Bu belge ana şartnamenin tamamlayıcısıdır.

**Karar 45 ile ONAYLANDI:** Entegrasyonda hem **kontrollü veri içe aktarma + onaylı dışa aktarma (S1)** hem de teknik/yetki şartları doğrulandığında **iki yönlü otomatik senkronizasyon (S2)** desteklenecek; firma yöntem seçebilecek. S1 önce, S2 güvenli ve aşamalı geliştirme sonrası. Ayrıntılar [Finans Tasarımı — Karar 45](FINANS_TASARIMI.md).

## 40. Karar 45 — Finans muhasebe veri aktarımında iki yöntem şirket bazında seçilebilir (2026-10-23, C / S3 ONAYLANDI)

**KESİN KULLANICI KARARI:** Entegrasyon için şirket **S1 — kontrollü tek yönlü içe alma ve onaylı dışa aktarma** veya **S2 — uygun muhasebe yazılımıyla gerçek iki yönlü otomatik senkronizasyon** yöntemlerinden birini seçebilecek. **İlk aşama S1**, sonraki aşamada yazılımın belgelenmiş teknik erişimi, yetkilendirme, veri eşlemesi, izole test, tam mutabakat ve firma onayı sağlanan sağlayıcılarda **S2** açılacak. Kullanıcının C tercihi her sağlayıcının otomatik S2'yi desteklediği iddiası değildir.

- **Karar 44 (bağımsız/entegre) ile Karar 45 (entegrasyondaki veri aktarım yönü) ayrıdır.** Bağımsız firmada dış muhasebeye otomatik yazma gerekmiyor; entegre firmada hangi kayıt türünün hangi yazılımda ana kaynak olduğu veri sözleşmesinde nesne bazında korunur.
- **S1:** Yetkili dosya/sağlayıcıdan cari, fatura, ödeme, tahsilat, banka hareketleri taslak eşleme, satır kontrolü ve onayla içe alınır. Finans'tan dışarı verilen belge/fişin **muhasebe sistemince gerçekten işlendiği ayrı statü** ile doğrulanır; dosya oluşturmayı tamamlanmış resmî muhasebe kaydı sayma.
- **S2:** Yalnız belgelenmiş, izinli API veya desteklenen resmî entegrasyonla; olaya göre yön ve kayıt otoritesi, kalıcı `source_event_id` / `external_id`, sürüm, idempotency, güvenli tekrar deneme, eşzamanlı değişiklik/çakışma kuyruğu, giden olayın tekrar içeri alınarak çoğaltılmasını engelleme, mutabakat ve dönem kilidi zorunludur. Sağlayıcı API yazma erişimi yoksa sahte 'tam otomatik çift yönlü' özelliği vaat etme; S1 kullanılabilir. **Zirve Ticari'nin API imkânı teknik araştırma/izin gerektirir.**
- Aynı fatura ve tahsilatın çift borç/alacak, ikinci banka/kasa veya cari hareketi yaratması engellenecek. Yanlış eşlenen cari/kaynak, çoklu firma/tüzel kişi, farklı kur/birim, kapanmış dönem, yanlış sıra, kısmi ağ kopması ve ikinci yazma gibi sorunlarda otomatik üstüne yazma/silme değil **yetkili insan incelemesi** gerekecek. İptal/ters kayıtlar izlenebilir.
- Şirket/uygulama/hesap/nesne bazlı aktarım ve onay limitleri, gerçek iki kişinin gerekli kritik onayları, kaynak yazma yetkisi, ayrı erişim anahtarları ve denetim logları korunacak. Platform Yönetimi işletmenin finans ayrıntılarını sırf platform yöneticisi sıfatıyla göremez.
- **Canlıya alma ayrı karardır:** Bu aşamada yalnız ürün/teknik şartname onaylı; henüz entegrasyon kodu, gerçek muhasebe yazma yetkisi, production migration, otomatik para hareketi veya canlı aktarım yapılmadı. Şirketin muhasebe/finans yazılımıyla resmî bağlantı kurulması ve canlı geçiş için ayrıca açık kullanıcı onayı gerekir.
- **Codex ayrıntı ve kabul testleri:** [Finans Tasarımı — Karar 45](FINANS_TASARIMI.md), 6. bölüm.

**Karar 46 ile kesinleşti:** Şirketler Finans'ta tamamen ayrı; birden fazla şirkete ait cari, banka, kasa, fatura, ödeme, ücret ve finans raporu birleştirilemez. Şirketler arası konsolide finans ekranı **yapılmayacak**. Ayrıntılar Karar 46'da.

## 41. Karar 46 — Finans'ta tam şirket izolasyonu; ortak şirket finans ekranı yok (2026-10-23, ONAYLANDI)

**Kullanıcı farklı şirketlerin finansını birleştirme önerisini REDDETTİ.** Her şirketin cari hesapları, banka/kasa, kredi kartı/POS, alacak/borç, fatura, ödeme/tahsilat, ücret/masraf, muhasebe bağlantısı ve raporu **yalnız o şirkete ait** olacak. Farklı şirketlerin verilerini karşılaştıran veya toplayan konsolide finans yönetim paneli oluşturma.

- Aynı kullanıcı iki şirkette ayrıca yetkili olsa dahi her Finans oturumu/işlem/sorgu için **tek doğrulanmış `tenant_id/company_id` bağlamı** kullanılır; çapraz şirket birleştirilmiş cari/rapor/ödeme listesi ve ortak toplam bakiyeler yoktur. Şirketler arası yetki atanabilmesi veri sızması yetkisi sayılmaz.
- Sunucu/API ve veritabanı RLS, izin/rol, işlem sınırları, dışa aktarım, arama, dosya indirme, entegrasyon ve bildirimler dahil bütün katmanlarda tenant izolasyonu zorunludur. Platform Yönetimi şirket üyeliği ve uygulama erişimini yönetebilir, şirket içi finans/maaş/cari verisini sırf platform yetkisiyle okuyamaz.
- Aynı yasal şirket içindeki şube/depo/masraf merkezi/proje raporu firmaya ait bir iç rapor olabilir; ayrı **yasal şirketleri** aynı muhasebe kaydı/bakiye gibi birleştirmek yasaktır. Gerçek şirketler arası alış/ödeme ancak her iki şirketin kendi bağımsız belge ve hesapları üzerinden normal bir ticari işlem olarak ele alınır, ortak cüzdan gibi gösterilmez.
- Kabul: bir kullanıcının yetkili olmadığı şirketin cari, banka, personel, IBAN, belge, ödeme listesi, XML/CSV/XLSX/PDF exportuna erişimi imkânsız olmalı. Birden çok şirkette yetkili kullanıcı hiçbir birleşik mali tablo alamaz.

## 42. Karar 47 — Bankaya gönderilmeye uygun ödeme listesi ve dosya indirme (2026-10-23, ÖZELLİK İSTEĞİ ONAYLANDI)

**Kullanıcı isteği:** Finans'ta bir **Ödeme Listesi** oluşturulabilsin; çıktı bankaya **e-postayla iletmeye uygun formatta indirilebilsin**. Kullanıcı şimdilik sistem içinden e-posta gönderilmesini, otomatik banka işlemi yapılmasını veya belli bir bankanın formatının kesin uygulanmasını istemedi.

- Tasarım önerisi: şirketin yetkili Finans kullanıcısı bir **taslak ödeme listesi** açar; onaylı ödeme talebi/tedarikçi borç satırlarını seçebilir ve yetkisi varsa tek tek satır girer. Her satır: alıcı cari/unvan, IBAN/hesap, banka (gerekli ise), tutar, para birimi, açıklama, ödeme tarihi/vade ve dayanak belge/işlem kimliği. Başlık: **tek şirket**, ödeme çıkacak şirket banka hesabı, istenen işlem tarihi, liste numarası, toplam ve satır sayısı.
- Taslak → kontrol/önizleme → onay bekliyor → onaylandı → bankaya uygun **dosya hazırlandı** → kullanıcı teyidiyle bankaya gönderildi → banka sonucu/mutabakat → gerçekleşmiş ödeme veya ret/iade durumları ayrı olacak. **Dosyanın indirilmesi veya bankaya mail atılması para transferi değildir; cari/banka bakiyesinden ikinci defa tahsilat/ödeme oluşturulmaz.**
- İndirilebilir çıktı önerileri: okunaklı **PDF ödeme talimatı/listesi** ve bankanın gerçek şablonuna uyarlanabilir **Excel/CSV toplu ödeme listesi**. PDF bilgi/talimat olabilir; banka içe aktarımına uygun dosya ancak ilgili bankanın örnek şablonu, karakter, sıralama, format, imza ve işlem kuralları doğrulandığında bankaya uygun olarak adlandırılır. Bir bankanın formatını diğer bankaya kesin uyacakmış gibi kodlama.
- Rol/limit/onay; alıcı-IBAN/tutar doğrulama; aynı belgenin/listenin iki kez ödenmesi; firma/IBAN yanlış eşleme; onaylı listeyi değiştirmek için yeni sürüm/onay; hassas ödeme ve maaş bilgilerinin gizliliği; PDF/XLSX/CSV export kayıtları/audit; bankadan dönüt alınmadan "ödendi" saymama zorunlu.
- Ek bankaya aktarma/senkronizasyon özelliği gerçek para gönderme izni değildir. Şirket A'nın alıcısı, IBAN'ı veya ödeme listesi şirket B'ye sızdırılamaz. Personel ücretleri için ayrı İK/Finans yetki ve gizlilik gerekir.
- Ayrıntı ve kabul testleri: [Finans Tasarımı — Karar 47](FINANS_TASARIMI.md).

## 43. Gündem 48 — Fiilî ödeme ve belge/bordro durumu arasındaki farkları yasal mutabakatla izleme (2026-10-23, TASARIM ÖNERİSİ; KESİN KULLANICI ONAYI BEKLİYOR)

**Kullanıcının tarif ettiği gerçek ihtiyaç:** Aynı cari/tedarikçi için bir işlem faturalı, diğerinde henüz fatura bulunmuyor olabilir; tahsilat/ödemeler nakit veya banka yoluyla gerçekleşebilir; personelin bordrodaki ücret ve fiilen ödenen tutarı uyuşmayabilir. Finans'ta **gerçek nakit hareketi ve dayanak belge/kayıt durumu ayrı ayrı** görülebilmeli.

**Güvenli öneri:** İki paralel "resmî/gayriresmî defter" ya da vergiden/SGK'dan saklı ikinci kayıt üretme. Tek şirketin denetlenebilir finans olay kaydı içinde (a) **muhasebe sisteminde usulüne uygun belgelenmiş/kaydedilmiş hareket**, (b) **belge bekleyen işlem veya gerçekleştiği iddia edilen nakit hareketi**, (c) **muhasebe mutabakatı ve eksik belge/ücret farkı uyarısı** ayrı tutulur. Belgesiz işlem doğrudan faturalı alış, KDV indirimi veya vergiye esas resmî gider olarak işlenmez. Eksiklik muhasebe/İK uzmanı tarafından uygun belge/tahakkuk/düzeltme ile çözümlenir.

- **Cari tek kimlik:** Aynı müşteri/tedarikçiye aynı tek cari kartı; ekranda "muhasebece doğrulanmış bakiye", "belge bekleyen talepler/borçlar", "mutabakat gerektiren nakit hareketleri" ve bunların karıştırılmadan açıklamalı yönetim amaçlı görünümü. Belgesiz işlem sonradan faturaya bağlanınca **tek işlem kimliği/eşleme ve fark kapatma**, ikinci borç doğurmama. Özellikle belgesi henüz gelmemiş gerçek mal teslimleri ve faturaya dönüşmeyen uyumsuzluklar farklı statülere ayrılır.
- **Ödeme kaynağı:** Fiziksel kasa/banka giriş-çıkışı, kanalı, tutarı ve paranın gerçekten gerçekleşip gerçekleşmediği kayıt altına alınabilir. "Fiilî kasa/banka mutabakatı" ile "belgelenmiş muhasebe bakiyesi" farkı gizlenmez, yetkiliye gösterilir. İşlem açıklaması, dayanak, veri sahibi, onay ve tarihçe mecburi.
- **İK ve ücretler:** Bordroya esas **gerçek toplam hak edilmiş ücret**, banka ve nakit gibi ödeme yöntemleri ve bordro/SGK/beyan kaydı ayrı kontrol edilir. Bordro dışı elden ücretin gizli ikinci maaş kayıt türü yapılması, vergiyi/primleri eksik bildirmek için araç sunulması **YASAK**. Bir fark varsa yetkili İK/muhasebe tarafından düzeltme veya mevzuata uygun ücret tahakkuku yoluna yönlendir; bordro ayrıntısı yalnız yetkililere görünür.
- **Üç eksen:** (1) işlem gerçekleşme durumu: planlandı/teslim edildi/ödendi/iptal, (2) belge durumu: var/bekliyor/eksik/uyuşmazlık, (3) muhasebe kayıt durumu: işlenmedi/tahakkuk-inceleniyor/kaydedildi/mutabık değil/ düzeltildi. "Banka mı nakit mi?" ayrıca **ödeme kanalı**dır; "resmî veya gayriresmî hesap" olarak ayrı görünmez defter oluşturma.
- **Görev ayrımı:** İşlem sahibi belge isteği oluşturabilir, yetkili Finans onaylayabilir; vergi/SGK/iş hukuku değerlendirmesini yetkili muhasebeci/İK yapar. Geçmişi silmeden kaynak belge, düzeltme, tarih, sorumlu ve kontrol kaydı saklanır. Belgeli bakiye ile belgesiz tahmini yükümlülük resmi raporda tek sayıymış gibi gösterilmez.
- **Ödeme Listesi bağlantısı:** Bankaya gönderilecek toplu ödeme listesinde belge/kayıt statüsü, onay ve ödeme yetkisi denetlenir; eksik belgeler veya bordro farkları sebebiyle hukuken gerekli onaylar atlanmaz. Bankaya talimat dosyası oluşturmak eksik faturayı veya bordroyu meşrulaştırmaz.
- **Kabul testleri:** Tek caride faturalı 60.000 ve belge bekleyen 20.000 ayrı satır; 20.000 faturalandığında tek borca eşlenir; 15.000 nakit ödemenin kasa ve belge farkı gösterilir; bordro 40.000 ve fiilî ek 10.000 için yetkili uyuşmazlık çözümü; çapraz şirket/hassas ücret erişimi reddi; gizli defter ve yanlış KDV/vergisel düşüm yapılmaması.

**Henüz onaylanmayan iş tasarım sorusu:** Kullanıcı aynı cari ekranında **muhasebe bakiyesi / belge bekleyen tutar / mutabakat dahil toplam takip edilen yükümlülük** ayrı ve etiketli sütunlarda görünsün mü? "Toplam" yalnız yönetim amaçlı olabilir, resmî muhasebe bakiyesi olarak sunulamaz. Kullanıcının onayı gelmeden gizli off-books cüzdan/maaş yürütme tasarlanmaz.
