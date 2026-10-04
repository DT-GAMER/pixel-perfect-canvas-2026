import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin, Quote, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { useCountdown } from "./CountdownPill";
import { Arcs } from "./Logo";
import aiHealthImage from "@/assets/track-ai-health.jpg";
import innovationImage from "@/assets/track-innovation.jpg";
import entrepreneurshipImage from "@/assets/track-entrepreneurship.jpg";
import communityImage from "@/assets/track-community.jpg";
import amaraImage from "@/assets/speaker-amara.jpg";
import tundeImage from "@/assets/speaker-tunde.jpg";
import zainabImage from "@/assets/speaker-zainab.jpg";

const stats = [
  { value: 1200, suffix: "+", label: "Attendees expected" },
  { value: 35, suffix: "+", label: "Expert speakers" },
  { value: 20, suffix: "+", label: "Sessions & workshops" },
  { value: 15, suffix: "+", label: "Partners" },
];

const tracks = [
  {
    number: "01",
    title: "AI for human progress",
    subtitle: "Smarter systems, better outcomes",
    description: "Explore practical ways artificial intelligence can strengthen health, public services, and everyday life across Africa.",
    image: aiHealthImage,
    accent: "bg-digital-lime text-deep-blue",
  },
  {
    number: "02",
    title: "Health innovation",
    subtitle: "Technology that puts people first",
    description: "Meet the clinicians, researchers, and builders creating accessible tools for prevention, diagnosis, and care.",
    image: innovationImage,
    accent: "bg-digital-teal text-deep-blue",
  },
  {
    number: "03",
    title: "Venture & enterprise",
    subtitle: "From bold idea to lasting business",
    description: "Learn how founders turn technical breakthroughs into trusted products, resilient teams, and investable companies.",
    image: entrepreneurshipImage,
    accent: "bg-signal-orange text-deep-blue",
  },
  {
    number: "04",
    title: "Connected ecosystem",
    subtitle: "The right people in one room",
    description: "Build relationships across technology, medicine, capital, government, and creative industries that continue beyond the summit.",
    image: communityImage,
    accent: "bg-light-grey text-deep-blue",
  },
];

const speakers = [
  { name: "Dr. Amara Okafor", role: "AI Research Director", organization: "Health Intelligence Lab", image: amaraImage, bio: "Amara leads multidisciplinary teams developing responsible AI systems for African health services and research." },
  { name: "Tunde Adebayo", role: "Founder & CEO", organization: "MediGrid Africa", image: tundeImage, bio: "Tunde builds technology that connects patients, clinicians, and community health providers across emerging markets." },
  { name: "Zainab Bello", role: "Venture Partner", organization: "Forward Capital", image: zainabImage, bio: "Zainab invests in ambitious African founders using technology to solve high-impact problems at scale." },
];

const faqs = [
  ["Who is C8 Tech Summit for?", "The summit is designed for founders, builders, clinicians, researchers, investors, students, and leaders shaping Africa's technology future."],
  ["Where will the summit take place?", "C8 Tech Summit takes place in Lagos State, Nigeria. The exact venue and arrival information will be announced closer to the event."],
  ["What does registration include?", "Your pass will include access to keynotes, panels, workshops, product demonstrations, and curated networking sessions."],
  ["Can my organisation become a sponsor?", "Yes. Sponsorship opportunities are available across several tiers. Visit our sponsors page to register your interest."],
];

const pad = (value: number) => String(value).padStart(2, "0");

