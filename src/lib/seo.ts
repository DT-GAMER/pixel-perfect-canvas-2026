import { absoluteUrl, EVENT } from "./event";

/** Default share image (1200×630), generated from the brand. */
export const DEFAULT_OG_IMAGE = "/og-image.png";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
};

/** Consistent title, description, canonical, Open Graph, and Twitter tags. */
export function pageMeta({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
}: PageMeta) {
  const url = absoluteUrl(path);
  const shareImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: EVENT.name },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: shareImage },
      { property: "og:image:alt", content: imageAlt ?? `${EVENT.name} ${EVENT.edition}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: shareImage },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** JSON-LD <script> entry for a route's head(). */
export const jsonLd = (data: Record<string, unknown>) => ({
  type: "application/ld+json",
  // Escape "<" so the JSON can't close the script tag.
  children: JSON.stringify(data).replace(/</g, "\\u003c"),
});
