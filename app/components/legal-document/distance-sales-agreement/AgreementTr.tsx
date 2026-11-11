/* eslint-disable react/no-unescaped-entities -- the legal text is kept exactly as supplied, apostrophes included */
import {Fragment} from "react";
import type {AgreementData} from "@/lib/legal/agreement-data";
import styles from "../legal-document.module.scss";

// Distance Sales Agreement, Turkish text exactly as supplied. Only the values in braces come
// from `data`; do not reword the text without approval.
export default function AgreementTr({data}: {data: AgreementData}) {
  return (
    <div className={styles.document}>
      <h2 className={styles.sectionHeading}>1. TARAFLAR</h2>
      <p className={styles.paragraph}>
        Bu Mesafeli Satış Sözleşmesisi, aşağıda bilgileri bulunan Satıcı ile
        www.pressmagazine.com.tr internet sitesi üzerinden ürün satın
        alan Alıcı arasında elektronik ortamda kurulmuştur.
      </p>
      <p className={styles.paragraph}>
        <strong>1.1. SATICI BİLGİLERİ</strong>
      </p>
      <ul className={styles.details}>
        <li><strong>Ticari Unvan:</strong> {data.seller.legalName}</li>
        <li><strong>Adres:</strong> {data.seller.address}</li>
        <li><strong>Vergi Kimlik Numarası:</strong> {data.seller.taxNumber}</li>
        <li><strong>Telefon:</strong> {data.seller.phone}</li>
        <li><strong>E-posta:</strong> {data.seller.email}</li>
        <li><strong>İnternet Sitesi:</strong> www.pressmagazine.com.tr</li>
      </ul>
      <p className={styles.paragraph}>
        <strong>1.2. ALICI BİLGİLERİ</strong>
      </p>
      <ul className={styles.details}>
        <li><strong>Adı Soyadı:</strong> {data.buyer.fullName}</li>
        <li><strong>E-posta:</strong> {data.buyer.email}</li>
        <li><strong>Telefon:</strong> {data.buyer.phone}</li>
        <li><strong>Ülke:</strong> {data.buyer.country}</li>
        <li><strong>Teslimat Adresi:</strong> {data.buyer.shippingAddress}</li>
        <li><strong>Fatura Adresi:</strong> {data.buyer.billingAddress}</li>
      </ul>
      <p className={styles.paragraph}>
        Alıcı ve Satıcı, işbu Sözleşme kapsamında birlikte “Taraflar”, ayrı ayrı
        “Taraf” olarak anılacaktır.
      </p>
      <h2 className={styles.sectionHeading}>2. TANIMLAR</h2>
      <p className={styles.paragraph}>İşbu Sözleşme'de geçen:</p>
      <p className={styles.paragraph}>
        <strong>Alıcı:</strong> Ticari veya mesleki olmayan amaçlarla ürün satın
        alan tüketiciyi,
      </p>
      <p className={styles.paragraph}>
        <strong>Satıcı:</strong> Press Magazine ürünlerini satışa sunan ve
        bilgileri Madde 1'de belirtilen gerçek veya tüzel kişiyi,
      </p>
      <p className={styles.paragraph}>
        <strong>Site:</strong> www.pressmagazine.com.tr adresinde faaliyet
        gösteren internet sitesini,
      </p>
      <p className={styles.paragraph}>
        <strong>Ürün:</strong> Site üzerinden satışa sunulan Press Magazine
        basılı dergilerini, dijital PDF yayınlarını ve bunlardan oluşan
        paketleri,
      </p>
      <p className={styles.paragraph}>
        <strong>Dijital İçerik:</strong> Elektronik ortamda erişime sunulan veya
        indirilebilen PDF formatındaki Press Magazine yayınlarını,
      </p>
      <p className={styles.paragraph}>
        <strong>Kanun:</strong> 6502 sayılı Tüketicinin Korunması Hakkında
        Kanun'u,
      </p>
      <p className={styles.paragraph}>
        <strong>Yönetmelik:</strong> Mesafeli Sözleşmeler Yönetmeliği'ni,
      </p>
      <p className={styles.paragraph}>
        <strong>Ön Bilgilendirme Formu:</strong> Sözleşme kurulmadan önce
        Alıcı'ya sunulan, satın alınacak ürün ve satış koşullarına ilişkin
        bilgileri içeren belgeyi
      </p>
      <p className={styles.paragraph}>ifade eder.</p>
      <h2 className={styles.sectionHeading}>
        3. SÖZLEŞMENİN KONUSU VE KAPSAMI
      </h2>
      <p className={styles.paragraph}>
        <strong>3.1.</strong> İşbu Sözleşme'nin konusu, Alıcı'nın Site üzerinden
        elektronik ortamda sipariş verdiği Press Magazine ürünlerinin satışı,
        bedelinin ödenmesi ve teslimi ile ilgili olarak Taraflar'ın hak ve
        yükümlülüklerinin belirlenmesidir.
      </p>
      <p className={styles.paragraph}>
        <strong>3.2.</strong> İşbu Sözleşme, Kanun ve Yönetmelik hükümlerine
        uygun olarak düzenlenmiştir.
      </p>
      <p className={styles.paragraph}>
        <strong>3.3.</strong> Alıcı, satın almak istediği ürünün temel
        nitelikleri, satış fiyatı, ödeme ve teslimat koşulları, cayma hakkı ve
        varsa cayma hakkının istisnaları hakkında sipariş öncesinde
        bilgilendirilir.
      </p>
      <p className={styles.paragraph}>
        <strong>3.4.</strong> Site üzerinden sunulan ücretli ürünler aşağıdaki
        kategorilerde olabilir:
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
        <strong>3.5.</strong> Press Magazine yılda iki sayı yayımlanan bir
        yayındır. Altı aylık dönem için sunulan bir paket, ürün sayfasında aksi
        belirtilmedikçe ilgili döneme ait bir dergi sayısını kapsar.
      </p>
      <p className={styles.paragraph}>
        <strong>3.6.</strong> Satın alma işlemi, ürün sayfasında açıkça aksi
        belirtilmedikçe tek seferlik ödeme niteliğindedir. Paket süresi sonunda
        otomatik yenileme veya Alıcı'dan yeni bir ödeme tahsilatı yapılmaz.
      </p>
      <h2 className={styles.sectionHeading}>
        4. ALICININ ÖNCEDEN BİLGİLENDİRİLDİĞİ HUSUSLAR
      </h2>
      <p className={styles.paragraph}>
        <strong>4.1.</strong> Alıcı, sipariş vermeden önce aşağıdaki hususlarda
        bilgilendirilir:
      </p>
      <p className={styles.paragraph}>
        a) Satın alınan ürünün temel özellikleri ve kapsamı,
      </p>
      <p className={styles.paragraph}>
        b) Satıcı'nın ticari unvanı, adresi ve iletişim bilgileri,
      </p>
      <p className={styles.paragraph}>
        c) Ürünün tüm vergiler dahil toplam satış fiyatı,
      </p>
      <p className={styles.paragraph}>
        d) Varsa kargo, teslimat ve diğer ek masraflar,
      </p>
      <p className={styles.paragraph}>e) Kabul edilen ödeme yöntemleri,</p>
      <p className={styles.paragraph}>f) Ürünün teslimat şekli ve süresi,</p>
      <p className={styles.paragraph}>
        g) Dijital içeriklerin teslim ve erişim koşulları,
      </p>
      <p className={styles.paragraph}>
        h) Cayma hakkının mevcut olup olmadığı, kullanım şartları ve
        istisnaları,
      </p>
      <p className={styles.paragraph}>i) İade ve geri ödeme koşulları,</p>
      <p className={styles.paragraph}>
        j) Şikâyet ve uyuşmazlıkların çözümü için başvuru yöntemleri,
      </p>
      <p className={styles.paragraph}>
        k) Dijital içeriklerin kullanımını etkileyebilecek teknik gereklilikler.
      </p>
      <p className={styles.paragraph}>
        <strong>4.2.</strong> Bu bilgiler, ürün sayfası, sipariş özeti, Ön
        Bilgilendirme Formu ve işbu Sözleşme aracılığıyla Alıcı'ya sunulur.
      </p>
      <p className={styles.paragraph}>
        <strong>4.3.</strong> Alıcı'ya, siparişi tamamlamadan önce satın alma
        işlemine ilişkin ödeme yükümlülüğü açıkça bildirilir.
      </p>
      <h2 className={styles.sectionHeading}>5. ÜRÜN VE SİPARİŞ BİLGİLERİ</h2>
      <p className={styles.paragraph}>
        <strong>5.1.</strong> Sözleşme konusu ürünün türü, miktarı, temel
        özellikleri ve satış bedeli aşağıdaki gibidir:
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
            </Fragment>
          ))}
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
          <tr>
            <th scope="row">Sipariş Tarihi</th>
            <td>{data.order.date}</td>
          </tr>
        </tbody>
      </table>
      <p className={styles.paragraph}>
        Birden fazla ürün satın alınması halinde her ürün, miktarı ve bedeliyle
        birlikte sipariş dökümünde ayrıca gösterilir.
      </p>
      <p className={styles.paragraph}>
        <strong>5.2.</strong> Siparişe ilişkin fiyatlar ve varsa kargo
        masrafları, Alıcı'nın ödeme yükümlülüğü altına girmesinden önce açıkça
        gösterilir.
      </p>
      <p className={styles.paragraph}>
        <strong>5.3.</strong> Nihai ödeme tutarı; ürün bedeli, geçerli vergiler,
        indirimler ve varsa teslimat masraflarından oluşur. Alıcı'nın açıkça
        onaylamadığı ek bir ödeme tahsil edilmez.
      </p>
      <h2 className={styles.sectionHeading}>6. ÖDEME KOŞULLARI</h2>
      <p className={styles.paragraph}>
        <strong>6.1.</strong> Alıcı, satın aldığı ürünün toplam bedelini Site
        üzerinden yönlendirildiği güvenli ödeme sayfasında sunulan ödeme
        yöntemlerinden biriyle öder.
      </p>
      <p className={styles.paragraph}>
        <strong>6.2.</strong> Ödeme işlemleri, Shopify altyapısı ve ilgili ödeme
        hizmet sağlayıcısı üzerinden gerçekleştirilir.
      </p>
      <p className={styles.paragraph}>
        <strong>6.3.</strong> Ödeme işleminin tamamlanamaması veya ilgili banka
        ya da ödeme hizmet sağlayıcısı tarafından reddedilmesi halinde sipariş
        tamamlanmaz.
      </p>
      <p className={styles.paragraph}>
        <strong>6.4.</strong> Satıcı, siparişin işleme alınmasını ödemenin
        başarıyla tamamlanması koşuluna bağlayabilir.
      </p>
      <p className={styles.paragraph}>
        <strong>6.5.</strong> Alıcı'nın tüketici mevzuatından kaynaklanan
        hakları saklıdır.
      </p>
      <h2 className={styles.sectionHeading}>7. TESLİMAT KOŞULLARI</h2>
      <h3 className={styles.subHeading}>7.1. Basılı Dergi Teslimatı</h3>
      <p className={styles.paragraph}>
        <strong>7.1.1.</strong> Basılı dergiler, Alıcı'nın sipariş sırasında
        belirttiği teslimat adresine, sipariş sırasında bildirilen teslimat
        yöntemiyle gönderilir.
      </p>
      <p className={styles.paragraph}>
        <strong>7.1.2.</strong> Teslimat süresi, ürünün yayın ve gönderim
        durumuna bağlı olarak sipariş öncesinde Alıcı'ya bildirilir. Mevzuatta
        öngörülen istisnalar dışında, mal satışlarında teslimat süresi otuz günü
        aşamaz.
      </p>
      <p className={styles.paragraph}>
        <strong>7.1.3.</strong> Ürün henüz yayımlanmamışsa, satış sayfasında
        belirtilen yayın ve teslimat bilgileri esas alınır. Ön sipariş niteliği
        taşıyan ürünlerin teslimat koşulları Alıcı'ya ayrıca ve açıkça
        bildirilir.
      </p>
      <p className={styles.paragraph}>
        <strong>7.1.4.</strong> Satıcı, ürünün Alıcı'ya veya Alıcı tarafından
        belirlenen üçüncü kişiye teslimine kadar meydana gelen kayıp ve
        hasarlardan, mevzuatta belirtilen istisnalar saklı kalmak üzere
        sorumludur.
      </p>
      <p className={styles.paragraph}>
        <strong>7.1.5.</strong> Alıcı'nın hatalı veya eksik adres bildirmesi
        nedeniyle teslimatın gerçekleştirilememesi durumunda Taraflar, sorunun
        çözümü için iletişime geçer. Bu durum, Alıcı'nın kanuni haklarını
        ortadan kaldırmaz.
      </p>
      <h3 className={styles.subHeading}>7.2. Dijital İçerik Teslimatı</h3>
      <p className={styles.paragraph}>
        <strong>7.2.1.</strong> Dijital yayınlar, PDF formatında elektronik
        ortamda sunulur.
      </p>
      <p className={styles.paragraph}>
        <strong>7.2.2.</strong> Dijital içeriğe erişim yöntemi ve erişimin
        başlayacağı tarih veya süre, satın alma öncesinde Alıcı'ya bildirilir.
      </p>
      <p className={styles.paragraph}>
        <strong>7.2.3.</strong> Dijital içeriğin indirilmesi veya görüntülenmesi
        için internet bağlantısı ve PDF formatını destekleyen uygun bir cihaz
        veya yazılım gerekebilir.
      </p>
      <p className={styles.paragraph}>
        <strong>7.2.4.</strong> Dijital içeriğin teknik bir sorun nedeniyle
        erişilememesi halinde Alıcı, Satıcı ile iletişime geçerek sorunun
        giderilmesini talep edebilir.
      </p>
      <p className={styles.paragraph}>
        <strong>7.2.5.</strong> Basılı ve dijital yayını birlikte içeren
        paketlerde, her ürünün teslimatı kendi niteliğine uygun şekilde
        gerçekleştirilir.
      </p>
      <h2 className={styles.sectionHeading}>8. CAYMA HAKKI</h2>
      <p className={styles.paragraph}>
        <strong>8.1.</strong> Kanunda ve Yönetmelik'te düzenlenen istisnalar
        saklı kalmak üzere Alıcı, mesafeli sözleşmeden on dört gün içerisinde
        herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma
        hakkına sahiptir.
      </p>
      <p className={styles.paragraph}>
        <strong>8.2.</strong> Cayma hakkı süresi, mal satışlarında Alıcı'nın
        veya Alıcı tarafından belirlenen üçüncü kişinin malı teslim aldığı gün;
        hizmet sözleşmelerinde ise sözleşmenin kurulduğu gün başlar.
      </p>
      <p className={styles.paragraph}>
        <strong>8.3.</strong> Alıcı, cayma hakkının mevcut olduğu hallerde,
        malın tesliminden önce de bu hakkını kullanabilir.
      </p>
      <p className={styles.paragraph}>
        <strong>8.4.</strong> Cayma hakkının kullanılabilmesi için Alıcı'nın bu
        yöndeki açık bildirimini yasal süre içerisinde Satıcı'ya yöneltmesi
        yeterlidir.
      </p>
      <p className={styles.paragraph}>
        Cayma ve iade talepleri aşağıdaki iletişim adresinden iletilebilir:
      </p>
      <p className={styles.paragraph}>
        <strong>{data.seller.supportEmail}</strong>
      </p>
      <p className={styles.paragraph}>
        <strong>8.5.</strong> Cayma hakkının geçerli olduğu bir satın alma
        işleminde Alıcı, cayma bildirimini takip eden on dört gün içerisinde
        ürünü Satıcı'ya geri göndermekle yükümlüdür.
      </p>
      <p className={styles.paragraph}>
        <strong>8.6.</strong> İadelerde kullanılacak taşıyıcı ve gönderim
        bilgileri, cayma hakkının uygulanabildiği ürünler bakımından Ön
        Bilgilendirme Formu'nda belirtilir. Mevzuata uygun şekilde belirtilen
        taşıyıcının kullanılması halinde iade gönderim masrafları Alıcı'ya
        yüklenmez.
      </p>
      <p className={styles.paragraph}>
        <strong>8.7.</strong> Cayma hakkının kullanıldığı durumlarda, Satıcı,
        Yönetmelik'te belirtilen süreler ve koşullar çerçevesinde, varsa ilk
        teslimat masrafları dahil olmak üzere tahsil edilen ödemeleri Alıcı'ya
        iade eder.
      </p>
      <p className={styles.paragraph}>
        <strong>8.8.</strong> Geri ödeme, mevzuatta aksi öngörülmedikçe
        Alıcı'nın satın alma sırasında kullandığı ödeme aracına uygun şekilde ve
        Alıcı'ya ek masraf yüklenmeden yapılır.
      </p>
      <h2 className={styles.sectionHeading}>9. CAYMA HAKKININ İSTİSNALARI</h2>
      <p className={styles.paragraph}>
        <strong>9.1.</strong> Yönetmelik'in 15. maddesi uyarınca belirli ürün ve
        hizmetlerde cayma hakkı bulunmamaktadır.
      </p>
      <h3 className={styles.subHeading}>9.2. Basılı Dergiler</h3>
      <p className={styles.paragraph}>
        Abonelik sözleşmesi kapsamında sağlananlar dışında, gazete ve dergi gibi
        süreli yayınların teslimine ilişkin sözleşmelerde Yönetmelik'in 15/1-f
        maddesi uyarınca cayma hakkı kullanılamaz.
      </p>
      <p className={styles.paragraph}>
        Abonelik sözleşmesi kapsamında sağlanan basılı dergiler bakımından ise
        bu istisna uygulanmaz.
      </p>
      <h3 className={styles.subHeading}>9.3. Dijital Yayınlar</h3>
      <p className={styles.paragraph}>
        Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında
        teslim edilen gayrimaddi mallara ilişkin sözleşmelerde Yönetmelik'in
        15/1-ğ maddesi uyarınca cayma hakkı kullanılamaz.
      </p>
      <p className={styles.paragraph}>
        Bu istisna, satın alınan dijital yayının gerçekten anında teslim
        edildiği durumlarda uygulanır.
      </p>
      <h3 className={styles.subHeading}>
        9.4. Basılı ve Dijital İçeriği Birlikte İçeren Paketler
      </h3>
      <p className={styles.paragraph}>
        Basılı ve dijital ürünleri birlikte içeren paketlerde, cayma hakkının
        uygulanabilirliği ürünlerin niteliği, teslim şekli ve satın alma
        ilişkisinin hukuki niteliği dikkate alınarak ilgili mevzuat çerçevesinde
        değerlendirilir.
      </p>
      <h3 className={styles.subHeading}>9.5. Kanuni Hakların Saklılığı</h3>
      <p className={styles.paragraph}>
        Cayma hakkına ilişkin istisnalar, ayıplı mal veya hizmete ilişkin
        tüketici haklarını ortadan kaldırmaz.
      </p>
      <h2 className={styles.sectionHeading}>10. GENEL HÜKÜMLER</h2>
      <p className={styles.paragraph}>
        <strong>10.1.</strong> Satıcı, sözleşme konusu ürünleri siparişte
        belirtilen temel özelliklere ve ilgili mevzuata uygun şekilde sunmakla
        yükümlüdür.
      </p>
      <p className={styles.paragraph}>
        <strong>10.2.</strong> Satıcı'nın siparişi taahhüt edilen süre
        içerisinde yerine getirmemesi halinde Alıcı, mevzuatta öngörülen
        şartlarla sözleşmeyi feshedebilir.
      </p>
      <p className={styles.paragraph}>
        <strong>10.3.</strong> Sözleşme konusu ürünün tesliminin veya ifasının
        imkânsızlaşması halinde Satıcı, bu durumu öğrendiği tarihten itibaren üç
        gün içerisinde Alıcı'yı yazılı olarak veya kalıcı veri saklayıcısıyla
        bilgilendirir ve tahsil edilen bedelleri mevzuatta belirtilen süre
        içerisinde iade eder.
      </p>
      <p className={styles.paragraph}>
        <strong>10.4.</strong> Ürünün stokta bulunmaması tek başına ifanın
        imkânsızlaşması olarak kabul edilmez.
      </p>
      <p className={styles.paragraph}>
        <strong>10.5.</strong> Alıcı, sipariş sırasında verdiği iletişim ve
        teslimat bilgilerinin doğru ve güncel olmasından sorumludur.
      </p>
      <p className={styles.paragraph}>
        <strong>10.6.</strong> Ürünlerin ayıplı olması halinde Alıcı'nın Kanun
        kapsamında sahip olduğu seçimlik haklar saklıdır.
      </p>
      <p className={styles.paragraph}>
        <strong>10.7.</strong> Satıcı, Alıcı'nın açık onayı olmaksızın sipariş
        konusu ürünü farklı bir ürünle değiştiremez.
      </p>
      <h2 className={styles.sectionHeading}>11. KİŞİSEL VERİLERİN KORUNMASI</h2>
      <p className={styles.paragraph}>
        <strong>11.1.</strong> Alıcı'nın sipariş işlemleri kapsamında paylaştığı
        kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu ve
        ilgili mevzuata uygun olarak işlenir.
      </p>
      <p className={styles.paragraph}>
        <strong>11.2.</strong> Kişisel veriler, siparişin alınması, ödemenin
        gerçekleştirilmesi, ürünün teslim edilmesi, faturalandırma ve müşteri
        destek süreçlerinin yürütülmesi gibi amaçlarla, hukuka uygun işleme
        şartları çerçevesinde kullanılabilir.
      </p>
      <p className={styles.paragraph}>
        <strong>11.3.</strong> Siparişin yerine getirilmesi için gerekli
        veriler; ödeme hizmet sağlayıcıları, e-ticaret altyapısı sağlayıcıları,
        kargo şirketleri ve diğer ilgili hizmet sağlayıcılarıyla mevzuata uygun
        şekilde paylaşılabilir.
      </p>
      <p className={styles.paragraph}>
        <strong>11.4.</strong> Kişisel verilerin işlenmesine ilişkin ayrıntılı
        bilgilere Site'de yayımlanan Gizlilik Politikası ve KVKK Aydınlatma
        Metni üzerinden ulaşılabilir.
      </p>
      <p className={styles.paragraph}>
        <strong>11.5.</strong> Pazarlama amaçlı elektronik ticari ileti
        gönderimi, ilgili mevzuat uyarınca gerekli olduğu hallerde Alıcı'nın
        ayrıca alınan onayına tabidir.
      </p>
      <h2 className={styles.sectionHeading}>12. FİKRİ MÜLKİYET HAKLARI</h2>
      <p className={styles.paragraph}>
        <strong>12.1.</strong> Press Magazine kapsamında yayımlanan metinler,
        fotoğraflar, görseller, tasarımlar ve diğer içerikler üzerindeki fikri
        mülkiyet hakları ilgili hak sahiplerine aittir.
      </p>
      <p className={styles.paragraph}>
        <strong>12.2.</strong> Dijital yayınların satın alınması, Alıcı'ya
        içerik üzerinde mülkiyet hakkı veya üçüncü kişilere ticari amaçlarla
        dağıtım yetkisi vermez.
      </p>
      <p className={styles.paragraph}>
        <strong>12.3.</strong> Alıcı, satın aldığı dijital içeriği kişisel ve
        ticari olmayan amaçlarla kullanabilir. Kanunen izin verilen kullanımlar
        ve hak sahiplerince açıkça verilen izinler saklıdır.
      </p>
      <p className={styles.paragraph}>
        <strong>12.4.</strong> İçeriklerin izinsiz çoğaltılması, ticari
        amaçlarla dağıtılması veya yeniden satışa sunulması, ilgili mevzuat
        kapsamında hak ihlaline yol açabilir.
      </p>
      <h2 className={styles.sectionHeading}>13. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
      <p className={styles.paragraph}>
        <strong>13.1.</strong> İşbu Sözleşme'den kaynaklanan uyuşmazlıklarda
        Türkiye Cumhuriyeti'nin ilgili tüketici mevzuatı uygulanır. Yabancı
        ülkelerde yerleşik tüketicilerin emredici mevzuattan doğan hakları
        saklıdır.
      </p>
      <p className={styles.paragraph}>
        <strong>13.2.</strong> Alıcı, yürürlükteki parasal sınırlar ve yetki
        kuralları çerçevesinde Tüketici Hakem Heyetlerine başvurabilir.
      </p>
      <p className={styles.paragraph}>
        <strong>13.3.</strong> Tüketici mahkemelerinin görev alanına giren
        uyuşmazlıklarda, kanunen öngörülen dava şartı arabuluculuk hükümleri
        saklıdır.
      </p>
      <p className={styles.paragraph}>
        <strong>13.4.</strong> Alıcı, talep ve şikâyetlerini öncelikle
        Satıcı'nın işbu Sözleşme'de belirtilen iletişim adreslerine iletebilir.
        Bu hüküm, Alıcı'nın doğrudan kanuni başvuru yollarını kullanmasına engel
        değildir.
      </p>
      <h2 className={styles.sectionHeading}>14. YÜRÜRLÜK</h2>
      <p className={styles.paragraph}>
        <strong>14.1.</strong> İşbu Sözleşme, Alıcı'nın Site üzerinden Sözleşme
        ve Ön Bilgilendirme Formu'nu inceleyip ilgili onayları vermesi ve
        siparişin tamamlanmasıyla elektronik ortamda kurulur.
      </p>
      <p className={styles.paragraph}>
        <strong>14.2.</strong> Sözleşmenin kurulmasına ilişkin elektronik
        kayıtlar, yürürlükteki mevzuata uygun şekilde saklanır.
      </p>
      <p className={styles.paragraph}>
        <strong>14.3.</strong> İşbu Sözleşme'de düzenlenmeyen hususlarda Kanun,
        Yönetmelik ve ilgili diğer mevzuat hükümleri uygulanır.
      </p>
      <p className={styles.paragraph}>
        <strong>Sözleşme Versiyonu:</strong> {data.legalDocumentsVersion}
      </p>
      <p className={styles.paragraph}>
        <strong>Sözleşme Tarihi:</strong> {data.agreementDate}
      </p>
      <p className={styles.paragraph}>
        <strong>SATICI:</strong> {data.seller.legalName}
      </p>
      <p className={styles.paragraph}>
        <strong>ALICI:</strong> {data.buyer.fullName}
      </p>
    </div>
  );
}
