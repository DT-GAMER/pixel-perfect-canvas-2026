import type { ReactNode } from "react";
import type { RichMark, RichNode } from "@/lib/rich-text";

// Renders Tiptap JSON as React elements (no raw HTML), so post content can't
// inject markup. Unknown node types are skipped.

const SAFE_HREF = /^(https?:|mailto:|\/(?!\/)|#)/i;
const YOUTUBE = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i;

const str = (value: unknown) => (typeof value === "string" ? value : undefined);

function applyMark(mark: RichMark, child: ReactNode, key: number): ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong key={key}>{child}</strong>;
    case "italic":
      return <em key={key}>{child}</em>;
    case "underline":
      return <u key={key}>{child}</u>;
    case "strike":
      return <s key={key}>{child}</s>;
    case "code":
      return (
        <code key={key} className="rounded bg-light-grey px-1.5 py-0.5 text-[0.9em]">
          {child}
        </code>
      );
    case "link": {
      const href = str(mark.attrs?.["href"]);
      if (!href || !SAFE_HREF.test(href)) return child;
      const external = /^https?:/i.test(href);
      return (
        <a
          key={key}
          href={href}
          className="font-semibold text-deep-blue underline decoration-digital-teal decoration-2 underline-offset-4 hover:text-teal-ink"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {child}
        </a>
      );
    }
    default:
      return child;
  }
}

function renderChildren(nodes: RichNode[] | undefined) {
  return nodes?.map((node, index) => renderNode(node, index));
}

function renderNode(node: RichNode, key: number): ReactNode {
  switch (node.type) {
    case "text":
      return (node.marks ?? []).reduce<ReactNode>(
        (child, mark, index) => applyMark(mark, child, index),
        node.text ?? "",
      );
    case "paragraph":
      return <p key={key}>{renderChildren(node.content)}</p>;
    case "heading": {
      const level = Number(node.attrs?.["level"] ?? 2);
      if (level <= 2)
        return (
          <h2 key={key} className="!mt-12 text-h3 text-deep-blue">
            {renderChildren(node.content)}
          </h2>
        );
      return (
        <h3 key={key} className="!mt-10 font-display text-xl font-bold text-deep-blue">
          {renderChildren(node.content)}
        </h3>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-2 pl-6 marker:text-teal-ink">
          {renderChildren(node.content)}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-2 pl-6 marker:font-bold marker:text-teal-ink">
          {renderChildren(node.content)}
        </ol>
      );
    case "listItem":
      return (
        <li key={key} className="pl-1 [&>p]:m-0">
          {renderChildren(node.content)}
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-signal-orange pl-6 font-display text-2xl font-semibold leading-snug text-deep-blue"
        >
          {renderChildren(node.content)}
        </blockquote>
      );
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} className="border-light-grey" />;
    case "codeBlock":
      return (
        <pre key={key} className="overflow-x-auto rounded-md bg-ink p-5 text-sm text-paper">
          <code>{renderChildren(node.content)}</code>
        </pre>
      );
    case "image": {
      const src = str(node.attrs?.["src"]);
      if (!src || !SAFE_HREF.test(src)) return null;
      return (
        <figure key={key}>
          <img
            src={src}
            alt={str(node.attrs?.["alt"]) ?? ""}
            loading="lazy"
            className="w-full rounded-md"
          />
          {str(node.attrs?.["title"]) && (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {str(node.attrs?.["title"])}
            </figcaption>
          )}
        </figure>
      );
    }
    case "youtube": {
      const src = str(node.attrs?.["src"]);
      if (!src || !YOUTUBE.test(src)) return null;
      return (
        <div key={key} className="aspect-video overflow-hidden rounded-md bg-ink">
          <iframe
            src={src}
            title="Embedded video"
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      );
    }
    default:
      return null;
  }
}

export function ArticleBody({ blocks }: { blocks: RichNode[] }) {
  return <div className="space-y-6 text-lg leading-[1.75] text-ink">{renderChildren(blocks)}</div>;
}
