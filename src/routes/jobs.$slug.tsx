import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Clock, Building2 } from "lucide-react";
import { departmentAccent, getJobBySlug } from "@/data/jobs";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { ApplyModal } from "@/components/apply-modal";

export const Route = createFileRoute("/jobs/$slug")({
  loader: ({ params }) => {
    const job = getJobBySlug(params.slug);
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
  const accent = departmentAccent[job.department];

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

        <span
          className="mt-8 inline-block rounded-full px-3 py-1 text-xs font-medium"
          style={{
            color: accent,
            backgroundColor: `color-mix(in oklab, ${accent} 16%, transparent)`,
            border: `1px solid color-mix(in oklab, ${accent} 35%, transparent)`,
          }}
        >
          {job.department}
        </span>

        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{job.title}</h1>

        <div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" /> {job.employmentType}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="size-4" /> EUROHULL Shipyards
          </span>
        </div>

        <div className="glass mt-10 space-y-8 rounded-xl p-7">
          <section className="space-y-4">
            <h2 className="font-display text-2xl">About the role</h2>
            {job.description.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl">What we're looking for</h2>
            <ul className="space-y-2">
              {job.requirements.map((requirement) => (
                <li key={requirement} className="flex gap-3 text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </section>

          <Button variant="rust" size="lg" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
            Apply Now
          </Button>
        </div>
      </main>
      <SiteFooter />
      <ApplyModal job={job} open={open} onOpenChange={setOpen} />
    </div>
  );
}
