import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({ filePath: z.string().min(1).max(500) });

/**
 * Virus-scan endpoint: POST { "filePath": "applications/..." }
 * Returns { status: "clean" | "infected" | "error", details: "..." }
 *
 * Access is restricted to the admin session cookie or an internal secret header,
 * so the scanner cannot be used as an open oracle against the storage bucket.
 */
export const Route = createFileRoute("/api/scan-file")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getAdminSession } = await import("@/lib/admin-session.server");
        const secret = process.env["LOVABLE_CRON_SECRET"];
        const provided = request.headers.get("x-scan-secret");
        const session = await getAdminSession();
        const authorized =
          Boolean(session.data.unlocked) || (Boolean(secret) && provided === secret);

        if (!authorized) {
          return Response.json({ status: "error", details: "Unauthorized" }, { status: 401 });
        }

        let parsed: { filePath: string };
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ status: "error", details: "Invalid body" }, { status: 400 });
        }

        const { scanStoredFile, readScannerConfig } = await import("@/lib/scan.server");
        const { clamavUrl } = await readScannerConfig();
        const result = await scanStoredFile(parsed.filePath, clamavUrl);
        return Response.json(result);
      },
    },
  },
});
