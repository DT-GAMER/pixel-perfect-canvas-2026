import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useServerFn } from "@tanstack/react-start";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Youtube as YoutubeIcon,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/lib/admin/media.functions";

// Mirrors the public ArticleBody styles so writing looks like reading.
const CONTENT_CLASS =
  "min-h-[420px] space-y-5 px-5 py-6 text-lg leading-[1.75] text-ink focus:outline-none [&_a]:font-semibold [&_a]:text-deep-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-signal-orange [&_blockquote]:pl-6 [&_blockquote]:font-display [&_blockquote]:text-2xl [&_blockquote]:font-semibold [&_blockquote]:text-deep-blue [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-[28px] [&_h2]:font-bold [&_h2]:text-deep-blue [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-deep-blue [&_hr]:border-light-grey [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-md [&_img]:rounded-md [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_ul]:list-disc [&_ul]:pl-6";

type Prompt = "link" | "image" | "youtube" | null;

export function RichTextEditor({
  content,
  onChange,
  labelId,
}: {
  content: JSONContent;
  onChange: (doc: JSONContent) => void;
  labelId: string;
}) {
  const [prompt, setPrompt] = useState<Prompt>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["https", "http", "mailto"],
        },
      }),
      Image.configure({ allowBase64: false }),
      Youtube.configure({ nocookie: true, controls: true }),
      Placeholder.configure({
        placeholder: "Start writing… The first paragraphs are the free preview on gated posts.",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: CONTENT_CLASS,
        "aria-labelledby": labelId,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });

  if (!editor) {
    return (
      <div className="flex min-h-[480px] items-center justify-center rounded-md border border-input bg-paper text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-input bg-paper focus-within:ring-2 focus-within:ring-ring">
      <Toolbar editor={editor} onPrompt={setPrompt} />
      <EditorContent editor={editor} />
      {prompt === "link" && <LinkPrompt editor={editor} onClose={() => setPrompt(null)} />}
      {prompt === "image" && <ImagePrompt editor={editor} onClose={() => setPrompt(null)} />}
      {prompt === "youtube" && <YoutubePrompt editor={editor} onClose={() => setPrompt(null)} />}
    </div>
  );
}

function Toolbar({ editor, onPrompt }: { editor: Editor; onPrompt: (prompt: Prompt) => void }) {
  // Re-render the toolbar when the selection's formatting changes.
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      h2: current.isActive("heading", { level: 2 }),
      h3: current.isActive("heading", { level: 3 }),
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      underline: current.isActive("underline"),
      link: current.isActive("link"),
      bullet: current.isActive("bulletList"),
      ordered: current.isActive("orderedList"),
      quote: current.isActive("blockquote"),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  const tools: (
    { label: string; icon: LucideIcon; run: () => void; active?: boolean; disabled?: boolean } | "|"
  )[] = [
    {
      label: "Heading",
      icon: Heading2,
      active: state.h2,
      run: () => chain().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Subheading",
      icon: Heading3,
      active: state.h3,
      run: () => chain().toggleHeading({ level: 3 }).run(),
    },
    "|",
    { label: "Bold", icon: Bold, active: state.bold, run: () => chain().toggleBold().run() },
    {
      label: "Italic",
      icon: Italic,
      active: state.italic,
      run: () => chain().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: Underline,
      active: state.underline,
      run: () => chain().toggleUnderline().run(),
    },
    { label: "Link", icon: Link2, active: state.link, run: () => onPrompt("link") },
    "|",
    {
      label: "Bulleted list",
      icon: List,
      active: state.bullet,
      run: () => chain().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: state.ordered,
      run: () => chain().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: Quote,
      active: state.quote,
      run: () => chain().toggleBlockquote().run(),
    },
    { label: "Divider", icon: Minus, run: () => chain().setHorizontalRule().run() },
    "|",
    { label: "Image", icon: ImagePlus, run: () => onPrompt("image") },
    { label: "YouTube video", icon: YoutubeIcon, run: () => onPrompt("youtube") },
    "|",
    { label: "Undo", icon: Undo2, disabled: !state.canUndo, run: () => chain().undo().run() },
    { label: "Redo", icon: Redo2, disabled: !state.canRedo, run: () => chain().redo().run() },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-light-grey bg-paper p-2"
    >
      {tools.map((tool, index) =>
        tool === "|" ? (
          <span key={`sep-${index}`} className="mx-1 h-6 w-px bg-light-grey" aria-hidden="true" />
        ) : (
          <button
            key={tool.label}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            {...(tool.active !== undefined ? { "aria-pressed": tool.active } : {})}
            disabled={tool.disabled}
            onClick={tool.run}
            className="flex h-10 w-10 items-center justify-center rounded-md text-deep-blue hover:bg-light-grey disabled:opacity-40 aria-pressed:bg-deep-blue aria-pressed:text-paper"
          >
            <tool.icon className="h-5 w-5" aria-hidden="true" />
          </button>
        ),
      )}
    </div>
  );
}

