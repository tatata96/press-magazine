// Order ids are Shopify global ids with a secret key (gid://shopify/Order/123?key=abc). They
// travel in the URL as base64url so no character needs escaping, and are checked again on the
// way back in.
const ORDER_ID_PATTERN = /^gid:\/\/shopify\/Order\/[^\s]{1,200}$/;

export function encodeOrderId(orderId: string): string {
  return Buffer.from(orderId).toString("base64url");
}

export function decodeOrderId(value: string): string | null {
  const decoded = Buffer.from(value, "base64url").toString("utf8");

  return ORDER_ID_PATTERN.test(decoded) ? decoded : null;
}
