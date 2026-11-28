/* eslint-disable react/no-unescaped-entities -- legal text with apostrophes, kept as supplied */
import styles from "../legal-document.module.scss";
import page from "./shipping-and-returns.module.scss";

// Teslimat ve İade Şartları, Turkish text as supplied, revised for the print-only offering
// (pending legal review). Do not reword without approval.
export default function ShippingAndReturnsTr({includesDigitalContent}: {includesDigitalContent: boolean}) {
  // Without the digital delivery section (3), the sections after it move up by one.
  const sectionNumber = (numberWithDigital: number) =>
    includesDigitalContent ? numberWithDigital : numberWithDigital - 1;

  return (
    <div className={page.sections}>
      <p className={page.updated}>Son Güncelleme: 28 Kasım 2026</p>

      <section>
        <h2 className={styles.sectionHeading}>1. Genel Bilgiler</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Press Magazine üzerinden satın alınan basılı yayınların teslimatı, iadesi ve geri ödeme koşulları bu sayfada açıklanmaktadır.
          </p>
          <p className={styles.paragraph}>
            Press Magazine, yılda iki kez yayımlanan bir kültür yayınıdır. Basılı dergi olarak sunulmaktadır.
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

      {includesDigitalContent ? (
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
              Satın aldığınız dijital içeriğe erişmekte sorun yaşarsanız hello@pressmagazine.com.tr adresinden bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className={styles.sectionHeading}>{sectionNumber(4)}. Kargo Ücretleri</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Kargo ücretleri, teslimat adresine ve siparişin kapsamına bağlı olarak değişebilir.
          </p>
          <p className={styles.paragraph}>
            Geçerli teslimat ücreti ve varsa diğer ek masraflar, ödeme işlemi tamamlanmadan önce gösterilir.
          </p>
          {includesDigitalContent ? (
            <p className={styles.paragraph}>
              Yalnızca dijital içerik içeren siparişlerde fiziksel gönderim yapılmaz ve kargo ücreti uygulanmaz.
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>{sectionNumber(5)}. İade</h2>
        <div className={styles.document}>
          {includesDigitalContent ? (
            <h3 className={page.subHeading}>Basılı Dergiler</h3>
          ) : null}
          <p className={styles.paragraph}>
            Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, abonelik sözleşmesi kapsamında sağlananlar dışında gazete ve dergi gibi süreli yayınların teslimine ilişkin sözleşmelerde cayma hakkı bulunmamaktadır.
          </p>
          {includesDigitalContent ? (
            <>
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
            </>
          ) : null}
          <p className={styles.paragraph}>
            İade ile ilgili sorularınız için hello@pressmagazine.com.tr adresinden bizimle iletişime geçebilirsiniz. Yasal tüketici haklarınız saklıdır.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>{sectionNumber(6)}. İletişim</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Teslimat, {includesDigitalContent ? "dijital erişim, " : ""}iade veya geri ödeme işlemleriyle ilgili sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
          <p className={styles.paragraph}>
            <strong>SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ</strong>
          </p>
          <p className={styles.paragraph}>
            Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş / İstanbul, Türkiye
          </p>
          <p className={styles.paragraph}>
            <strong>E-posta:</strong> hello@pressmagazine.com.tr
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