function PromptDialog({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-paper">
        <DialogTitle className="font-display text-xl font-bold text-deep-blue">{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function LinkPrompt({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [href, setHref] = useState<string>(editor.getAttributes("link")["href"] ?? "");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = href.trim();
    if (!value) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else if (!/^(https?:\/\/|mailto:|\/)/i.test(value)) {
      toast.error("Links must start with https://, mailto:, or /");
      return;
    } else editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
    onClose();
  };
  return (
    <PromptDialog
      title="Link"
      description="Select text first, then add a link. Leave empty to remove it."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="link-href" className="mb-2 block font-semibold text-deep-blue">
            URL
          </Label>
          <Input
            id="link-href"
            autoFocus
            className="h-12"
            placeholder="https://"
            value={href}
            onChange={(event) => setHref(event.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" className="h-12 rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="h-12 rounded-full">
            Apply
          </Button>
        </div>
      </form>
    </PromptDialog>
  );
}

function ImagePrompt({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const upload = useServerFn(uploadMedia);
  const file = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const picked = file.current?.files?.[0];
    if (!picked) {
      toast.error("Choose an image");
      return;
    }
    if (alt.trim().length < 3) {
      toast.error("Describe the image for screen readers");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", picked);
      form.set("folder", "blog");
      const { url } = await upload({ data: form });
      editor.chain().focus().setImage({ src: url, alt: alt.trim() }).run();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PromptDialog
      title="Insert image"
      description="PNG, JPEG, WebP, GIF, or SVG, up to 5 MB."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="image-file" className="mb-2 block font-semibold text-deep-blue">
            Image
          </Label>
          <input
            ref={file}
            id="image-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="block w-full text-sm file:mr-3 file:h-10 file:rounded-full file:border-0 file:bg-light-grey file:px-4 file:font-semibold"
          />
        </div>
        <div>
          <Label htmlFor="image-alt" className="mb-2 block font-semibold text-deep-blue">
            Alt text
          </Label>
          <Input
            id="image-alt"
            className="h-12"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="What does the image show?"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" className="h-12 rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy} className="h-12 rounded-full">
            {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />} Insert
          </Button>
        </div>
      </form>
    </PromptDialog>
  );
}

function YoutubePrompt({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url.trim())) {
      toast.error("Paste a YouTube link (https://youtube.com/… or https://youtu.be/…)");
      return;
    }
    editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
    onClose();
  };
  return (
    <PromptDialog
      title="Embed YouTube video"
      description="Videos load from youtube-nocookie.com for readers' privacy."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="youtube-url" className="mb-2 block font-semibold text-deep-blue">
            YouTube link
          </Label>
          <Input
            id="youtube-url"
            autoFocus
            className="h-12"
            placeholder="https://youtu.be/…"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" className="h-12 rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="h-12 rounded-full">
            Embed
          </Button>
        </div>
      </form>
    </PromptDialog>
  );
}
