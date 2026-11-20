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

  const name = `${customer.firstName} ${customer.lastName}`.trim();

  return (
    <section className={styles.section} aria-labelledby="profile-heading">
      <h2 id="profile-heading" className={`type-mono ${styles.sectionHeading}`}>
        {t("profileHeading")}
      </h2>
      <dl className={styles.summary}>
        <div>
          <dt>{t("firstName")} / {t("lastName")}</dt>
          <dd>{name || t("notSet")}</dd>
        </div>
        <div>
          <dt>{t("email")}</dt>
          <dd>{customer.email ?? t("notSet")}</dd>
        </div>
        <div>
          <dt>{t("phone")}</dt>
          <dd>{customer.phone ?? t("notSet")}</dd>
        </div>
      </dl>
      <p className={styles.note}>{t("emailNote")}</p>
      <ProfileForm firstName={customer.firstName} lastName={customer.lastName} />
    </section>
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
