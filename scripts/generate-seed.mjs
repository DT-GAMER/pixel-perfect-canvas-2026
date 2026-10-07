// Generates supabase/seed.sql: sample blog categories and posts.
// Posts are written in a small markdown-like format and converted to Tiptap JSON.
//
//   node scripts/generate-seed.mjs && npm run db:seed
//
// Seeding is idempotent (ON CONFLICT DO NOTHING on slugs).
import { writeFileSync } from "node:fs";

const categories = [
  { slug: "ai-and-jobs", name: "AI & Jobs", description: "How AI is changing work, careers, and skills in Nigeria." },
  { slug: "privacy", name: "Privacy", description: "Personal data, rights, and trust in an AI-driven economy." },
  { slug: "financial-security", name: "Financial Security", description: "Fintech, fraud, and keeping money safe as AI spreads." },
  { slug: "community", name: "Community", description: "News and stories from the C8 Tech Summit community." },
];

const posts = [
  {
    slug: "will-ai-take-nigerian-jobs-or-create-new-ones",
    title: "Will AI take Nigerian jobs, or create new ones?",
    excerpt: "The honest answer is both. What matters is which tasks change first, who gets to adapt, and what we do in the next few years.",
    category: "ai-and-jobs",
    tags: ["AI", "jobs", "skills"],
    cover: "/blog/ai-jobs.jpg",
    coverAlt: "Young professionals collaborating around laptops at a workshop table",
    publishedAt: "2026-09-16T09:00:00+01:00",
    body: `
Every few weeks a new headline announces that AI is coming for our jobs. Most of those headlines are written with other labour markets in mind. Nigeria's economy looks different, and so will the way AI reshapes it.

The useful question is not "will AI replace people?" but "which tasks will change first, and who will be ready when they do?"

## Tasks change before jobs do

AI tools are good at drafting, summarising, classifying, and answering routine questions. That means the first changes show up inside jobs: the customer support agent who now handles more complex cases, the analyst who spends less time cleaning spreadsheets, the marketer who can test ten versions of an ad instead of two.

Roles built almost entirely from repetitive, screen-based tasks are the most exposed. Roles that depend on judgement, trust, relationships, and local context are much harder to automate.

## Where new work appears

New tools create new work around them. Someone has to adapt AI products to Nigerian languages, accents, and business realities. Someone has to label data, evaluate outputs, build integrations, train teams, and explain risks to customers and regulators.

- **Builders** who can ship AI features into products Nigerians already use
- **Translators** between technology and industries like agriculture, logistics, health, and finance
- **Trust roles** covering data protection, security, quality, and responsible use

## What to do now

If you are early in your career, learn to use AI tools well and pair that with a domain you understand deeply. If you lead a team, start small experiments, measure what actually improves, and invest in reskilling before you restructure.

> The people most at risk are not those whose jobs AI can touch. They are the ones who never get the chance to adapt.

At C8 Tech Summit 2026 we will put these questions to builders, employers, and emerging professionals, and ask what a fair transition looks like for Nigeria.
`,
  },
  {
    slug: "what-your-data-is-worth-in-an-ai-economy",
    title: "What your data is worth in an AI economy",
    excerpt: "AI runs on personal data. Here is what that means for Nigerians, the rights you already have, and what builders should get right.",
    category: "privacy",
    tags: ["privacy", "data protection", "NDPA"],
    cover: "/blog/privacy.jpg",
    coverAlt: "Professionals reviewing information on tablets in a bright office",
    publishedAt: "2026-09-23T09:00:00+01:00",
    body: `
Every app you sign up for asks for something: your phone number, your BVN, your location, your contacts. AI systems make that information more valuable, because patterns in data are exactly what they learn from.

That raises a simple question with complicated answers: who benefits from your data, and who protects it?

## Data is the raw material

Recommendation engines, credit scoring models, fraud detection, and chatbots all improve with more data. That creates a strong incentive to collect as much as possible and keep it for as long as possible.

For users, the risk is not only a data breach. It is also being profiled, priced, or refused a service by a system you cannot see or question.

## You already have rights

The Nigeria Data Protection Act 2023 gives people rights over their personal data, including the right to be informed about how it is used, to access it, to correct it, and in many cases to have it deleted. Organisations need a lawful basis to process personal data and must keep it secure.

Rights only matter if people know about them and companies take them seriously.

## What builders should get right

- Collect only what the product genuinely needs
- Explain, in plain language, what data is used for, including AI training
- Make it easy to access, correct, and delete data
- Treat security as a product feature, not an afterthought

> Trust is a competitive advantage. The products that win in Nigeria's AI era will be the ones people feel safe using.

Our 2026 summit will bring builders, privacy professionals, and everyday users together to talk about what responsible data use should look like in Nigeria.
`,
  },
  {
    slug: "ai-powered-fraud-and-how-to-stay-a-step-ahead",
    title: "AI-powered fraud and how to stay a step ahead",
    excerpt: "Scammers are using AI too: cloned voices, convincing messages, fake documents. Here is how individuals and fintech teams can respond.",
    category: "financial-security",
    tags: ["fraud", "fintech", "security"],
    cover: "/blog/fraud.jpg",
    coverAlt: "A team discussing data on a large digital screen in a modern office",
    publishedAt: "2026-09-30T09:00:00+01:00",
    body: `
Nigerians have become experts at spotting a badly written scam message. AI is removing those warning signs. Messages are now fluent, personalised, and sent at scale. Voices can be cloned from a short clip. Documents can be faked in minutes.

The good news is that AI is also one of the best tools we have for fighting back.

## How the threat is changing

- **Better impersonation:** messages and calls that sound exactly like a bank, an employer, or a family member
- **Scale:** thousands of tailored attempts instead of one generic broadcast
- **Synthetic identities:** fake profiles and documents used to open accounts or take loans

## What individuals can do

Slow down whenever a message creates urgency. Verify requests for money through a second channel you already trust, such as calling the person back on a number you know. Agree on a simple code word with family for emergencies. Never share one-time passwords, whoever asks.

## What fintech teams can do

Fraud prevention has to be layered. Behavioural signals, device checks, transaction monitoring, and fast human review all matter. AI models can flag unusual patterns in real time, but they need good data, regular testing, and clear routes for customers to report and recover.

> Security that frustrates honest customers pushes them away. The goal is protection that feels invisible until it is needed.

At C8 Tech Summit 2026 we will hear from people building payments and security products about what is working, and what everyone else can learn from them.
`,
  },
  {
    slug: "why-c8-is-giving-emerging-voices-the-stage",
    title: "Why C8 is giving emerging voices the stage",
    excerpt: "Most tech events spotlight people who have already made it. We think great ideas also come from people who are just getting started.",
    category: "community",
    tags: ["community", "C8 Tech Summit"],
    cover: "/blog/community.jpg",
    coverAlt: "Attendees networking in a lively event space",
    publishedAt: "2026-10-03T09:00:00+01:00",
    free: true,
    body: `
Nigeria's tech ecosystem is full of talented founders, builders, researchers, and young professionals doing great work. But they do not always have the right platforms to meet, share ideas, learn from each other, or find opportunities.

Most tech events focus on people who have already made it: successful founders, executives, and well-known leaders. Their experience matters. But great ideas don't only come from people who are already successful.

## A seat at the table

C8 Tech Summit exists to bring different parts of the ecosystem together, emerging and established, and give emerging voices real space to share their ideas and help shape where the industry goes next.

- Have important conversations
- Share knowledge
- Meet and build relationships
- Discover opportunities
- Collaborate on ideas

## This year's conversation

Our 2026 theme is *Navigating Nigeria's AI Revolution: Jobs, Privacy, & Financial Security*. AI is a global conversation, but much of it is shaped by experiences outside Nigeria. We want to bring it home: what AI actually means for our jobs, our data, our businesses, and our everyday lives.

## Join us

The summit is live online on 15 October 2026 at 4:00 PM WAT. Register on this site and we will send your joining link before the event. Bring your questions, and your ideas.
`,
  },
  {
    slug: "five-ai-skills-every-nigerian-professional-can-learn-this-year",
    title: "Five AI skills every Nigerian professional can learn this year",
    excerpt: "You don't need to become a machine learning engineer. These practical skills will make you more effective in almost any role.",
    category: "ai-and-jobs",
    tags: ["skills", "careers", "AI"],
    cover: "/blog/skills.jpg",
    coverAlt: "Colleagues at a workshop discussing ideas over laptops and notes",
    publishedAt: "2026-10-06T09:00:00+01:00",
    body: `
Learning about AI can feel overwhelming. The good news is that the most valuable skills for most professionals are practical, and you can start building them this week.

## 1. Asking good questions

Getting useful output from AI tools depends on clear instructions: context, constraints, examples, and the format you want. This is really a communication skill, and it improves with practice.

## 2. Checking the work

AI tools can be confidently wrong. Knowing how to verify facts, test outputs, and spot gaps is what separates people who use AI well from people who are misled by it.

## 3. Working with data

You do not need to be a data scientist, but understanding where data comes from, how it can be biased, and how to read a simple chart will help you make better decisions with AI tools.

## 4. Automating the boring parts

Many everyday tasks, such as drafting emails, summarising meetings, and organising information, can be partly automated. Learning to spot those opportunities frees time for higher-value work.

## 5. Thinking about risk

Responsible use means knowing what not to paste into a tool, when a decision needs a human, and how to protect customers' privacy. Employers increasingly value people who can use AI safely.

> Start with one tool, one task, and one week. Small experiments compound.

We will be talking about skills, careers, and the future of work at C8 Tech Summit 2026.
`,
  },
  {
    slug: "c8-tech-summit-2026-what-we-learned",
    title: "C8 Tech Summit 2026: what we learned",
    excerpt: "Highlights from our conversation on Nigeria's AI revolution: jobs, privacy, and financial security.",
    category: "community",
    tags: ["C8 Tech Summit", "recap"],
    cover: "/blog/community.jpg",
    coverAlt: "Attendees networking in a lively event space",
    status: "scheduled",
    publishedAt: "2026-10-20T09:00:00+01:00",
    body: `
This recap will be published after the summit. It is a scheduled post: it stays hidden until its publish date.

## Placeholder

Replace this content with highlights from the event.
`,
  },
];

