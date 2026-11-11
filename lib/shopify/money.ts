export type Money = {amount: string; currencyCode: string};

// Display only: Shopify's amount string stays the source of truth and is never summed here.
export function formatMoney(money: Money, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}
