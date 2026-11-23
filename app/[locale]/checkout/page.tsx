import {Suspense} from "react";
import type {Metadata} from "next";
import {getLocale, getTranslations} from "next-intl/server";
import {Link, redirect} from "../../../i18n/navigation";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import {getCustomer, type Customer} from "@/lib/customer-account/customer";
import {getCartWithCheckoutContext} from "@/lib/shopify/cart";
import {getSellingCountryCodes} from "@/lib/shopify/countries";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import {getPageMetadata} from "@/lib/seo";
import type {PostalAddress} from "../buyer-details/buyer-details";
import detailsStyles from "../buyer-details/buyer-details.module.scss";
import {parseCheckoutSelection, resolveBuyerDetails} from "../buyer-details/checkout-selection";
import CartLines from "../cart/CartLines";
import PaymentMethods from "../cart/PaymentMethods";
import {readCheckoutInputs} from "../cart/checkout-state";
import cartStyles from "../cart/cart.module.scss";
import CheckoutReview from "./CheckoutReview";

type CheckoutPageProps = {
  searchParams: Promise<{shipping?: string | string[]; billing?: string | string[]}>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CheckoutPage");

  return {
    ...(await getPageMetadata({
      title: t("metaTitle"),
      description: t("metaDescription"),
      path: "/checkout",
    })),
    robots: {index: false, follow: false},
  };
}

function firstValue(value: string | string[] | undefined): string | null {
  const first = Array.isArray(value) ? value[0] : value;

  return first ? first : null;
}

// Step 2 of checkout: read-only details, consent and the hand-off to Shopify. Anything that
// does not fit (no cart, signed out, details that no longer match the account) goes back to
// the cart page, which already knows how to handle each case.
async function CheckoutContent({searchParams}: CheckoutPageProps) {
  const t = await getTranslations("CartPage");
  const detailsT = await getTranslations("BuyerDetails");
  const locale = await getLocale();
  const {cartId, session} = await readCheckoutInputs();
  const params = await searchParams;

  if (!isLegalContentPublishable() || session.status !== "active") {
    redirect({href: "/cart", locale});
  }

  let current: Awaited<ReturnType<typeof getCartWithCheckoutContext>>;
  let countryCodes: string[] | null;
  let customer: Customer | null = null;

  try {
    [current, countryCodes] = await Promise.all([
      cartId ? getCartWithCheckoutContext(cartId) : null,
      getSellingCountryCodes(),
    ]);

    if (session.status === "active") {
      customer = await getCustomer(session.accessToken);
    }
  } catch (error) {
    console.error(
      "Could not load checkout:",
      error instanceof Error ? error.message : "unknown error",
    );

    return <p role="alert" className={cartStyles.message}>{t("loadError")}</p>;
  }

  if (!current || current.cart.lines.length === 0 || !customer || !countryCodes) {
    redirect({href: "/cart", locale});

    return null;
  }

  const {cart, context} = current;
  const shippingId = firstValue(params.shipping);
  const billingId = firstValue(params.billing);
  const selection = parseCheckoutSelection({
    // The account's phone first (that is where edits are stored), then this order's.
    phone: customer.phone || context.buyer.phone || "",
    shippingAddressId: context.requiresShipping ? shippingId : null,
    billingAddressId: billingId,
  });
  const resolution = selection
    ? resolveBuyerDetails({
        profile: customer,
        addresses: customer.addresses,
        selection,
        requiresShipping: context.requiresShipping,
        allowedCountryCodes: countryCodes,
      })
    : null;

  if (!selection || !resolution?.ok) {
    redirect({href: "/cart", locale});

    return null;
  }

  const {details} = resolution;
  const regionNames = new Intl.DisplayNames([locale], {type: "region"});
  const formatAddress = (address: PostalAddress) =>
    [
      address.address1,
      address.address2,
      `${address.zip} ${address.city}`.trim(),
      regionNames.of(address.countryCode) ?? address.countryCode,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <div className={cartStyles.layout}>
      <section className={cartStyles.details} aria-labelledby="checkout-details-heading">
        <h2 id="checkout-details-heading" className={`type-mono ${detailsStyles.legend}`}>
          {detailsT("contact")}
        </h2>
        <dl className={detailsStyles.summary}>
          <div>
            <dt>{detailsT("name")}</dt>
            <dd>{`${details.firstName} ${details.lastName}`}</dd>
          </div>
          <div>
            <dt>{detailsT("email")}</dt>
            <dd>{details.email}</dd>
          </div>
          <div>
            <dt>{detailsT("phone")}</dt>
            <dd>{details.phone}</dd>
          </div>
          {details.shippingAddress ? (
            <div>
              <dt>{detailsT("shippingHeading")}</dt>
              <dd>{formatAddress(details.shippingAddress)}</dd>
            </div>
          ) : null}
          <div>
            <dt>{detailsT("billingHeading")}</dt>
            <dd>
              {details.billingAddress
                ? formatAddress(details.billingAddress)
                : detailsT("billingSame")}
            </dd>
          </div>
        </dl>
        <Link href="/cart" className={cartStyles.link}>{detailsT("edit")}</Link>
      </section>
      <aside className={cartStyles.order}>
        <h2 className={`type-mono ${cartStyles.sectionHeading} ${cartStyles.orderHeading}`}>
          {t("orderHeading")}
        </h2>
        <CartLines
          cart={cart}
          locale={locale}
          readOnly
          copy={{
            itemsLabel: t("itemsLabel"),
            quantity: t("quantity"),
            decrease: t("decrease"),
            increase: t("increase"),
            remove: t("remove"),
            updating: t("updating"),
            subtotal: t("subtotal"),
            updateError: t("updateError"),
          }}
        />
        <CheckoutReview
          selection={selection}
          paymentMethods={<PaymentMethods />}
        />
      </aside>
    </div>
  );
}

export default async function CheckoutPage({searchParams}: CheckoutPageProps) {
  const t = await getTranslations("CheckoutPage");
  const cartT = await getTranslations("CartPage");

  return (
    <main className={cartStyles.main}>
      <h1 className={cartStyles.heading}>{t("heading")}</h1>
      <Suspense fallback={<LoadingScreen label={cartT("loading")} />}>
        <div className={cartStyles.reveal}>
          <CheckoutContent searchParams={searchParams} />
        </div>
      </Suspense>
    </main>
  );
}
