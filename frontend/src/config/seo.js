export const SITE_URL = "https://deltatrophies.com";
export const SITE_NAME = "Delta Industries";
export const DEFAULT_SOCIAL_IMAGE =
  "https://res.cloudinary.com/gufssbcd/image/upload/c_fill,f_auto,q_auto:best,w_1200,h_630/v1788566868/deltatrophies/gallery/factory/AA%20Welcome.jpg";

export function productPath(product) {
  return `/products/${encodeURIComponent(product.id)}/${encodeURIComponent(product.slug)}`;
}

export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
