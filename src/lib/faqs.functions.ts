import { createServerFn } from "@tanstack/react-start";

export type Faq = { id: string; question: string; answer: string };

/** Published FAQs in display order, for the homepage. */
export const listFaqs = createServerFn({ method: "GET" }).handler(async (): Promise<Faq[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("id, question, answer")
    .eq("is_published", true)
    .order("display_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data;
});
