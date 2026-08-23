import { Link } from "@tanstack/react-router";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";
import { departmentAccent } from "@/data/departments";
import type { PublicJob } from "@/lib/jobs.functions";

export function JobCard({ job }: { job: PublicJob }) {
  const accent = departmentAccent(job.department);

  return (
    <Link
      to="/jobs/$slug"
      params={{ slug: job.slug }}
      className="glass glass-hover group relative flex flex-col gap-4 overflow-hidden rounded-xl p-6"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl leading-snug text-foreground">{job.title}</h3>
        <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-gold" />
      </div>

      <span
        className="w-fit rounded-full px-3 py-1 text-xs font-medium tracking-wide"
        style={{
          color: accent,
          backgroundColor: `color-mix(in oklab, ${accent} 16%, transparent)`,
          border: `1px solid color-mix(in oklab, ${accent} 35%, transparent)`,
        }}
      >
        {job.department}
      </span>

      <p className="text-sm leading-relaxed text-muted-foreground">{job.summary}</p>

      <div className="mt-auto flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" /> {job.employment_type}
        </span>
      </div>
    </Link>
  );
}
