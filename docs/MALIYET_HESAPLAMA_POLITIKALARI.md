# SÖZBİR — Şirkete Özel Maliyet Hesaplama ve Fiyatlandırma Politikaları

> **Kapsam:** Operasyon + Finans + İK arasında yetkili veri paylaşımıyla şirket bazlı maliyet planlama, genel üretim gideri dağıtımı, satışa esas referans maliyet ve gerçek maliyet raporlaması.
>
> **Durum / Karar 35 (2026-10-22):** Kullanıcı, alüminyum aşağı düştüğünde satışa esas maliyetin otomatik düşmemesinin **bütün şirketlere zorlanmasına karşı**, bunun **şirket bazlı seçilebilir ayar** olmasını ONAYLADI. Ayrıca yakın zamanda kararlaştırılan ürün kapasitesi bazlı üretim genel gideri dağıtımı, önceki ay maliyeti ve diğer maliyet yaklaşımlarının **alternatif ve ayrıntılı seçenekler** halinde sunulmasını talep etti. Aşağıdaki yöntem kataloğunun her teknik ayrıntısı kullanıcı tarafından tek tek onaylanmış sayılmamalıdır: yeni politika seçenekleri uygulanmadan önce uygun mali müşavir/finans uzmanı ve şirket yetkilisinin belirlediği muhasebe ilkeleri dikkate alınır.
>
> **Öncelikli güvenlik:** Mevcut canlı SÖZBİR Operasyon özellikleri, siparişler, stok hareketleri, depo kabulü→sevkiyat zorunluluğu, Supabase/Postgres verileri, müşteri/çalışanlar ve geçmiş maliyet fotoğrafları korunacak. Bu dosya özelliğin kapsamını tanımlar, **prod deployment veya veri migrasyonu izni değildir.**

## 1. Üç ayrı ama ilişkili maliyet katmanı — birbirinin yerine geçmez

1. **FİİLİ / MUHASEBE MALİYETİ:** Gerçek, dönemi belli, belgesi ve doğru değerleme politikasıyla hesaplanmış hammadde, işçilik, SGK ve genel üretim gideri; stok değeri, finansal rapor ve gerçek kârlılık kaynağı. Finansal raporlamanın tabi olduğu muhasebe standartları, vergi mevzuatı ve şirketin onaylı muhasebe politikası üstündür. Ticari fiyatlandırma tercihi burada tutarı keyfî değiştiremez.
2. **AY İÇİ TAHMİN / BEKLENEN MALİYET:** Henüz tamamlanmayan aylarda önceki dönem, bütçe, sözleşme ve güncel tüketim/gider bilgisiyle öngörülen maliyet. Gerçek giderler geldikçe tahminlerin **yerine** geçer; tahmin + gerçek değer aynı gider için iki kez toplanmaz. Tamlık/güven düzeyi görünür.
3. **SATIŞA ESAS / KORUYUCU REFERANS MALİYET:** Teklif, iskonto ve satış fiyatı kararlarına dayanak olarak şirketin seçtiği ihtiyatlı ticari tutar. Muhasebe maliyetini, stok değerini, faturayı, gider tahakkukunu veya geçmiş satış fiyatını değiştirmez. İndirim/marj limitleri şirketin önceki onaylı rolleriyle uygulanır.

Her ürünün maliyet ekranında bu değerler ayrı isim ve dönemle yer alır; yetkisiz rollere maliyet, çalışan ücreti veya kâr marjı açılmaz.

## 2. Satışa esas referans maliyet seçimi (her firma birincil yöntem seçer)

| Kod | Görünen ad | Mantık ve kullanım | Koruyucu davranış |
| --- | --- | --- | --- |
| P1 | **Önceki Ay + Alüminyum Artışı Koruması** | Önceki ay kapanmış ürün maliyeti temel alınır; ilgili ürünün **alüminyum bileşenine** güvenilir kilogram fiyatındaki yukarı yönlü değişim yansıtılır. Önceki onaylı alüminyum koruma tabanı tarihsel saklanır. | Alüminyum kg fiyatı düşüşü **otomatik fiyatlandırma düşüşü yaratmaz**. Yönetici gerekçeli biçimde referansı manuel indirebilir. Kullanıcının tercih ettiği model; şirket bazlı etkinleştirilir. |
| P2 | **Önceki Ay + İki Yönlü Malzeme Güncellemesi** | Önceki ay kapanmış maliyet üzerinden seçili malzeme bileşenleri güncel güvenilir fiyatlara göre artırılıp azaltılır. | Ticari fiyatlandırmada otomatik düşüşe izin veren firma tercihidir. |
| P3 | **Güncel Reçete + Tahmini Üretim Gideri** | Onaylı reçete × güncel/hakiki birim malzeme fiyatı + standart doğrudan işçilik/dış işlem + bütçelenmiş normal kapasiteye dayalı genel gider payı. | Yeni ürün, maliyet geçmişi olmayan firma veya sık değişen ürün reçetelerinde. |
| P4 | **Son N Ay Ağırlıklı Ortalama** | Önceki kapanmış 3 veya 6 ayın ürün başına güvenilir üretim maliyetleri, **gerçekte üretilen/kabul edilen tutarlı üretim miktarlarıyla ağırlıklandırılır**. Seçilirse malzeme artış endeksi ayrı ve çift sayılmadan uygulanabilir. | Tek aydaki anormal dalgalanmayı azaltır; eksik dönemi ve istisnai gideri açıkça işaretler. |
| P5 | **Bütçelenmiş / Standart Maliyet** | Firma tarafından yetkili olarak onaylanmış standart BOM, işçilik tarifesi, makine/hat kapasitesi ve bütçe giderlerinin versiyonlu hesabı. | Planlama ve yeni kurulmuş şirketler için; sonradan gerçekleşen sapmalar fiili maliyetle karşılaştırılır. |
| P6 | **Yetkili Manuel Koruyucu Taban** | Veri olmayan veya özel ürünlerde gerekçeli ve süreli fiyatlandırma referansı girilir; kaynak, yetkili ve son değerlendirme tarihi zorunludur. | 'Gerçekleşmiş maliyet' olarak gösterilemez. Oluşan ilk gerçek maliyetle kıyaslanır ve ilgili yönetici uyarılır. |

