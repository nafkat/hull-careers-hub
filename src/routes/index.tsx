import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, Ship, Waves, Wrench } from "lucide-react";
import { listActiveJobs } from "@/lib/jobs.functions";
import { JobCard } from "@/components/job-card";
import { Rivets, SparkBurst, YardAtmosphere } from "@/components/industrial";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  loader: () => listActiveJobs(),
  head: () => ({
    meta: [
      { title: "EUROHULL Careers — Building the Future of Maritime" },
      {
        name: "description",
        content:
          "Join EUROHULL shipyards in Greece. Open roles in naval architecture, hull production, marine design and yard operations.",
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

const pillars = [
  { icon: Ship, title: "90m hulls", text: "Offshore support vessels built end-to-end in Elefsina." },
  { icon: Waves, title: "Hybrid propulsion", text: "Electrifying the Aegean coastal fleet since 2019." },
  { icon: Wrench, title: "1,400 crew", text: "Welders, architects, planners and designers in one yard." },
];

function Landing() {
  const { jobs } = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <YardAtmosphere />
        <div className="page-enter relative mx-auto w-full max-w-6xl px-5 py-24">
          <p className="font-mono text-[11px] tracking-[0.5em] text-fog uppercase">
            Shipyards · Greece
          </p>
          <h1 className="hero-title mt-6 text-[clamp(3rem,11vw,84px)] text-foreground">
            EUROHULL
          </h1>
          <p className="mt-6 font-mono text-xs tracking-[6px] text-primary uppercase">
            Ideas that float
          </p>
          <p className="mt-7 max-w-xl leading-relaxed text-muted-foreground">
            We cut, weld and launch the vessels that keep Europe's coastlines moving. If you want
            your work measured in tonnes and horizons, there's a berth for you here.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              to="/jobs"
              className="group relative inline-flex items-center gap-3 border-2 border-primary bg-card px-8 py-4 font-display text-sm tracking-[3px] text-foreground uppercase transition-colors hover:bg-primary/10"
              style={{ borderRadius: 2 }}
            >
              <Rivets />
              <SparkBurst />
              Join the yard
              <ArrowDown className="size-4 -rotate-90 text-primary" />
            </Link>
            <a
              href="#openings"
              className="font-mono text-[11px] tracking-[3px] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Scroll to listings ↓
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="metal-plate plate-hover group relative p-7">
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
            <p className="text-xs tracking-[0.35em] text-gold uppercase">Now hiring</p>
            <h2 className="mt-3 font-display text-4xl">Open positions</h2>
          </div>
          <Link to="/jobs" className="text-sm text-gold underline-offset-4 hover:underline">
            View all {jobs.length} roles
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
