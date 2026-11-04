import type {Metadata} from "next";
import {Crimson_Text} from "next/font/google";
import localFont from "next/font/local";
import {locale} from "next/root-params";
import {NextIntlClientProvider} from "next-intl";
import {getTranslations} from "next-intl/server";
import {routing} from "../../i18n/routing";
import "../globals.scss";
import "../typography.scss";
import Header from "../components/header/Header";
import SiteFooter from "../components/site-footer/SiteFooter";

const pressed = localFont({
  src: "../style/fonts/Pressed.woff2",
  variable: "--font-pressed",
  display: "swap",
});

const crimson = Crimson_Text({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-crimson",
  display: "swap",
});

const crit = localFont({
  src: [
    {path: "../style/fonts/Crit-Regular.woff2", weight: "400", style: "normal"},
    {
      path: "../style/fonts/Crit-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-crit",
  display: "swap",
});

const critMono = localFont({
  src: "../style/fonts/CritMono-Light.woff2",
  weight: "300",
  variable: "--font-crit-mono",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((code) => ({locale: code}));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: {default: t("title"), template: `%s | ${t("title")}`},
    description: t("description"),
  };
}

export default async function RootLayout({children}: LayoutProps<"/[locale]">) {
  return (
    <html
      lang={await locale()}
      className={`${pressed.variable} ${crimson.variable} ${crit.variable} ${critMono.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <Header />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