- Şirket politikası profil bazlı seçilir; yetkili kullanıcının **ürün grubu veya tek üründe** yöntem istisnası tanımlaması mümkündür; hangi yetkiyle hangi kapsamda olduğu RBAC'la sınırlanır. Varsayılan ilk yöntem seçimi kurulumda yapılır, tüm müşterilere 'P1 zorunlu' diye dayatılmaz.
- **Önemli uyarı:** P1, P2, P4 ve P6 muhasebe değerleme yöntemleri değil, yalnız ticari teklif ve yönetim kararında kullanılan referans hesaplarıdır.
- Üretim/teslim tarihi, ürün reçete sürümü, para birimi, satın alma fiyatı kaynağı ve alüminyum kg karşılaştırma tarihleri kayıtta olmalı; kullanıcı değişmiş ürün reçetesini eski ürünle karşılaştırırken sistem uyumsuzluğu göstermeli.
- Eski ay henüz kapanmadıysa seçilen kural sahte 'önceki ay kesin' değeri üretmez; en son güvenilir kapanmış dönem ve arada kaç ay bulunduğu açıkça gösterilir; gerekirse P3/P5/P6 ile onaylı geçici referans oluşturulur.

### P1 koruyucu yöntemin ayrıntıları ve örneği

- Birim ürünün baz maliyet bileşenlerini ayrıştır: **alüminyum** (fiyatı/qty/birim kaynağı), diğer hammaddeler, işçilik, SGK, üretim genel gideri, dış işlem, fire/hurda değer etkisi.
- Sadece ilgili ürünün alüminyum net girdi miktarı / maliyet payı fiyat artışından etkilenir. **Bütün ürün maliyetine alüminyum zam oranını uygulamak hatalıdır.**
- Örnek: önceki ay 1 adet mamul için alüminyum 600 TL, diğer maliyet 400 TL → 1.000 TL. Alüminyumun karşılaştırılabilir fiyatı %10 yükselirse fiyatlandırma tabanında ilgili bileşen +60 TL ve örnek toplam 1.060 TL olur. %10 düşerse fiyatlandırma amaçlı alüminyum bileşeni otomatik azaltılmaz; fiili maliyetteki düşüş ise olduğu gibi muhasebeleştirilir.
- **Fiyat olayı değiştirilemez referansa göre yeniden hesaplanır.** Örn. başlangıç kg bedeli 100 TL; önce 110 TL sonra 115 TL olduysa artış 15 TL/kg'dır, üst üste +10 ve ardından tekrar +15 eklenmez. Olay-id, kaynak, tarih, fiyat para birimi ve baz sürümüyle idempotency sağlanır.
- **Ay devirlerinde düşüş koruması:** Önceki ay maliyeti her ay yenilenirken 'düşen alüminyum fiyatına bağlı ticari referans düşmesin' tercihini sessizce sıfırlama. Onaylı alüminyum referans bileşeni ve kullanılan baz fiyat versiyonunu ayrıca sakla. Bu koruma **yalnız alüminyum fiyat bileşenine** uygulanır; diğer maliyetlerin tutarı ayrıca yeni döneme göre değişebilir. İstenirse şirket ayrıca açıkça onaylanmış minimum toplam teklif tabanı seçebilir; varsayılan olarak böyle gizli taban uygulanmaz.
- Aynı ayda başka önemli zamlar (asgari ücret, işveren SGK, kira, enerji, fason) P1 ile gizlenmemeli: maliyet tahmini güncellemesi, önemli sapma uyarısı ve **yetkili manuel/kurallı güncelleme** gerektirsin. Sistem kilitli eski kârı garanti ediyormuş gibi sunmasın.
- Referans alüminyum fiyatı için şirketin seçtiği güvenilir kaynak (son onaylı satın alma, aktif tedarikçi teklifi veya elle onaylanan fiyat listesi) açık olmalı. Stokun gerçek maliyeti ile yeni tedarik fiyatı farklı olabilir; fiyatlandırma referansı bu farkı gösterebilir ama muhasebe stoğunu buna göre kendiliğinden yeniden değerlemez.

## 3. Genel üretim gideri dağıtımı (ticari referanstan ayrı politika)

