# Address validation in the buying flow — design

Status: draft, awaiting approval.

**Scope: address only.** Phone validation is a separate, later piece of work (see Deferred). Nothing about phone is built in this change.

## Intent
Buyers can type a misspelled city ("Istanbl") and ship to a bad address. Make address values correct by construction using a worldwide dataset, and validate on the server in every case. Press ships worldwide.

## Goals
- Country → state/province → city, chosen from lists (search-and-pick). The server rejects any combination not in the dataset.
- One shared `AddressFields` component keeps serving checkout and the account address book.

## Non-goals / anti-goals
- No address autocomplete or third-party address service.
- No free-text escape hatch ("my city isn't listed"). Decision: strict (option A).
- No neighborhood field.
- Do not leave a buyer unable to order because a whole country lacks data (see fallbacks).

## Approaches considered
- **A (chosen): strict search-and-pick from a worldwide dataset.** Blocks typos. Accepted trade-off: a buyer whose town is missing from the dataset cannot select it.
- B: same, plus a "my city isn't listed" free-text escape hatch — not chosen; the owner prefers typo prevention over covering missing towns.
- C: address autocomplete service — rejected: paid third party, addresses leave the site, needs privacy copy we must not invent.
- D: free text with format checks only — cannot catch typos.
- Rejected packages: `country-state-city` (no Turkish districts, GPL-3.0, 17 MB, unmaintained since 2023); `turkey-location-data` (Turkey only, superseded).

## Decisions
- **Dataset:** `@countrystatecity/countries` (ODbL-1.0, updated 2026-11, 250+ countries, 5,000+ states, 150,000+ cities; Turkey: 81 provinces, 988 districts, Turkish spelling). Server-side only, loaded lazily per country/state, so the browser receives only the list it needs, via a Server Action or Route Handler as the buyer picks. *(Packaging details are the builder's call.)*
- **Licence:** ODbL-1.0 requires attribution and keeping the package's `NOTICE-*.txt` files. Owner to confirm this is acceptable; not legal advice.
- **Mapping to Shopify:** state/province → `province`, city → `city`. For Turkey, province = province, city = district. *(My call; verify against the Customer Account API address input and iyzico billing requirements before building.)*
- **Fallbacks so no one is blocked by missing data** *(my call)*: if the dataset has no states for the chosen country, skip the state field; if it has no cities for the chosen country or state, that field becomes free text with the existing length limits. The server applies the same rule, so it only accepts free text where the dataset has nothing to offer.
- **Zip:** keep as free text with length limits; Shopify validates per country. Adding per-country zip patterns is out of scope here.
- **Copy:** new strings go in `messages/en.json` and `messages/tr.json`. Turkish text for new strings is marked for review, not final.

## Constraints
- Server-side validation is authoritative; dropdowns are a convenience.
- Server Components by default; the address form is already a client component.
- New dependency: `@countrystatecity/countries` only.
- Dataset ids change between package versions; store names/codes, not dataset ids.

## Open questions
1. Confirm the ODbL-1.0 attribution requirement is acceptable.
2. Does iyzico require a specific province/district split on the billing address?
3. Existing saved addresses with free-text cities: left as they are; validated only when edited. Confirm.
4. Countries where Shopify's `province` is required but the dataset has no state level: the builder checks Shopify's rules per country.

## Deferred (not in this change)
Phone validation. Today's rule is `+` plus 7–15 digits (`checkout-selection.ts`). Candidates: `libphonenumber-js` alone, or `react-phone-number-input` (includes it, adds a flag country selector that must stay in sync with the address country). Decide when this is picked up.

## Left to the builder
Component structure (search-and-pick control, native-first and keyboard accessible), the server function's shape, error codes, and tests: server rejection of invalid country/state/city combinations, the no-data fallbacks, 
