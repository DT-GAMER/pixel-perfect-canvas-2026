/** "Dr. Amara Okafor" → "dr-amara-okafor" (ASCII, lowercase, hyphenated). */
export const slugify = (value: string, max = 80) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
