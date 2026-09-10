const BRAND_SUFFIX = ' | Delta Industries';

export function buildProductSeoTitle(name: string): string {
  const brandedTitle = `${name}${BRAND_SUFFIX}`;
  return brandedTitle.length <= 65 ? brandedTitle : name;
}

export function buildProductSeoDescription(name: string): string {
  return `Customizable ${name} from Delta Industries, Jalandhar. Request pricing for bulk trophy and award orders.`;
}
