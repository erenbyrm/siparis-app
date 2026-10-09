# Mobil Sipariş — kurulum ve size kalan işler

7 Ekim 2026 · Sürüm 0.2.0

Kod ve yerel deneme hazır. Ortak kullanım için Supabase hesabını sizin adınıza açmadık; yeni hesabınızın ve gizli bağlantı değerlerinin sizin kontrolünüzde olması gerekiyor. Parola veya gizli anahtarları sohbete göndermeyin.

## 1. Eski verileri koruyun

Kaynak kod ZIP'i işletmenin sipariş kayıtlarını içermez. Eski uygulama verileri kullanılan cihaz ve tarayıcıda tutulur.

1. Eski uygulamayı **normalde sipariş girdiğiniz tarayıcıda**, mevcut adresinde açın.
2. Tarayıcı verilerini temizlemeyin. Farklı adrese geçince eski kayıtlar kendiliğinden taşınmaz.
3. Yeni sürüm aynı adrese alındığında **Yedekleme → Bu tarayıcıdaki eski sürüm kayıtlarını kontrol et** ile kayıtları görebilirsiniz. Önce **Önizlemenin yedeğini indir** ile dosya alın.
4. Yayından önce dışarı aktarmak için teknik destek alan kişi `scripts/export-legacy.js` dosyasının içeriğini eski uygulamanın geliştirici konsolunda çalıştırabilir. İndirilen `siparis-eski-veri-yedegi.json` yeni sürümün yedek ekranında açılır. Betik yalnızca ürün, müşteri ve siparişleri okur; kullanıcı/parola listesini okumaz, sunucuya veri göndermez.
5. Farklı cihazlarda farklı kayıtlar varsa **her cihazdan ayrı yedek alın**. Farklı yedekler otomatik birleştirilmez; mükerrer siparişler kontrol edilmelidir.

Aktarım geçersiz/kesirli miktar veya sevkiyat geçmişi uyuşmazlığında durur. Gerçek kayıtları düzeltmeden önce özgün dosyayı saklayın. Önceki incelemedeki yarım adetlik deneme siparişini gerçek işletme verisi sanmayın.

## 2. Supabase hesabı ve proje oluşturun

