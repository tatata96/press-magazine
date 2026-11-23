import type {Money} from "./money";

// Which issue is on sale is managed in Shopify Admin with product tags, not in code:
// the issue currently for sale carries `current`, and the format is `digital` or `print`.
// Old issues keep their `digital`/`print` tag but lose `current`.
export const CURRENT_TAG = "current";
export const PLAN_TAGS = {digital: "digital", print: "print"} as const;

export type PlanId = keyof typeof PLAN_TAGS;

export type PlanProduct = {
  variantId: string;
  price: Money;
  availableForSale: boolean;
  /** Product's featured image in Shopify; null until one is uploaded. */
  imageUrl: string | null;
};

export type PlanProductsResult =
  | {status: "ok"; products: Record<PlanId, PlanProduct | null>}
  | {status: "error"};

export type PlanProductNode = {
  tags: string[];
  featuredImage: {url: string} | null;
  variants: {
    nodes: {id: string; availableForSale: boolean; price: Money}[];
  };
};

export type PlanProductsData = {
  products: {
    nodes: PlanProductNode[];
    pageInfo: {hasNextPage: boolean};
  };
};

// Shopify compares tags case-insensitively.
function hasTag(tags: string[], tag: string): boolean {
  return tags.some((candidate) => candidate.toLowerCase() === tag);
}

/** The plan a product belongs to, from its tags; null when it is not (clearly) one. */
export function planIdFromTags(tags: string[]): PlanId | null {
  const matches = (Object.keys(PLAN_TAGS) as PlanId[]).filter((id) =>
    hasTag(tags, PLAN_TAGS[id]),
  );

  return matches.length === 1 ? matches[0] : null;
}

function toPlanProduct(node: PlanProductNode): PlanProduct | null {
  // Both products have a single default variant, so the first one is purchased.
  const variant = node.variants.nodes[0];

  if (!variant) {
    return null;
  }

  return {
    variantId: variant.id,
    price: variant.price,
    availableForSale: variant.availableForSale,
    imageUrl: node.featuredImage?.url ?? null,
  };
}

// Picks the one current product per plan. Shopify's `tag:` search can lag behind Admin, so
// the tags on each returned product are checked again. A plan with no match, or with
// several, gets null: guessing could sell the wrong issue.
export function selectPlanProducts(data: PlanProductsData): PlanProductsResult {
  // Shopify's search returned more than one page, so we cannot see every match.
  if (data.products.pageInfo.hasNextPage) {
    throw new Error("More current products than one page can show.");
  }

  const current = data.products.nodes.filter((node) =>
    hasTag(node.tags, CURRENT_TAG),
  );
  const products: Record<PlanId, PlanProduct | null> = {
    digital: null,
    print: null,
  };

  for (const id of Object.keys(PLAN_TAGS) as PlanId[]) {
    const matches = current.filter((node) => hasTag(node.tags, PLAN_TAGS[id]));

    if (matches.length > 1) {
      console.error(
        `Ambiguous current "${id}" product: ${matches.length} products carry the "${CURRENT_TAG}" tag.`,
      );
    } else if (matches.length === 1) {
      products[id] = toPlanProduct(matches[0]);
    }
  }

  return {status: "ok", products};
}

// Runs the request and selection, turning any failure into a safe error result.
export async function loadPlanProducts(
  request: () => Promise<PlanProductsData>,
): Promise<PlanProductsResult> {
  try {
    return selectPlanProducts(await request());
  } catch (error) {
    console.error(
      "Could not load plan products:",
      error instanceof Error ? error.message : "unknown error",
    );

    return {status: "error"};
  }
}
