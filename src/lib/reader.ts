// Shared (client + server) helpers for blog reader sign-in.

/** Only allow same-site paths as post-sign-in destinations (no open redirects). */
export function safeNextPath(next: unknown, fallback = "/blog"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next.slice(0, 300);
}