1. [Supabase panelini](https://supabase.com/dashboard) açın, kendi e-postanızla hesap oluşturun.
2. Yeni proje adı olarak `mobil-siparis` kullanabilirsiniz. Bölge seçerken Vercel sunucusuna yakın bir bölge seçin.
3. Veritabanı parolasını siz belirleyin ve parola yöneticinizde saklayın. Ücret/plan seçimini ihtiyacınıza göre siz yapın; bu çalışma kapsamında ücretli abonelik başlatılmadı.
4. Proje hazır olunca **SQL Editor → New query** açın. `database/001_workspace.sql` içeriğini yapıştırıp çalıştırın. Dosya uygulamaya özel şema ve iki tabloyu oluşturur; mevcut tabloları silmez.
5. Bu şemayı API'nin **Exposed schemas** listesine eklemeyin. Uygulama sunucusu veritabanına doğrudan bağlanır.

## 3. Giriş e-postalarını ayarlayın

Supabase **Authentication** ayarlarında e-posta/parola girişini ve e-posta doğrulamasını etkin tutun. Yeni parolalar için en az 12 karakter şartını Supabase tarafında da ayarlayın.

- **URL Configuration → Site URL:** canlı uygulamanızın adresi.
- **Redirect URLs:** canlı adresi ve `/?reset=1` yolunu, test edeceğiniz sabit önizleme adresi ve onun `/?reset=1` yolunu ekleyin. Önizleme oluşunca gerçek adresi kullanın.
- Personelin doğrulama ve parola sıfırlama e-postalarını alması için **Custom SMTP** kurun. Mevcut kurumsal e-posta sağlayıcınız destekliyorsa onun SMTP bilgilerini kullanın. Supabase varsayılan göndericisinde proje ekibi dışındaki alıcılara gönderim kısıtlıdır. [Resmî SMTP açıklaması](https://supabase.com/docs/guides/auth/auth-smtp).
- SMTP bilgilerini yalnızca Supabase paneline girin. Bağlantıların bozulmaması için e-posta sağlayıcısındaki bağlantı izlemeyi kapatın.

## 4. Vercel'de dört bağlantı ayarını girin

Mevcut proje: **siparis-app-cf14**. **Settings → Environment Variables** bölümüne aşağıdakileri ekleyin. Önce test ortamında ayrı Supabase projesi kullanılması önerilir; canlı veritabanını test dallarına bağlamayın.

| Ayar | Nereden bulunur? | Kullanım |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Project Settings/API veya Connect: Project URL | Tarayıcı ve sunucu; açık değer |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (eski projelerde anon key) | Tarayıcı ve sunucu; **secret/service_role kullanmayın** |
| `DATABASE_URL` | Supabase Connect → Transaction pooler → URI, port 6543 | **Yalnızca sunucu; gizli** |
| `BOOTSTRAP_ADMIN_EMAIL` | İlk yöneticinin doğrulayacağı sizin e-postanız | Yalnızca sunucu |

`DATABASE_URL` içindeki parola yer tutucusunu siz doldurun. Özel karakterler URI için kodlanmalıdır. SSL kullanın (`sslmode=require`); bağlantı dizesini loglara veya GitHub'a yazmayın. [Supabase bağlantı rehberi](https://supabase.com/docs/guides/database/connecting-to-postgres).

Vercel ayarları: Framework **Vite**, kök repo kökü, çıktı **dist**, build `pnpm run build`, Node.js **24.x**. Gerekirse Install Command `pnpm install --frozen-lockfile` olarak ayarlanır.

Değerler eski yayına kendiliğinden işlenmez; **Redeploy** gerekir. Önce yeni kod dalının **Preview** dağıtımını açın. Production değerlerini ayrıca yapılandırın.

## 5. İlk yönetici ve personel

1. Yapılandırılmış önizlemede **Yeni hesap** açın; e-posta tam olarak `BOOTSTRAP_ADMIN_EMAIL` olsun. Parolayı siz girin.
2. E-postayı doğrulayın ve giriş yapın. Boş sistemde bu hesap ilk yönetici olur.
3. **Kullanıcılar** ekranında personelin adını, gerçek e-postasını ve görevini ekleyin. Bu işlem otomatik e-posta göndermez.
4. Personel kendi e-postasıyla hesap açıp doğrular. Kullanıcı listesindeki e-posta eşleşince yetkisi etkin olur.
5. Rolü Supabase kullanıcı metadata'sından değiştirmeyin; yetki kaynağı yönetici ekranıdır.
6. İlk yönetici oluşturulduktan sonra `BOOTSTRAP_ADMIN_EMAIL` kaldırılabilir. Yeni yönetici için mevcut yönetici ekranını kullanın; kurum içinde hesap kurtarma sorumlusu belirleyin.

## 6. Gerçek verileri yükleyin

Merkez boş başlar. Eski yedeği aktaracaksanız önce deneme ürünü veya müşteri oluşturmayın; aktarım yalnızca boş iş verisine izin verir.

**Yedekleme → Yedek dosyası** ile eski veya v2 JSON dosyasını seçin. Sayıları ve uyarıları kontrol edin. Siparişlerin bağlanacağı kişiyi seçip onay kutusunu işaretleyin, ardından aktarın. Kullanıcı parolaları/yetkileri taşınmaz. Yeni işlem geçmişi aktarım işlemiyle başlar; özgün dosyayı geçmişin arşivi olarak saklayın.

Sadece ürün için **Ürünler → Toplu aktarım** bölümüne beş sütun yapıştırın: sıra, stok kodu, ad, fiyat, KDV. Noktalı virgüllü CSV veya Excel'den sekmeli metin kabul edilir. Aynı stok kodu mevcut ürünü günceller; önizlemeyi kontrol edin.

## 7. Canlıya geçişten önce kabul testi

İki ayrı tarayıcı/cihaz ve farklı kullanıcılarla, gerçek müşteri kullanmadan:

1. Satış iki adetlik teklif oluşturur; başka satış hesabı görmemeli.
2. Müşteri onayı verilir; yönetici onayını yalnızca yönetici verebilmeli.
3. Üretim iki adedi hazırlar; fiyat ve yönetici menülerini görmemeli.
4. Sevkiyat bir adet gönderir: **Sevkiyata Hazır**, hazır **1**.
5. İkinci adet gönderilir: **Tamamlandı**, hazır **0**.
6. Diğer cihazda normal 15 saniyelik yenilemede değişiklik görünmeli; eşzamanlı eski sürümle işlem reddedilmeli.
7. Yanlış/pasif/yetkisiz hesap, çıkış, parola sıfırlama ve internet kopması sonrası aynı işlemin yeniden denenmesi kontrol edilmeli.
8. Sipariş çıktısı ve JSON yedeği indirilip sayılar karşılaştırılmalı.
9. Supabase veritabanı yedekleme politikasını planınıza göre ayarlayın; ayrı test projesinde geri yüklemeyi deneyin.

Testler geçince yeni dalı `main` ile birleştirin ve Production dağıtımını doğrulayın. Eski kaynak ZIP'ini saklayın. Yeni sistemde veri oluştuysa yalnızca eski arayüze dönmek veri geri yükleme değildir; önce merkezi veriyi yedekleyin.

## Sorun giderme

| Belirti | Kontrol |
|---|---|
| Yalnızca deneme düğmesi var | İki `VITE_SUPABASE_*` build değeri eksik; düzeltip yeniden dağıtın. |
| Merkezi kurulum tamamlanmamış | Sunucuda `DATABASE_URL` veya Supabase değerleri eksik. |
| E-posta gelmiyor | SMTP, doğrulama, spam klasörü ve gönderim limitleri. |
| Erişim tanımlı değil | İlk yönetici e-postası veya Kullanıcılar ekranındaki aktif hesap. |
| Veritabanı hatası | SQL çalıştı mı; pooler adresi, parola, SSL ve proje açık mı? |
| Başka kullanıcı güncelledi | Listeyi yenileyin, miktarı kontrol ederek tekrar deneyin. |
| Eski kayıt bulunamadı | Aynı cihaz, tarayıcı profili ve eski alan adı gerekli. |
| Yedek aktarılamıyor | Miktar/geçmiş tutarsızlığını özgün dosyayı koruyarak inceleyin. |

## Teknik destek için alternatif SQL kurulumu

SQL Editor yeterlidir. Alternatif olarak doğru test projesi hazırsa `.env.example` dosyasını `.env.local` olarak kopyalayın, değerleri doldurun ve `pnpm db:migrate` çalıştırın. `.env.local` Git'e dahil edilmez. Komut gerçek şemayı oluşturur; geliştirme sırasında kendiliğinden çalışmaz.
