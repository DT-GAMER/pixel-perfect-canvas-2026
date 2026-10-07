import type { FieldErrors, FieldValues } from "react-hook-form";
import { toast } from "sonner";

type Found = { path: string; message: string };

function firstError(errors: FieldErrors | undefined, prefix = ""): Found | null {
  if (!errors) return null;
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if ("message" in value && typeof value.message === "string" && value.message)
      return { path, message: value.message };
    const nested = firstError(value as FieldErrors, path);
    if (nested) return nested;
  }
  return null;
}

// "coverImageUrl" → "Cover image url", "stats.0.label" → "Stats 1 label"
const label = (path: string) =>
  path
    .split(".")
    .map((part) =>
      /^\d+$/.test(part) ? String(Number(part) + 1) : part.replace(/([A-Z])/g, " $1").toLowerCase(),
    )
    .join(" ")
    .replace(/^\w/, (char) => char.toUpperCase());

/**
 * handleSubmit's onInvalid for admin forms: names the first problem, so an
 * error on a field that isn't visible (e.g. an image) never looks like a
 * dead Save button.
 */
export function onInvalid<T extends FieldValues>(errors: FieldErrors<T>) {
  const found = firstError(errors as FieldErrors);
  toast.error(found ? `${label(found.path)}: ${found.message}` : "Check the form and try again");
}

/** Readable message from a failed server call (unwraps server-side validation errors). */
export function errorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  if (message.trim().startsWith("[")) {
    try {
      const issues = JSON.parse(message) as { path?: (string | number)[]; message?: string }[];
      const issue = issues[0];
      if (issue?.message)
        return issue.path?.length
          ? `${label(issue.path.join("."))}: ${issue.message}`
          : issue.message;
    } catch {
      // not JSON
    }
  }
  return message || fallback;
}
