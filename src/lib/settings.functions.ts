import { createServerFn } from "@tanstack/react-start";
import type { SiteSettings } from "./event";

/** Public site settings, loaded by the root route for the browser. */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const { loadSettings } = await import("./settings.server");
    return loadSettings();
  },
);
