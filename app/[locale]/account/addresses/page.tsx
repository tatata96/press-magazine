import {Suspense} from "react";
import {getLocale, getTranslations} from "next-intl/server";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import {getCustomer} from "@/lib/customer-account/customer";
import {loadAsCustomer} from "@/lib/customer-account/guard";
import {getSellingCountryCodes} from "@/lib/shopify/countries";
import AddressBook, {type BookAddress} from "../AddressBook";
import styles from "../account.module.scss";

async function AddressesContent() {
  const t = await getTranslations("Account");
  const locale = await getLocale();
  const data = await loadAsCustomer({locale, returnTo: "/account/addresses"}, async (accessToken) => {
    const [customer, countryCodes] = await Promise.all([
      getCustomer(accessToken),
      getSellingCountryCodes(),
    ]);

    return {customer, countryCodes};
  });

  if (!data || !data.countryCodes) {
    return <p role="alert" className={styles.message}>{t("loadError")}</p>;
  }

  const {customer, countryCodes} = data;
  const regionNames = new Intl.DisplayNames([locale], {type: "region"});
  const countryName = (code: string) => regionNames.of(code) ?? code;
  const addresses: BookAddress[] = customer.addresses.map((address) => ({
    id: address.id,
    lines: [
      address.address1,
      address.address2,
      `${address.zip} ${address.city}`.trim(),
      countryName(address.countryCode),
    ].filter(Boolean),
    isDefault: address.id === customer.defaultAddressId,
    values: {
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      zip: address.zip,
      countryCode: address.countryCode,
    },
  }));

  return (
    <section className={styles.section} aria-labelledby="addresses-heading">
      <h2 id="addresses-heading" className={`type-mono ${styles.sectionHeading}`}>
        {t("addressesHeading")}
      </h2>
      <AddressBook
        addresses={addresses}
        countries={countryCodes.map((code) => ({code, name: countryName(code)}))}
      />
    </section>
  );
}

export default async function AddressesPage() {
  const t = await getTranslations("Account");

  return (
    <Suspense fallback={<LoadingScreen label={t("loading")} />}>
      <AddressesContent />
    </Suspense>
  );
}
