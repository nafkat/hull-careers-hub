import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AdminJob = {
  id: string;
  slug: string;
  title: string;
  department: string;
  description: string;
  summary: string;
  requirements: string[];
  employment_type: string;
  location: string;
  status: "draft" | "active" | "closed";
  social_auto_post: boolean;
  social_posted_at: string | null;
  created_at: string;
};

export type AdminApplication = {
  id: string;
  job_listing_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_message: string | null;
  file_name: string | null;
  file_size: number | null;
  file_path: string | null;
  virus_scan_status: string;
  email_sent: boolean;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
};

export type AdminSettings = {
  max_file_size_mb: number;
  email_from: string;
  email_subject: string;
  email_body_template: string;
  virus_scan_enabled: boolean;
  social_api_keys: Record<string, string>;
  clamav_api_url: string | null;
  rate_limit_per_day: number;
};

const jobSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(150),
  department: z.string().trim().min(2).max(60),
  description: z.string().trim().max(8000),
  summary: z.string().trim().max(400),
  requirements: z.array(z.string().trim().max(300)).max(20),
  employment_type: z.enum(["Full-time", "Part-time", "Contract"]),
  location: z.string().trim().max(150),
  status: z.enum(["draft", "active", "closed"]),
  social_auto_post: z.boolean(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({ password: String(data.password).slice(0, 200) }))
  .handler(async ({ data }) => {
    const { getAdminSession, passwordMatches } = await import("./admin-session.server");
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected) return { ok: false as const };
    if (!passwordMatches(data.password, expected)) return { ok: false as const };
    const session = await getAdminSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin-session.server");
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminSession } = await import("./admin-session.server");
  const session = await getAdminSession();
  return { unlocked: Boolean(session.data.unlocked) };
});

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin-session.server");
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ data: jobs }, { data: applications }] = await Promise.all([
    supabaseAdmin.from("job_listings").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("applications").select("*").order("created_at", { ascending: false }),
  ]);

  const apps = (applications ?? []) as AdminApplication[];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return {
    jobs: (jobs ?? []) as AdminJob[],
    applications: apps,
    stats: {
      total: apps.length,
      thisMonth: apps.filter((a) => a.created_at >= monthStart).length,
      unread: apps.filter((a) => !a.is_read && !a.is_archived).length,
    },
  };
});

export const saveJob = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => jobSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { postJobToSocials } = await import("./notifications.server");

    let previousStatus: string | null = null;
    if (data.id) {
      const { data: existing } = await supabaseAdmin
        .from("job_listings")
        .select("status")
        .eq("id", data.id)
        .maybeSingle();
      previousStatus = existing?.status ?? null;
    }

    const payload = {
      title: data.title,
      department: data.department,
      description: data.description,
      summary: data.summary,
      requirements: data.requirements,
      employment_type: data.employment_type,
      location: data.location,
      status: data.status,
      social_auto_post: data.social_auto_post,
    };

    let jobId = data.id ?? null;
    if (jobId) {
      const { error } = await supabaseAdmin.from("job_listings").update(payload).eq("id", jobId);
      if (error) return { ok: false as const, message: error.message };
    } else {
      const { data: created, error } = await supabaseAdmin
        .from("job_listings")
        .insert({ ...payload, slug: `${slugify(data.title)}-${Date.now().toString(36).slice(-4)}` })
        .select("id")
        .single();
      if (error || !created) return { ok: false as const, message: error?.message ?? "Insert failed" };
      jobId = created.id;
    }

    let socialPosted = false;
    const becameActive = data.status === "active" && previousStatus !== "active";
    if (becameActive && data.social_auto_post) {
      const { data: settings } = await supabaseAdmin
        .from("app_settings")
        .select("social_api_keys")
        .eq("id", true)
        .maybeSingle();
      const { data: job } = await supabaseAdmin
        .from("job_listings")
        .select("slug")
        .eq("id", jobId)
        .maybeSingle();
      const results = await postJobToSocials({
        title: data.title,
        location: data.location,
        url: `https://eurohull.com/jobs/${job?.slug ?? ""}`,
        keys: (settings?.social_api_keys ?? {}) as Record<string, string | undefined>,
      });

      await supabaseAdmin.from("social_posts").insert(
        results.map((result) => ({
          job_listing_id: jobId,
          platform: result.network,
          post_url: result.postUrl ?? null,
          status: result.posted ? "success" : "failed",
          error_message: result.error ?? null,
        })),
      );

      const flagFor = (network: string) =>
        results.some((result) => result.network === network && result.posted);

      await supabaseAdmin
        .from("job_listings")
        .update({
          social_posted_at: new Date().toISOString(),
          posted_to_linkedin: flagFor("linkedin"),
          posted_to_facebook: flagFor("facebook"),
          posted_to_instagram: flagFor("instagram"),
        })
        .eq("id", jobId);
      socialPosted = results.some((result) => result.posted);
    }

    return { ok: true as const, jobId, socialPosted };
  });