Giderin sınıflandırması ve hangi ürün/hat/gider merkezine ait olduğu, **hangi paylaştırma anahtarından önce** belirlenir. Giderler muhasebe açısından doğru bölümde kalır. Şirket genel üretim gideri havuzu/hat bazında şu yöntemlerden birini veya tanımlı karmasını seçebilir:

| Kod | Genel gider dağıtım yöntemi | Önerildiği durum |
| --- | --- | --- |
| G1 | **Ürün/hat standart kapasitesi — eşdeğer hat günü** | **Kullanıcının Karar 34'te onayladığı öncelikli seçenek.** O ay üretilen ürün adedi / aynı hattaki ürünün geçerli günlük kapasitesi = hat yükü; gider havuzu yük oranında paylaştırılır. |
| G2 | **Gerçek makine/hat saati** | Güvenilir üretim makine süresi ölçümü olan firmalar. |
| G3 | **Standart makine/işçilik saati** | İş emri başına standart süre, operasyon rotası veya bilinen birim süre kullanılan firmalar. |
| G4 | **Gerçek doğrudan işçilik saati** | İşçilik yoğun, çalışma süreleri gerçekten takip edilen üretimler. |
| G5 | **Fiziksel dağıtım ölçüsü (alan, sayaç kWh, çalışan sayısı, m² vb.)** | Gider havuzlarının öncelikle tesis/bölüm/hat maliyet merkezlerine aktarılması; **yalnız ilgili gider için anlamlı anahtar** seçilir. |
| G6 | **Basitleştirilmiş ürün adedi/ağırlığı/parti katsayısı** | Basit homojen ürünlerde veya ilk kuruluma yönelik pratik yöntem; farklı kapasitedeki merdivenlerde **eşit adet yöntemi önerilmez** ve uyarı gösterilir. |

- **İki aşama:** (1) fabrika kira/enerji/temizlik vb. gider havuzunu uygun üretim hatlarına/maliyet merkezlerine ayır; (2) hat havuzunu o hatta ürünlerin harcadığı eşdeğer kapasite saat/günü veya firmanın G yöntemiyle ürünlere paylaştır.
- **G1 örneği:** SCC22 günlük kapasite 120 adet, ayda 120 adet → 1 hat günü; SCC66 günlük 40 adet, ayda 120 adet → 3 hat günü. Toplam 4 gün eşdeğer kullanım, **ilgili dağıtılabilir üretim gideri 80.000 TL varsayılırsa** SCC22 %25 = 20.000 TL (~166,67 TL/adet), SCC66 %75 = 60.000 TL (500 TL/adet). Bu yöntem bir ayın bütün gerçek kira maliyetini her durumda aynen dağıtma zorunluluğu **getirmez**.
- **Sabit ve değişken gider ayrımı/atıl kapasite:** Normal kapasiteye göre sabit genel gider oranını yönet; fiili üretim azsa yüklenemeyen sabit gideri ayrı "atıl kapasite/dönem sapması" raporla. Gerçek sayaç tüketimiyle ölçülen değişken enerji gibi giderleri anlamlı fiili kullanım anahtarıyla dağıt. Stok/muhasebe değerlemesinde geçerli mevzuat/standartlar esas alınır.
- Bir ürün birden fazla kaynak/hattan geçtiyse her kaynak için ilgili operasyon yükü ayrı tutulur; aynı maliyet havuzu ikinci kez yüklenmez. Aynı ay üretim kapasitesi revize edilirse hesaplarda sürüm ve etkin tarih vardır.
- Personel ücret, SGK, fazla mesai, servis/yemek gibi maliyetler ilgili **üretim doğrudan/endirekt** sınıflara ayrılır; ofis personeli, satış, bankacılık, vade farkı vb. üretim havuzuna otomatik yüklenmez. Yetkili yönetim için tam işletme kârlılığına ayrıca katılır.

## 4. Ay içinde maliyet projeksiyonu (teklif politikası P'den bağımsız)

| Kod | Ay içinde güncel beklenen maliyet yöntemi | Koruma |
| --- | --- | --- |
| T1 | **Önceki kapalı ay + bilinen zam/bütçe farkları** | Fatura girilmediği için kira/maaş sıfır sayılmaz. |
| T2 | **Ayın bütçe/tahakkuk planı + gerçekleşenler** | Sözleşme/bordro/servis/yemek/enerji gideri ay başında öngörü olarak ayrılır; gerçek geldikçe aynı giderin tahmini yerini alır. |
| T3 | **Son 3/6 ay ortalaması + sezon/üretim planı** | Düzensiz üretim ve giderlerde daha sakin öngörü; kaynak ve varyans şeffaf. |
| T4 | **Standart ürün maliyeti + dönemsel fiili sapma** | Çalışan sayısı, planlanan üretim ve standart kapasitesi bilinen işletmeler için. |

İşletme isterse **P1 + G1 + T2** seçebilir; isterse **P3 + G4 + T1**. Bunlar birbirini dışlayan *üç ana eksenin* alternatifleridir; her eksende sadece bir varsayılan ve açıkça yetkilendirilmiş istisnalar vardır. Ay sonunda yalnız mutabakat yapılmış gerçek finansal veri "kesinleşmiş" adını alır.

