import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.kronkai.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/kronkai-twitter.png`;

export interface PageMetaProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
}

export function PageMeta({
  title,
  description,
  path = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  noIndex = false,
}: PageMetaProps) {
  const canonical = `${SITE_URL}${path || "/"}`;
  const imageUrl = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage.replace(/^\//, "")}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonical} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}
    </Helmet>
  );
}
