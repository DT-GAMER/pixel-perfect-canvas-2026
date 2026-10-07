import { z } from "zod";

/**
 * An image reference: a site path (uploads are "/media/…", bundled images
 * "/images/…") or a full http(s) URL. `z.string().url()` rejects site paths,
 * which silently blocked saving any record with an image.
 */
export const imageUrl = z
  .string()
  .trim()
  .max(500)
  .regex(/^(\/(?!\/)\S*|https?:\/\/\S+)$/, "Use an uploaded image or a full https:// link")
  .nullable();
