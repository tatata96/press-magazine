import type {Metadata} from "next";
import {getLocale, getTranslations} from "next-intl/server";
import {formatMoney} from "@/lib/shopify/money";
import {getPlanProducts} from "@/lib/shopify/products";
import {getPageMetadata} from "@/lib/seo";
import SubscribePlans, {type Plan} from "./SubscribePlans";

// Message keys under SubscribePage.plans hold the editorial copy. Prices, variants and
// availability and imagery always come from Shopify (see lib/shopify/products.ts).
function toStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SubscribePage");

  return getPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/subscribe",
  });
}

export default async function SubscribePage() {
  const t = await getTranslations("SubscribePage");
  const locale = await getLocale();
  const result = await getPlanProducts();
  const plans: Plan[] = (["digital", "print"] as const).map((id) => {
    const product = result.status === "ok" ? result.products[id] : null;

    return {
      id,
      image: product?.imageUrl ?? null,
      name: t(`plans.${id}.name`),
      tagline: t(`plans.${id}.tagline`),
      price: product ? formatMoney(product.price, locale) : null,
      variantId: product?.availableForSale ? product.variantId : null,
      benefits: toStrings(t.raw(`plans.${id}.benefits`)),
    };
  });

  return (
    <SubscribePlans
      plans={plans}
      copy={{
        heading: t("heading"),
        lead: t("lead"),
        issueNote: t("issueNote"),
        priceNote: t("priceNote"),
        planChoice: t("planChoice"),
        includesLabel: t("includesLabel"),
        cta: t("cta"),
        adding: t("adding"),
        priceUnavailable: t("priceUnavailable"),
        unavailable: t("unavailable"),
        addError: t("addError"),
      }}
    />
  );
}
