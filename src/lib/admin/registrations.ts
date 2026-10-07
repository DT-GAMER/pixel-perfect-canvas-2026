import { z } from "zod";

// Filters shared by the registrations table (URL search params), the list
// server function, and the CSV export.
export const SORTABLE = [
  "created_at",
  "full_name",
  "email",
  "profession",
  "country",
  "city",
] as const;

export const registrationFiltersSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  profession: z.string().max(80).optional().catch(undefined),
  country: z.string().max(80).optional().catch(undefined),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
  subscribed: z.enum(["yes", "no"]).optional().catch(undefined),
  email: z.enum(["sent", "failed", "pending"]).optional().catch(undefined),
  sort: z.enum(SORTABLE).optional().catch(undefined),
  dir: z.enum(["asc", "desc"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10000).optional().catch(undefined),
});

export type RegistrationFilters = z.infer<typeof registrationFiltersSchema>;

export const PAGE_SIZE = 25;
