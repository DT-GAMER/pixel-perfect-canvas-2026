// Formatting shared by server and client. Fixed time zone so SSR and hydration agree.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Lagos",
});

/** "16 September 2026" */
export const formatDate = (iso: string) => (iso ? dateFormat.format(new Date(iso)) : "");