## 5. Üç işletme profiliyle kullanım deneyimi

- **Pratik:** Kurulum sihirbazında 3 soru: "Fiyatı belirlerken hangi referansı kullanıyorsunuz?", "Üretim giderini neye göre bölüyorsunuz?", "Ay içi gider tahminini neye göre yapalım?" Önerilen başlangıç: P1 veya P3 (bilgiye göre), G1 (ürün günlük kapasitesi biliniyorsa), T1/T2. Ürün grubunda tek ayar, isteğe bağlı toplu veri girişi, eksik veri uyarısı.
- **Kontrollü:** Gider merkezi, aylık gider bütçesi, toplu tahakkuk/Fiili, yöntem geçmişi, ürün/hat kapasitesi, yönetici onayı, tutarsızlık ve bekleyen fatura listesi.
- **Ayrıntılı:** Çoklu fabrika/hat/operasyon, gerçek ve standart saatler, normal kapasite, faaliyet tabanlı gider havuzu politikaları, dönemlik sapma, lot/parti/iş emri, güvenilir stok değerleme ve denetim raporları.
- Uygulama içi açıklamalar, kullanım profili seçimi ve maliyet raporuna erişim şirket/rol bazında olmalı; tüm firmalara 100 ayarlı uzun sayfayı mecbur tutma.

## 6. Yetkiler, güvenlik, değişiklik ve veri güvenirliği

- **Politika seçimi/değişimi:** Şirket içi yetkili Patron/Genel Müdür/Finans Müdürü tarafından, kendilerine ayrı ayrı verilen izinlere göre. Maliyet etkisi büyük değişiklikler için ikinci kişi onayı ve gerekçe istenebilir; işlemi başlatan kendi istisnasını onaylayamaz. Platform Admin yalnız şirket/modül erişimini yönetir, şirketin ücret ve maliyet verisini rolünden ötürü göremez.
- **Versiyonlama:** `tenant_id`, şirket, geçerlilik başlangıcı, oluşturucu/onaylayan, yöntem kodu P/G/T, kapsam (şirket/maliyet merkezi/ürün grubu/ürün), baz para birimi, birim, alüminyum fiyat kaynağı ve metodu, zam koruması, kapasite/atıl zaman kuralları, manuel düzenleme gerekçesi.
- **Satış anı snapshot:** Geçmiş fiyat teklifi/sipariş hangi tarihte, hangi politika sürümü, hangi ürün reçete, hangi alüminyum fiyat kaynağı, hangi önerilen maliyet/marj ve hangi satış fiyatıyla oluştuysa *aynen saklanır*. Referansın değişmesi eski kabul edilmiş siparişi veya faturayı sessizce değiştirmez.
- **Dönem kapanışı:** Eksik fatura, bordro, hizmet ve hammadde değerleme/kur kontrolleri, onay listesi; kapanmış dönemde düzeltme ancak ayrı yetki/audit ile. Eksik maliyet bileşenleri `bilinmiyor`/ `tahmini` kalır, sıfır varsayılmaz.
- **Güvenilir veri:** Kaynağı doğrulanmamış kilo fiyatı, sahte reçete, eksik işçilik veya bilinmeyen kapasite ile "kesin gerçek maliyet" üretilmez. Sırf koruyucu taban fiyatlandırma için yüksek diye muhasebe kârı düşmüş gibi gösterilmez.
- **Para birimi/kurs/tarih:** Alüminyum kg fiyatı TL/USD/EUR ve ilgili gün kuruyla dönüştürülür; net malzeme ağırlığı, kesim firesi, hurda ve reçete versiyonu karşılaştırılır. Döviz cinsi fiyatları elma-armut kıyasına sokma.
- **Finans + Operasyon + İK:** İş emri/fiili tüketim/kapasite Operasyon'dan; bordro/maaş/SGK yalnız yetkiyle toplulaştırılmış olarak İK'dan; kira/enerji/tedarikçi fatura/tahakkuk/vade farkları Finans'tan. Sistemde dört ayrı uygulama ve ortak güvenli veri katmanı kararı korunur. Hem en uçta hem DB'de tenant izolasyonu uygulanır.
- **Hesap denetimi:** Her hesap `cost_calculation_run` benzeri benzersiz kimlik, kaynak veriler, tarihli yöntem sürümü ve tarife bileşenleriyle tekrar üretilebilir. Yetki, SQL/API ve rapor sızıntısı için testler zorunlu.

## 7. Codex uygulama sırası ve testler

