import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const submitSchema = z.object({
  jobId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  coverMessage: z.string().trim().max(500).optional().or(z.literal("")),
  fileName: z.string().trim().min(1).max(255),
  fileMimeType: z.string().trim().max(150),
  fileBase64: z.string().min(1),
});

export type SubmitResult =
  | { status: "clean"; applicationId: string; emailSent: boolean }
  | { status: "infected" }
  | { status: "error"; message: string };

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendConfirmationEmail, renderTemplate } = await import("./notifications.server");

    const { data: settings } = await supabaseAdmin
      .from("app_settings")
      .select("max_file_size_mb, email_from, email_subject, email_body_template, virus_scan_enabled")
      .eq("id", true)
      .maybeSingle();

    const maxBytes = (settings?.max_file_size_mb ?? 10) * 1024 * 1024;
    const isDocx = data.fileName.toLowerCase().endsWith(".docx");
    if (!ALLOWED_MIME.includes(data.fileMimeType) && !isDocx) {
      return { status: "error", message: "Only PDF and DOCX files are accepted." };
    }

    let bytes: Uint8Array;
    try {
      bytes = Uint8Array.from(Buffer.from(data.fileBase64, "base64"));
    } catch {
      return { status: "error", message: "The uploaded file could not be read." };
    }
    if (bytes.byteLength === 0 || bytes.byteLength > maxBytes) {
      return { status: "error", message: "File exceeds the allowed size." };
    }

    const { data: job } = await supabaseAdmin
      .from("job_listings")
      .select("id, title, status")
      .eq("id", data.jobId)
      .maybeSingle();
    if (!job || job.status !== "active") {
      return { status: "error", message: "This position is no longer accepting applications." };
    }

    const { data: application, error: insertError } = await supabaseAdmin
      .from("applications")
      .insert({
        job_listing_id: job.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        cover_message: data.coverMessage || null,
        file_name: data.fileName,
        file_size: bytes.byteLength,
        file_mime_type: isDocx
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : data.fileMimeType,
        virus_scan_status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !application) {
      console.error("[applications] insert failed", insertError?.message);
      return { status: "error", message: "We could not save your application. Please retry." };
    }

    const safeName = data.fileName.replace(/[^\w.\-]+/g, "_");
    const path = `applications/${job.id}/${application.id}/${safeName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("cv-uploads")
      .upload(path, bytes, { contentType: data.fileMimeType, upsert: true });

    if (uploadError) {
      console.error("[applications] upload failed", uploadError.message);
      await supabaseAdmin
        .from("applications")
        .update({ virus_scan_status: "error" })
        .eq("id", application.id);
      return { status: "error", message: "The file upload failed. Please try again." };
    }

    // Simulated scan: files whose name signals malware are quarantined.
    const scanEnabled = settings?.virus_scan_enabled ?? true;
    const infected = scanEnabled && /virus|malware|infected|eicar/i.test(data.fileName);

    if (infected) {
      await supabaseAdmin.storage.from("cv-uploads").remove([path]);
      await supabaseAdmin
        .from("applications")
        .update({ virus_scan_status: "infected", file_path: null })
        .eq("id", application.id);
      return { status: "infected" };
    }

    const body = renderTemplate(
      settings?.email_body_template ??
        "Thank you {{full_name}}, we received your application for {{job_title}}.",
      { full_name: data.fullName, job_title: job.title },
    );
    const { sent } = await sendConfirmationEmail({
      to: data.email,
      from: settings?.email_from ?? "careers@eurohull.com",
      subject: renderTemplate(settings?.email_subject ?? "Application received", {
        full_name: data.fullName,
        job_title: job.title,
      }),
      body,
    });

    await supabaseAdmin
      .from("applications")
      .update({ virus_scan_status: "clean", file_path: path, email_sent: sent })
      .eq("id", application.id);

    return { status: "clean", applicationId: application.id, emailSent: sent };
  });
