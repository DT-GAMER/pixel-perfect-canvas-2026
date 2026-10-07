import { createServerFn } from "@tanstack/react-start";

const MAX_BYTES = 5 * 1024 * 1024;
const FOLDERS = ["sponsors", "speakers", "blog"] as const;
const TYPES: Record<string, { ext: string; magic: (bytes: Uint8Array) => boolean }> = {
  "image/png": {
    ext: "png",
    magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/gif": { ext: "gif", magic: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  "image/webp": {
    ext: "webp",
    magic: (b) =>
      String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  },
  "image/svg+xml": {
    ext: "svg",
    magic: (b) => /<svg[\s>]/i.test(new TextDecoder().decode(b.slice(0, 1024))),
  },
};

/** Public URL base for stored files (the browser-facing Supabase URL). */
function publicBase() {
  return (
    process.env["SUPABASE_PUBLIC_URL"] ??
    process.env["VITE_SUPABASE_URL"] ??
    process.env["SUPABASE_URL"] ??
    ""
  ).replace(/\/$/, "");
}

/** Uploads an image from the dashboard (multipart: file, folder). Returns its public URL. */
export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!(input instanceof FormData)) throw new Error("Expected form data");
    const file = input.get("file");
    const folder = input.get("folder");
    if (!(file instanceof File)) throw new Error("No file");
    if (typeof folder !== "string" || !FOLDERS.includes(folder as (typeof FOLDERS)[number]))
      throw new Error("Invalid folder");
    return { file, folder };
  })
  .handler(async ({ data: { file, folder } }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    // Editors upload blog images; everything else is admin-only.
    await requireStaff(
      ...(folder === "blog" ? (["admin", "editor"] as const) : (["admin"] as const)),
    );

    const type = TYPES[file.type];
    if (!type) throw new Error("Use a PNG, JPEG, WebP, GIF, or SVG image");
    if (file.size > MAX_BYTES) throw new Error("Images must be 5 MB or smaller");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!type.magic(bytes))
      throw new Error("That file doesn't look like the image type it claims to be");

    const path = `${folder}/${crypto.randomUUID()}.${type.ext}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("media")
      .upload(path, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return { url: `${publicBase()}/storage/v1/object/public/media/${path}` };
  });
