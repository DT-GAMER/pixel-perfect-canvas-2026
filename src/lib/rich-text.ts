// Tiptap / ProseMirror document JSON, as stored in blog_posts.content.
type Attrs = Record<string, string | number | boolean | null>;
export type RichMark = { type: string; attrs?: Attrs };
export type RichNode = {
  type: string;
  attrs?: Attrs;
  content?: RichNode[];
  text?: string;
  marks?: RichMark[];
};
export type RichDoc = { type: "doc"; content?: RichNode[] };

/**
 * The top-level blocks up to and including the Nth paragraph: the free preview
 * of a gated post. Headings, lists and quotes before it come along too.
 */
export function previewBlocks(doc: RichDoc, paragraphs: number): RichNode[] {
  const blocks = doc.content ?? [];
  const preview: RichNode[] = [];
  let seen = 0;
  for (const block of blocks) {
    preview.push(block);
    if (block.type === "paragraph" && ++seen >= paragraphs) break;
  }
  return preview;
}