// ---- tiny markdown-ish → Tiptap JSON converter ----

function inline(text) {
  const nodes = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) nodes.push({ type: "text", text: text.slice(last, match.index) });
    if (match[1]) nodes.push({ type: "text", text: match[1], marks: [{ type: "bold" }] });
    else if (match[2]) nodes.push({ type: "text", text: match[2], marks: [{ type: "italic" }] });
    else nodes.push({ type: "text", text: match[3], marks: [{ type: "link", attrs: { href: match[4] } }] });
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push({ type: "text", text: text.slice(last) });
  return nodes;
}

function toDoc(markdown) {
  const content = [];
  const blocks = markdown.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines[0].startsWith("## ")) {
      content.push({ type: "heading", attrs: { level: 2 }, content: inline(lines[0].slice(3)) });
    } else if (lines.every((line) => line.startsWith("- "))) {
      content.push({
        type: "bulletList",
        content: lines.map((line) => ({ type: "listItem", content: [{ type: "paragraph", content: inline(line.slice(2)) }] })),
      });
    } else if (lines[0].startsWith("> ")) {
      content.push({ type: "blockquote", content: [{ type: "paragraph", content: inline(lines.map((l) => l.replace(/^> ?/, "")).join(" ")) }] });
    } else {
      content.push({ type: "paragraph", content: inline(lines.join(" ")) });
    }
  }
  return { type: "doc", content };
}

