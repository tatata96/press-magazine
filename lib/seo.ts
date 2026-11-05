import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

// Production origin used for canonical, alternate and share URLs. Preview
// deployments deliberately point at it too, so they never become canonical.
export const SITE_URL = "https://pressmagazine.com.tr";

const OPEN_GRAPH_LOCALES: Record<string, string> = {
  en: "en_US",
  tr: "tr_TR",
};

// Share image, 1200×630, served from public/. Left null until the artwork
// exists so no tag points at a missing file. To enable it, add the file at
// public/images/og-default.jpg and set this to "/images/og-default.jpg".
const SHARE_IMAGE_PATH: string | null = null;

type PageMetadataInput = {
  title: string;
  description: string;
  /** Route without the locale prefix: "" for home, "/about", "/newsletter". */
  path: string;
  /** Use the title as written instead of the layout's "%s — Press Magazine" template. */
  absoluteTitle?: boolean;
};

// Next merges metadata shallowly, so a page that sets `openGraph` replaces the
// layout's whole object. Every public page builds its metadata here so
// canonical, alternates, Open Graph and Twitter fields stay consistent.
export async function getPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetadataInput): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Metadata"),
  ]);
  const siteName = t("siteName");
  const shareTitle = absoluteTitle ? title : `${title} — ${siteName}`;
  const getLocalizedPath = (code: string) => `/${code}${path}`;
  const shareImages = SHARE_IMAGE_PATH
    ? [{ url: SHARE_IMAGE_PATH, width: 1200, height: 630, alt: siteName }]
    : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: getLocalizedPath(locale),
      languages: {
        ...Object.fromEntries(
          routing.locales.map((code) => [code, getLocalizedPath(code)]),
        ),
        "x-default": getLocalizedPath(routing.defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      siteName,
      title: shareTitle,
      description,
      url: getLocalizedPath(locale),
      locale: OPEN_GRAPH_LOCALES[locale],
      alternateLocale: routing.locales
        .filter((code) => code !== locale)
        .map((code) => OPEN_GRAPH_LOCALES[code]),
      images: shareImages,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: shareImages?.map((image) => image.url),
    },
  };
}
