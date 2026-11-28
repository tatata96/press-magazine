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
| `npm test`      | Run the unit tests (Node's built-in runner) |

### Environment variables

Read on the server only. Never commit real values or expose them via `NEXT_PUBLIC_*`. `.env.example` lists every name with a placeholder.

| Variable                                 | Purpose                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `SHOPIFY_STORE_DOMAIN`                   | Shopify store domain (`<name>.myshopify.com`)                           |
| `SHOPIFY_CLIENT_ID` / `_SECRET`          | Shopify app credentials for the Admin API                               |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN`        | Storefront API token (cart, products)                                   |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`     | Customer Account API client ID (confidential client)                    |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` | Customer Account API client secret                                      |
| `CUSTOMER_SESSION_SECRET`                | 32 random bytes, base64: encrypts the customer session cookie           |
| `APP_ORIGIN`                             | The one origin Shopify redirects back to. Required in every environment |

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

## Digital edition (temporarily withdrawn)

Since 28 November 2026 the storefront sells the print edition only. Digital support (plan tag, product fetching, translations, digital-cart handling, `digitalAccess` / `digitalProtection` terms) is kept.

- `OFFERED_PLAN_IDS` in `lib/shopify/plan-products.ts` controls what the Shop page and the empty cart offer, and whether the blank legal pages and Shipping & Returns include digital clauses.
- A filled-in agreement includes digital clauses only when the order contains a product tagged `digital`. Such a product can still be checked out if it is already in a cart.
- Legal documents are at version 1.1. **The revised wording needs legal review before production deployment.**
- To offer the digital edition again, add `"digital"` to `OFFERED_PLAN_IDS`, then review the Shop copy (`SubscribePage` in `messages/`) and the legal wording: the print + digital bundle definition was removed, some retained clauses still mention packages, and the Shipping & Returns introduction now describes print only.

## Checkout flow and sales agreement

Flow: Subscribe → `/cart` (cart lines, then sign in) → `/cart` (signed in: contact summary, delivery and billing address, personalized Distance Sales Agreement) → Shopify hosted checkout (logged in) → iyzico. Shipping method is chosen by the buyer in Shopify checkout; there is no picker on our cart page.

- **Guests** can browse, add to the cart and change it. Checking out needs a signed-in customer: `proceedToCheckout` refuses without a session, whatever the browser shows.
- **Contact and addresses come from the customer's Shopify account** (Customer Account API). The cart page shows a summary and asks only for what is missing or what the buyer edits: first and last name are saved to the account, a new address is saved to the account and selected. Email is the sign-in identity and cannot be changed here. The account has no phone field the API can update, so the phone is kept for the order only: it defaults to the account's phone or the cart's.
- **Nothing the buyer chooses is trusted from the browser.** The browser sends the ids of saved addresses and a phone number; the server looks each address up on Shopify (`resolveBuyerDetails` in `app/[locale]/buyer-details/checkout-selection.ts`, covered by `npm test`). There is no buyer cookie any more and no database.
- **Delivery address** is only required when a cart line has `requiresShipping` in Shopify; digital-only carts never ask for one. Billing is "same as delivery" or another saved address, and is never sent to Shopify (the cart has no billing field), so Shopify's own billing step is still filled in again. Each address carries its own country, which is how the agreement prints it.
- **The cart is attached to the customer** (`cartBuyerIdentityUpdate` with the customer token, plus phone, country and a one-time delivery address) every time the agreement is prepared and again right before the checkout handoff, so the handoff URL opens a logged-in checkout that matches the agreement.
- **Agreement text**: the Distance Sales Agreement is plain JSX in `app/components/legal-document/distance-sales-agreement/` (`AgreementTr.tsx`, `AgreementEn.tsx`), exactly as supplied. Only the values in `{braces}` come from one `AgreementData` object (`lib/legal/agreement-data.ts`). Do not reword the text without approval. The standalone page passes blank buyer/order data (no personal data); `app/[locale]/cart/PersonalizedAgreement.tsx` fills it from the checkout snapshot for the cart modal.
- **Agreement data**: `app/[locale]/cart/checkout-state.ts` builds a snapshot (buyer, lines, delivery option, total) on the server from the account and the cart, and fingerprints it. Consent is stored against that fingerprint, so any change to quantities, details or totals invalidates it. `proceedToCheckout` recomputes the fingerprint and only then returns the checkout URL, after writing the acceptance to cart attributes (`lib/legal/consent.ts`), which Shopify copies onto the order.
- **Seller details and business terms** are configured in one place, `lib/legal/agreement-config.ts`.
- **Pre-Contractual Information Form** (Ön Bilgilendirme Formu): plain JSX in `app/components/legal-document/pre-information/` (TR/EN), following Article 5(1) of the Regulation on Distance Contracts. `app/[locale]/cart/build-agreement-data.ts` fills both legal documents from the same checkout snapshot, so one fingerprint covers both. Where it repeats the Distance Sales Agreement it uses that wording. The standalone page shows the general form (blank buyer/order fields); the cart modal shows the personalized one.
- **Values not known before checkout** (tax amount, payment method, discount amount) show "Determined at checkout"; nothing is guessed. Order and agreement date are the day the agreement is shown (Europe/Istanbul); the exact acceptance time is on the order.
- **Taxes**: Storefront API 2026-07 exposes no tax amount or tax-inclusive flag on a cart, so none is shown or computed. The agreement has a placeholder line for it.
- **Go-live guard** (`lib/legal/readiness.ts`): while `LEGAL_DOCUMENTS_VERSION` is `"placeholder"` or any legal message still contains a `[PLACEHOLDER]` / `[YER TUTUCU]` marker, production has no legal pages or footer links, no checkout details, and no checkout. Development is unaffected. A staging deployment can opt in with `ALLOW_PLACEHOLDER_LEGAL=true`, which is read at **build** time because those pages are prerendered.

## Customer accounts and sign-in

Shopify's Customer Account API is the only identity provider: passwordless (a one-time code by email), new and returning customers alike, no separate user database.

- **Routes** (`app/api/auth/`): `login` starts the OAuth flow (state and nonce in a short-lived encrypted cookie), `callback` is the registered redirect URI and exchanges the code for tokens, `refresh` renews an expired access token, `logout` (POST only) clears the session and ends it on Shopify. Paths are not locale-prefixed because the registered callback must be fixed; the locale travels in the flow and sets the language of Shopify's login screen.
- **Session**: access, refresh and id tokens live in one AES-256-GCM encrypted, httpOnly cookie (`press_customer_session`, `CUSTOMER_SESSION_SECRET`). Tokens never reach browser JavaScript. Pages cannot set cookies, so an expired token sends the buyer through `/api/auth/refresh` and back; if renewal is impossible they sign in again. The cart cookie is never touched, so the cart survives sign-in and sign-out.
- **Origin**: redirects use `APP_ORIGIN` only, never the request host or `VERCEL_URL`. Login started on another host is redirected to `APP_ORIGIN` first, because cookies are host-specific. For a Vercel preview, set `APP_ORIGIN` to the stable branch URL and register `<APP_ORIGIN>/api/auth/callback` and `<APP_ORIGIN>/` in the Customer Account API settings.
- **`/account`**: profile (name editable), saved addresses (add, edit, delete, default), order history and order detail. Order ids in URLs are base64url global ids, validated on the way back; Shopify only returns the signed-in customer's own orders.

### Agreement integrity: known limits

The fingerprint proves our page and our server agreed on one version of the order before the buyer left. These gaps remain, and none can be closed from this repo alone:

- **Shopify checkout can still change the order.** A logged-in checkout can prefill the customer's own saved addresses and payment methods, and the delivery option, tax and total are decided there. Nothing compares the final order with the accepted agreement. `consent_agreed_total` is stored on the order so the difference can be detected. A follow-up could compare it, and the order's addresses, via an `orders/create` webhook (Admin API).
- **Billing is entered twice.** Logging in did not remove this: the Cart API has no billing-address field, so Shopify's billing step is blank, and the buyer can type a different billing address there than the one the agreement states.
- **The agreement does not record which account accepted it.** The customer id is on the cart through the authenticated checkout, but it is not part of the stored consent attributes.
- **Token lifetime vs. a long review.** A buyer who leaves the agreement open past the access token's lifetime is sent through the refresh route when they continue; the page reloads and the agreement has to be reviewed again.
- **Provinces are not collected.** Addresses are created with country, city, postal code and street only. A country whose addresses require a province in Shopify's validation would reject the new address with a generic message.
- **Shopify plan limits apply** (no checkout controls beyond Basic's).

### Unresolved limitation (needs a decision, not solved by the notice)

The agreement is generated before Shopify's hosted checkout, and on the Basic plan checkout can still change the delivery address, shipping option, taxes and total. The agreement carries no estimate notice (it was removed on request), so nothing on screen tells the buyer that checkout can change these amounts; the accepted agreement and the final order can differ. `consent_agreed_total` is stored on the order so the difference can at least be detected. Options to evaluate with legal advice include an agreement or confirmation after checkout, or Shopify Plus checkout controls.

### Still placeholders (checkout stays closed in production until all are real)

All in `BUSINESS_TERMS` in `lib/legal/agreement-config.ts`, in Turkish and English:

- `physicalDeliveryTime`: delivery time for printed magazines.
- `returnCarrier`: carrier for returns and who pays return shipping.
- `digitalAccess`: how and from when the buyer can access the PDF.
- `digitalProtection`: technical protection applied to the PDF, if any.

### Open legal questions (for review, not decided in code)

- Taxes, payment methods and discount amounts are not available from Shopify's cart before checkout, so the documents say they are determined at checkout. The regulation asks for the total price including taxes before the order; confirm this is acceptable.
- Not included: the sample withdrawal form annexed to the regulation (Article 11), and items 5(1)(e) (extra communication costs) and 5(1)(ı) (deposits or guarantees), because no information was supplied.
- The first-sentence wording of the Turkish agreement was edited by hand after generation (see "Sözleşmesisi").
- The English documents call it the "Pre-Contractual Information Form" while the page title, modal, footer and checkbox say "Pre-Information Form".
