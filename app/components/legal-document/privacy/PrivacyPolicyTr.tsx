/* eslint-disable react/no-unescaped-entities -- legal text with apostrophes, kept as supplied */
import styles from "../legal-document.module.scss";
import privacy from "./privacy.module.scss";

// Gizlilik Politikası, Turkish text as supplied. Do not reword without approval.
export default function PrivacyPolicyTr() {
  return (
    <div className={privacy.sections}>
      <p className={privacy.updated}>Son Güncelleme: 11 Kasım 2026</p>

      <section>
        <h2 className={styles.sectionHeading}>1. Giriş</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Press Magazine olarak ziyaretçilerimizin ve müşterilerimizin kişisel verilerinin gizliliğine ve güvenliğine önem veriyoruz.
          </p>
          <p className={styles.paragraph}>
            Bu Gizlilik Politikası, www.pressmagazine.com.tr üzerinden hangi kişisel verileri topladığımızı, bu verileri nasıl kullandığımızı, kimlerle paylaştığımızı ve nasıl koruduğumuzu açıklamaktadır.
          </p>
          <p className={styles.paragraph}>
            Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuata uygun olarak işlenir.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>2. Veri Sorumlusu</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>Kişisel verilerinizin işlenmesinden sorumlu şirketin bilgileri aşağıdadır:</p>
          <ul className={styles.details}>
            <li><span className={privacy.lead}>Ticari Unvan:</span> SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ</li>
            <li><span className={privacy.lead}>Adres:</span> Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş / İstanbul, Türkiye</li>
            <li><span className={privacy.lead}>Vergi Kimlik Numarası:</span> 7610578558</li>
            <li><span className={privacy.lead}>E-posta:</span> hello@septembercompany.com</li>
            <li><span className={privacy.lead}>İnternet Sitesi:</span> www.pressmagazine.com.tr</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>3. Hangi Bilgileri Topluyoruz?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Sitemizi ziyaret ettiğinizde, newsletter'a abone olduğunuzda veya alışveriş yaptığınızda bazı kişisel bilgilerinizi topluyoruz.
          </p>

          <h3 className={privacy.subHeading}>Newsletter Aboneliği</h3>
          <p className={styles.paragraph}>Newsletter aboneliği sırasında aşağıdaki bilgileri alıyoruz:</p>
          <ul className={styles.bullets}>
            <li>E-posta adresi</li>
            <li>Ad ve soyad (isteğe bağlı)</li>
            <li>Doğum yılı (isteğe bağlı)</li>
            <li>Ülke (isteğe bağlı)</li>
          </ul>
          <p className={styles.paragraph}>
            Bu bilgileri aboneliğinizi yönetmek ve iletişim izniniz kapsamında Press Magazine'in yeni sayıları, içerikleri ve duyuruları hakkında sizi bilgilendirmek için kullanıyoruz.
          </p>

          <h3 className={privacy.subHeading}>Alışveriş ve Siparişler</h3>
          <p className={styles.paragraph}>Sitemizden bir ürün satın aldığınızda aşağıdaki bilgiler işlenir:</p>
          <ul className={styles.bullets}>
            <li>Ad ve soyad</li>
            <li>E-posta adresi ve telefon numarası</li>
            <li>Teslimat ve fatura adresleri</li>
            <li>Satın aldığınız ürünler</li>
            <li>Sipariş ve ödeme işlem bilgileri</li>
          </ul>
          <p className={styles.paragraph}>
            Bu bilgiler, siparişinizin hazırlanması, ödemenin gerçekleştirilmesi, ürünlerin teslim edilmesi ve gerektiğinde sizinle iletişime geçilmesi için kullanılır.
          </p>
          <p className={styles.paragraph}>
            Ödemeler güvenli ödeme altyapıları üzerinden gerçekleştirilir. Kredi kartı numaranızın tamamı ve kart güvenlik kodunuz (CVV) Press Magazine tarafından saklanmaz.
          </p>

          <h3 className={privacy.subHeading}>Teknik Bilgiler</h3>
          <p className={styles.paragraph}>
            Sitemizi kullanırken IP adresi, tarayıcı ve cihaz bilgileri, bağlantı ve güvenlik kayıtları gibi teknik veriler de işlenebilir.
          </p>
          <p className={styles.paragraph}>
            Bu bilgiler, sitenin güvenliğini sağlamak, teknik sorunları tespit etmek ve hizmetlerimizin düzgün çalışmasını sağlamak amacıyla kullanılır.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>4. Bilgilerinizi Neden ve Hangi Hukuki Sebeplerle Kullanıyoruz?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Kişisel verilerinizi yalnızca belirli amaçlar ve geçerli hukuki sebepler kapsamında işliyoruz.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Sipariş ve teslimat işlemleri:</span> Satın aldığınız ürünleri size ulaştırmak, siparişinizi yönetmek ve müşteri desteği sunmak için gerekli bilgileri kullanıyoruz. Bu işlemler, KVKK'nın 5/2-c maddesi kapsamında sözleşmenin kurulması veya yerine getirilmesi için gerekli olmasına dayanır.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Faturalandırma ve yasal yükümlülükler:</span> Fatura düzenlemek, muhasebe kayıtlarını tutmak ve yasal yükümlülüklerimizi yerine getirmek için bazı bilgilerinizi saklıyoruz. Bu işlemler, KVKK'nın 5/2-ç maddesi kapsamında hukuki yükümlülüklerimize dayanır.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>İletişim ve destek:</span> Taleplerinizi ve şikâyetlerinizi değerlendirmek için bizimle paylaştığınız bilgileri kullanıyoruz. İlgili işlemler, sözleşmenin yerine getirilmesi veya bir hakkın tesisi, kullanılması ya da korunması için gerekli olabilir.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Newsletter:</span> Aboneliğinizi yönetmek ve izin verdiğiniz kapsamda size yayınlarımızla ilgili e-postalar göndermek için bilgilerinizi kullanıyoruz. Pazarlama iletişimlerinde, gerekli olduğu durumlarda açık rızanıza ve elektronik ticari ileti izninize dayanıyoruz.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Site güvenliği:</span> Sistemin güvenliğini sağlamak ve kötüye kullanımı önlemek amacıyla gerekli teknik bilgileri işliyoruz. İlgili koşulların sağlanması halinde bu işlemler, KVKK'nın 5/2-f maddesi kapsamındaki meşru menfaatimize dayanır.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>5. Bilgilerinizi Kimlerle Paylaşıyoruz?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Sitemizin ve sunduğumuz hizmetlerin çalışabilmesi için bazı hizmet sağlayıcılarla çalışıyoruz.
          </p>
          <p className={styles.paragraph}>Bunlar arasında:</p>
          <ul className={styles.bullets}>
            <li><span className={privacy.lead}>Shopify:</span> E-ticaret altyapısı, sipariş yönetimi ve newsletter işlemleri.</li>
            <li><span className={privacy.lead}>Vercel:</span> Web sitesinin barındırılması ve teknik altyapısı.</li>
            <li><span className={privacy.lead}>Ödeme hizmet sağlayıcıları:</span> Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi.</li>
            <li><span className={privacy.lead}>Kargo şirketleri:</span> Basılı dergilerin alıcılara ulaştırılması.</li>
            <li><span className={privacy.lead}>Muhasebe ve diğer yetkili hizmet sağlayıcıları:</span> Faturalandırma ve yasal yükümlülüklerin yerine getirilmesi.</li>
          </ul>
          <p className={styles.paragraph}>
            Kişisel bilgileriniz yalnızca ilgili hizmetin sunulması için gerekli olduğu ölçüde ve mevzuata uygun olarak paylaşılır.
          </p>
          <p className={styles.paragraph}>
            Kanunen gerekli durumlarda yetkili kamu kurumlarıyla da bilgi paylaşılması söz konusu olabilir.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>6. Verilerin Yurt Dışına Aktarılması</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Press Magazine'in kullandığı bazı teknoloji hizmetleri yurt dışında sunulmaktadır.
          </p>
          <p className={styles.paragraph}>
            Bu nedenle kişisel verileriniz, kullanılan hizmetin niteliğine bağlı olarak Türkiye dışındaki sunucularda işlenebilir veya yurt dışındaki hizmet sağlayıcılara aktarılabilir.
          </p>
          <p className={styles.paragraph}>
            Yurt dışına veri aktarımı, KVKK'nın 9. maddesinde belirtilen şartlar ve uygulanabilir yasal güvenceler çerçevesinde gerçekleştirilir.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>7. Çerezler</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Sitemizde, alışveriş deneyiminizin düzgün çalışmasını sağlamak amacıyla çerezler kullanıyoruz.
          </p>
          <p className={styles.paragraph}>
            Çerezler, tarayıcınızda saklanan ve belirli bilgilerin hatırlanmasını sağlayan küçük veri dosyalarıdır.
          </p>
          <p className={styles.paragraph}>Sitemizde kullanılan temel çerezler:</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Çerez</th>
                <th scope="col">Kullanım Amacı</th>
                <th scope="col">Saklama Süresi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code className={privacy.cookie}>press_cart_id</code></td>
                <td>Alışveriş sepetinizin hatırlanması</td>
                <td>10 gün</td>
              </tr>
              <tr>
                <td><code className={privacy.cookie}>press_buyer_details</code></td>
                <td>Sipariş sırasında verdiğiniz bazı bilgilerin geçici olarak saklanması</td>
                <td>48 saat</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.paragraph}>
            Alıcı bilgilerini içeren çerez şifrelenerek saklanır ve tarayıcıdaki JavaScript kodlarının doğrudan erişimine kapalıdır.
          </p>
          <p className={styles.paragraph}>
            Shopify'ın ödeme sayfasına geçtiğinizde, Shopify ve ilgili ödeme hizmet sağlayıcıları kendi hizmetleri için ek çerezler kullanabilir.
          </p>
          <p className={styles.paragraph}>
            Zorunlu olmayan analitik veya pazarlama çerezleri kullanılması halinde, gerekli olduğu durumlarda önceden izniniz alınır.
          </p>
          <p className={styles.paragraph}>
            Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak bazı çerezlerin devre dışı bırakılması sepet gibi temel özelliklerin çalışmasını etkileyebilir.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>8. Bilgilerinizi Ne Kadar Süre Saklıyoruz?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Kişisel verileriniz, toplanma amaçları için gerekli olduğu ve ilgili mevzuatın gerektirdiği süre boyunca saklanır.
          </p>
          <p className={styles.paragraph}>
            Sipariş ve fatura bilgileri, geçerli yasal saklama sürelerine uygun olarak muhafaza edilir.
          </p>
          <p className={styles.paragraph}>
            Newsletter aboneliğinizle ilgili bilgiler, aboneliğiniz ve geçerli veri işleme amaçları devam ettiği sürece saklanabilir. Abonelikten ayrılmanız, pazarlama e-postalarının durdurulmasını sağlar; yasal olarak tutulması gereken kayıtlar ise ilgili süre boyunca korunabilir.
          </p>
          <p className={styles.paragraph}>
            Saklama süresi sona erdiğinde ve verilerin işlenmesi için geçerli bir hukuki sebep kalmadığında bilgileriniz mevzuata uygun şekilde silinir, yok edilir veya anonim hale getirilir.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>9. Verilerinizi Nasıl Koruyoruz?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Kişisel verilerinizi yetkisiz erişime, kayba veya kötüye kullanıma karşı korumak için uygun teknik ve idari güvenlik önlemleri alıyoruz.
          </p>
          <p className={styles.paragraph}>
            Web sitemiz güvenli bağlantılar kullanır. Sipariş ve ödeme işlemleri ilgili hizmet sağlayıcıların güvenlik mekanizmaları üzerinden yürütülür.
          </p>
          <p className={styles.paragraph}>
            Bununla birlikte, internet üzerinden gerçekleştirilen hiçbir veri aktarımının tamamen risksiz olduğu garanti edilemez.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>10. Kişisel Verileriniz Üzerindeki Haklarınız</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            KVKK'nın 11. maddesi kapsamında kişisel verilerinize ilişkin çeşitli haklara sahipsiniz.
          </p>
          <p className={styles.paragraph}>Bu kapsamda:</p>
          <ul className={styles.bullets}>
            <li>Hakkınızda hangi kişisel verilerin işlendiğini öğrenebilir ve bilgi talep edebilirsiniz.</li>
            <li>Verilerinizin hangi amaçlarla kullanıldığını ve kimlerle paylaşıldığını öğrenebilirsiniz.</li>
            <li>Eksik veya yanlış bilgilerin düzeltilmesini isteyebilirsiniz.</li>
            <li>Kanuni şartların oluşması halinde bilgilerinizin silinmesini veya yok edilmesini talep edebilirsiniz.</li>
            <li>Düzeltme ve silme işlemlerinin verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteyebilirsiniz.</li>
            <li>Yalnızca otomatik sistemlerle yapılan analizler sonucunda aleyhinize ortaya çıkan sonuçlara itiraz edebilirsiniz.</li>
            <li>Verilerinizin kanuna aykırı işlenmesi nedeniyle zarar görmeniz halinde zararınızın giderilmesini talep edebilirsiniz.</li>
          </ul>
          <p className={styles.paragraph}>
            Bu haklarınızı kullanmak için ilgili mevzuatta belirtilen başvuru yöntemleriyle bize ulaşabilirsiniz.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>E-posta:</span> hello@septembercompany.com
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>11. Gizlilik Politikasındaki Değişiklikler</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Hizmetlerimizde veya yasal düzenlemelerde değişiklik olması halinde bu politikayı güncelleyebiliriz.
          </p>
          <p className={styles.paragraph}>
            Güncel Gizlilik Politikası'na her zaman www.pressmagazine.com.tr üzerinden ulaşabilirsiniz.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>12. İletişim</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Gizlilik Politikamız veya kişisel verileriniz hakkında sorularınız varsa bizimle iletişime geçebilirsiniz.
          </p>
          <p className={styles.paragraph}>
            <strong>SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ</strong>
          </p>
          <p className={styles.paragraph}>
            Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş / İstanbul, Türkiye
          </p>
          <p className={styles.paragraph}>
            <strong>hello@septembercompany.com</strong>
          </p>
          <p className={styles.paragraph}>
            <strong>www.pressmagazine.com.tr</strong>
          </p>
        </div>
      </section>
    </div>
  );
}
