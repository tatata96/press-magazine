<p align="center">
  <img src="public/images/logo.svg" alt="Press" width="160">
</p>

# Press

Website for Press, a cultural magazine with a minimal, print-inspired editorial design.

The first release is the QR-to-newsletter flow: a printed QR link opens the magazine information page, where visitors can sign up for the free newsletter and see a clear result. Commerce, accounts, PDF access, and a blog are planned for later work.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with strict TypeScript and React
- SCSS Modules for component styles, global SCSS for resets and typography
- [next-intl](https://next-intl.dev) for localisation (`en`, `tr`)
- [GSAP](https://gsap.com) for animation
- Shopify Admin API for newsletter signups (server-side only)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |

### Environment variables

Read on the server only by [lib/shopify/admin-client.ts](lib/shopify/admin-client.ts). Never commit real values or expose them via `NEXT_PUBLIC_*`.

| Variable                | Purpose                         |
| ----------------------- | ------------------------------- |
| `SHOPIFY_STORE_DOMAIN`  | Shopify store domain            |
| `SHOPIFY_CLIENT_ID`     | Shopify app client ID           |
| `SHOPIFY_CLIENT_SECRET` | Shopify app client secret       |

## Project structure

```
app/
  [locale]/        Localised routes: home, about, newsletter
  api/newsletter/  Signup route handler (validation, rate limit, Shopify call)
  components/      Shared components (header, footer, form fields, ...)
  style/           Fonts
  utils/           Small shared helpers
i18n/              next-intl routing, navigation, and request config
lib/shopify/       Server-only Shopify Admin API client
messages/          Translations (en.json, tr.json)
public/            Static assets
```

## Conventions

- Project rules for contributors and coding assistants: [CLAUDE.md](CLAUDE.md)
- Naming, structure, and style conventions: [CODING_CONVENTIONS.md](CODING_CONVENTIONS.md)

## Open decisions

Not final yet, so no behaviour should be assumed: newsletter provider and consent copy, form fields, payment setup, PDF download limits, and archive access rules.

## Checkout flow and sales agreement

Flow: Subscribe → `/buyer-details` → `/cart` (personalized Distance Sales Agreement) → Shopify hosted checkout. Shipping method is chosen by the buyer in Shopify checkout; there is no picker on our cart page.

- **Buyer details** are saved by a Server Action. Email, phone, country and the delivery address go onto the Shopify cart (`cartBuyerIdentityUpdate`, `cartDeliveryAddressesReplace`) so checkout opens prefilled. Shopify's cart has no buyer name and no billing address, so only those two live in an AES-256-GCM encrypted cookie (`press_buyer_details`; httpOnly, Secure, SameSite=Lax, 48 hours). No database. Requires `BUYER_COOKIE_SECRET` (see `.env.example`).
- **Delivery address** is only required when a cart line has `requiresShipping` in Shopify. Billing is never sent to Shopify (no cart field exists).
- **Agreement text**: the Distance Sales Agreement is plain JSX in `app/components/legal-document/distance-sales-agreement/` (`AgreementTr.tsx`, `AgreementEn.tsx`), exactly as supplied. Only the values in `{braces}` come from one `AgreementData` object (`lib/legal/agreement-data.ts`). Do not reword the text without approval. The standalone page passes blank buyer/order data (no personal data); `app/[locale]/cart/PersonalizedAgreement.tsx` fills it from the checkout snapshot for the cart modal.
- **Agreement data**: `app/[locale]/cart/checkout-state.ts` builds a snapshot (buyer, lines, delivery option, total) on the server and fingerprints it. Consent is stored against that fingerprint, so any change to quantities, details or totals invalidates it. `proceedToCheckout` recomputes the fingerprint and only then returns the checkout URL, after writing the acceptance to cart attributes (`lib/legal/consent.ts`), which Shopify copies onto the order.
- **Seller details** are configured in one place, `lib/legal/agreement-config.ts`.
- **Values not known before checkout** (tax amount, payment method, discount amount) show "Determined at checkout"; nothing is guessed. Order and agreement date are the day the agreement is shown (Europe/Istanbul); the exact acceptance time is on the order.
- **Taxes**: Storefront API 2026-07 exposes no tax amount or tax-inclusive flag on a cart, so none is shown or computed. The agreement has a placeholder line for it.
- **Go-live guard** (`lib/legal/readiness.ts`): while `LEGAL_DOCUMENTS_VERSION` is `"placeholder"` or any legal message still contains a `[PLACEHOLDER]` / `[YER TUTUCU]` marker, production has no legal pages or footer links, no buyer-details form, and no checkout. Development is unaffected. A staging deployment can opt in with `ALLOW_PLACEHOLDER_LEGAL=true`, which is read at **build** time because those pages are prerendered.

### Unresolved limitation (needs a decision, not solved by the notice)

The agreement is generated before Shopify's hosted checkout, and on the Basic plan checkout can still change the delivery address, shipping option, taxes and total. The agreement carries no estimate notice (it was removed on request), so nothing on screen tells the buyer that checkout can change these amounts; the accepted agreement and the final order can differ. `consent_agreed_total` is stored on the order so the difference can at least be detected. Options to evaluate with legal advice include an agreement or confirmation after checkout, or Shopify Plus checkout controls.

### Still placeholders (checkout stays closed in production until all are real)

- The Pre-Information Form text (`LegalDocuments.preInformation` in `messages/*.json`).