1. **İlk etap:** Var olan 0.13.0 üretim planı `dailyCapacity` ve kaynaklarını bozmadan maliyet politika **konfigürasyon/sürüm/veri sözleşmeleri** ile açıklamalı P/G/T kurulum arayüzü tasarla; başlangıçta yalnız development branch ve test verisi. Aşama 1'in dört gerçek ayrı uygulama önceliğini gölgelememeli.
2. **Ardından:** Gerçek maliyet ve referans ayrımı; önceki ay kapandı kontrolü; P1 yükseliş ve düşüş koruması; P2 ve P3; G1 kapasite yükü ve atıl kapasite; T1/T2 gider tamlığı/çift saymama; şirket seçimi ve geçmiş sürüm. Birden fazla şirket tenant testi.
3. **Sonraki faz:** P4/P5/P6, G2–G6, T3/T4; gelişmiş çoklu hat, karma gider havuzu, maaş/SGK toplulaştırma, fiyat endeksi ve otomatik yetki/uyarı.
4. **Kabul testleri:** Alüminyum +%10 → yalnız alüminyum payı artar; -%10 → P1'in referansı otomatik düşmez, fiili maliyet düşebilir. Aynı zam iki kere yansımaz. Ay değişince koruma tabanı kaybolmaz. Kira 15 gün geç girilse ay başı tahmini maliyet eksik kalmaz, daha sonra gider iki kez sayılmaz. Üretim kapasitesine göre farklı SCC ürünleri doğru G1 oranı alır; atıl kapasiteyi yanlış yükleme engellenir. Ürün yeni/ay kapanmamışsa sahte kesin maliyet yok. Politikalar arası geçiş eski teklif maliyetlerini değiştirmez. Üretim maaşı/SGK detayı yetkisiz kişiye gösterilmez. Bir tenant diğer tenant verisini göremez. Bitmiş ürün depo kabulü olmadan sevk edilemez.
5. **Canlı veri güvenliği:** SQL migrasyonu/devreye alma yalnız kullanıcı açık onayı, yedek ve rollback planından sonra. Mevcut `database/002_record_storage.sql` **TEKRAR ÇALIŞTIRILMAYACAK**. `pnpm test`, `pnpm check`, `pnpm build` yeşil olmalı.

## 8. Henüz açıklığa kavuşturulacak ayarlar

- SÖZBİR şirketinin ilk açılış profili önerisi: **P1 (Önceki Ay + yalnız alüminyum yukarı yönlü güncelleme), G1 (ürün kapasitesi), T2 (bütçe+tahakkuk)**. Kullanıcının P1/G1 görüşleri mevcut; T2 varsayılanı henüz ayrıca onaylanmadı.
- **Karar 36 ile netleşti:** Üç kg fiyatı kaynağı da firma bazında seçilebilir ve kayıt geçmişiyle desteklenir. Güncellemenin otomatik bildirim mi yoksa yönetici onayıyla mı etkin olacağı ve kaynak öncelik/fallback ayarları sonraki görüşmede kesinleştirilecek.
- Şirket/ürün/grup seviyesinde fiyatlandırma referansının manuel düşürülmesi için hangi yönetici onayı gerektiği.
- Normal kapasite ve atıl saat dağıtımı, muhasebe ve finansal raporlama standardı danışman onayı.

## 9. Karar 36 — Üç alternatif alüminyum kilogram fiyat kaynağı (2026-10-22, ONAYLANDI)

**Kullanıcı onayı:** Her şirket, satış referans maliyetinde kullanılacak alüminyumun **kg birim fiyatı için üç farklı kaynağı** destekleyen sistemi kullanabilecek. Bu üç kaynak firmanın tercihine göre yapılandırılacak; bütün şirketlere tek bir fiyat kaynağı zorlanmayacak. Karar 35'in P1/P2/P3 gibi satış fiyatlandırma yaklaşımlarına veri sağlayan bu seçim, **gerçek muhasebe stok değerleme fiyatını değiştirmez**.

| Kaynak kodu | Şirketin seçebileceği yöntem | Doğrulama ve kısıt |
| --- | --- | --- |
| A1 | **Son geçerli alış faturası** | Finans'ta kaydedilmiş ve yetkili doğrulaması yapılmış gerçek tedarik alış belgesinden aynı profil/alaşım/kalite ve karşılaştırılabilir birimde **net kg alış bedeli** türetilir. İade, iskonto, fatura düzeltmesi, ölçü birimi, para birimi, belge tarihi, satıcı ve (uygunsa) ek gider etkileri izlenir. Satın alma tarihi eskiyse görünür uyarı verilir. |
| A2 | **Tedarikçinin güncel fiyat listesi / teklifi** | Belirli tedarikçi, ürün/malzeme grubu ve geçerlilik tarihine bağlı kg fiyatı Finans/Satınalma tarafından girilir veya daha sonra entegrasyonla alınabilir. İskonto/vade/teslim biçimi, KDV hariç/dahil bilgisi, para birimi ve teklifin bitiş tarihi korunur. Süresi bitmiş teklif otomatik kesin fiyat sayılmaz. |
| A3 | **Yetkili yöneticinin onayladığı referans kg fiyatı** | Sorumlu yönetici fiyatı, kaynak/açıklama, geçerlilik başlangıç tarihi, yetki, onay geçmişi ve gerekirse geçerlilik bitişiyle belirler. Keyfî değişiklik geçmiş tekliflerin maliyet fotoğrafını değiştirmez; büyük sapma ve olağandışı düşük değerler yetki/uyarıya tabi olabilir. |

### Fiyat kaynağının sistem davranışı