function HeroCountdown() {
  const time = useCountdown(EVENT.startsAt);
  const values = time ? [[time.d, "Days"], [time.h, "Hours"], [time.m, "Minutes"], [time.s, "Seconds"]] as const : [[0, "Days"], [0, "Hours"], [0, "Minutes"], [0, "Seconds"]] as const;
  return (
    <div className="grid w-full max-w-2xl grid-cols-4 divide-x divide-paper/20 border-y border-paper/20 py-5" aria-label="Countdown to the summit">
      {values.map(([value, label]) => (
        <div key={label} className="text-center">
          <strong className="block font-display text-2xl text-digital-lime tabular-nums sm:text-4xl">{label === "Days" ? value : pad(value)}</strong>
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
    const observer = new IntersectionObserver(([entry]) => {
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
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

function SpeakerModal({ speaker, close }: { speaker: typeof speakers[number]; close: () => void }) {
  useEffect(() => {
    document.body.dataset["modalOpen"] = "true";
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      delete document.body.dataset["modalOpen"];
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-5" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && close()}>
      <div role="dialog" aria-modal="true" aria-labelledby="speaker-name" className="relative grid max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-paper md:grid-cols-[280px_1fr]">
        <img src={speaker.image} alt="" className="h-full max-h-96 w-full object-cover md:max-h-none" width={1024} height={1280} />
        <div className="p-8 md:p-10">
          <Button variant="ghost" size="icon" className="absolute right-3 top-3 min-h-12 min-w-12" onClick={close} aria-label="Close speaker profile"><X /></Button>
          <p className="font-display text-sm font-bold uppercase text-digital-teal">Featured speaker</p>
          <h3 id="speaker-name" className="mt-3 text-h2 text-deep-blue">{speaker.name}</h3>
          <p className="mt-3 font-display font-semibold text-ink">{speaker.role} · {speaker.organization}</p>
          <p className="mt-6 text-muted-foreground">{speaker.bio}</p>
          <p className="mt-5 text-sm text-muted-foreground">Placeholder profile — full biography and social links will be added with the final speaker lineup.</p>
        </div>
      </div>
    </div>
  );
}

export function Homepage() {
  const [activeSpeaker, setActiveSpeaker] = useState<typeof speakers[number] | null>(null);
  return (
    <>
      <section className="relative flex min-h-[calc(100svh-8rem)] items-end overflow-hidden bg-deep-blue text-paper">
        <Arcs className="arc-spin pointer-events-none absolute -right-44 top-4 h-[620px] w-[620px] opacity-80 md:-right-10 md:h-[760px] md:w-[760px]" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-24 md:pb-12 md:pt-32">
          <div className="max-w-4xl animate-enter-up">
            <p className="font-display text-sm font-bold uppercase text-digital-lime">Lagos · 15 December 2026</p>
            <h1 className="mt-4 text-h1">C8 Tech<br />Summit</h1>
            <p className="mt-5 max-w-xl text-xl text-paper/85 md:text-2xl">{EVENT.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" data-register className="min-h-12 rounded-full px-7 font-display font-bold">Register now <ArrowRight /></Button>
              <a href="#about" className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-paper px-7 font-display font-semibold transition hover:bg-paper hover:text-deep-blue">Discover the summit</a>
            </div>
          </div>
          <div className="mt-14 flex flex-col gap-6 border-t border-paper/20 pt-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm sm:text-base">
              <span className="flex items-center gap-2"><CalendarDays className="text-digital-lime" /> 9:00 AM – 6:00 PM</span>
              <span className="flex items-center gap-2"><MapPin className="text-digital-lime" /> Lagos State, Nigeria</span>
            </div>
            <HeroCountdown />
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 bg-paper py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <p className="reveal font-display text-sm font-bold uppercase text-digital-teal">About C8</p>
            <div className="reveal">
              <h2 className="max-w-4xl text-h2 text-deep-blue">Where Africa's brightest minds turn ideas into impact.</h2>
              <div className="mt-8 grid gap-6 text-muted-foreground md:grid-cols-2">
                <p>C8 Tech Summit is a meeting point for the people imagining, building, funding, and applying the technologies shaping our future.</p>
                <p>Across one focused day, bold ideas meet practical experience through meaningful conversations, hands-on learning, and human connection.</p>
              </div>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-2 border-y border-deep-blue/15 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`reveal px-3 py-8 md:px-6 ${index > 0 ? "border-l border-deep-blue/15" : ""}`}>
                <strong className="block font-display text-3xl text-deep-blue sm:text-5xl"><CountUp value={stat.value} suffix={stat.suffix} /></strong>
                <span className="mt-2 block text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="theme" className="scroll-mt-20 bg-digital-teal py-24 text-deep-blue md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div className="reveal"><p className="font-display text-sm font-bold uppercase">2026 theme</p><h2 className="mt-4 text-h2">Intelligence with intention.</h2></div>
            <p className="reveal max-w-xl text-lg">A programme about building technology that is ambitious, responsible, commercially viable, and deeply useful to people.</p>
          </div>
          <div className="mt-14 overflow-hidden border-y border-deep-blue/25 py-5" aria-label="Programme formats">
            <div className="programme-ticker flex w-max gap-8 font-display text-3xl font-bold md:text-5xl">
              {["Keynotes", "Workshops", "Panels", "Networking", "Demos", "Keynotes", "Workshops", "Panels", "Networking", "Demos"].map((item, i) => <span key={`${item}-${i}`} className={i % 5 === 2 ? "text-digital-lime" : "text-deep-blue/45"}>{item} <span aria-hidden="true">·</span></span>)}
            </div>
          </div>
          <div className="mt-16">
            {tracks.map((track, index) => (
              <article key={track.title} className="sticky mb-8 min-h-[460px] overflow-hidden rounded-md shadow-2xl" style={{ top: `${96 + index * 14}px` }}>
                <img src={track.image} alt="" loading="lazy" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-ink/70" />
                <div className="relative flex min-h-[460px] flex-col justify-between p-7 text-paper md:p-12">
                  <div className="flex items-start justify-between gap-4"><span className={`rounded-full px-4 py-2 font-display text-sm font-bold ${track.accent}`}>{track.number}</span><span className="font-display text-sm uppercase text-paper/70">Summit track</span></div>
                  <div className="max-w-3xl"><p className="font-display font-semibold text-digital-lime">{track.subtitle}</p><h3 className="mt-3 text-h2">{track.title}</h3><p className="mt-5 max-w-2xl text-paper/80">{track.description}</p></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light-grey py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="reveal flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="font-display text-sm font-bold uppercase text-digital-teal">On the stage</p><h2 className="mt-3 text-h2 text-deep-blue">Ideas worth gathering for.</h2></div><Link to="/speakers" className="inline-flex min-h-12 items-center gap-2 font-display font-bold text-deep-blue hover:text-digital-teal">See all speakers <ArrowRight /></Link></div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {speakers.map((speaker) => (
              <Button key={speaker.name} variant="ghost" type="button" onClick={() => setActiveSpeaker(speaker)} className="reveal group block h-auto min-h-0 whitespace-normal p-0 text-left hover:bg-transparent">
                <span className="block aspect-[4/5] overflow-hidden rounded-t-[50%] bg-paper"><img src={speaker.image} alt={`Portrait of ${speaker.name}`} loading="lazy" width={1024} height={1280} className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" /></span>
                <span className="mt-5 block font-display text-2xl font-bold text-deep-blue">{speaker.name}</span><span className="mt-1 block text-sm text-muted-foreground">{speaker.role} · {speaker.organization}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-paper py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5"><div className="reveal grid gap-8 lg:grid-cols-2 lg:items-end"><div><p className="font-display text-sm font-bold uppercase text-signal-orange">Our partners</p><h2 className="mt-3 text-h2 text-deep-blue">Backing the builders.</h2></div><p className="max-w-xl text-muted-foreground">Forward-looking organisations helping create the room where technology, enterprise, and human progress meet.</p></div></div>
        <div className="mt-14 border-y border-light-grey py-8"><div className="sponsor-marquee flex w-max items-center gap-12 px-6 font-display text-2xl font-bold text-deep-blue/50 md:gap-20 md:text-4xl">{["AFRICA LABS", "NOVA HEALTH", "BUILD/NG", "ORBIT CAPITAL", "NEXT SYSTEMS", "AFRICA LABS", "NOVA HEALTH", "BUILD/NG", "ORBIT CAPITAL", "NEXT SYSTEMS"].map((name, index) => <span key={`${name}-${index}`} className="whitespace-nowrap">{name}</span>)}</div></div>
        <div className="mx-auto mt-10 max-w-7xl px-5"><Link to="/sponsors" className="inline-flex min-h-12 items-center gap-2 font-display font-bold text-deep-blue hover:text-digital-teal">Explore partnerships <ArrowRight /></Link></div>
      </section>

      <section className="bg-deep-blue py-24 text-paper md:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <div className="reveal flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="font-display text-sm font-bold uppercase text-digital-lime">Latest thinking</p><h2 className="mt-3 text-h2">Ideas before the stage.</h2></div><Link to="/blog" className="inline-flex min-h-12 items-center gap-2 font-display font-bold text-paper hover:text-digital-lime">Read all stories <ArrowRight /></Link></div>
          <div className="mt-12 grid gap-px bg-paper/20 md:grid-cols-3">
            {[{ tag: "Artificial intelligence", title: "Why Africa's next AI chapter must be built with intention", date: "8 min read" }, { tag: "Health technology", title: "The systems helping care travel further", date: "6 min read" }, { tag: "Founder stories", title: "What resilient technology companies do differently", date: "5 min read" }].map((post, index) => (
              <article key={post.title} className="reveal flex min-h-80 flex-col justify-between bg-deep-blue p-7 transition hover:bg-ink"><div><span className="font-display text-sm font-bold text-digital-lime">0{index + 1} · {post.tag}</span><h3 className="mt-5 text-h3">{post.title}</h3></div><div className="flex items-center justify-between text-sm text-paper/65"><span>{post.date}</span><ArrowRight /></div></article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-light-grey py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="reveal"><p className="font-display text-sm font-bold uppercase text-digital-teal">Good to know</p><h2 className="mt-3 text-h2 text-deep-blue">Questions,<br />answered.</h2><Quote className="mt-8 h-12 w-12 text-signal-orange" /></div>
          <div className="reveal divide-y divide-deep-blue/20 border-y border-deep-blue/20">
            {faqs.map(([question, answer]) => <details key={question} className="group py-2"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-deep-blue"><span>{question}</span><span className="text-2xl transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-6 pr-10 text-muted-foreground">{answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-signal-orange py-24 text-deep-blue md:py-32">
        <Arcs className="pointer-events-none absolute -bottom-48 -right-32 h-[520px] w-[520px] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5"><p className="font-display text-sm font-bold uppercase">One day. A room full of possibility.</p><h2 className="mt-4 max-w-4xl text-h1">Be part of what's next.</h2><Button size="lg" data-register className="mt-8 min-h-12 rounded-full bg-deep-blue px-7 font-display font-bold text-paper hover:bg-ink">Register now <ArrowRight /></Button></div>
      </section>
      {activeSpeaker && <SpeakerModal speaker={activeSpeaker} close={() => setActiveSpeaker(null)} />}
    </>
  );
}