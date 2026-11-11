import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {getPageMetadata} from "@/lib/seo";
import SubscribePlans, {type Plan} from "./SubscribePlans";

// Message keys under SubscribePage.plans. Prices and benefits live in the
// messages so editorial copy stays out of the component.
// TODO: placeholder imagery; swap for dedicated digital / print artwork.
const PLAN_IMAGES = {
  digital: "/images/newsletter/newsletter-5.jpg",
  print: "/images/cover.jpg",
} as const;

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
  const plans: Plan[] = (["digital", "print"] as const).map((id) => ({
    id,
    image: PLAN_IMAGES[id],
    name: t(`plans.${id}.name`),
    tagline: t(`plans.${id}.tagline`),
    price: t(`plans.${id}.price`),
    benefits: toStrings(t.raw(`plans.${id}.benefits`)),
  }));

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
      }}
    />
  );
}
