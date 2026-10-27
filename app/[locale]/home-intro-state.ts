// Whether the home page intro has played during this visit. Module state survives
// client-side navigation but not a reload, so returning to the home page within a visit
// skips the intro and the scroll reveal, while a fresh visit (such as scanning the QR
// card) always gets both.
export const homeIntro = {played: false};
