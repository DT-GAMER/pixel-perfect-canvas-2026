import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/site/FormField";
import {
  deleteFaq,
  faqSchema,
  reorderFaqs,
  saveFaq,
  type AdminFaq,
  type FaqForm,
} from "@/lib/admin/faqs.functions";
import { PageHeader } from "./AdminShell";
import { DeleteButton, SortableList, adminInput } from "./fields";
import { errorMessage, onInvalid } from "./form-errors";

export function FaqsAdmin({ faqs }: { faqs: AdminFaq[] }) {
  const router = useRouter();
  const reorder = useServerFn(reorderFaqs);
  const remove = useServerFn(deleteFaq);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);
  const list = order
    ? order.map((id) => faqs.find((faq) => faq.id === id)).filter((faq): faq is AdminFaq => !!faq)
    : faqs;

  return (
    <>
      <PageHeader
        title="FAQ"
        description="Questions shown in the homepage FAQ, in this order."
        actions={
          editing !== "new" && (
            <Button className="h-12 rounded-full px-6" onClick={() => setEditing("new")}>
              <Plus aria-hidden="true" /> Add question
            </Button>
          )
        }
      />
      {editing === "new" && (
        <div className="mb-6 rounded-md bg-paper p-5">
          <FaqEditor faq={null} onDone={() => setEditing(null)} />
        </div>
      )}
      {list.length === 0 ? (
        <p className="rounded-md bg-paper p-6 text-muted-foreground">
          No questions yet. The homepage hides the FAQ until you add one.
        </p>
      ) : (
        <SortableList
          items={list}
          getId={(faq) => faq.id}
          getLabel={(faq) => faq.question}
          onReorder={async (ids) => {
            setOrder(ids);
            try {
              await reorder({ data: { ids } });
              await router.invalidate();
            } catch {
              toast.error("Couldn't save the new order");
            }
            setOrder(null);
          }}
        >
          {(faq, handle) =>
            editing === faq.id ? (
              <div className="w-full py-3">
                <FaqEditor faq={faq} onDone={() => setEditing(null)} />
              </div>
            ) : (
              <>
                {handle}
                <div className="min-w-0 flex-1 py-2">
                  <p className="font-semibold text-ink">
                    {faq.question}
                    {!faq.is_published && (
                      <span className="ml-2 rounded bg-light-grey px-1.5 py-0.5 text-xs text-muted-foreground">
                        Hidden
                      </span>
                    )}
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{faq.answer}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  aria-label={`Edit “${faq.question}”`}
                  onClick={() => setEditing(faq.id)}
                >
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                </Button>
                <DeleteButton
                  what="this question"
                  onConfirm={async () => {
                    await remove({ data: { id: faq.id } });
                    toast.success("Question deleted");
                    await router.invalidate();
                  }}
                />
              </>
            )
          }
        </SortableList>
      )}
    </>
  );
}

function FaqEditor({ faq, onDone }: { faq: AdminFaq | null; onDone: () => void }) {
  const router = useRouter();
  const save = useServerFn(saveFaq);
  const prefix = faq ? `faq-${faq.id}` : "faq-new";
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FaqForm>({
    resolver: zodResolver(faqSchema) as Resolver<FaqForm>,
    defaultValues: {
      ...(faq ? { id: faq.id } : {}),
      question: faq?.question ?? "",
      answer: faq?.answer ?? "",
      isPublished: faq?.is_published ?? true,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await save({ data: values });
      toast.success(faq ? "Question updated" : "Question added");
      onDone();
      await router.invalidate();
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't save the question"));
    }
  }, onInvalid);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Question" htmlFor={`${prefix}-question`} error={errors.question?.message}>
        <Input
          id={`${prefix}-question`}
          autoFocus
          className={adminInput}
          {...register("question")}
          aria-invalid={!!errors.question}
        />
      </Field>
      <Field label="Answer" htmlFor={`${prefix}-answer`} error={errors.answer?.message}>
        <Textarea
          id={`${prefix}-answer`}
          rows={4}
          className="text-base"
          {...register("answer")}
          aria-invalid={!!errors.answer}
        />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 font-display font-semibold text-deep-blue">
          <Controller
            control={control}
            name="isPublished"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          Show on the homepage
        </label>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" className="h-12 rounded-full" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-12 rounded-full px-6">
            {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />} Save
          </Button>
        </div>
      </div>
    </form>
  );
}
