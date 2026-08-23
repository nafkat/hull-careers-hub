import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls: { loc: string; lastmod?: string; priority: string }[] = [
          { loc: `${origin}/`, priority: "1.0" },
          { loc: `${origin}/jobs`, priority: "0.9" },
        ];

        try {
          const { createPublicClient } = await import("@/lib/supabase-public.server");
          const { data } = await createPublicClient()
            .from("job_listings")
            .select("slug, created_at")
            .eq("status", "active");
          for (const job of data ?? []) {
            urls.push({
              loc: `${origin}/jobs/${job.slug}`,
              lastmod: new Date(job.created_at).toISOString(),
              priority: "0.8",
            });
          }
        } catch (error) {
          console.error("[sitemap] job fetch failed", error);
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url><loc>${url.loc}</loc>${
        url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""
      }<priority>${url.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
