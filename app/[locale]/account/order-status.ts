// Shopify sends statuses as enum names. Known ones are translated; an unknown one (Shopify can
// add values) is shown readable rather than hidden.
export function getStatusLabel(
  labels: Record<string, string>,
  status: string | null,
): string | null {
  if (!status) {
    return null;
  }

  return (
    labels[status] ??
    status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")
  );
}