export const updateApplicationFlags = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        is_read: z.boolean().optional(),
        is_archived: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { is_read?: boolean; is_archived?: boolean } = {};
    if (data.is_read !== undefined) patch.is_read = data.is_read;
    if (data.is_archived !== undefined) patch.is_archived = data.is_archived;
    const { error } = await supabaseAdmin.from("applications").update(patch).eq("id", data.id);
    return { ok: !error };
  });

export const getCvDownloadUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: application } = await supabaseAdmin
      .from("applications")
      .select("file_path, virus_scan_status")
      .eq("id", data.id)
      .maybeSingle();

    if (!application?.file_path || application.virus_scan_status !== "clean") {
      return { url: null as string | null, message: "Only files scanned clean can be downloaded." };
    }

    const { data: signed, error } = await supabaseAdmin.storage
      .from("cv-uploads")
      .createSignedUrl(application.file_path, 60);

    if (error || !signed) return { url: null as string | null, message: "Could not create link." };
    return { url: signed.signedUrl, message: null as string | null };
  });

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin-session.server");
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select(
      "max_file_size_mb, email_from, email_subject, email_body_template, virus_scan_enabled, social_api_keys, clamav_api_url, rate_limit_per_day",
    )
    .eq("id", true)
    .maybeSingle();
  return { settings: (data ?? null) as AdminSettings | null };
});

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        max_file_size_mb: z.number().int().min(1).max(50),
        email_from: z.string().trim().email().max(255),
        email_subject: z.string().trim().min(1).max(200),
        email_body_template: z.string().trim().min(1).max(4000),
        virus_scan_enabled: z.boolean(),
        social_api_keys: z.record(z.string().max(300)),
        clamav_api_url: z.string().trim().url().max(500).nullable().or(z.literal("")),
        rate_limit_per_day: z.number().int().min(1).max(50),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .update({
        ...data,
        clamav_api_url: data.clamav_api_url ? data.clamav_api_url : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    return { ok: !error, message: error?.message ?? null };
  });

export const rescanApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { scanStoredFile, quarantineFile, readScannerConfig } = await import("./scan.server");

    const { data: application } = await supabaseAdmin
      .from("applications")
      .select("id, file_path")
      .eq("id", data.id)
      .maybeSingle();

    if (!application?.file_path) {
      return { status: "error" as const, details: "No stored file to rescan." };
    }

    const { clamavUrl } = await readScannerConfig();
    const result = await scanStoredFile(application.file_path, clamavUrl);

    if (result.status === "infected") {
      await quarantineFile(application.file_path);
      await supabaseAdmin
        .from("applications")
        .update({ virus_scan_status: "infected", file_path: null })
        .eq("id", application.id);
    } else {
      await supabaseAdmin
        .from("applications")
        .update({ virus_scan_status: result.status })
        .eq("id", application.id);
    }

    return { status: result.status, details: result.details };
  });

/** Uploads a tiny generated PDF and runs it through the configured scanner. */
export const testScan = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("./admin-session.server");
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { scanBytes, readScannerConfig } = await import("./scan.server");

  const bytes = new TextEncoder().encode("%PDF-1.4\nEUROHULL scanner test file\n%%EOF\n");
  const path = `diagnostics/test-scan-${Date.now()}.pdf`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from("cv-uploads")
    .upload(path, bytes, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    return { status: "error" as const, details: uploadError.message };
  }

  const { clamavUrl } = await readScannerConfig();
  const result = await scanBytes({ bytes, fileName: "test-scan.pdf", clamavUrl });
  await supabaseAdmin.storage.from("cv-uploads").remove([path]);
  return result;
});

/** Lightweight poll used by the admin console for near-real-time notifications. */
export const latestApplications = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin-session.server");
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("applications")
    .select("id, full_name, job_listing_id, created_at, is_read, is_archived, virus_scan_status")
    .order("created_at", { ascending: false })
    .limit(20);
  return { applications: data ?? [] };
});
