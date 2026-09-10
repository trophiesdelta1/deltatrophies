import { Helmet } from "react-helmet-async";
import {
  DEFAULT_SOCIAL_IMAGE,
  jsonLd,
  SITE_NAME,
  SITE_URL,
} from "../config/seo";

function SeoHead({
  title,
  description,
  canonicalPath,
  image = DEFAULT_SOCIAL_IMAGE,
  imageAlt = title,
  type = "website",
  noindex = false,
  structuredData = [],
}) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const robots = noindex
    ? "noindex,follow"
    : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
      {structuredData.map((schema) => (
        <script
          key={schema["@id"] || schema["@type"]}
          type="application/ld+json"
        >
          {jsonLd(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export default SeoHead;
