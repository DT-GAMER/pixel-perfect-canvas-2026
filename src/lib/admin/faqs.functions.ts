import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function admin() {
  const { requireStaff } = await import("@/lib/staff.server");
  await requireStaff("admin");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export type AdminFaq = {
  id: string;
  question: string;
  answer: string;
  is_published: boolean;
  display_order: number;
};

export const faqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().trim().min(5, "Write the question (at least 5 characters)").max(200),
  answer: z.string().trim().min(5, "Write the answer (at least 5 characters)").max(2000),
  isPublished: z.boolean(),
});
export type FaqForm = z.input<typeof faqSchema>;

export const faqsDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db
    .from("faqs")
    .select("id, question, answer, is_published, display_order")
    .order("display_order")
    .order("created_at");
  fail(error);
  return (data ?? []) as AdminFaq[];
});

export const saveFaq = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => faqSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const row = { question: data.question, answer: data.answer, is_published: data.isPublished };
    if (data.id) {
      fail((await db.from("faqs").update(row).eq("id", data.id)).error);
    } else {
      const { data: last } = await db
        .from("faqs")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      fail(
        (await db.from("faqs").insert({ ...row, display_order: (last?.display_order ?? -1) + 1 }))
          .error,
      );
    }
    return { ok: true };
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    fail((await db.from("faqs").delete().eq("id", data.id)).error);
    return { ok: true };
  });

export const reorderFaqs = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const results = await Promise.all(
      data.ids.map((id, index) => db.from("faqs").update({ display_order: index }).eq("id", id)),
    );
    for (const result of results) fail(result.error);
    return { ok: true };
  });
