import {Suspense} from "react";
import type {Metadata} from "next";
import Image from "next/image";
import {redirect} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {Link} from "../../../i18n/navigation";
import {getPageMetadata} from "@/lib/seo";
import buttonStyles from "@/app/components/button/button.module.scss";
import {getCustomer, type Customer} from "@/lib/customer-account/customer";
import {getLoginPath, getRefreshPath} from "@/lib/customer-account/links";
import {CustomerSessionExpiredError} from "@/lib/customer-account/types";
import {getCartWithCheckoutContext} from "@/lib/shopify/cart";
import {formatMoney} from "@/lib/shopify/money";
import {OFFERED_PLAN_IDS} from "@/lib/shopify/plan-products";
import {getPlanProducts} from "@/lib/shopify/products";
import {getSellingCountryCodes} from "@/lib/shopify/countries";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import type {AddressView} from "../buyer-details/AddressChooser";
import CheckoutDetails from "../buyer-details/CheckoutDetails";
import CartLines from "./CartLines";
import PaymentMethods from "./PaymentMethods";
import {readCheckoutInputs} from "./checkout-state";
import styles from "./cart.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CartPage");

  return {
    ...(await getPageMetadata({
      title: t("metaTitle"),
      description: t("metaDescription"),
      path: "/cart",
    })),
    // The cart is personal and not worth indexing.
    robots: {index: false, follow: false},
  };
}

async function CartContent() {
  const t = await getTranslations("CartPage");
  const detailsT = await getTranslations("BuyerDetails");
  const locale = await getLocale();
  // Keep request-time cookie reads outside catch blocks for Cache Components.
  const {cartId, session} = await readCheckoutInputs();
  const checkoutEnabled = isLegalContentPublishable();
  let current: Awaited<ReturnType<typeof getCartWithCheckoutContext>>;
  let countryCodes: string[] | null;

  try {
    [current, countryCodes] = await Promise.all([
      cartId ? getCartWithCheckoutContext(cartId) : null,
      checkoutEnabled ? getSellingCountryCodes() : Promise.resolve(null),
    ]);
  } catch (error) {
    console.error(
      "Could not load cart:",
      error instanceof Error ? error.message : "unknown error",
    );

    return <p role="alert" className={styles.message}>{t("loadError")}</p>;
  }

  if (!current || current.cart.lines.length === 0) {
    const plansT = await getTranslations("SubscribePage");
    const plansResult = await getPlanProducts();

    return (
      <div className={styles.empty}>
        <p className={styles.message}>{t("empty")}</p>
        {/* Names come from the Subscribe copy; prices stay Shopify's. Hidden if they failed to load. */}
        {plansResult.status === "ok" && (
          <ul className={styles.plans}>
            {OFFERED_PLAN_IDS.map((id) => {
              const product = plansResult.products[id];

              return (
                <li key={id}>
                  <Link href="/subscribe" className={styles.plan}>
                    {product?.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt=""
                        width={400}
                        height={500}
                        sizes="(min-width: 768px) 30vw, 45vw"
                        className={styles.planImage}
                      />
                    ) : (
                      <span className={styles.planImage} aria-hidden="true" />
                    )}
                    <span className={styles.planName}>{plansT(`plans.${id}.name`)}</span>
                    {product && (
                      <span className={styles.planPrice}>
                        {formatMoney(product.price, locale)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href="/subscribe"
          className={`${buttonStyles.button} type-label ${styles.signInButton}`}
        >
          {t("browseShop")}
        </Link>
      </div>
    );
  }

  const {cart, context} = current;
  const orderSummary = (
    <>
      <h2 className={`type-mono ${styles.sectionHeading} ${styles.orderHeading}`}>
        {t("orderHeading")}
      </h2>
      <CartLines
        cart={cart}
        locale={locale}
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
    </>
  );

  if (!checkoutEnabled) {
    return (
      <section className={styles.order}>
        {orderSummary}
        <p role="status" className={styles.message}>{t("checkoutUnavailable")}</p>
        <PaymentMethods />
      </section>
    );
  }

  // Browsing and the cart need no account; checking out does.
  if (session.status === "signed_out") {
    return (
      <div className={styles.layout}>
        <section className={styles.details} aria-labelledby="sign-in-heading">
          <h2 id="sign-in-heading" className={`type-mono ${styles.sectionHeading}`}>
            {t("signInHeading")}
          </h2>
          <div className={styles.signIn}>
            <p className={styles.message}>{t("signInBody")}</p>
            {/* A plain link: the auth routes are not locale-prefixed pages. */}
            <a
              href={getLoginPath({locale})}
              className={`${buttonStyles.button} type-label ${styles.signInButton}`}
            >
              {t("signIn")}
            </a>
          </div>
        </section>
        <aside className={styles.order}>{orderSummary}</aside>
      </div>
    );
  }

  // Pages cannot set cookies, so the auth route renews the session and comes back here.
  if (session.status === "expired") {
    redirect(getRefreshPath({locale}));
  }

  if (!countryCodes || countryCodes.length === 0) {
    return <p role="alert" className={styles.message}>{detailsT("loadError")}</p>;
  }

  let customer: Customer | null = null;
  let sessionExpired = false;

  try {
    customer = await getCustomer(session.accessToken);
  } catch (error) {
    sessionExpired = error instanceof CustomerSessionExpiredError;

    if (!sessionExpired) {
      console.error(
        "Could not load customer:",
        error instanceof Error ? error.message : "unknown error",
      );
    }
  }

  if (sessionExpired) {
    redirect(getRefreshPath({locale}));
  }

  if (!customer) {
    return <p role="alert" className={styles.message}>{detailsT("loadError")}</p>;
  }

  const regionNames = new Intl.DisplayNames([locale], {type: "region"});
  // Addresses the shop cannot sell to are left out: they could not be used for this order.
  const addresses: AddressView[] = customer.addresses
    .filter((address) => countryCodes.includes(address.countryCode))
    .map((address) => ({
      id: address.id,
      label: [
        address.address1,
        address.address2,
        `${address.zip} ${address.city}`.trim(),
        regionNames.of(address.countryCode) ?? address.countryCode,
      ]
        .filter(Boolean)
        .join(", "),
      isDefault: address.id === customer.defaultAddressId,
    }));
  const preselectedAddress = addresses.find((address) => address.isDefault) ?? addresses[0];

  return (
    <CheckoutDetails
      requiresShipping={context.requiresShipping}
      countries={countryCodes.map((code) => ({code, name: regionNames.of(code) ?? code}))}
      customer={{
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email ?? "",
        phone: customer.phone ?? "",
      }}
      addresses={addresses}
      defaults={{
        // The account's phone first (that is where edits are stored), then this order's.
        phone: customer.phone || context.buyer.phone || "",
        addressId: preselectedAddress?.id ?? null,
      }}
      orderSummary={orderSummary}
    />
  );
}

export default async function CartPage() {
  const t = await getTranslations("CartPage");

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t("heading")}</h1>
      <Suspense fallback={<LoadingScreen label={t("loading")} />}>
        <div className={styles.reveal}><CartContent /></div>
      </Suspense>
    </main>
  );
}