- Her firma A1, A2 veya A3 kaynağını **aktif öncelikli kaynak** olarak seçer; ürün/alaşım/tedarikçi grubu için yetkili istisna tanımlayabilir. Öncelik ve yedek kaynaklar ileride firma ayarından tanımlanabilir, fakat kullanıcının istemediği otomatik **sessiz kaynak geçişi** yapılmaz; kaynak geçersizse yöneticiye görünür uyarı gösterilir ve yetkilendirilmiş alternatif politika işletilir.
- **Fiyat karşılaştırılabilirliği:** Net kg birim fiyatının tanımı belgeli olmalıdır: KDV hariç/hariç olmayan fiyat dönüşümü, kg/ton/metre/ürün başı ölçüler, alaşım, profil tipi, sipariş miktarı, nakliye, tedarikçi iskontosu, vadeli/peşin ödeme koşulları, fiyatın para birimi ve geçerli döviz kuru. Uygun kg ağırlık dönüşümü bilinmiyorsa hesap kesin fiyat iddiasında bulunmaz.
- **Artış hesaplayıcısı P1:** Yalnız ürünün alüminyum maliyet bileşeninde, **karşılaştırılabilir onaylı mevcut kg fiyatı ile onaylı baz kg fiyatı arasındaki artış** yansıtılır. Aynı fiyat değişikliği tekrarlanınca ikinci kez zam hesaplanamaz; fiyat düştüğünde P1'in koruyucu bileşeni kendiliğinden düşmez. P2 gibi iki yönlü yöntemler farklı davranır.
- **Fiyat güncelleme kayıtları:** Kaynak tipi, referans belge/teklif id, ürün/malzeme kapsamı, eski-yeni fiyat, fiyatın alındığı tarih, sistemde kaydedildiği zaman, kim tarafından ve hangi yetkiyle onaylandığı, yürürlük tarihi ve eski tekliflerdeki kaynak snapshot'ı denetlenebilir. Aynı dönemde veri bulunmazsa sistem sıfır fiyat ve sahte kesin maliyet üretmez.
- **Gerçek alış fiyatı vs satış referansı:** Stokta farklı tarihlerden alımlar varsa A1'in seçilmesi tek başına tüm mevcut stokun fiili değerini değiştirmez. Kullanılabilir stokun finansal maliyeti, muhasebe politikasına göre ayrı hesaplanır; bu seçim sadece satış maliyet referansına güvenilir pazar fiyatı girdisi sağlar.
- **Kullanım kolaylığı:** Pratik profilde 'Alüminyum kg fiyatını nereden alalım?' sorusuna üç anlaşılır seçenek; Kontrollü/Ayrıntılı profilde tedarikçi karşılaştırmaları, teklif geçmişi, uyarı eşiği, grup ve para birimi ayarları. Hiçbir firmada zorunlu elle üç fiyat birden girme yükü yok.
- **Testler:** A1 son geçerli fatura seçimi, iade/düzeltme; A2 süresi dolmuş teklifin engellenmesi; A3 yetkisiz manuel düzenleme ret; A1→A2→A3 şirket seçimi; kg/ton ve para birimi dönüşümü; aynı artışın ikinci kez yansımaması; P1 aşağı koruma ve P2 iki yönlü hareket; tenant veri izolasyonu; gizli maliyetin üretim personeline sızmaması; önceki satış snapshot'larının değişmemesi.

**Karar 37 ile çözüldü:** Firma bazında otomatik ve yetkili müdür onaylı fiyat güncellemesi seçenekleri desteklenecek; anormal değişim, doğrulama ve güvenlik eşikleri ayrıca yapılandırılabilecek. Detaylar Karar 37'de.

## 10. Karar 37 — Firma bazlı otomatik veya yönetici onaylı fiyat güncellemesi (2026-10-22, C ONAYLANDI)

**Kullanıcı C seçeneğini kesin onayladı.** Her şirket, A1 (son geçerli alış faturası), A2 (güncel tedarikçi fiyat listesi/teklifi) veya A3 (yetkili yönetici referansı) kaynağından hesaplanan fiyat değişikliklerinin **satışa esas referans maliyete ne zaman yansıyacağını** kendi politikasıyla seçer. Bir şirketin seçimi diğer şirketleri etkilemez.

### Seçilebilir yürürlüğe alma modları

- **U1 — Otomatik:** Yalnız **kaynağı geçerli, doğru birimi ve para birimiyle normalize edilmiş, yetki/uygunluk kontrollerini geçmiş** birim fiyat hareketleri şirketin etkin maliyet politikasına göre yeni fiyatlandırma referansına otomatik yansıtılır. P1 ise alüminyumun yalnız yukarı yönlü değişimi fiyatlandırma tabanını artırır, aşağı yönlü değişim tabanı otomatik azaltmaz; P2 gibi iki yönlü ticari politikalarda azalma da olabilir. Fiyat kaydı muhasebe stok maliyetini, önceden onaylanmış sipariş fiyatını veya faturayı değiştirmez.
- **U2 — Yönetici onayıyla:** Sistem güncellenen fiyatı ve eski-yeni karşılaştırmasını **bekleyen maliyet referansı değişikliği** olarak sunar; gerekli yetkiye sahip Finans Müdürü / tanımlı Satış Müdürü veya Genel Müdür (şirket RBAC sınırları) inceleyip onaylamadan yeni teklif referansına yansımaz. Bekleme süresince yeni teklifleri eski maliyete göre düşük fiyatlama riskine karşı **"yeni maliyet güncellemesi onay bekliyor"** uyarısı ve yapılandırılabilir geçici fiyat teklifi kısıtlaması gösterilir.
- Şirket her an yetkili onayla U1/U2 arasında geçebilir; **geçerlilik tarihi, hesap yöntemi, onaylayıcı ve geçmiş** saklanır. Sonradan geçiş geçmiş onaylı teklif/siparişleri yeniden fiyatlandırmaz.

