import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "tr"],
  defaultLocale: "en",
  // The language lives in the URL only; no cookie is set.
  localeCookie: false,
});
