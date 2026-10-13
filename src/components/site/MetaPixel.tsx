import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadMetaPixel, trackMeta } from "@/lib/meta-pixel";

/**
 * Loads the Meta Pixel and records a PageView for every page, including
 * in-app navigation (the site doesn't reload between pages).
 */
export function MetaPixel({ pixelId }: { pixelId: string | null }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (pixelId) loadMetaPixel(pixelId);
  }, [pixelId]);

  useEffect(() => {
    if (pixelId) trackMeta("PageView");
  }, [pixelId, pathname]);

  return null;
}
