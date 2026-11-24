# Address Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Country → state → city are picked from lists backed by `@countrystatecity/countries`, and the server rejects combinations not in the data.

**Architecture:** A pure `checkLocation` function (tested) decides validity from loaded options. A server-only loader reads the dataset. A Server Action feeds the client `AddressFields` as the buyer picks. The account Server Actions run `checkLocation` after the existing form parsing. The state code is stored on the Shopify address as `zoneCode`.

**Tech Stack:** Next.js server actions, `@countrystatecity/countries`, node:test.

**Spec:** `docs/superpowers/specs/2026-11-24-address-validation-design.md`

## Global Constraints
- Server validation is authoritative; the client lists are a convenience.
- Free text only where the dataset has no states / no cities for that country or state.
- Only new dependency: `@countrystatecity/countries`. Phone is out of scope.
- Follow CODING_CONVENTIONS.md (braces, blank line after declarations).

## Review Focus
- State submitted for a country with no states → `invalid`.
- State missing for a country with states → `required`; city is not checked until the state is valid.
- City not in the state's list → `invalid`; city in list → ok; empty list → any non-empty city ok.
- Unknown country / state codes from a hand-edited request → empty options, no crash.

## Tasks
1. **`lib/locations/check-location.ts`** (pure) + `tests/check-location.test.mjs`: `checkLocation(options: LocationOptions, selection: {stateCode: string; city: string}): LocationErrors`.
2. **`lib/locations/options.ts`** (server-only): `getLocationOptions(countryCode: string, stateCode: string): Promise<LocationOptions>`. `next.config.ts`: keep the package external and trace its data files.
3. **Data model:** `stateCode` on `CustomerAddress`/`AddressInput` (`zoneCode` in the Customer Account API query and mutation), read in `parseAddressForm`, passed through `makeDefaultAddress`, shown as a default in the address book.
4. **Actions:** `account/actions.ts` runs `checkLocation` for add and edit; `app/components/address-fields/actions.ts` exposes `loadLocationOptions`.
5. **UI:** `AddressFields` gets state and city selects (free-text fallback), copy in `messages/en.json` and `tr.json`.
6. **Verify:** `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
