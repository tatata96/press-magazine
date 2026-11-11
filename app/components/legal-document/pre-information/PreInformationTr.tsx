/* eslint-disable react/no-unescaped-entities -- Turkish legal text with apostrophes, kept as written */
import {Fragment} from "react";
import type {PreInformationData} from "@/lib/legal/agreement-data";
import styles from "../legal-document.module.scss";

// Ön Bilgilendirme Formu (Mesafeli Sözleşmeler Yönetmeliği m. 5). Statements that repeat the
// Mesafeli Satış Sözleşmesi use its wording. Values in braces come from `data`.
export default function PreInformationTr({data}: {data: PreInformationData}) {
  return (
    <div className={styles.document}>
      <p className={styles.paragraph}>
        Bu Ön Bilgilendirme Formu, Alıcı sipariş vermeden ve Mesafeli Satış
        Sözleşmesi kurulmadan önce, 6502 sayılı Tüketicinin Korunması Hakkında
        Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca Alıcı'ya sunulur ve
        Mesafeli Satış Sözleşmesi ile birlikte değerlendirilir.
      </p>

      <h2 className={styles.sectionHeading}>1. SATICI BİLGİLERİ</h2>
      <ul className={styles.details}>
        <li>
          <strong>Ticari Unvan:</strong> {data.seller.legalName}
        </li>
        <li>
          <strong>Adres:</strong> {data.seller.address}
        </li>
        <li>
          <strong>Vergi Kimlik Numarası:</strong> {data.seller.taxNumber}
        </li>
        <li>
          <strong>Telefon:</strong> {data.seller.phone}
        </li>
        <li>
          <strong>E-posta:</strong> {data.seller.email}
        </li>
        <li>
          <strong>İnternet Sitesi:</strong> www.pressmagazine.com.tr
        </li>
      </ul>
      <p className={styles.paragraph}>
        Şikâyet ve başvurular ile cayma bildirimleri yukarıdaki adrese veya{" "}
        {data.seller.supportEmail} e-posta adresine iletilebilir.
      </p>

      <h2 className={styles.sectionHeading}>2. ALICI BİLGİLERİ</h2>
      <ul className={styles.details}>
        <li>
          <strong>Adı Soyadı:</strong> {data.buyer.fullName}
        </li>
        <li>
          <strong>E-posta:</strong> {data.buyer.email}
        </li>
        <li>
          <strong>Telefon:</strong> {data.buyer.phone}
        </li>
        <li>
          <strong>Ülke:</strong> {data.buyer.country}
        </li>
        <li>
          <strong>Teslimat Adresi:</strong> {data.buyer.shippingAddress}
        </li>
        <li>
          <strong>Fatura Adresi:</strong> {data.buyer.billingAddress}
        </li>
      </ul>

      <h2 className={styles.sectionHeading}>3. ÜRÜNÜN TEMEL NİTELİKLERİ</h2>
      <p className={styles.paragraph}>
        Sipariş konusu ürünler aşağıdaki gibidir. Birden fazla ürün satın
        alınması halinde her ürün, miktarı ve bedeliyle birlikte ayrıca
        gösterilir.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Bilgi</th>
            <th scope="col">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {/* One group of rows per cart line. */}
          {data.products.map((product, index) => (
            <Fragment key={index}>
              <tr className={index > 0 ? styles.tableGroupStart : undefined}>
                <th scope="row">Ürün Adı</th>
                <td>{product.name}</td>
              </tr>
              <tr>
                <th scope="row">Ürün Türü</th>
                <td>{product.type}</td>
              </tr>
              <tr>
                <th scope="row">Adet</th>
                <td>{product.quantity}</td>
              </tr>
              <tr>
                <th scope="row">Birim Fiyat</th>
                <td>{product.unitPrice}</td>
              </tr>
              <tr>
                <th scope="row">Ürün Toplamı</th>
                <td>{product.totalPrice}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      <p className={styles.paragraph}>
        Satışa sunulan ücretli ürünler aşağıdaki kategorilerdedir:
      </p>
      <ul className={styles.bullets}>
        <li>
          <strong>Dijital Yayın:</strong> Press Magazine'in PDF formatındaki
          dijital sayısı.
        </li>
        <li>
          <strong>Basılı + Dijital Yayın:</strong> Press Magazine'in fiziksel
          dergisi ile aynı sayının PDF formatındaki dijital versiyonu.
        </li>
      </ul>
      <p className={styles.paragraph}>
        Ürün sayfasında açıkça aksi belirtilmedikçe satın alma işlemi tek
        seferlik ödeme niteliğindedir. Paket süresi sonunda otomatik yenileme
        veya Alıcı'dan yeni bir ödeme tahsilatı yapılmaz.
      </p>

      <h2 className={styles.sectionHeading}>4. FİYAT, VERGİLER VE ÖDEME</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Bilgi</th>
            <th scope="col">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Ara Toplam</th>
            <td>{data.order.subtotal}</td>
          </tr>
          <tr>
            <th scope="row">İndirim</th>
            <td>{data.order.discount}</td>
          </tr>
          <tr>
            <th scope="row">Vergi Tutarı</th>
            <td>{data.order.taxAmount}</td>
          </tr>
          <tr>
            <th scope="row">Kargo / Teslimat</th>
            <td>{data.order.shippingCost}</td>
          </tr>
          <tr>
            <th scope="row">
              <strong>Toplam Tutar</strong>
            </th>
            <td>
              <strong>{data.order.total}</strong>
            </td>
          </tr>
          <tr>
            <th scope="row">Para Birimi</th>
            <td>{data.order.currency}</td>
          </tr>
          <tr>
            <th scope="row">Ödeme Yöntemi</th>
            <td>{data.order.paymentMethod}</td>
          </tr>
        </tbody>
      </table>
      <p className={styles.paragraph}>
        Teslimat ücreti, vergiler ve toplam tutar, sepetiniz için Shopify
        tarafından yapılan tahminlerdir ve nihai değildir. Nihai tutarlar
        Shopify ödeme sayfasında belirlenir.
      </p>
      <p className={styles.paragraph}>
        Sipariş vermek, ödeme yükümlülüğü anlamına gelir. Alıcı'nın açıkça
        onaylamadığı ek bir ödeme tahsil edilmez. Ödeme, Site üzerinden
        yönlendirilen güvenli ödeme sayfasında, Shopify altyapısı ve ilgili
        ödeme hizmet sağlayıcısı üzerinden gerçekleştirilir; kabul edilen ödeme
        yöntemleri bu sayfada sunulur.
      </p>

      <h2 className={styles.sectionHeading}>5. TESLİMAT KOŞULLARI</h2>
      <h3 className={styles.subHeading}>
        5.1. Basılı Dergi Teslimatı (Basılı + Dijital Yayın)
      </h3>
      <p className={styles.paragraph}>
        Basılı dergiler, Alıcı'nın sipariş sırasında belirttiği teslimat
        adresine, sipariş sırasında bildirilen teslimat yöntemiyle gönderilir.
      </p>
      <ul className={styles.details}>
        <li>
          <strong>Teslimat Adresi:</strong> {data.buyer.shippingAddress}
        </li>
        <li>
          <strong>Teslimat Süresi:</strong> {data.terms.physicalDeliveryTime}
        </li>
        <li>
          <strong>Teslimat Ücreti:</strong> {data.order.shippingCost}
        </li>
      </ul>
      <p className={styles.paragraph}>
        Mevzuatta öngörülen istisnalar dışında, mal satışlarında teslimat süresi
        otuz günü aşamaz.
      </p>
      <h3 className={styles.subHeading}>
        5.2. Dijital İçerik Teslimatı (Dijital Yayın ve Basılı + Dijital Yayın)
      </h3>
      <p className={styles.paragraph}>
        Dijital yayınlar, PDF formatında elektronik ortamda sunulur.
      </p>
      <ul className={styles.details}>
        <li>
          <strong>Erişim Yöntemi ve Zamanı:</strong> {data.terms.digitalAccess}
        </li>
        <li>
          <strong>Teknik Gereklilikler:</strong> Dijital içeriğin indirilmesi
          veya görüntülenmesi için internet bağlantısı ve PDF formatını
          destekleyen uygun bir cihaz veya yazılım gerekebilir.
        </li>
        <li>
          <strong>Teknik Koruma Önlemleri:</strong>{" "}
          {data.terms.digitalProtection}
        </li>
      </ul>

      <h2 className={styles.sectionHeading}>6. CAYMA HAKKI</h2>
      <p className={styles.paragraph}>
        Kanunda ve Yönetmelik'te düzenlenen istisnalar saklı kalmak üzere Alıcı,
        mesafeli sözleşmeden on dört gün içerisinde herhangi bir gerekçe
        göstermeksizin ve cezai şart ödemeksizin cayma hakkına sahiptir.
      </p>
      <p className={styles.paragraph}>
        Cayma hakkı süresi, mal satışlarında Alıcı'nın veya Alıcı tarafından
        belirlenen üçüncü kişinin malı teslim aldığı gün; hizmet sözleşmelerinde
        ise sözleşmenin kurulduğu gün başlar.
      </p>
      <p className={styles.paragraph}>
        Cayma hakkını kullanmak için Alıcı'nın bu yöndeki açık bildirimini yasal
        süre içerisinde Satıcı'ya yöneltmesi yeterlidir. Cayma bildirimi
        aşağıdaki iletişim bilgilerine yapılabilir:
      </p>
      <ul className={styles.details}>
        <li>
          <strong>E-posta:</strong> {data.seller.supportEmail}
        </li>
        <li>
          <strong>Adres:</strong> {data.seller.address}
        </li>
      </ul>
      <p className={styles.paragraph}>
        Cayma hakkının geçerli olduğu bir satın alma işleminde Alıcı, cayma
        bildirimini takip eden on dört gün içerisinde ürünü Satıcı'ya geri
        göndermekle yükümlüdür.
      </p>
      <ul className={styles.details}>
        <li>
          <strong>İade Taşıyıcısı ve İade Gönderim Masrafı:</strong>{" "}
          {data.terms.returnCarrier}
        </li>
      </ul>
      <p className={styles.paragraph}>
        Cayma hakkının kullanıldığı durumlarda Satıcı, Yönetmelik'te belirtilen
        süreler ve koşullar çerçevesinde, varsa ilk teslimat masrafları dahil
        olmak üzere tahsil edilen ödemeleri Alıcı'ya iade eder. Geri ödeme,
        mevzuatta aksi öngörülmedikçe Alıcı'nın satın alma sırasında kullandığı
        ödeme aracına uygun şekilde ve Alıcı'ya ek masraf yüklenmeden yapılır.
      </p>

      <h2 className={styles.sectionHeading}>
        7. CAYMA HAKKININ KULLANILAMADIĞI DURUMLAR
      </h2>
      <p className={styles.paragraph}>
        Yönetmelik'in 15. maddesi uyarınca belirli ürün ve hizmetlerde cayma
        hakkı kullanılamaz. Aşağıdaki istisnalar yalnızca koşulları
        gerçekleştiğinde uygulanır; her sipariş için geçerli değildir.
      </p>
      <ul className={styles.bullets}>
        <li>
          <strong>Basılı dergiler:</strong> Abonelik sözleşmesi kapsamında
          sağlananlar dışında, gazete ve dergi gibi süreli yayınların teslimine
          ilişkin sözleşmelerde Yönetmelik'in 15/1-f maddesi uyarınca cayma
          hakkı kullanılamaz. Abonelik sözleşmesi kapsamında sağlanan basılı
          dergiler bakımından bu istisna uygulanmaz.
        </li>
        <li>
          <strong>Dijital yayınlar:</strong> Elektronik ortamda anında ifa
          edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi
          mallara ilişkin sözleşmelerde Yönetmelik'in 15/1-ğ maddesi uyarınca
          cayma hakkı kullanılamaz. Bu istisna, satın alınan dijital yayının
          gerçekten anında teslim edildiği durumlarda uygulanır.
        </li>
        <li>
          <strong>Basılı ve dijital içeriği birlikte içeren paketler:</strong>{" "}
          Cayma hakkının uygulanabilirliği ürünlerin niteliği, teslim şekli ve
          satın alma ilişkisinin hukuki niteliği dikkate alınarak ilgili mevzuat
          çerçevesinde değerlendirilir.
        </li>
      </ul>
      <p className={styles.paragraph}>
        Cayma hakkına ilişkin istisnalar, ayıplı mal veya hizmete ilişkin
        tüketici haklarını ortadan kaldırmaz.
      </p>

      <h2 className={styles.sectionHeading}>8. ŞİKÂYET VE UYUŞMAZLIK ÇÖZÜMÜ</h2>
      <p className={styles.paragraph}>
        Alıcı, talep ve şikâyetlerini öncelikle Satıcı'nın yukarıda belirtilen
        iletişim bilgilerine iletebilir. Bu, Alıcı'nın doğrudan kanuni başvuru
        yollarını kullanmasına engel değildir.
      </p>
      <p className={styles.paragraph}>
        Alıcı, yürürlükteki parasal sınırlar ve yetki kuralları çerçevesinde
        Tüketici Hakem Heyetlerine veya Tüketici Mahkemelerine başvurabilir.
        Tüketici mahkemelerinin görev alanına giren uyuşmazlıklarda, kanunen
        öngörülen dava şartı arabuluculuk hükümleri saklıdır.
      </p>

      <h2 className={styles.sectionHeading}>9. ONAY</h2>
      <p className={styles.paragraph}>
        Alıcı, bu Ön Bilgilendirme Formu'nu ve Mesafeli Satış Sözleşmesi'ni
        okuyup kabul ettiğini, sipariş sürecinde ilgili onay kutusunu
        işaretleyerek beyan eder.
      </p>
      <p className={styles.paragraph}>
        <strong>Form Tarihi:</strong> {data.agreementDate}
      </p>
    </div>
  );
}