function readingMinutes(markdown) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const sql = (value) => (value == null ? "NULL" : `'${String(value).replace(/'/g, "''")}'`);
const sqlArray = (values) => `ARRAY[${values.map(sql).join(", ")}]::text[]`;

const out = [
  "-- Generated by scripts/generate-seed.mjs. Edit that file, not this one.",
  "-- Sample content so the site looks complete. Safe to re-run.",
  "",
  "INSERT INTO public.categories (slug, name, description, display_order) VALUES",
  categories.map((c, i) => `  (${sql(c.slug)}, ${sql(c.name)}, ${sql(c.description)}, ${i})`).join(",\n"),
  "ON CONFLICT (slug) DO NOTHING;",
  "",
];

for (const post of posts) {
  out.push(
    `INSERT INTO public.blog_posts (slug, title, excerpt, content, cover_image_url, cover_image_alt, category_id, tags, is_free, reading_minutes, status, published_at)`,
    `SELECT ${sql(post.slug)}, ${sql(post.title)}, ${sql(post.excerpt)}, ${sql(JSON.stringify(toDoc(post.body)))}::jsonb, ${sql(post.cover)}, ${sql(post.coverAlt)},`,
    `  (SELECT id FROM public.categories WHERE slug = ${sql(post.category)}), ${sqlArray(post.tags)}, ${post.free ? "true" : "false"}, ${readingMinutes(post.body)}, ${sql(post.status ?? "published")}, ${sql(post.publishedAt)}`,
    "ON CONFLICT (slug) DO NOTHING;",
    "",
  );
}

writeFileSync("supabase/seed.sql", out.join("\n"));
console.log(`Wrote supabase/seed.sql (${categories.length} categories, ${posts.length} posts)`);
