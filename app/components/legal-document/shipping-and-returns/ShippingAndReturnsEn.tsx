import styles from "../legal-document.module.scss";
import page from "./shipping-and-returns.module.scss";

// Shipping & Returns, English text as supplied. Do not reword without approval.
export default function ShippingAndReturnsEn() {
  return (
    <div className={page.sections}>
      <p className={page.updated}>Last Updated: November 11, 2026</p>

      <section>
        <h2 className={styles.sectionHeading}>1. General Information</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            This page explains the delivery, return, and refund conditions for printed and digital publications purchased through Press Magazine.
          </p>
          <p className={styles.paragraph}>
            Press Magazine is a biannual cultural publication offering digital PDF editions and print + digital packages.
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
            If you experience difficulties accessing purchased digital content, please contact us at hello@septembercompany.com.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>4. Shipping Costs</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Shipping costs may vary depending on the delivery address and the contents of the order.
          </p>
          <p className={styles.paragraph}>
            Applicable shipping charges and any additional costs are displayed before payment is completed.
          </p>
          <p className={styles.paragraph}>
            Orders containing only digital content do not require physical shipping and are not subject to shipping charges.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>5. Withdrawal and Return Conditions</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Under Turkish Consumer Protection Law No. 6502 and the Regulation on Distance Contracts, consumers generally have the right to withdraw from eligible distance sales contracts within 14 days without providing a reason or incurring a penalty.
          </p>
          <p className={styles.paragraph}>
            However, certain products are subject to statutory exceptions.
          </p>

          <h3 className={page.subHeading}>Printed Magazines</h3>
          <p className={styles.paragraph}>
            Under Article 15 of the Turkish Regulation on Distance Contracts, the right of withdrawal does not apply to contracts concerning the delivery of newspapers, periodicals, or magazines, except where they are supplied under a subscription agreement.
          </p>
          <p className={styles.paragraph}>
            This exception does not apply to products supplied under a subscription agreement. Applicable statutory withdrawal rights remain subject to the legal nature of the purchase.
          </p>

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
          <p className={styles.paragraph}>
            Exceptions to the right of withdrawal do not affect your statutory rights regarding defective or incorrectly supplied products.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>6. How to Request a Return</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Where the right of withdrawal applies, you may submit your request within the statutory period by emailing:
          </p>
          <p className={styles.paragraph}>
            <strong>hello@septembercompany.com</strong>
          </p>
          <p className={styles.paragraph}>
            Including your order number and the product you wish to return will help us process your request more efficiently.
          </p>
          <p className={styles.paragraph}>
            Where the right of withdrawal is exercised, the Product must be returned within 14 days following the withdrawal notification.
          </p>
          <p className={styles.paragraph}>
            The designated return carrier and shipping instructions are specified in the Pre-Contractual Information Form relating to the order.
          </p>
          <p className={styles.paragraph}>
            Return shipping costs are governed by applicable consumer legislation. Costs that cannot legally be charged to the consumer will not be passed on to the customer.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>7. Damaged, Incorrect, or Missing Products</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            If your order arrives damaged, contains an incorrect product, or is incomplete, please contact us.
          </p>
          <p className={styles.paragraph}>
            To help us review the issue more efficiently, you may provide your order number and, where possible, photographs showing the problem.
          </p>
          <p className={styles.paragraph}>
            Your statutory remedies under Turkish Consumer Protection Law No. 6502 regarding defective goods and services remain unaffected.
          </p>
          <p className={styles.paragraph}>
            Exceptions to the right of withdrawal do not limit your statutory rights concerning defective products.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>8. Refunds</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            Where a withdrawal right applies or a refund is otherwise required by law, refunds are processed within the applicable statutory periods.
          </p>
          <p className={styles.paragraph}>
            For goods returned through the exercise of the right of withdrawal, the refund period is determined in accordance with applicable legislation, generally from the date the returned item is handed to the designated carrier or, where applicable, received by the Seller. The applicable statutory refund period is 14 days.
          </p>
          <p className={styles.paragraph}>
            Unless otherwise required by law, refunds are issued using the payment method used for the original purchase, without additional charges to the consumer.
          </p>
          <p className={styles.paragraph}>
            The time it takes for the refund to appear in your bank or card account may vary depending on the processing procedures of the relevant financial institution.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>9. Contact</h2>
        <div className={styles.document}>
          <p className={styles.paragraph}>
            For questions about shipping, digital access, returns, or refunds, please contact us.
          </p>
          <p className={styles.paragraph}>
            <strong>SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ</strong>
          </p>
          <p className={styles.paragraph}>
            Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş, Istanbul, Türkiye
          </p>
          <p className={styles.paragraph}>
            <strong>Email:</strong> hello@septembercompany.com
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
