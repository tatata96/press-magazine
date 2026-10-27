import type { Metadata } from "next";
import localFont from "next/font/local";
import { locale } from "next/root-params";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "../../i18n/routing";
import "../globals.scss";
import "../typography.scss";
import Header from "../components/header/Header";
import SiteFooter from "../components/site-footer/SiteFooter";

const pressed = localFont({
  src: "../style/fonts/Pressed.otf",
  variable: "--font-pressed",
  display: "swap",
});

const register = localFont({
  src: [
    { path: "../style/fonts/Register.otf", weight: "400", style: "normal" },
    { path: "../style/fonts/Register-Italic.otf", weight: "400", style: "italic" },
    { path: "../style/fonts/Register-Bold.otf", weight: "700", style: "normal" },
    { path: "../style/fonts/Register-BoldItalic.otf", weight: "700", style: "italic" },
  ],
  variable: "--font-register",
  display: "swap",
});

const crit = localFont({
  src: [
    { path: "../style/fonts/Crit-Light.otf", weight: "300", style: "normal" },
    { path: "../style/fonts/Crit-Light-Italic.otf", weight: "300", style: "italic" },
    { path: "../style/fonts/Crit-Regular.otf", weight: "400", style: "normal" },
    { path: "../style/fonts/Crit-Italic.otf", weight: "400", style: "italic" },
    { path: "../style/fonts/Crit-Medium.otf", weight: "500", style: "normal" },
    { path: "../style/fonts/Crit-Medium-Italic.otf", weight: "500", style: "italic" },
  ],
  variable: "--font-crit",
  display: "swap",
});

const critMono = localFont({
  src: "../style/fonts/CritMono-Light.otf",
  weight: "300",
  variable: "--font-crit-mono",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((code) => ({ locale: code }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("title"), description: t("description") };
}

export default async function RootLayout({
  children,
}: LayoutProps<"/[locale]">) {
  return (
    <html
      lang={await locale()}
      className={`${pressed.variable} ${register.variable} ${crit.variable} ${critMono.variable}`}
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
