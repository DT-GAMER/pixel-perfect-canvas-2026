// Shared dashboard building blocks: image upload, sortable lists, delete confirmation.
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useServerFn } from "@tanstack/react-start";
import { GripVertical, ImagePlus, LoaderCircle, Trash2, X } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/lib/admin/media.functions";

export const adminInput = "h-12 text-base";
export const adminSelect =
  "h-12 w-full rounded-md border border-input bg-paper px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Image upload with preview and required alt text (accessibility requirement). */
export function ImageField({
  label,
  folder,
  url,
  alt,
  onChange,
  altError,
}: {
  label: string;
  folder: "sponsors" | "speakers" | "blog";
  url: string | null;
  alt: string;
  onChange: (next: { url: string | null; alt: string }) => void;
  altError?: string | undefined;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const upload = useServerFn(uploadMedia);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", folder);
      const result = await upload({ data: form });
      onChange({ url: result.url, alt });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 font-display font-semibold text-deep-blue">{label}</legend>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border border-light-grey bg-light-grey/40">
          {url ? (
            <img src={url} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <ImagePlus className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={input}
            id={`${id}-file`}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            onChange={(event) => pick(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-full"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {busy ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus aria-hidden="true" />
            )}
            {url ? "Replace image" : "Upload image"}
          </Button>
          {url && (
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-full"
              onClick={() => onChange({ url: null, alt: "" })}
            >
              <X aria-hidden="true" /> Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">PNG, JPEG, WebP, GIF, or SVG, up to 5 MB.</p>
      {url && (
        <div>
          <Label
            htmlFor={`${id}-alt`}
            className="mb-2 block font-display font-semibold text-deep-blue"
          >
            Alt text (describes the image for screen readers)
          </Label>
          <Input
            id={`${id}-alt`}
            className={adminInput}
            value={alt}
            onChange={(event) => onChange({ url, alt: event.target.value })}
            aria-invalid={!!altError}
          />
          {altError && (
            <p role="alert" className="mt-1 text-sm font-medium text-destructive">
              {altError}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}

/**
 * Drag-and-drop list. Keyboard: focus a handle, press Space, use the arrow
 * keys, press Space again. `onReorder` receives the new id order.
 */
export function SortableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  children,
}: {
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder: (ids: string[]) => void;
  children: (item: T, handle: ReactNode) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map(getId);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Picked up ${labelFor(active.id)}.`,
          onDragOver: ({ active, over }) =>
            over
              ? `${labelFor(active.id)} is now at position ${ids.indexOf(String(over.id)) + 1} of ${ids.length}.`
              : "",
          onDragEnd: ({ active, over }) =>
            over
              ? `Dropped ${labelFor(active.id)} at position ${ids.indexOf(String(over.id)) + 1}.`
              : "",
          onDragCancel: ({ active }) => `Cancelled moving ${labelFor(active.id)}.`,
        },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-light-grey rounded-md bg-paper">
          {items.map((item) => (
            <SortableRow key={getId(item)} id={getId(item)} label={getLabel(item)}>
              {(handle) => children(item, handle)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );

  function labelFor(id: string | number) {
    const item = items.find((candidate) => getId(candidate) === String(id));
    return item ? getLabel(item) : "item";
  }
}

function SortableRow({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${label}`}
      className="flex h-12 w-10 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-light-grey active:cursor-grabbing"
    >
      <GripVertical className="h-5 w-5" aria-hidden="true" />
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 px-3 py-2 ${isDragging ? "relative z-10 bg-paper shadow-lg" : ""}`}
    >
      {children(handle)}
    </li>
  );
}

/** Icon button that asks for confirmation before deleting. */
export function DeleteButton({
  what,
  onConfirm,
}: {
  what: string;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-12 w-12 text-destructive hover:bg-destructive/10"
        aria-label={`Delete ${what}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-5 w-5" aria-hidden="true" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {what}?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-12 rounded-full bg-destructive text-paper hover:bg-destructive/90"
              onClick={async () => {
                try {
                  await onConfirm();
                } catch {
                  toast.error(`Couldn't delete ${what}. Please try again.`);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
