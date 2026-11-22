import {Suspense} from "react";
import {getLocale, getTranslations} from "next-intl/server";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import {getCustomer} from "@/lib/customer-account/customer";
import {loadAsCustomer} from "@/lib/customer-account/guard";
import ProfileForm from "./ProfileForm";
import styles from "./account.module.scss";

async function ProfileContent() {
  const t = await getTranslations("Account");
  const locale = await getLocale();
  const customer = await loadAsCustomer({locale, returnTo: "/account"}, getCustomer);

  if (!customer) {
    return <p role="alert" className={styles.message}>{t("loadError")}</p>;
  }

  return (
    <div className={styles.section}>
      <ProfileForm
        firstName={customer.firstName}
        lastName={customer.lastName}
        phone={customer.phone ?? ""}
        email={customer.email ?? ""}
      />
    </div>
  );
}

export default async function AccountPage() {
  const t = await getTranslations("Account");

  return (
    <Suspense fallback={<LoadingScreen label={t("loading")} />}>
      <ProfileContent />
    </Suspense>
  );
}
