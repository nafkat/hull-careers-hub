import { createFileRoute } from "@tanstack/react-router";
import { activeJobs } from "@/data/jobs";
import { JobCard } from "@/components/job-card";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/jobs")({
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
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="page-enter mx-auto w-full max-w-6xl flex-1 px-5 py-16">
        <p className="text-xs tracking-[0.35em] text-gold uppercase">Careers</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Open positions</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {activeJobs.length} roles across our Elefsina and Piraeus yards. Every application is
          reviewed by the team that will work beside you.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