### Büyük fiyat değişimi / veri doğrulama güvenlik zinciri

- Şirket/ürün grubu/malzeme bazında **değişim yüzdesi ve/veya mutlak TL/kg eşiği** ayarlanabilir. Eşik, birim/kur/ürün doğru karşılaştırılmadan ölçülmez. **Somut yüzde/TL limiti kullanıcı tarafından henüz verilmedi; keyfî sabit limit kodlama.**
- U1 modunda dahi eşik aşan veya olağandışı fiyat, yetkisiz kaynak/şüpheli fatura düzeltmesi, süresi dolmuş tedarikçi teklifi, geçersiz para birimi/ölçü dönüşümü otomatik yürürlüğe **sessizce alınmaz**. Politikaya göre onay bekler/uyarı verir; sistem kullanıcı onayı olmadan yeni fiyata zorunlu devam etmez.
- U2 modunda yetkili yönetici değişiklik ve gerekçeyi onaylar veya reddeder. Talep sahibi kendi ayrı yetkili onayı gerektiren istisnasını onaylayamaz. Yetkili müdürün şirketten şirkete hangi rol olduğu ayrıca atanabilir.
- Bildirim ve denetim: Eski/yeni kg bedeli, kaynak (A1/A2/A3), ilgili belge/satıcı, onay durumu, zam/yüzde etkisi, etkilenen ürün/gruplar, hesap değişiklikleri, tarih, hesaplayan ve yetkili bilgisi; şirket gizlilik sınırları korunur.
- Fiyat artışı hesaplama ve yayın **idempotent** olmalı; aynı kaynak olayı yeni sync'te tekrar gelince fiyat artışı ikinci defa eklenmez. Eşzamanlı iki onay/iki fiyat akışında yalnız doğru etkin sürüm geçerli olur.
- Değişiklik onayından önce mevcut onaylı referans maliyet yürürlükte kalır; görünür 'güncelliği riskli' uyarısı ve gerekirse yetkili yönetim kuralıyla yeni teklif hazırlama kısıtı uygulanır. Onaylanmış eski müşteri siparişinin birim fiyatı, iskonto, faturası, cari bakiyesi kendi kendine değiştirilmez.
- **Test senaryoları:** U1 geçerli +%10 kg değişimini doğru tek sefer yansıtır; U2 hiçbir fiyatı onaysız değiştirmez; U1 anormal büyük değişimi eşik kuralına göre onaya alır; U1 P1 aşağı yönlü değişimde tabanı düşürmez, U1 P2'de iki yönlü olabilir; onay bekleyen fiyat eski/satış ref karşılaştırmasında belirtilir; P1 önceki ay devrinde bir fiyat zammını iki kez yansıtmaz; eski teklif/sipariş fiyatları kalır; kullanıcı ve tenant erişimi ayrıdır.
- **Geliştirme fazları:** Önce şirket politikası U1/U2 veri modeli/rol izinleri, taslak-onay-yayın durumları ve testler; otomatik bildirim/kural motoru sonra aşamalı uygulanabilir. İlk aşamada production fiyat güncellemesi yapılmaz.

**Karar 38A ile cevaplandı:** Liste fiyatları, maliyet veya kg fiyatı değişiminde **otomatik asla güncellenmez**. Yalnız yetkili yönetici açık işlemiyle güncellenebilir. Müşteri nakit/vadeli iskontosunun yönetici onaylı toplu revizyonu ayrı bir iş akışı olarak önerildi; matematiksel politika henüz kullanıcı onayı bekliyor.

## 11. Karar 38A — Sabit liste fiyatı, nakit/vadeli müşteri iskontosu ve önerilen toplu revizyon (2026-10-22)

**Kesinleşen iş kuralı:** Ürün liste fiyatları **yetkili yönetici değiştirmedikçe sabit**; alüminyum fiyatı veya güncel satış referans maliyetindeki hiçbir otomatik/manual güncelleme bunları kendiliğinden değiştirmeyecek. Fiyat listesi yönetici tarafından açıkça yeni sürüm olarak yayınlanır. Sözleşme ve geçmiş teklif/sipariş/faturaların fiyatı korunur.

**Kullanıcının ilave önerisi (onay bekliyor):** Her müşteriye farklı tanımlanan **nakit ve vadeli iskonto** oranlarının, maliyet yükselince yetkili yöneticinin onayıyla topluca revize edilmesi. Sözleşmeler, ürün grupları ve ilgili net fiyat/katkı marjı dikkate alınır. Müşteriler arası ticari farklılıklar kaybolmamalıdır.

### Önerilen hesaplama — tüm net satış fiyatlarını ürün artış oranıyla güncelle

