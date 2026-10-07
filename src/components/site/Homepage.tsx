import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MonitorPlay, Quote } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import type { PostSummary } from "@/lib/blog.functions";
import type { Speaker } from "@/lib/speakers.functions";
import type { Sponsor } from "@/lib/sponsors.functions";
import type { Faq } from "@/lib/faqs.functions";
import { SpeakerCard } from "./SpeakerCard";
import { SponsorsPreview } from "./SponsorsPreview";
import { useCountdown } from "./CountdownPill";
import { Arcs } from "./Logo";
import aiHealthImage from "@/assets/track-ai-health.jpg";
import innovationImage from "@/assets/track-innovation.jpg";
import entrepreneurshipImage from "@/assets/track-entrepreneurship.jpg";
import communityImage from "@/assets/track-community.jpg";
import heroImage from "@/assets/c8-summit-hero.jpeg";

const tracks = [
  {
    number: "01",
    title: "AI and Nigerian jobs",
    subtitle: "What changes, what grows, what to prepare for",
    description:
      "Which roles will AI reshape in Nigeria, which new ones will it create, and how professionals, students, and employers can get ready now.",
    image: entrepreneurshipImage,
    accent: "bg-digital-lime text-deep-blue",
  },
  {
    number: "02",
    title: "Privacy in the age of AI",
    subtitle: "Your data, your rights",
    description:
      "From phone numbers to health records, AI runs on personal data. What does privacy mean for Nigerians, and how should products and policy protect it?",
    image: innovationImage,
    accent: "bg-digital-teal text-deep-blue",
  },
  {
    number: "03",
    title: "Financial security",
    subtitle: "Money, fintech, and fraud in an AI world",
    description:
      "How AI is changing payments, lending, and fraud, and what individuals, businesses, and fintech builders can do to keep money safe.",
    image: aiHealthImage,
    accent: "bg-signal-orange text-deep-blue",
  },
  {
    number: "04",
    title: "Nigeria's direction",
    subtitle: "Every voice at the table",
    description:
      "Emerging and established builders, experts, and founders on the direction Nigeria should take, and the part each of us can play.",
    image: communityImage,
    accent: "bg-light-grey text-deep-blue",
  },
];

const pad = (value: number) => String(value).padStart(2, "0");

