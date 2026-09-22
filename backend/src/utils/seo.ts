const BRAND_SUFFIX = ' | Delta Industries';

export function buildProductSeoTitle(name: string, sku?: string): string {
  const identity = sku ? `${name} (${sku})` : name;
  const brandedTitle = `${identity}${BRAND_SUFFIX}`;
  if (brandedTitle.length <= 65) return brandedTitle;
  if (identity.length <= 65) return identity;
  return name.length <= 65 ? name : identity;
}

export function buildProductSeoDescription(name: string, sku?: string): string {
  const identity = sku ? `${name} (${sku})` : name;
  const description = `${identity} from Delta Industries, Jalandhar. Custom branding and bulk trophy orders.`;
  return description.length <= 160
    ? description
    : `${identity} from Delta Industries. Bulk-order enquiries welcome.`;
}
