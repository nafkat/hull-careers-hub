import { createServerFn } from "@tanstack/react-start";

export type PublicJob = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  summary: string;
  description: string;
  requirements: string[];
  created_at: string;
};

const columns =
  "id, slug, title, department, location, employment_type, summary, description, requirements, created_at";

export const listActiveJobs = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const { data, error } = await createPublicClient()
    .from("job_listings")
    .select(columns)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[jobs] list failed", error.message);
    return { jobs: [] as PublicJob[], error: "Listings are temporarily unavailable." };
  }
  return { jobs: (data ?? []) as PublicJob[], error: null };
});

export const getActiveJob = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const { data: job, error } = await createPublicClient()
      .from("job_listings")
      .select(columns)
      .eq("status", "active")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) console.error("[jobs] detail failed", error.message);
    return { job: (job ?? null) as PublicJob | null };
  });