function HeroCountdown() {
  const time = useCountdown(EVENT.startsAt);
  const values = time
    ? ([
        [time.d, "Days"],
        [time.h, "Hours"],
        [time.m, "Minutes"],
        [time.s, "Seconds"],
      ] as const)
    : ([
        [0, "Days"],
        [0, "Hours"],
        [0, "Minutes"],
        [0, "Seconds"],
      ] as const);
  return (
    <div
      className="grid w-full max-w-2xl grid-cols-4 divide-x divide-paper/20 border-y border-paper/20 py-5"
      aria-label="Countdown to the summit"
    >
      {values.map(([value, label]) => (
        <div key={label} className="text-center">
          <strong className="block font-display text-2xl text-digital-lime tabular-nums sm:text-4xl">
            {label === "Days" ? value : pad(value)}
          </strong>
          <span className="mt-1 block text-xs text-paper/65 sm:text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setDisplay(value);
        } else {
          const started = performance.now();
          const tick = (now: number) => {
            const progress = Math.min(1, (now - started) / 1100);
            setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);
  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

type Props = { latestPosts: PostSummary[]; speakers: Speaker[]; sponsors: Sponsor[]; faqs: Faq[] };

export function Homepage({ latestPosts, speakers, sponsors, faqs }: Props) {
  return (
    <>
      <section className="relative flex min-h-[calc(100svh-9.5rem)] items-end overflow-hidden bg-deep-blue text-paper">
        <img
          src={heroImage}
          alt="A technology summit audience gathered around an illuminated stage"
          fetchPriority="high"
          width={1080}
          height={608}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-deep-blue/70" />
        <Arcs className="arc-spin pointer-events-none absolute -right-52 -top-24 h-[560px] w-[560px] opacity-20 sm:-right-36 sm:h-[680px] sm:w-[680px] md:-right-12 md:-top-28 md:h-[820px] md:w-[820px] md:opacity-30" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-20 md:pb-10 md:pt-28">
          <div className="max-w-4xl animate-enter-up border-l-2 border-digital-lime pl-5 md:pl-8">
            <p className="font-display text-sm font-bold uppercase text-digital-lime">
              {EVENT.venue} · {EVENT.dateLabel}
            </p>
            <h1 className="mt-4 text-h1 text-paper">
              C8 Tech
              <br />
              Summit
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-medium text-paper/90 md:text-2xl">
              {EVENT.edition} theme: {EVENT.theme}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                data-register
                className="min-h-12 rounded-full px-7 font-display font-bold"
              >
                Register now <ArrowRight />
              </Button>
              <a
                href="#about"
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-paper/80 bg-deep-blue/25 px-7 font-display font-semibold backdrop-blur-sm transition hover:bg-paper hover:text-deep-blue"
              >
                Discover the summit
              </a>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-6 border-t border-paper/30 bg-deep-blue/25 px-4 py-5 backdrop-blur-sm sm:px-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm sm:text-base">
              <span className="flex items-center gap-2">
                <CalendarDays className="text-digital-lime" /> {EVENT.dateLabel}, {EVENT.timeLabel}
              </span>
              <span className="flex items-center gap-2">
                <MonitorPlay className="text-digital-lime" /> {EVENT.format}, join from anywhere
              </span>
            </div>
            <HeroCountdown />
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 bg-paper py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <p className="reveal font-display text-sm font-bold uppercase text-digital-teal">
              About C8
            </p>
            <div className="reveal">
              <h2 className="max-w-4xl text-h2 text-deep-blue">
                Where Nigeria's tech community comes together.
              </h2>
              <div className="mt-8 grid gap-6 text-muted-foreground md:grid-cols-2">
                <p>
                  C8 Tech Summit is a tech community that brings people in technology together to
                  have important conversations, share ideas, build relationships, and discover
                  opportunities, through our annual summit, events, and year-round activities.
                </p>
                <p>
                  Most tech events spotlight people who have already made it. C8 gives emerging
                  builders, experts, and founders the stage too, alongside established leaders, so
                  different voices can help shape the future of technology in Nigeria and Africa.
                </p>
              </div>
            </div>
          </div>
          {EVENT.stats.length > 0 && (
            <div className="mt-20 grid grid-cols-2 border-y border-deep-blue/15 md:grid-cols-4">
              {EVENT.stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`reveal px-3 py-8 md:px-6 ${index > 0 ? "border-l border-deep-blue/15" : ""}`}
                >
                  <strong className="block font-display text-3xl text-deep-blue sm:text-5xl">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </strong>
                  <span className="mt-2 block text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="theme" className="scroll-mt-20 bg-digital-teal py-24 text-deep-blue md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div className="reveal">
              <p className="font-display text-sm font-bold uppercase">{EVENT.edition} theme</p>
              <h2 className="mt-4 text-h2">{EVENT.themeShort}.</h2>
            </div>
            <p className="reveal max-w-xl text-lg">
              AI is a global conversation, but much of it is shaped by experiences outside Nigeria.
              We're bringing it home: what AI means for our jobs, our privacy, our money, and the
              direction Nigeria should take.
            </p>
          </div>
          <div
            className="mt-14 overflow-hidden border-y border-deep-blue/25 py-5"
            aria-label="Programme formats"
          >
            <div className="programme-ticker flex w-max gap-8 font-display text-3xl font-bold md:text-5xl">
              {[
                "Keynotes",
                "Panels",
                "Fireside chats",
                "Live Q&A",
                "Networking",
                "Keynotes",
                "Panels",
                "Fireside chats",
                "Live Q&A",
                "Networking",
              ].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className={i % 5 === 2 ? "text-digital-lime" : "text-deep-blue/45"}
                >
                  {item} <span aria-hidden="true">·</span>
                </span>
              ))}
            </div>
          </div>
          <div className="mt-16">
            {tracks.map((track, index) => (
              <article
                key={track.title}
                className="sticky mb-8 min-h-[460px] overflow-hidden rounded-md shadow-2xl"
                style={{ top: `${96 + index * 14}px` }}
              >
                <img
                  src={track.image}
                  alt=""
                  loading="lazy"
                  width={1536}
                  height={1024}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-ink/70" />
                <div className="relative flex min-h-[460px] flex-col justify-between p-7 text-paper md:p-12">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`rounded-full px-4 py-2 font-display text-sm font-bold ${track.accent}`}
                    >
                      {track.number}
                    </span>
                    <span className="font-display text-sm uppercase text-paper/70">
                      Conversation
                    </span>
                  </div>
                  <div className="max-w-3xl">
                    <p className="font-display font-semibold text-digital-lime">{track.subtitle}</p>
                    <h3 className="mt-3 text-h2">{track.title}</h3>
                    <p className="mt-5 max-w-2xl text-paper/80">{track.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light-grey py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="reveal flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-display text-sm font-bold uppercase text-digital-teal">
                On the stage
              </p>
              <h2 className="mt-3 text-h2 text-deep-blue">Voices shaping the conversation.</h2>
            </div>
            <Link
              to="/speakers"
              className="inline-flex min-h-12 items-center gap-2 font-display font-bold text-deep-blue hover:text-digital-teal"
            >
              See all speakers <ArrowRight />
            </Link>
          </div>
          {speakers.length > 0 ? (
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {speakers.map((speaker) => (
                <SpeakerCard key={speaker.slug} speaker={speaker} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-lg text-muted-foreground">
              Our speaker lineup will be announced soon.
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden bg-paper py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="reveal grid gap-8 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="font-display text-sm font-bold uppercase text-signal-orange">
                Our partners
              </p>
              <h2 className="mt-3 text-h2 text-deep-blue">Backing the builders.</h2>
            </div>
            <p className="max-w-xl text-muted-foreground">
              Organisations helping us bring Nigeria's tech community together and give emerging
              voices a platform.
            </p>
          </div>
        </div>
        <SponsorsPreview sponsors={sponsors} />
        <div className="mx-auto mt-10 max-w-7xl px-5">
          <Link
            to="/sponsors"
            className="inline-flex min-h-12 items-center gap-2 font-display font-bold text-deep-blue hover:text-digital-teal"
          >
            Explore partnerships <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="bg-deep-blue py-24 text-paper md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="reveal flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-display text-sm font-bold uppercase text-digital-lime">
                Latest thinking
              </p>
              <h2 className="mt-3 text-h2">Ideas before the summit.</h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex min-h-12 items-center gap-2 font-display font-bold text-paper hover:text-digital-lime"
            >
              Read all stories <ArrowRight />
            </Link>
          </div>
          <div className="mt-12 grid gap-px bg-paper/20 md:grid-cols-3">
            {latestPosts.map((post, index) => (
              <article
                key={post.slug}
                className="reveal group relative flex min-h-80 flex-col justify-between bg-deep-blue p-7 transition focus-within:ring-4 focus-within:ring-inset focus-within:ring-signal-orange hover:bg-ink"
              >
                <div>
                  <span className="font-display text-sm font-bold text-digital-lime">
                    0{index + 1} · {post.category?.name ?? "Article"}
                  </span>
                  <h3 className="mt-5 text-h3">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      {post.title}
                    </Link>
                  </h3>
                </div>
                <div className="flex items-center justify-between text-sm text-paper/65">
                  <span>{post.readingMinutes} min read</span>
                  <ArrowRight className="transition group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section id="faq" className="scroll-mt-20 bg-light-grey py-24 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="reveal">
              <p className="font-display text-sm font-bold uppercase text-digital-teal">
                Good to know
              </p>
              <h2 className="mt-3 text-h2 text-deep-blue">
                Questions,
                <br />
                answered.
              </h2>
              <Quote className="mt-8 h-12 w-12 text-signal-orange" />
            </div>
            <div className="reveal divide-y divide-deep-blue/20 border-y border-deep-blue/20">
              {faqs.map(({ id, question, answer }) => (
                <details key={id} className="group py-2">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-deep-blue">
                    <span>{question}</span>
                    <span className="text-2xl transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-2xl pb-6 pr-10 text-muted-foreground">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-signal-orange py-24 text-deep-blue md:py-32">
        <Arcs className="pointer-events-none absolute -bottom-48 -right-32 h-[520px] w-[520px] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5">
          <p className="font-display text-sm font-bold uppercase">
            {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venue}
          </p>
          <h2 className="mt-4 max-w-4xl text-h1">Add your voice to Nigeria's AI conversation.</h2>
          <Button
            size="lg"
            data-register
            className="mt-8 min-h-12 rounded-full bg-deep-blue px-7 font-display font-bold text-paper hover:bg-ink"
          >
            Register now <ArrowRight />
          </Button>
        </div>
      </section>
    </>
  );
}
