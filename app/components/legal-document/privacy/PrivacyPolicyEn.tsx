/* eslint-disable react/no-unescaped-entities -- legal text with apostrophes, kept as supplied */
import styles from "../legal-document.module.scss";
import privacy from "./privacy.module.scss";

// Privacy Policy, English text as supplied. Do not reword without approval.
export default function PrivacyPolicyEn() {
  return (
    <div className={privacy.sections}>
      <p className={privacy.updated}>Last Updated: November 11, 2026</p>

      <section>
        <h2 className={styles.sectionHeading}>1. Introduction</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            At Press Magazine, we value the privacy and security of our visitors' and customers' personal information.
          </p>
          <p className={styles.paragraph}>
            This Privacy Policy explains what personal information we collect through www.pressmagazine.com.tr, how we use it, who we share it with, and how we protect it.
          </p>
          <p className={styles.paragraph}>
            Your personal information is processed in accordance with Turkish Personal Data Protection Law No. 6698 (KVKK) and other applicable laws.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>2. Data Controller</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>The company responsible for processing your personal information is:</p>
          <ul className={styles.details}>
            <li><span className={privacy.lead}>Legal Name:</span> SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ</li>
            <li><span className={privacy.lead}>Address:</span> Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş, Istanbul, Türkiye</li>
            <li><span className={privacy.lead}>Tax Identification Number:</span> 7610578558</li>
            <li><span className={privacy.lead}>Email:</span> hello@septembercompany.com</li>
            <li><span className={privacy.lead}>Website:</span> www.pressmagazine.com.tr</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>3. What Information Do We Collect?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            We collect certain personal information when you visit our website, subscribe to our newsletter, or make a purchase.
          </p>

          <h3 className={privacy.subHeading}>Newsletter Subscriptions</h3>
          <p className={styles.paragraph}>When you subscribe to our newsletter, we collect:</p>
          <ul className={styles.bullets}>
            <li>Email address</li>
            <li>First and last name (optional)</li>
            <li>Year of birth (optional)</li>
            <li>Country (optional)</li>
          </ul>
          <p className={styles.paragraph}>
            We use this information to manage your subscription and, within the scope of your communication preferences and permissions, keep you informed about new issues, content, and announcements from Press Magazine.
          </p>

          <h3 className={privacy.subHeading}>Purchases and Orders</h3>
          <p className={styles.paragraph}>When you purchase a product through our website, we process:</p>
          <ul className={styles.bullets}>
            <li>First and last name</li>
            <li>Email address and phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Products purchased</li>
            <li>Order and payment transaction details</li>
          </ul>
          <p className={styles.paragraph}>
            We use this information to process your order, complete payments, deliver products, and contact you when necessary.
          </p>
          <p className={styles.paragraph}>
            Payments are processed through secure payment platforms. Press Magazine does not store your full credit card number or card security code (CVV).
          </p>

          <h3 className={privacy.subHeading}>Technical Information</h3>
          <p className={styles.paragraph}>
            When you use our website, technical information such as your IP address, browser and device details, connection records, and security logs may also be processed.
          </p>
          <p className={styles.paragraph}>
            We use this information to maintain website security, identify technical issues, and ensure that our services function properly.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>4. Why Do We Use Your Information, and What Are the Legal Grounds?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            We process personal information only for specific purposes and where a valid legal basis applies.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Orders and deliveries:</span> We use the information necessary to process your purchases, deliver your products, and provide customer support. This processing is based on the necessity of establishing or performing a contract under Article 5/2(c) of the KVKK.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Invoicing and legal obligations:</span> We retain certain information to issue invoices, maintain accounting records, and comply with our legal obligations. This processing is based on Article 5/2(ç) of the KVKK.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Communication and support:</span> We use the information you share with us to respond to your questions, requests, and complaints. Depending on the circumstances, this processing may be necessary for performing a contract or establishing, exercising, or protecting legal rights.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Newsletter:</span> We use your information to manage your subscription and send you emails about our publications within the scope of your permissions. Where required, marketing communications are based on your explicit consent and permission to receive commercial electronic messages.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Website security:</span> We process necessary technical information to maintain system security and prevent misuse. Where the relevant conditions are met, this processing is based on our legitimate interests under Article 5/2(f) of the KVKK.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>5. Who Do We Share Your Information With?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            We work with certain service providers to operate our website and deliver our services.
          </p>
          <p className={styles.paragraph}>These may include:</p>
          <ul className={styles.bullets}>
            <li><span className={privacy.lead}>Shopify:</span> E-commerce infrastructure, order management, and newsletter services.</li>
            <li><span className={privacy.lead}>Vercel:</span> Website hosting and technical infrastructure.</li>
            <li><span className={privacy.lead}>Payment service providers:</span> Secure payment processing.</li>
            <li><span className={privacy.lead}>Shipping companies:</span> Delivery of printed magazines.</li>
            <li><span className={privacy.lead}>Accounting and other authorized service providers:</span> Invoicing and compliance with legal obligations.</li>
          </ul>
          <p className={styles.paragraph}>
            We share personal information only to the extent necessary to provide the relevant services and in accordance with applicable laws.
          </p>
          <p className={styles.paragraph}>
            Information may also be shared with authorized public authorities where legally required.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>6. International Data Transfers</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Some of the technology services used by Press Magazine are provided from outside Türkiye.
          </p>
          <p className={styles.paragraph}>
            As a result, depending on the service, your personal information may be processed on servers located outside Türkiye or transferred to service providers operating internationally.
          </p>
          <p className={styles.paragraph}>
            International transfers of personal data are carried out in accordance with Article 9 of the KVKK and the applicable legal safeguards.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>7. Cookies</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            We use cookies to ensure that essential website features and shopping functions work properly.
          </p>
          <p className={styles.paragraph}>
            Cookies are small files stored in your browser that allow certain information to be remembered.
          </p>
          <p className={styles.paragraph}>The main cookies used on our website are:</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Cookie</th>
                <th scope="col">Purpose</th>
                <th scope="col">Retention Period</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code className={privacy.cookie}>press_cart_id</code></td>
                <td>Remembers your shopping cart</td>
                <td>10 days</td>
              </tr>
              <tr>
                <td><code className={privacy.cookie}>press_buyer_details</code></td>
                <td>Temporarily stores certain information entered during checkout</td>
                <td>48 hours</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.paragraph}>
            The cookie containing buyer information is encrypted and configured to prevent direct access by JavaScript running in your browser.
          </p>
          <p className={styles.paragraph}>
            When you proceed to Shopify's checkout page, Shopify and the relevant payment service providers may use additional cookies to operate and secure their services.
          </p>
          <p className={styles.paragraph}>
            If we introduce non-essential analytics or marketing cookies, we will obtain your prior consent where required.
          </p>
          <p className={styles.paragraph}>
            You can delete or block cookies through your browser settings. However, disabling certain cookies may affect essential website features, such as the shopping cart.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>8. How Long Do We Keep Your Information?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            We retain your personal information only for as long as necessary for the purposes for which it was collected and in accordance with applicable legal retention requirements.
          </p>
          <p className={styles.paragraph}>
            Order and invoice information is retained for the periods required by relevant laws.
          </p>
          <p className={styles.paragraph}>
            Newsletter subscription information may be retained while your subscription and valid processing purposes continue. Unsubscribing stops marketing emails, although records required by law may be retained for the applicable period.
          </p>
          <p className={styles.paragraph}>
            When the retention period expires and no valid legal basis for processing remains, your personal information is deleted, destroyed, or anonymized in accordance with applicable laws.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>9. How Do We Protect Your Information?</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            We take appropriate technical and organizational measures to protect personal information against unauthorized access, loss, and misuse.
          </p>
          <p className={styles.paragraph}>
            Our website uses secure connections. Order and payment transactions are handled through the security systems of the relevant service providers.
          </p>
          <p className={styles.paragraph}>
            However, no transmission of information over the internet can be guaranteed to be completely risk-free.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>10. Your Personal Data Rights</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Under Article 11 of the KVKK, you have certain rights regarding your personal information.
          </p>
          <p className={styles.paragraph}>These include the right to:</p>
          <ul className={styles.bullets}>
            <li>Learn whether your personal information is being processed and request information about such processing.</li>
            <li>Learn why your information is processed and whether it is used for its intended purposes.</li>
            <li>Learn which third parties have received your information.</li>
            <li>Request the correction of incomplete or inaccurate information.</li>
            <li>Request the deletion or destruction of your information where the legal conditions are met.</li>
            <li>Request that corrections, deletions, or destruction of your information be communicated to third parties to whom it has been transferred.</li>
            <li>Object to decisions made solely through automated analysis that produce an unfavorable result concerning you.</li>
            <li>Request compensation if you suffer damage as a result of unlawful processing of your personal information.</li>
          </ul>
          <p className={styles.paragraph}>
            You can contact us using the application methods prescribed by applicable legislation to exercise these rights.
          </p>
          <p className={styles.paragraph}>
            <span className={privacy.lead}>Email:</span> hello@septembercompany.com
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>11. Changes to This Privacy Policy</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            We may update this Privacy Policy to reflect changes in our services or applicable laws.
          </p>
          <p className={styles.paragraph}>
            The latest version will always be available at www.pressmagazine.com.tr.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>12. Contact</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            If you have any questions about this Privacy Policy or how your personal information is processed, please contact us.
          </p>
          <p className={styles.paragraph}>
            <strong>SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ</strong>
          </p>
          <p className={styles.paragraph}>
            Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş, Istanbul, Türkiye
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
