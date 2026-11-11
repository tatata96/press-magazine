/* eslint-disable react/no-unescaped-entities -- the legal text is kept exactly as supplied, apostrophes included */
import {Fragment} from "react";
import type {AgreementData} from "@/lib/legal/agreement-data";
import styles from "../legal-document.module.scss";

// Distance Sales Agreement, English text exactly as supplied. Only the values in braces come
// from `data`; do not reword the text without approval.
export default function AgreementEn({data}: {data: AgreementData}) {
  return (
    <div className={styles.document}>
      <h2 className={styles.sectionHeading}>1. PARTIES</h2>
      <p className={styles.paragraph}>
        This Distance Sales Agreement is entered into electronically between the Seller, whose details are provided below, and the Buyer purchasing products through the website www.pressmagazine.com.tr.
      </p>
      <p className={styles.paragraph}>
        <strong>1.1. SELLER INFORMATION</strong>
      </p>
      <ul className={styles.details}>
        <li><strong>Legal Name:</strong> {data.seller.legalName}</li>
        <li><strong>Address:</strong> {data.seller.address}</li>
        <li><strong>Tax Identification Number:</strong> {data.seller.taxNumber}</li>
        <li><strong>Phone:</strong> {data.seller.phone}</li>
        <li><strong>Email:</strong> {data.seller.email}</li>
        <li><strong>Website:</strong> www.pressmagazine.com.tr</li>
      </ul>
      <p className={styles.paragraph}>
        <strong>1.2. BUYER INFORMATION</strong>
      </p>
      <ul className={styles.details}>
        <li><strong>Full Name:</strong> {data.buyer.fullName}</li>
        <li><strong>Email:</strong> {data.buyer.email}</li>
        <li><strong>Phone:</strong> {data.buyer.phone}</li>
        <li><strong>Country:</strong> {data.buyer.country}</li>
        <li><strong>Shipping Address:</strong> {data.buyer.shippingAddress}</li>
        <li><strong>Billing Address:</strong> {data.buyer.billingAddress}</li>
      </ul>
      <p className={styles.paragraph}>
        The Buyer and Seller shall hereinafter be referred to collectively as the “Parties” and individually as a “Party”.
      </p>
      <h2 className={styles.sectionHeading}>2. DEFINITIONS</h2>
      <p className={styles.paragraph}>
        For the purposes of this Agreement:
      </p>
      <p className={styles.paragraph}>
        <strong>Buyer:</strong> A consumer purchasing products for purposes outside their trade, business, or profession.
      </p>
      <p className={styles.paragraph}>
        <strong>Seller:</strong> The natural or legal person offering Press Magazine products for sale, whose details are provided in Article 1.
      </p>
      <p className={styles.paragraph}>
        <strong>Website:</strong> The website operating at www.pressmagazine.com.tr.
      </p>
      <p className={styles.paragraph}>
        <strong>Product:</strong> Printed editions of Press Magazine, digital PDF publications, and packages combining these products offered for sale through the Website.
      </p>
      <p className={styles.paragraph}>
        <strong>Digital Content:</strong> Press Magazine publications provided electronically in PDF format for viewing or downloading.
      </p>
      <p className={styles.paragraph}>
        <strong>Law:</strong> Turkish Consumer Protection Law No. 6502.
      </p>
      <p className={styles.paragraph}>
        <strong>Regulation:</strong> The Turkish Regulation on Distance Contracts.
      </p>
      <p className={styles.paragraph}>
        <strong>Pre-Contractual Information Form:</strong> The document containing information about the products and terms of sale, provided to the Buyer before the conclusion of the Agreement.
      </p>
      <h2 className={styles.sectionHeading}>3. SUBJECT AND SCOPE OF THE AGREEMENT</h2>
      <p className={styles.paragraph}>
        <strong>3.1.</strong> This Agreement governs the rights and obligations of the Parties concerning the sale, payment, and delivery of Press Magazine products ordered electronically by the Buyer through the Website.
      </p>
      <p className={styles.paragraph}>
        <strong>3.2.</strong> This Agreement has been prepared in accordance with the Law and the Regulation.
      </p>
      <p className={styles.paragraph}>
        <strong>3.3.</strong> Before placing an order, the Buyer shall be informed of the essential characteristics of the Product, its price, payment and delivery conditions, the right of withdrawal, and any applicable exceptions.
      </p>
      <p className={styles.paragraph}>
        <strong>3.4.</strong> Paid products offered through the Website may fall into the following categories:
      </p>
      <ul className={styles.bullets}>
        <li><strong>Digital Publication:</strong> A digital edition of Press Magazine in PDF format.</li>
        <li><strong>Print + Digital Publication:</strong> A physical copy of Press Magazine together with a digital PDF version of the same issue.</li>
      </ul>
      <p className={styles.paragraph}>
        <strong>3.5.</strong> Press Magazine is published twice a year. Unless otherwise stated on the relevant product page, a package covering a six-month period includes one issue published during that period.
      </p>
      <p className={styles.paragraph}>
        <strong>3.6.</strong> Unless expressly stated otherwise on the product page, purchases are subject to a one-time payment. Packages do not renew automatically, and no additional payment will be charged at the end of the package period.
      </p>
      <h2 className={styles.sectionHeading}>4. PRE-CONTRACTUAL INFORMATION PROVIDED TO THE BUYER</h2>
      <p className={styles.paragraph}>
        <strong>4.1.</strong> Before placing an order, the Buyer shall be informed of the following:
      </p>
      <p className={styles.paragraph}>
        a) The essential characteristics and scope of the Product,
      </p>
      <p className={styles.paragraph}>
        b) The Seller's legal name, address, and contact information,
      </p>
      <p className={styles.paragraph}>
        c) The total purchase price, including all applicable taxes,
      </p>
      <p className={styles.paragraph}>
        d) Any shipping, delivery, or additional charges,
      </p>
      <p className={styles.paragraph}>
        e) Accepted payment methods,
      </p>
      <p className={styles.paragraph}>
        f) Delivery methods and estimated delivery times,
      </p>
      <p className={styles.paragraph}>
        g) Delivery and access conditions for Digital Content,
      </p>
      <p className={styles.paragraph}>
        h) Whether the right of withdrawal applies, including its conditions and exceptions,
      </p>
      <p className={styles.paragraph}>
        i) Return and refund conditions,
      </p>
      <p className={styles.paragraph}>
        j) Available procedures for complaints and dispute resolution,
      </p>
      <p className={styles.paragraph}>
        k) Technical requirements that may affect the use of Digital Content.
      </p>
      <p className={styles.paragraph}>
        <strong>4.2.</strong> This information shall be made available to the Buyer through the product pages, order summary, Pre-Contractual Information Form, and this Agreement.
      </p>
      <p className={styles.paragraph}>
        <strong>4.3.</strong> Before completing the order, the Buyer shall be clearly informed that placing the order entails an obligation to pay.
      </p>
      <h2 className={styles.sectionHeading}>5. PRODUCT AND ORDER INFORMATION</h2>
      <p className={styles.paragraph}>
        <strong>5.1.</strong> The type, quantity, essential characteristics, and purchase price of the Products covered by this Agreement are as follows:
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
            </Fragment>
          ))}
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
          <tr>
            <th scope="row">Order Date</th>
            <td>{data.order.date}</td>
          </tr>
        </tbody>
      </table>
      <p className={styles.paragraph}>
        Where multiple Products are purchased, each Product shall be listed separately in the order summary together with its quantity and price.
      </p>
      <p className={styles.paragraph}>
        <strong>5.2.</strong> Product prices and any applicable shipping charges shall be clearly displayed before the Buyer becomes obligated to pay.
      </p>
      <p className={styles.paragraph}>
        <strong>5.3.</strong> The final payable amount consists of the Product price, applicable taxes, discounts, and any delivery charges. No additional payment shall be collected without the Buyer's express consent.
      </p>
      <h2 className={styles.sectionHeading}>6. PAYMENT TERMS</h2>
      <p className={styles.paragraph}>
        <strong>6.1.</strong> The Buyer shall pay the total amount for the purchased Products using one of the payment methods available on the secure checkout page accessed through the Website.
      </p>
      <p className={styles.paragraph}>
        <strong>6.2.</strong> Payment transactions are processed through Shopify infrastructure and the relevant payment service provider.
      </p>
      <p className={styles.paragraph}>
        <strong>6.3.</strong> If a payment cannot be completed or is rejected by the relevant bank or payment service provider, the order shall not be completed.
      </p>
      <p className={styles.paragraph}>
        <strong>6.4.</strong> The Seller may make order processing conditional upon successful completion of the payment.
      </p>
      <p className={styles.paragraph}>
        <strong>6.5.</strong> The Buyer's statutory consumer rights shall remain unaffected.
      </p>
      <h2 className={styles.sectionHeading}>7. DELIVERY CONDITIONS</h2>
      <h3 className={styles.subHeading}>7.1. Delivery of Printed Publications</h3>
      <p className={styles.paragraph}>
        <strong>7.1.1.</strong> Printed magazines shall be shipped to the delivery address provided by the Buyer during checkout using the delivery method specified at the time of purchase.
      </p>
      <p className={styles.paragraph}>
        <strong>7.1.2.</strong> The delivery period shall be communicated to the Buyer before purchase, taking into account the publication and shipping status of the Product. Except where permitted by applicable legislation, delivery of physical goods shall not exceed thirty days.
      </p>
      <p className={styles.paragraph}>
        <strong>7.1.3.</strong> If the Product has not yet been published, the publication and delivery information stated on the product page shall apply. The delivery conditions of pre-ordered Products shall be separately and clearly communicated to the Buyer.
      </p>
      <p className={styles.paragraph}>
        <strong>7.1.4.</strong> The Seller shall be responsible for loss of or damage to the Product until it is delivered to the Buyer or a third party designated by the Buyer, subject to exceptions provided by applicable legislation.
      </p>
      <p className={styles.paragraph}>
        <strong>7.1.5.</strong> If delivery cannot be completed due to an incorrect or incomplete address provided by the Buyer, the Parties shall communicate to resolve the issue. This shall not eliminate the Buyer's statutory rights.
      </p>
      <h3 className={styles.subHeading}>7.2. Delivery of Digital Content</h3>
      <p className={styles.paragraph}>
        <strong>7.2.1.</strong> Digital publications shall be provided electronically in PDF format.
      </p>
      <p className={styles.paragraph}>
        <strong>7.2.2.</strong> The method of accessing Digital Content and the date or period when access will become available shall be communicated to the Buyer before purchase.
      </p>
      <p className={styles.paragraph}>
        <strong>7.2.3.</strong> Downloading or viewing Digital Content may require an internet connection and a compatible device or software capable of opening PDF files.
      </p>
      <p className={styles.paragraph}>
        <strong>7.2.4.</strong> If Digital Content cannot be accessed due to a technical issue, the Buyer may contact the Seller to request that the issue be resolved.
      </p>
      <p className={styles.paragraph}>
        <strong>7.2.5.</strong> For packages combining printed and digital publications, each Product shall be delivered according to its respective nature and delivery conditions.
      </p>
      <h2 className={styles.sectionHeading}>8. RIGHT OF WITHDRAWAL</h2>
      <p className={styles.paragraph}>
        <strong>8.1.</strong> Subject to the exceptions provided under the Law and the Regulation, the Buyer has the right to withdraw from a distance contract within fourteen (14) days without providing any reason and without incurring a penalty.
      </p>
      <p className={styles.paragraph}>
        <strong>8.2.</strong> For contracts concerning the sale of goods, the withdrawal period begins on the date the Buyer or a third party designated by the Buyer receives the goods. For service contracts, the period begins on the date the contract is concluded.
      </p>
      <p className={styles.paragraph}>
        <strong>8.3.</strong> Where the right of withdrawal applies, the Buyer may exercise this right before the goods are delivered.
      </p>
      <p className={styles.paragraph}>
        <strong>8.4.</strong> To exercise the right of withdrawal, the Buyer must notify the Seller of their decision through an explicit statement within the statutory withdrawal period.
      </p>
      <p className={styles.paragraph}>
        Withdrawal and return requests may be submitted to:
      </p>
      <p className={styles.paragraph}>
        <strong>{data.seller.supportEmail}</strong>
      </p>
      <p className={styles.paragraph}>
        <strong>8.5.</strong> Where the right of withdrawal applies, the Buyer must return the Product to the Seller within fourteen (14) days following the withdrawal notification.
      </p>
      <p className={styles.paragraph}>
        <strong>8.6.</strong> The designated carrier and return shipping instructions shall be specified in the Pre-Contractual Information Form for Products eligible for withdrawal. Where the designated carrier is used in accordance with applicable legislation, return shipping costs shall not be charged to the Buyer.
      </p>
      <p className={styles.paragraph}>
        <strong>8.7.</strong> Where the right of withdrawal is exercised, the Seller shall refund the payments received, including initial delivery costs where applicable, within the periods and under the conditions prescribed by the Regulation.
      </p>
      <p className={styles.paragraph}>
        <strong>8.8.</strong> Unless otherwise provided by applicable legislation, refunds shall be made using the same payment method used by the Buyer for the original transaction, without imposing additional costs on the Buyer.
      </p>
      <h2 className={styles.sectionHeading}>9. EXCEPTIONS TO THE RIGHT OF WITHDRAWAL</h2>
      <p className={styles.paragraph}>
        <strong>9.1.</strong> Under Article 15 of the Regulation, the right of withdrawal does not apply to certain categories of goods and services.
      </p>
      <h3 className={styles.subHeading}>9.2. Printed Magazines</h3>
      <p className={styles.paragraph}>
        Pursuant to Article 15/1(f) of the Regulation, the right of withdrawal does not apply to contracts concerning the delivery of newspapers, periodicals, or magazines, except where they are supplied under a subscription agreement.
      </p>
      <p className={styles.paragraph}>
        This exception does not apply to printed magazines supplied under a subscription agreement.
      </p>
      <h3 className={styles.subHeading}>9.3. Digital Publications</h3>
      <p className={styles.paragraph}>
        Pursuant to Article 15/1(ğ) of the Regulation, the right of withdrawal does not apply to contracts concerning services performed instantly in an electronic environment or intangible goods delivered instantly to the consumer.
      </p>
      <p className={styles.paragraph}>
        This exception applies where the purchased Digital Content is actually delivered instantly.
      </p>
      <h3 className={styles.subHeading}>9.4. Packages Combining Printed and Digital Publications</h3>
      <p className={styles.paragraph}>
        For packages containing both printed and digital Products, the applicability of the right of withdrawal shall be determined in accordance with the relevant legislation, taking into account the nature of the Products, their delivery methods, and the legal nature of the purchase arrangement.
      </p>
      <h3 className={styles.subHeading}>9.5. Preservation of Statutory Rights</h3>
      <p className={styles.paragraph}>
        Exceptions to the right of withdrawal do not limit or eliminate the Buyer's statutory rights concerning defective goods or services.
      </p>
      <h2 className={styles.sectionHeading}>10. GENERAL PROVISIONS</h2>
      <p className={styles.paragraph}>
        <strong>10.1.</strong> The Seller is responsible for providing the Products in accordance with the essential characteristics stated in the order and applicable legislation.
      </p>
      <p className={styles.paragraph}>
        <strong>10.2.</strong> If the Seller fails to fulfil the order within the agreed period, the Buyer may terminate the Agreement under the conditions prescribed by applicable legislation.
      </p>
      <p className={styles.paragraph}>
        <strong>10.3.</strong> If delivery or performance of the contractual obligation becomes impossible, the Seller shall notify the Buyer in writing or through a durable medium within three (3) days of becoming aware of the situation and refund the amounts collected within the statutory period.
      </p>
      <p className={styles.paragraph}>
        <strong>10.4.</strong> The fact that a Product is out of stock shall not, by itself, constitute impossibility of performance.
      </p>
      <p className={styles.paragraph}>
        <strong>10.5.</strong> The Buyer is responsible for ensuring that the contact and delivery information provided when placing an order is accurate and up to date.
      </p>
      <p className={styles.paragraph}>
        <strong>10.6.</strong> The Buyer's statutory remedies under the Law in relation to defective Products shall remain unaffected.
      </p>
      <p className={styles.paragraph}>
        <strong>10.7.</strong> The Seller shall not substitute the ordered Product with another Product without the Buyer's express consent.
      </p>
      <h2 className={styles.sectionHeading}>11. PROTECTION OF PERSONAL DATA</h2>
      <p className={styles.paragraph}>
        <strong>11.1.</strong> Personal data provided by the Buyer during the ordering process shall be processed in accordance with Turkish Personal Data Protection Law No. 6698 and other applicable legislation.
      </p>
      <p className={styles.paragraph}>
        <strong>11.2.</strong> Personal data may be processed for purposes including order processing, payment administration, Product delivery, invoicing, and customer support, subject to applicable lawful grounds for processing.
      </p>
      <p className={styles.paragraph}>
        <strong>11.3.</strong> Where necessary to fulfil an order, relevant personal data may be shared with payment service providers, e-commerce infrastructure providers, shipping companies, and other relevant service providers in accordance with applicable legislation.
      </p>
      <p className={styles.paragraph}>
        <strong>11.4.</strong> Further information regarding the processing of personal data is available in the Privacy Policy and Personal Data Protection Information Notice published on the Website.
      </p>
      <p className={styles.paragraph}>
        <strong>11.5.</strong> The sending of commercial electronic communications for marketing purposes shall be subject to the Buyer's separately obtained consent where required under applicable legislation.
      </p>
      <h2 className={styles.sectionHeading}>12. INTELLECTUAL PROPERTY RIGHTS</h2>
      <p className={styles.paragraph}>
        <strong>12.1.</strong> All intellectual property rights relating to texts, photographs, illustrations, designs, and other content published by Press Magazine belong to their respective rights holders.
      </p>
      <p className={styles.paragraph}>
        <strong>12.2.</strong> Purchasing a digital publication does not transfer ownership of intellectual property rights or grant the Buyer the right to commercially distribute the content to third parties.
      </p>
      <p className={styles.paragraph}>
        <strong>12.3.</strong> The Buyer may use purchased Digital Content for personal, non-commercial purposes. Uses permitted by law and permissions expressly granted by the relevant rights holders shall remain unaffected.
      </p>
      <p className={styles.paragraph}>
        <strong>12.4.</strong> Unauthorized reproduction, commercial distribution, or resale of the content may constitute an infringement of intellectual property rights under applicable legislation.
      </p>
      <h2 className={styles.sectionHeading}>13. DISPUTE RESOLUTION</h2>
      <p className={styles.paragraph}>
        <strong>13.1.</strong> Disputes arising from this Agreement shall be governed by the relevant consumer protection legislation of the Republic of Türkiye. Mandatory consumer rights applicable in the country of residence of consumers located abroad shall remain unaffected.
      </p>
      <p className={styles.paragraph}>
        <strong>13.2.</strong> The Buyer may apply to the competent Consumer Arbitration Committees in accordance with the monetary thresholds and jurisdictional rules in force at the relevant time.
      </p>
      <p className={styles.paragraph}>
        <strong>13.3.</strong> For disputes falling within the jurisdiction of Consumer Courts, any mandatory mediation requirements prescribed by law shall apply.
      </p>
      <p className={styles.paragraph}>
        <strong>13.4.</strong> The Buyer may submit requests and complaints directly to the Seller using the contact details provided in this Agreement. This provision does not restrict the Buyer's right to pursue statutory remedies directly.
      </p>
      <h2 className={styles.sectionHeading}>14. ENTRY INTO FORCE</h2>
      <p className={styles.paragraph}>
        <strong>14.1.</strong> This Agreement shall be concluded electronically when the Buyer has reviewed the Agreement and the Pre-Contractual Information Form, provided the relevant confirmations through the Website, and completed the order.
      </p>
      <p className={styles.paragraph}>
        <strong>14.2.</strong> Electronic records relating to the conclusion of this Agreement shall be retained in accordance with applicable legislation.
      </p>
      <p className={styles.paragraph}>
        <strong>14.3.</strong> Matters not expressly addressed in this Agreement shall be governed by the Law, the Regulation, and other applicable legislation.
      </p>
      <p className={styles.paragraph}>
        <strong>Agreement Version:</strong> {data.legalDocumentsVersion}
      </p>
      <p className={styles.paragraph}>
        <strong>Agreement Date:</strong> {data.agreementDate}
      </p>
      <p className={styles.paragraph}>
        <strong>SELLER:</strong> {data.seller.legalName}
      </p>
      <p className={styles.paragraph}>
        <strong>BUYER:</strong> {data.buyer.fullName}
      </p>
    </div>
  );
}
