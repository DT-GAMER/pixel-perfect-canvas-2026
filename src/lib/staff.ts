// Shared (client + server) staff types and permissions.
export type StaffRole = "admin" | "editor";
export type Staff = { id: string; email: string; fullName: string | null; role: StaffRole };

/** Editors manage the blog only; admins manage everything. */
export const canAccess = (role: StaffRole, area: "blog" | "admin") =>
  role === "admin" || area === "blog";