- Sabit liste fiyatı `L>0`, müşteri ödeme çeşidine (nakit veya vadeli) göre eski iskonto `d` (örneğin %20=0,20), aynı ürünün **fiyatlandırmaya esas referans maliyet artış oranı** `r≥0` olsun.
- Eski net: `N0 = L * (1-d)`. Hedef yeni net: `N1 = N0 * (1+r)`. Hedef yeni iskonto: `d1 = 1 - N1/L`. Yüzde puan azaltmasıyla karıştırma: her müşteri için d1 farklı çıkar. **Bu formül müşteriler arası net fiyat oranını korur**, ama her müşteri için nominal marjın aynı kalacağı garantisi vermez; net fiyat ve maliyet aynı yüzdede yükselirse brüt marj yüzdesi sabit kalabilir.
- Örnek `L=1000`: A nakit indirimi %20 → eski net 800, r=%10 → yeni net 880, yeni d=%12; B vadeli veya başka müşteri indirimi %10 → eski net 900, r=%10 → yeni net 990, yeni d=%1. Örnek rakamlar gerçek müşteri fiyatları değildir.
- **Alternatif 'aynı miktarda iskonto puanı düşürme' veya 'iskonto yüzdesini aynı oranda azaltma' aynı sonucu vermez.** Net fiyat artış yüzdeleri müşteriden müşteriye değişir. Kullanıcıdan hangi ticari amacın istendiği teyit edilmelidir.
- r, birim ürünün **önceki ve güncel onaylı fiyatlandırmaya esas referans maliyeti** arasındaki değişimden hesaplanır. Alüminyum kg %10 yükselince bütün merdivenler %10 maliyetli hale gelmez; her mamulün net alüminyum maliyet payı, kapasitesi ve diğer girdileri farklıdır. Farklı ürünleri, ayrıca şirket onayı olmadan tek r ile indiscriminately değiştirme.
- Nakit/vadeli için ayrı oran ve geçerlilik tarihleri; vadeli satışta vade uzunluğu, tahsilat finansmanı, müşteri kredi/risk limiti ve varsa ayrı vade farkı doğru gösterilir. Nakit/vadeli örnekleri bir müşterinin kendi iki oranı için de uygulanabilir.
- **Sert sınır:** `N1>L` ise `d1<0`; negatif iskonto yaratma ve sabit liste fiyatına gizli zam ekleme. 'Liste fiyatı sınırı aşıldı' durumunu ürün+müşteri+ödeme biçimi bazında önizlemede belirt; yönetici liste fiyatını ayrıca değiştirebilir ya da kapsamı ve fiyat artış hedefini gerekçeli biçimde günceller. Önizlemede otomatik %0'a kırpmak gerçek planlanan fiyat artışını saptırır; açık fark raporu ister.
- **Diğer ticari korumalar:** Mevcut özel fiyat anlaşmaları, yürürlükteki fiyat taahhüdü, promosyon, önceki dönem siparişleri ve onaylı teklifler değişmeden kalır; yalnız etkin tarihten itibaren yeni tekliflerde yeni müşteri iskontosu geçerli olur. Liste fiyatında özel KDV/ürün kampanyası uygulama sırası vergi kurallarıyla uyumlu netleştirilir.
- **Güvenilirlik ve onay:** Toplu iskonto önerisi *otomatik yayınlanmaz*; yetkili yönetici önizlemede etkilenen müşteri/ürün/ödeme türleri, eski-yeni iskonto, eski-yeni net fiyat, artış oranı, brüt katkı marjı, sözleşme istisnaları, negatif iskonto/liste tavanı ve kaynak maliyet sürümünü görüp açıkça onaylar. Kritik değişim/tanımlı risk eşiği varsa ikinci gerçek kişi onayı RBAC kurallarına göre uygulanır. Onay öncesi hesap/simülasyon **taslaktır**.
- **Toplu değişimde atomiklik:** Kısmi onay varsa açık kapsam versiyonları oluştur; bir kayda uygulayıp diğerlerine sessizce uygulayamamak gibi yarım durumları önle, ödeme tipi ve müşteri istisnalarının nedenlerini logla. Eski fiyat ve iskonto kaydı yeni sürümle değişir, silinmez. Eşzamanlı teklif/iskonto güncellemesinde yarış koşulu ve idempotency güvenliği sağlar.
- **Katman ayrımı:** P fiyatlandırma referansı, A fiyat kaynağı, U referans yayın politikası, satış liste fiyatı ve müşteri/ödeme tipi iskonto yayın politikası ayrı yapılandırmalardır. U1 otomatik maliyet referansı güncellemesi, **müşteri iskonto veya liste fiyatı için otomatik güncelleme izni değildir**.
- **Testler:** L=1000, %20→%12, %10→%1 hesapları; alüminyum zammı ≠ toplam maliyet zammı; nakit/vadeli ayrı; N1>L durumunda engel; negatif iskonto yok; onaysız toplu iskonto yok; sözleşmeli istisna yok; geçmiş sipariş/fatura sabit; iki yönlü P2 ve koruyucu P1 farkları; onay sürümleri, RBAC, tenant izolasyonu ve canlı iş akışları korunur.

**Kullanıcıdan beklenen kısa karar:** "İskonto yüzdelerini aynı oran azaltmak" yerine **müşteri net satış fiyatlarını ürün maliyet artış yüzdesi kadar aynı oranda artırmak** mı esas yöntem olacak? Henüz bu matematiksel revizyon onaylı değil.
