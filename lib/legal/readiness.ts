import "server-only";

import english from "@/messages/en.json";
import turkish from "@/messages/tr.json";
import {SELLER} from "./agreement-config";
import {LEGAL_DOCUMENTS_VERSION, PLACEHOLDER_VERSION} from "./consent";

// Text that must be replaced with real content before checkout can run in production.
const PLACEHOLDER_MARKERS = ["[PLACEHOLDER]", "[YER TUTUCU]"];
// "Agreement" is not scanned: its placeholderValue message is the runtime marker itself.
const LEGAL_MESSAGE_NAMESPACES = ["LegalDocuments"] as const;

function containsPlaceholder(value: unknown): boolean {
  if (typeof value === "string") {
    return PLACEHOLDER_MARKERS.some((marker) => value.includes(marker));
  }

  if (Array.isArray(value)) {
    return value.some(containsPlaceholder);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(containsPlaceholder);
  }

  return false;
}

// True only when everything the agreement needs is real: the version is set, the seller
// details are filled in, and no placeholder marker is left in the legal messages
// (the Pre-Information Form is still placeholder text). Checking the content itself, not just
// the version, means finishing one piece cannot unlock the rest.
function isLegalContentFinal(): boolean {
  return (
    LEGAL_DOCUMENTS_VERSION !== PLACEHOLDER_VERSION &&
    Object.values(SELLER).every((value) => value !== null) &&
    ![english, turkish].some((messages) =>
      LEGAL_MESSAGE_NAMESPACES.some((namespace) =>
        containsPlaceholder(messages[namespace]),
      ),
    )
  );
}

// Placeholder legal text is fine while developing, and on a staging deployment that opts in
// with ALLOW_PLACEHOLDER_LEGAL=true. In production it is not: the legal pages disappear and
// checkout (and the personal data collection that leads to it) stays closed.
export function isLegalContentPublishable(): boolean {
  return (
    isLegalContentFinal() ||
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_PLACEHOLDER_LEGAL === "true"
  );
}
