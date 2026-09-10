import {
  apiBaseUrl,
  escapeXml,
  productPath,
  SITE_URL,
  STATIC_PAGE_SEO,
} from "./_seo-shared.js";

function sitemapEntry({ path, lastModified, images = [] }) {
  const lastmod = lastModified
    ? `<lastmod>${escapeXml(new Date(lastModified).toISOString())}</lastmod>`
    : "";
  const imageMarkup = images
    .filter((image) => image.url)
    .map(
      (image) =>
        `<image:image><image:loc>${escapeXml(image.url)}</image:loc><image:title>${escapeXml(image.title)}</image:title></image:image>`,
    )
    .join("");
  return `<url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${lastmod}${imageMarkup}</url>`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Catalogue responded ${response.status}`);
  return response.json();
}

async function fetchAllProducts(baseUrl) {
  const products = [];
  for (let page = 1; products.length < 50_000; page += 1) {
    const payload = await fetchJson(
      `${baseUrl}/products?page=${page}&limit=1000`,
    );
    products.push(...(payload.products || []));
    if (page >= (payload.pagination?.pages || 1)) break;
  }
  return products;
}

export default async function handler(_request, response) {
  const entries = Object.values(STATIC_PAGE_SEO).map(({ canonicalPath }) =>
    sitemapEntry({ path: canonicalPath }),
  );
  const baseUrl = apiBaseUrl();

  if (baseUrl) {
    try {
      const [products, categoryPayload] = await Promise.all([
        fetchAllProducts(baseUrl),
        fetchJson(`${baseUrl}/categories`),
      ]);
      for (const category of categoryPayload.categories || []) {
        entries.push(
          sitemapEntry({
            path: `/collections?category=${encodeURIComponent(category.slug)}`,
          }),
        );
        if (category.slug === "la-aca-ra-f-models") {
          for (const model of ["LA", "F", "RA", "ACA"]) {
            entries.push(
              sitemapEntry({
                path: `/collections?category=${encodeURIComponent(category.slug)}&model=${model.toLowerCase()}`,
              }),
            );
          }
        }
      }
      for (const product of products) {
        if (!product.id || !product.slug) continue;
        entries.push(
          sitemapEntry({
            path: productPath(product),
            lastModified: product.updated_at,
            images: (product.images || []).map((url) => ({
              url,
              title: product.image_alt || product.name,
            })),
          }),
        );
      }
    } catch (error) {
      console.error(
        "Catalogue sitemap fallback:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600",
  );
  response
    .status(200)
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>`,
    );
}
