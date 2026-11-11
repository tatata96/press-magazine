/* eslint-disable react/no-unescaped-entities -- legal text with apostrophes, kept as written */
import {Fragment} from "react";
import type {PreInformationData} from "@/lib/legal/agreement-data";
import styles from "../legal-document.module.scss";

// Pre-Contractual Information Form (Turkish Regulation on Distance Contracts, art. 5).
// Statements that repeat the Distance Sales Agreement use its wording. Values in braces come
// from `data`.
export default function PreInformationEn({data}: {data: PreInformationData}) {
  return (
    <div className={styles.document}>
      <p className={styles.paragraph}>
        This Pre-Contractual Information Form is provided to the Buyer before an order is placed and
        before the Distance Sales Agreement is concluded, in accordance with Turkish Consumer
        Protection Law No. 6502 and the Regulation on Distance Contracts. It should be read together
        with the Distance Sales Agreement.
      </p>

      <h2 className={styles.sectionHeading}>1. SELLER INFORMATION</h2>
      <ul className={styles.details}>
        <li><strong>Legal Name:</strong> {data.seller.legalName}</li>
        <li><strong>Address:</strong> {data.seller.address}</li>
        <li><strong>Tax Identification Number:</strong> {data.seller.taxNumber}</li>
        <li><strong>Phone:</strong> {data.seller.phone}</li>
        <li><strong>Email:</strong> {data.seller.email}</li>
        <li><strong>Website:</strong> www.pressmagazine.com.tr</li>
      </ul>
      <p className={styles.paragraph}>
        Complaints, requests and withdrawal notices may be sent to the address above or to {data.seller.supportEmail}.
      </p>

      <h2 className={styles.sectionHeading}>2. BUYER INFORMATION</h2>
      <ul className={styles.details}>
        <li><strong>Full Name:</strong> {data.buyer.fullName}</li>
        <li><strong>Email:</strong> {data.buyer.email}</li>
        <li><strong>Phone:</strong> {data.buyer.phone}</li>
        <li><strong>Country:</strong> {data.buyer.country}</li>
        <li><strong>Shipping Address:</strong> {data.buyer.shippingAddress}</li>
        <li><strong>Billing Address:</strong> {data.buyer.billingAddress}</li>
      </ul>

      <h2 className={styles.sectionHeading}>3. ESSENTIAL CHARACTERISTICS OF THE PRODUCT</h2>
      <p className={styles.paragraph}>
        The Products covered by the order are as follows. Where multiple Products are purchased, each
        Product is listed separately together with its quantity and price.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Information</th>
            <th scope="col">Details</th>
          </tr>
        </thead>
        <tbody>
          {/* One group of rows per cart line. */}
          {data.products.map((product, index) => (
            <Fragment key={index}>
              <tr className={index > 0 ? styles.tableGroupStart : undefined}>
                <th scope="row">Product Name</th>
                <td>{product.name}</td>
              </tr>
              <tr>
                <th scope="row">Product Type</th>
                <td>{product.type}</td>
              </tr>
              <tr>
                <th scope="row">Quantity</th>
                <td>{product.quantity}</td>
              </tr>
              <tr>
                <th scope="row">Unit Price</th>
                <td>{product.unitPrice}</td>
              </tr>
              <tr>
                <th scope="row">Product Total</th>
                <td>{product.totalPrice}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      <p className={styles.paragraph}>Paid products offered for sale fall into the following categories:</p>
      <ul className={styles.bullets}>
        <li><strong>Digital Publication:</strong> A digital edition of Press Magazine in PDF format.</li>
        <li><strong>Print + Digital Publication:</strong> A physical copy of Press Magazine together with digital PDF versions of the same issues.</li>
      </ul>
      <p className={styles.paragraph}>
        Unless expressly stated otherwise on the product page, purchases are subject to a one-time
        payment. Packages do not renew automatically, and no additional payment will be charged at the
        end of the package period.
      </p>

      <h2 className={styles.sectionHeading}>4. PRICE, TAXES AND PAYMENT</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Information</th>
            <th scope="col">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Subtotal</th>
            <td>{data.order.subtotal}</td>
          </tr>
          <tr>
            <th scope="row">Discount</th>
            <td>{data.order.discount}</td>
          </tr>
          <tr>
            <th scope="row">Tax Amount</th>
            <td>{data.order.taxAmount}</td>
          </tr>
          <tr>
            <th scope="row">Shipping / Delivery</th>
            <td>{data.order.shippingCost}</td>
          </tr>
          <tr>
            <th scope="row"><strong>Total Amount</strong></th>
            <td><strong>{data.order.total}</strong></td>
          </tr>
          <tr>
            <th scope="row">Currency</th>
            <td>{data.order.currency}</td>
          </tr>
          <tr>
            <th scope="row">Payment Method</th>
            <td>{data.order.paymentMethod}</td>
          </tr>
        </tbody>
      </table>
      <p className={styles.paragraph}>
        The delivery cost, taxes and total shown are estimates made by Shopify for your cart and are not
        final. The final amounts are determined at Shopify checkout.
      </p>
      <p className={styles.paragraph}>
        Placing an order entails an obligation to pay. No additional payment is collected without the
        Buyer's express consent. Payment is made on the secure checkout page reached through the Website,
        using Shopify infrastructure and the relevant payment service provider; the accepted payment
        methods are presented on that page.
      </p>

      <h2 className={styles.sectionHeading}>5. DELIVERY CONDITIONS</h2>
      <h3 className={styles.subHeading}>5.1. Delivery of Printed Magazines (Print + Digital Publication)</h3>
      <p className={styles.paragraph}>
        Printed magazines are shipped to the delivery address provided by the Buyer during checkout using
        the delivery method specified at the time of purchase.
      </p>
      <ul className={styles.details}>
        <li><strong>Delivery Address:</strong> {data.buyer.shippingAddress}</li>
        <li><strong>Delivery Period:</strong> {data.terms.physicalDeliveryTime}</li>
        <li><strong>Delivery Cost:</strong> {data.order.shippingCost}</li>
      </ul>
      <p className={styles.paragraph}>
        Except where permitted by applicable legislation, delivery of physical goods shall not exceed
        thirty days.
      </p>
      <h3 className={styles.subHeading}>5.2. Delivery of Digital Content (Digital Publication and Print + Digital Publication)</h3>
      <p className={styles.paragraph}>Digital publications are provided electronically in PDF format.</p>
      <ul className={styles.details}>
        <li><strong>Access Method and Timing:</strong> {data.terms.digitalAccess}</li>
        <li>
          <strong>Technical Requirements:</strong> Downloading or viewing Digital Content may require an
          internet connection and a compatible device or software capable of opening PDF files.
        </li>
        <li><strong>Technical Protection Measures:</strong> {data.terms.digitalProtection}</li>
      </ul>

      <h2 className={styles.sectionHeading}>6. RIGHT OF WITHDRAWAL</h2>
      <p className={styles.paragraph}>
        Subject to the exceptions provided under the Law and the Regulation, the Buyer has the right to
        withdraw from a distance contract within fourteen (14) days without providing any reason and
        without incurring a penalty.
      </p>
      <p className={styles.paragraph}>
        For contracts concerning the sale of goods, the withdrawal period begins on the date the Buyer or
        a third party designated by the Buyer receives the goods. For service contracts, the period begins
        on the date the contract is concluded.
      </p>
      <p className={styles.paragraph}>
        To exercise the right of withdrawal, the Buyer must notify the Seller of their decision through an
        explicit statement within the statutory withdrawal period. The notice may be sent to:
      </p>
      <ul className={styles.details}>
        <li><strong>Email:</strong> {data.seller.supportEmail}</li>
        <li><strong>Address:</strong> {data.seller.address}</li>
      </ul>
      <p className={styles.paragraph}>
        Where the right of withdrawal applies, the Buyer must return the Product to the Seller within
        fourteen (14) days following the withdrawal notification.
      </p>
      <ul className={styles.details}>
        <li><strong>Return Carrier and Return Shipping Cost:</strong> {data.terms.returnCarrier}</li>
      </ul>
      <p className={styles.paragraph}>
        Where the right of withdrawal is exercised, the Seller shall refund the payments received,
        including initial delivery costs where applicable, within the periods and under the conditions
        prescribed by the Regulation. Unless otherwise provided by applicable legislation, refunds shall
        be made using the same payment method used by the Buyer for the original transaction, without
        imposing additional costs on the Buyer.
      </p>

      <h2 className={styles.sectionHeading}>7. WHEN THE RIGHT OF WITHDRAWAL CANNOT BE EXERCISED</h2>
      <p className={styles.paragraph}>
        Under Article 15 of the Regulation, the right of withdrawal does not apply to certain categories
        of goods and services. The exceptions below apply only where their conditions are met; they do
        not apply to every order.
      </p>
      <ul className={styles.bullets}>
        <li>
          <strong>Printed magazines:</strong> Pursuant to Article 15/1(f) of the Regulation, the right of
          withdrawal does not apply to contracts concerning the delivery of newspapers, periodicals, or
          magazines, except where they are supplied under a subscription agreement. This exception does
          not apply to printed magazines supplied under a subscription agreement.
        </li>
        <li>
          <strong>Digital publications:</strong> Pursuant to Article 15/1(ğ) of the Regulation, the right
          of withdrawal does not apply to contracts concerning services performed instantly in an
          electronic environment or intangible goods delivered instantly to the consumer. This exception
          applies where the purchased Digital Content is actually delivered instantly.
        </li>
        <li>
          <strong>Packages combining printed and digital publications:</strong> The applicability of the
          right of withdrawal is determined in accordance with the relevant legislation, taking into
          account the nature of the Products, their delivery methods, and the legal nature of the purchase
          arrangement.
        </li>
      </ul>
      <p className={styles.paragraph}>
        Exceptions to the right of withdrawal do not limit or eliminate the Buyer's statutory rights
        concerning defective goods or services.
      </p>

      <h2 className={styles.sectionHeading}>8. COMPLAINTS AND DISPUTE RESOLUTION</h2>
      <p className={styles.paragraph}>
        The Buyer may submit requests and complaints directly to the Seller using the contact details
        above. This does not restrict the Buyer's right to pursue statutory remedies directly.
      </p>
      <p className={styles.paragraph}>
        The Buyer may apply to the competent Consumer Arbitration Committees or Consumer Courts in
        accordance with the monetary thresholds and jurisdictional rules in force at the relevant time.
        For disputes falling within the jurisdiction of Consumer Courts, any mandatory mediation
        requirements prescribed by law shall apply.
      </p>

      <h2 className={styles.sectionHeading}>9. CONFIRMATION</h2>
      <p className={styles.paragraph}>
        By ticking the relevant box during the ordering process, the Buyer confirms having read and
        accepted this Pre-Contractual Information Form and the Distance Sales Agreement.
      </p>
      <p className={styles.paragraph}>
        <strong>Form Date:</strong> {data.agreementDate}
      </p>
    </div>
  );
}
