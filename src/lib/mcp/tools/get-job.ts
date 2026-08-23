import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_job",
  title: "Get job details",
  description:
    "Get the full public description, requirements and application link for one active EUROHULL job listing, identified by its slug.",
  inputSchema: {
    slug: z.string().trim().min(1).max(200).describe("Job slug, as returned by list_open_jobs."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("job_listings")
      .select(
        "slug, title, department, location, employment_type, summary, description, requirements, created_at",
      )
      .eq("status", "active")
      .eq("slug", slug)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: `No active job listing found for slug "${slug}".` }],
        isError: true,
      };
    }

    const requirements = (data.requirements ?? []) as string[];
    const text = [
      `${data.title}`,
      `Department: ${data.department}`,
      `Location: ${data.location}`,
      `Employment type: ${data.employment_type}`,
      "",
      data.summary,
      "",
      data.description,
      requirements.length ? `\nRequirements:\n- ${requirements.join("\n- ")}` : "",
      `\nApply at: /jobs/${data.slug}`,
    ].join("\n");

    return {
      content: [{ type: "text", text }],
      structuredContent: { job: data, applyPath: `/jobs/${data.slug}` },
    };
  },
});
