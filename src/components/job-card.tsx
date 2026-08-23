import { Link } from "@tanstack/react-router";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";
import { departmentAccent } from "@/data/departments";
import { Rivets, SparkBurst } from "@/components/industrial";
import type { PublicJob } from "@/lib/jobs.functions";

export function JobCard({ job }: { job: PublicJob }) {
  const accent = departmentAccent(job.department);

  return (
    <Link
      to="/jobs/$slug"
      params={{ slug: job.slug }}
      className="metal-plate plate-hover group relative flex flex-col gap-4 p-6 pt-7"
    >
      <Rivets />
      <SparkBurst />
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
      />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl leading-snug tracking-[2px] text-foreground uppercase">
          {job.title}
        </h3>
        <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>

      <span className="stamp w-fit" style={{ color: accent, borderColor: accent }}>
        {job.department}
      </span>

      <p className="text-sm leading-relaxed text-muted-foreground">{job.summary}</p>

      <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-white/5 pt-3 font-mono text-[10px] tracking-[1.5px] text-muted-foreground uppercase">
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
