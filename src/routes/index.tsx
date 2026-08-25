import { createFileRoute, Link } from "@tanstack/react-router";
import { Anchor, ArrowDown, Ship, Waves, Wrench } from "lucide-react";
import { listActiveJobs } from "@/lib/jobs.functions";
import { JobCard } from "@/components/job-card";
import { Rivets, SparkBurst, YardAtmosphere } from "@/components/industrial";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useTranslation } from "@/lib/i18n/useTranslation";

export const Route = createFileRoute("/")({
  loader: () => listActiveJobs(),
  head: () => ({
    meta: [
      { title: "EUROHULL Careers — Building the Future of Maritime" },
      {
        name: "description",
        content:
          "Καριέρα στα ναυπηγεία EUROHULL. Ανοιχτές θέσεις σε ναυπηγική αρχιτεκτονική, παραγωγή, σχεδιασμό και λειτουργίες ναυπηγείου.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "EUROHULL Careers" },
      {
        name: "twitter:description",
        content: "Open shipyard roles at EUROHULL: engineering, production, design and operations.",
      },
      { property: "og:title", content: "EUROHULL Careers — Building the Future of Maritime" },
      {
        property: "og:description",
        content: "Open shipyard roles at EUROHULL: engineering, production, design and operations.",
      },
    ],
  }),
  component: Landing,
});

function EmptyOpenings() {
  const { t } = useTranslation();
  return (
    <div className="mt-10 flex flex-col items-center gap-3 py-16 text-center">
      <Anchor className="size-12 text-muted-foreground" aria-hidden />
      <p className="font-display text-xl text-foreground">{t.jobs.emptyTitle}</p>
      <p className="text-muted-foreground">{t.jobs.emptySubtitle}</p>
    </div>
  );
}

export function Landing() {
  const { jobs } = Route.useLoaderData();
  const { t } = useTranslation();

  const pillars = [
    { icon: Ship, title: t.pillars.hulls.title, text: t.pillars.hulls.text },
    { icon: Waves, title: t.pillars.propulsion.title, text: t.pillars.propulsion.text },
    { icon: Wrench, title: t.pillars.crew.title, text: t.pillars.crew.text },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main">

      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <YardAtmosphere />
        <div className="page-enter relative mx-auto w-full max-w-6xl px-5 py-24">
          <p className="font-mono text-[11px] tracking-[0.5em] text-fog uppercase">
            {t.hero.eyebrow}
          </p>
          <h1 className="hero-title mt-6 text-[clamp(2.5rem,12vw,84px)] max-sm:tracking-[6px] text-foreground">
            EUROHULL
          </h1>
          <p className="mt-6 font-mono text-xs tracking-[4px] sm:tracking-[6px] text-primary uppercase">
            {t.hero.tagline}
          </p>
          <p className="mt-7 max-w-xl leading-relaxed text-muted-foreground">
            {t.hero.subTagline}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              to="/jobs"
              className="group relative inline-flex w-full min-h-[44px] justify-center sm:w-auto items-center gap-3 border-2 border-primary bg-card px-6 py-3 sm:px-8 sm:py-4 font-display text-sm tracking-[3px] text-foreground uppercase transition-colors hover:bg-primary/10"
              style={{ borderRadius: 2 }}
            >
              <Rivets />
              <SparkBurst />
              {t.hero.cta}
              <ArrowDown className="size-4 -rotate-90 text-primary" />
            </Link>
            <a
              href="#openings"
              className="font-mono text-[11px] tracking-[3px] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {t.hero.scrollIndicator} ↓
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className="metal-plate plate-hover stagger-in group relative p-4 sm:p-7"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Rivets />
              <Icon className="size-5 text-primary" />
              <h3 className="mt-4 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>


      <section id="openings" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.35em] text-gold uppercase">{t.jobs.nowHiring}</p>
            <h2 className="mt-3 font-display text-4xl">{t.jobs.title}</h2>
          </div>
          <Link to="/jobs" className="text-sm text-gold underline-offset-4 hover:underline">
            {t.jobs.viewAll.replace("{count}", String(jobs.length))}
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyOpenings />
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))}
          </div>
        )}
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
