import styles from "../legal-document.module.scss";
import page from "./shipping-and-returns.module.scss";

// Shipping & Returns, English text as supplied, revised for the print-only offering (pending
// legal review). Do not reword without approval.
export default function ShippingAndReturnsEn({includesDigitalContent}: {includesDigitalContent: boolean}) {
  // Without the digital delivery section (3), the sections after it move up by one.
  const sectionNumber = (numberWithDigital: number) =>
    includesDigitalContent ? numberWithDigital : numberWithDigital - 1;

  return (
    <div className={page.sections}>
      <p className={page.updated}>Last Updated: November 28, 2026</p>

      <section>
        <h2 className={styles.sectionHeading}>1. General Information</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            This page explains the delivery, return, and refund conditions for printed publications purchased through Press Magazine.
          </p>
          <p className={styles.paragraph}>
            Press Magazine is a biannual cultural publication offered in print.
          </p>
          <p className={styles.paragraph}>
            Product details, prices, and delivery information are provided on the relevant product pages and during the ordering process.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>2. Delivery of Printed Magazines</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Printed magazines are shipped to the delivery address provided during checkout.
          </p>
          <p className={styles.paragraph}>
            Available shipping countries and regions are determined by the delivery options offered during the ordering process.
          </p>
          <p className={styles.paragraph}>
            Delivery times may vary depending on the publication date, product availability, and destination. Applicable delivery information is provided before completing the purchase.
          </p>
          <p className={styles.paragraph}>
            Except where permitted by applicable legislation, the Seller is responsible for delivering the order within the agreed period and no later than 30 days.
          </p>
          <p className={styles.paragraph}>
            For issues that have not yet been published, publication and shipping information will be stated separately on the product page.
          </p>
          <p className={styles.paragraph}>
            If you have any questions about your delivery, please contact us.
          </p>
        </div>
      </section>

      {includesDigitalContent ? (
        <section>
          <h2 className={styles.sectionHeading}>3. Delivery of Digital Publications</h2>
          <div className={styles.document}>
            <p className={styles.paragraph}>Digital publications are provided in PDF format.</p>
            <p className={styles.paragraph}>
              The method of accessing digital content and the date when access becomes available are specified on the product page before purchase.
            </p>
            <p className={styles.paragraph}>
              Viewing or downloading a digital publication may require an internet connection and a compatible device or software capable of opening PDF files.
            </p>
            <p className={styles.paragraph}>
              If you experience difficulties accessing purchased digital content, please contact us at hello@pressmagazine.com.tr.
            </p>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className={styles.sectionHeading}>{sectionNumber(4)}. Shipping Costs</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Shipping costs may vary depending on the delivery address and the contents of the order.
          </p>
          <p className={styles.paragraph}>
            Applicable shipping charges and any additional costs are displayed before payment is completed.
          </p>
          {includesDigitalContent ? (
            <p className={styles.paragraph}>
              Orders containing only digital content do not require physical shipping and are not subject to shipping charges.
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>{sectionNumber(5)}. Returns</h2>
        <div className={styles.document}>
          {includesDigitalContent ? (
            <h3 className={page.subHeading}>Printed Magazines</h3>
          ) : null}
          <p className={styles.paragraph}>
            Under Article 15 of the Turkish Regulation on Distance Contracts, the right of withdrawal does not apply to contracts concerning the delivery of newspapers, periodicals, or magazines, except where they are supplied under a subscription agreement.
          </p>
          {includesDigitalContent ? (
            <>
              <h3 className={page.subHeading}>Digital Publications</h3>
              <p className={styles.paragraph}>
                Digital content delivered instantly in an electronic environment may fall within the statutory exceptions to the right of withdrawal under the Regulation on Distance Contracts.
              </p>
              <p className={styles.paragraph}>
                This exception applies where the digital content is actually delivered instantly.
              </p>

              <h3 className={page.subHeading}>Print + Digital Packages</h3>
              <p className={styles.paragraph}>
                For packages containing both printed and digital publications, the applicability of the right of withdrawal is determined according to the nature of the purchased products and the relevant legal provisions.
              </p>
            </>
          ) : null}
          <p className={styles.paragraph}>
            For return-related inquiries, please contact us at hello@pressmagazine.com.tr. Your statutory consumer rights remain unaffected.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>{sectionNumber(6)}. Contact</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            For questions about shipping, {includesDigitalContent ? "digital access, " : ""}returns, or refunds, please contact us.
          </p>
          <p className={styles.paragraph}>
            <strong>SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ</strong>
          </p>
          <p className={styles.paragraph}>
            Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş, Istanbul, Türkiye
          </p>
          <p className={styles.paragraph}>
            <strong>Email:</strong> hello@pressmagazine.com.tr
          </p>
          <p className={styles.paragraph}>
            <strong>Website:</strong> www.pressmagazine.com.tr
          </p>
          <p className={styles.paragraph}>
            The information on this page does not limit your statutory consumer rights. For detailed purchase conditions, please refer to our Distance Sales Agreement and Pre-Contractual Information Form.
          </p>
        </div>
      </section>
    </div>
  );
}
