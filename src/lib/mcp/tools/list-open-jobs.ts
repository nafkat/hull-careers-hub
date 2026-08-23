import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_open_jobs",
  title: "List open jobs",
  description:
    "List the currently active, publicly advertised job openings at EUROHULL Shipyards. Optionally filter by department or location text.",
  inputSchema: {
    department: z.string().trim().min(1).max(80).optional().describe("Filter by department, e.g. Engineering."),
    location: z.string().trim().min(1).max(80).optional().describe("Case-insensitive location substring."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ department, location, limit }) => {
    const supabase = supabaseAnon();
    let query = supabase
      .from("job_listings")
      .select("slug, title, department, location, employment_type, summary, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);

    if (department) query = query.eq("department", department);
    if (location) query = query.ilike("location", `%${location}%`);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const jobs = data ?? [];
    return {
      content: [
        {
          type: "text",
          text: jobs.length
            ? jobs
                .map(
                  (j) =>
                    `${j.title} — ${j.department} · ${j.location} · ${j.employment_type} (slug: ${j.slug})`,
                )
                .join("\n")
            : "No active job openings right now.",
        },
      ],
      structuredContent: { jobs },
    };
  },
});
