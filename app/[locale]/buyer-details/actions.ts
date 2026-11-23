"use server";

import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {CustomerAccountError} from "@/lib/customer-account/types";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import {ShopifyError} from "@/lib/shopify/admin-client";
import {buildPreparedCheckout, type PreparedCheckout} from "../cart/build-agreement-data";
import type {CheckoutActionError} from "../cart/actions";
import {prepareCheckoutState, readCheckoutInputs} from "../cart/checkout-state";
import {parseCheckoutSelection} from "./checkout-selection";

export type PrepareCheckoutResult =
  | {ok: true; checkout: PreparedCheckout}
  | {ok: false; error: Exclude<CheckoutActionError, "consent_required" | "agreement_changed">};

// Builds the personalized agreements for what the buyer has chosen. It is public, so the
// selection is validated again, and the buyer, their addresses and whether a delivery address
// is needed all come from Shopify, never from the browser.
export async function prepareCheckout(
  selectionInput: unknown,
  locale: string,
): Promise<PrepareCheckoutResult> {
  if (!hasLocale(routing.locales, locale)) {
    return {ok: false, error: "failed"};
  }

  // No personal data is processed for a checkout that cannot open yet.
  if (!isLegalContentPublishable()) {
    return {ok: false, error: "unavailable"};
  }

  const selection = parseCheckoutSelection(selectionInput);

  if (!selection) {
    return {ok: false, error: "invalid_details"};
  }

  // Keep request-time cookie reads outside the try/catch below.
  const inputs = await readCheckoutInputs();

  try {
    const state = await prepareCheckoutState(inputs, selection);

    if (state.status !== "ready") {
      return {ok: false, error: state.status === "empty" ? "empty_cart" : state.status};
    }

    return {ok: true, checkout: await buildPreparedCheckout(state, locale)};
  } catch (error) {
    // Never log submitted or account values; these messages only carry codes.
    console.error(
      "Preparing checkout failed:",
      error instanceof ShopifyError || error instanceof CustomerAccountError
        ? error.message
        : "unexpected error",
    );

    return {ok: false, error: "failed"};
  }
}
