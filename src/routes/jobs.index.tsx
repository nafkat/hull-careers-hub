import { createFileRoute } from "@tanstack/react-router";
import { Anchor } from "lucide-react";
import { listActiveJobs } from "@/lib/jobs.functions";
import { JobCard } from "@/components/job-card";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useTranslation } from "@/lib/i18n/useTranslation";

export const Route = createFileRoute("/jobs/")({
  loader: () => listActiveJobs(),
  head: () => ({
    meta: [
      { title: "Open Roles at EUROHULL Shipyards" },
      {
        name: "description",
        content:
          "Browse open positions at EUROHULL: naval architecture, hull welding, marine design and yard operations roles in Greece.",
      },
      { property: "og:title", content: "Open Roles at EUROHULL Shipyards" },
      {
        property: "og:description",
        content: "Engineering, production and design careers at EUROHULL shipyards in Greece.",
      },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const { jobs, error } = Route.useLoaderData();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="page-enter mx-auto w-full max-w-6xl flex-1 px-5 py-16">
        <p className="text-xs tracking-[0.35em] text-gold uppercase">{t.jobs.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">{t.jobs.title}</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {error ? error : `${jobs.length} ${t.jobs.subtitle}`}
        </p>

        {jobs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 py-16 text-center">
            <Anchor className="size-12 text-muted-foreground" aria-hidden />
            <p className="font-display text-xl text-foreground">{t.jobs.emptyTitle}</p>
            <p className="text-muted-foreground">{t.jobs.emptySubtitle}</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
