/* eslint-disable react/no-unescaped-entities -- legal text with apostrophes, kept as supplied */
import styles from "../legal-document.module.scss";
import page from "./shipping-and-returns.module.scss";

// Teslimat ve İade Şartları, Turkish text as supplied. Do not reword without approval.
export default function ShippingAndReturnsTr() {
  return (
    <div className={page.sections}>
      <p className={page.updated}>Son Güncelleme: 11 Kasım 2026</p>

      <section>
        <h2 className={styles.sectionHeading}>1. Genel Bilgiler</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Press Magazine üzerinden satın alınan basılı ve dijital yayınların teslimatı, iadesi ve geri ödeme koşulları bu sayfada açıklanmaktadır.
          </p>
          <p className={styles.paragraph}>
            Press Magazine, yılda iki kez yayımlanan bir kültür yayınıdır. Dijital PDF ve basılı dergi + dijital PDF paketleri sunulmaktadır.
          </p>
          <p className={styles.paragraph}>
            Satın alınan ürünlerin kapsamı, fiyatı ve teslimat bilgileri ilgili ürün sayfasında ve sipariş sırasında belirtilir.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>2. Basılı Dergilerin Teslimatı</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Basılı dergiler, sipariş sırasında belirtilen teslimat adresine kargo yoluyla gönderilir.
          </p>
          <p className={styles.paragraph}>
            Teslimat yapılabilen ülkeler ve bölgeler, sipariş sırasında sunulan seçeneklere göre belirlenir.
          </p>
          <p className={styles.paragraph}>
            Gönderim süresi, derginin yayın tarihine, stok durumuna ve teslimat adresine bağlı olarak değişebilir. Geçerli teslimat bilgileri satın alma işlemi tamamlanmadan önce paylaşılır.
          </p>
          <p className={styles.paragraph}>
            Satıcı, ilgili mevzuatta öngörülen istisnalar dışında, siparişi taahhüt edilen süre içinde ve her durumda en geç 30 gün içerisinde teslim etmekle yükümlüdür.
          </p>
          <p className={styles.paragraph}>
            Henüz yayımlanmamış sayılar için yayın ve gönderim bilgileri ürün sayfasında ayrıca belirtilir.
          </p>
          <p className={styles.paragraph}>
            Siparişinizin teslimatıyla ilgili sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>3. Dijital Yayınların Teslimatı</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>Dijital yayınlar PDF formatında sunulur.</p>
          <p className={styles.paragraph}>
            Dijital içeriğe erişim yöntemi ve erişimin başlayacağı tarih, satın alma öncesinde ürün sayfasında belirtilir.
          </p>
          <p className={styles.paragraph}>
            Dijital yayınların görüntülenmesi veya indirilmesi için internet bağlantısı ve PDF formatını destekleyen bir cihaz veya yazılım gerekebilir.
          </p>
          <p className={styles.paragraph}>
            Satın aldığınız dijital içeriğe erişmekte sorun yaşarsanız hello@septembercompany.com adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>4. Kargo Ücretleri</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Kargo ücretleri, teslimat adresine ve siparişin kapsamına bağlı olarak değişebilir.
          </p>
          <p className={styles.paragraph}>
            Geçerli teslimat ücreti ve varsa diğer ek masraflar, ödeme işlemi tamamlanmadan önce gösterilir.
          </p>
          <p className={styles.paragraph}>
            Yalnızca dijital içerik içeren siparişlerde fiziksel gönderim yapılmaz ve kargo ücreti uygulanmaz.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>5. Cayma ve İade Koşulları</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında, cayma hakkının geçerli olduğu mesafeli satışlarda tüketiciler 14 gün içerisinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden sözleşmeden cayabilir.
          </p>
          <p className={styles.paragraph}>
            Ancak bazı ürünler için mevzuatta cayma hakkı istisnaları bulunmaktadır.
          </p>

          <h3 className={page.subHeading}>Basılı Dergiler</h3>
          <p className={styles.paragraph}>
            Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, abonelik sözleşmesi kapsamında sağlananlar dışında gazete ve dergi gibi süreli yayınların teslimine ilişkin sözleşmelerde cayma hakkı bulunmamaktadır.
          </p>
          <p className={styles.paragraph}>
            Abonelik sözleşmesi kapsamında sunulan ürünlerde bu istisna uygulanmaz. İlgili satın alma işleminin niteliğine göre tüketicinin yasal cayma hakları saklıdır.
          </p>

          <h3 className={page.subHeading}>Dijital Yayınlar</h3>
          <p className={styles.paragraph}>
            Elektronik ortamda anında teslim edilen dijital içerikler, Mesafeli Sözleşmeler Yönetmeliği'nde belirtilen cayma hakkı istisnaları kapsamında değerlendirilebilir.
          </p>
          <p className={styles.paragraph}>
            Bu istisna, dijital içeriğin gerçekten anında teslim edildiği durumlarda uygulanır.
          </p>

          <h3 className={page.subHeading}>Basılı + Dijital Paketler</h3>
          <p className={styles.paragraph}>
            Basılı dergi ve dijital yayını birlikte içeren paketlerde cayma hakkı, satın alınan ürünlerin niteliği ve ilgili yasal düzenlemeler dikkate alınarak değerlendirilir.
          </p>
          <p className={styles.paragraph}>
            Cayma hakkına ilişkin istisnalar, ayıplı veya hatalı ürünlerle ilgili yasal haklarınızı ortadan kaldırmaz.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>6. İade Talebi Nasıl Oluşturulur?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Cayma hakkının geçerli olduğu durumlarda, yasal süre içerisinde aşağıdaki e-posta adresi üzerinden talebinizi iletebilirsiniz:
          </p>
          <p className={styles.paragraph}>
            <strong>hello@septembercompany.com</strong>
          </p>
          <p className={styles.paragraph}>
            Talebinizde sipariş numaranızı ve iade etmek istediğiniz ürünü belirtmeniz işlemlerin daha hızlı yürütülmesine yardımcı olacaktır.
          </p>
          <p className={styles.paragraph}>
            Cayma hakkının kullanılması halinde ürün, bildirimin ardından 14 gün içerisinde geri gönderilmelidir.
          </p>
          <p className={styles.paragraph}>
            İade için kullanılacak taşıyıcı ve gönderim bilgileri, ilgili siparişe ait Ön Bilgilendirme Formu'nda belirtilir.
          </p>
          <p className={styles.paragraph}>
            İade gönderim masrafları konusunda yürürlükteki tüketici mevzuatı uygulanır. Mevzuat uyarınca tüketiciye yüklenemeyen iade masrafları müşteriden talep edilmez.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>7. Hasarlı, Hatalı veya Eksik Ürünler</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Siparişinizin hasarlı, hatalı veya eksik teslim edilmesi durumunda bizimle iletişime geçebilirsiniz.
          </p>
          <p className={styles.paragraph}>
            Sorunun daha hızlı değerlendirilebilmesi için sipariş numaranızı ve mümkünse sorunu gösteren fotoğrafları paylaşabilirsiniz.
          </p>
          <p className={styles.paragraph}>
            Ayıplı mal ve hizmetlere ilişkin 6502 sayılı Kanun kapsamında sahip olduğunuz seçimlik haklar saklıdır.
          </p>
          <p className={styles.paragraph}>
            Cayma hakkı istisnaları, ayıplı ürünlerle ilgili başvuru haklarınızı sınırlandırmaz.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>8. Geri Ödemeler</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Cayma hakkının geçerli olduğu veya mevzuat gereği bedel iadesi yapılması gereken durumlarda geri ödemeler yasal süreler içerisinde gerçekleştirilir.
          </p>
          <p className={styles.paragraph}>
            Cayma hakkının kullanıldığı mal satışlarında geri ödeme süresi, ilgili mevzuata göre iade ürününün belirtilen taşıyıcıya teslim edilmesi veya gerekli hallerde Satıcı'ya ulaşması esas alınarak belirlenir. Geçerli yasal süre 14 gündür.
          </p>
          <p className={styles.paragraph}>
            Geri ödemeler, mevzuatta aksi öngörülmedikçe satın alma sırasında kullanılan ödeme aracına uygun şekilde ve tüketiciye ek masraf yüklenmeden yapılır.
          </p>
          <p className={styles.paragraph}>
            İade tutarının banka veya kart hesabınıza yansıma süresi, ilgili finans kuruluşunun işlem süreçlerine bağlı olarak değişebilir.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>9. İletişim</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Teslimat, dijital erişim, iade veya geri ödeme işlemleriyle ilgili sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
          <p className={styles.paragraph}>
            <strong>SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ</strong>
          </p>
          <p className={styles.paragraph}>
            Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş / İstanbul, Türkiye
          </p>
          <p className={styles.paragraph}>
            <strong>E-posta:</strong> hello@septembercompany.com
          </p>
          <p className={styles.paragraph}>
            <strong>İnternet Sitesi:</strong> www.pressmagazine.com.tr
          </p>
          <p className={styles.paragraph}>
            Bu sayfadaki açıklamalar, yürürlükteki tüketici mevzuatından doğan haklarınızı sınırlandırmaz. Ayrıntılı satış koşulları için Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu'nu inceleyebilirsiniz.
          </p>
        </div>
      </section>
    </div>
  );
}
