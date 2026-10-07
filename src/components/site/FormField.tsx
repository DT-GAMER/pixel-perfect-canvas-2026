import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Labelled form control with an inline, announced error message. */
export function Field({
  label,
  htmlFor,
  error,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  error: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-2 block font-display font-semibold text-deep-blue">
        {label}
      </Label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
