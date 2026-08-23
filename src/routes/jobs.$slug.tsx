import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Clock, Building2 } from "lucide-react";
import { departmentAccent } from "@/data/departments";
import { getActiveJob } from "@/lib/jobs.functions";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { ApplyModal } from "@/components/apply-modal";

export const Route = createFileRoute("/jobs/$slug")({
  loader: async ({ params }) => {
    const { job } = await getActiveJob({ data: { slug: params.slug } });
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Position unavailable — EUROHULL" }, { name: "robots", content: "noindex" }],
      };
    }
    const { job } = loaderData;
    const title = `${job.title} — EUROHULL Careers`;
    return {
      meta: [
        { title },
        { name: "description", content: job.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: job.summary },
      ],
    };
  },
  notFoundComponent: JobNotFound,
  errorComponent: JobNotFound,
  component: JobDetail,
});

function JobNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="font-display text-3xl">This position is no longer listed</h1>
        <Link to="/jobs" className="text-gold underline-offset-4 hover:underline">
          View all open roles
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function JobDetail() {
  const { job } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const accent = departmentAccent(job.department);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="page-enter mx-auto w-full max-w-3xl flex-1 px-5 py-14">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All positions
        </Link>

        <div className="mt-8">
          <span className="stamp inline-block" style={{ color: accent, borderColor: accent }}>
            {job.department}
          </span>
        </div>

        <h1 className="mt-4 font-display text-[clamp(2rem,6vw,42px)] leading-tight tracking-[2px] uppercase">
          {job.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 divide-x divide-white/10 font-mono text-[11px] tracking-[2px] text-muted-foreground uppercase">
          <span className="inline-flex items-center gap-1.5 pr-5">
            <MapPin className="size-4" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5 pr-5">
            <Clock className="size-4" /> {job.employment_type}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="size-4" /> EUROHULL Shipyards
          </span>
        </div>

        <div className="metal-plate relative mt-10 space-y-8 p-8">
          <Rivets />
          <section className="space-y-4">
            <h2 className="font-display text-2xl">About the role</h2>
            {job.description.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl">What we're looking for</h2>
            <ul className="space-y-2 border-l-2 border-[#1E3A5F] pl-5">
              {job.requirements.map((requirement) => (
                <li key={requirement} className="flex gap-3 text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 bg-primary" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="weld-underline group relative w-full border-2 border-primary bg-card px-8 py-4 font-display text-sm tracking-[3px] text-foreground uppercase transition-colors hover:bg-primary/10"
            style={{ borderRadius: 2 }}
          >
            <Rivets />
            Apply now
          </button>
        </div>

      </main>
      <SiteFooter />
      <ApplyModal job={job} open={open} onOpenChange={setOpen} />
    </div>
  );
}
