/**
 * Virus scanning for uploaded CVs.
 *
 * The scanner talks to a ClamAV REST API over HTTP. When no endpoint is
 * configured (app_settings.clamav_api_url or CLAMAV_API_URL) the scanner falls
 * back to a structurally identical simulation so the flow stays exercisable.
 *
 * TODO: Replace with your ClamAV instance URL (e.g. https://clamav.internal/scan)
 */

export type ScanStatus = "clean" | "infected" | "error";
export type ScanOutcome = { status: ScanStatus; details: string };

const QUARANTINE_BUCKET = "cv-quarantine";
const UPLOAD_BUCKET = "cv-uploads";

export const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
export const ZIP_MAGIC = [0x50, 0x4b]; // PK — DOCX is a zip container

export function hasValidMagicBytes(bytes: Uint8Array, isDocx: boolean) {
  const expected = isDocx ? ZIP_MAGIC : PDF_MAGIC;
  if (bytes.byteLength < expected.length) return false;
  return expected.every((byte, index) => bytes[index] === byte);
}

async function callClamAv(url: string, bytes: Uint8Array, fileName: string): Promise<ScanOutcome> {
  const form = new FormData();
  form.append("file", new Blob([bytes as unknown as BlobPart]), fileName);

  const response = await fetch(url, {
    method: "POST",
    headers: process.env["CLAMAV_API_KEY"]
      ? { Authorization: `Bearer ${process.env["CLAMAV_API_KEY"]}` }
      : undefined,
    body: form,
  });

  if (!response.ok) {
    return { status: "error", details: `Scanner responded with ${response.status}` };
  }

  const payload = (await response.json()) as {
    is_infected?: boolean;
    infected?: boolean;
    status?: string;
    viruses?: string[];
    message?: string;
  };

  const infected =
    payload.is_infected === true || payload.infected === true || payload.status === "infected";

  return infected
    ? { status: "infected", details: payload.viruses?.join(", ") ?? payload.message ?? "Malware signature matched" }
    : { status: "clean", details: payload.message ?? "No signatures matched" };
}

/** Simulated scanner used while no ClamAV endpoint is configured: 95% clean. */
function simulateScan(fileName: string, bytes: Uint8Array): ScanOutcome {
  const eicar = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR";
  const head = new TextDecoder().decode(bytes.slice(0, 256));
  if (head.includes(eicar) || /virus|malware|infected|eicar/i.test(fileName)) {
    return { status: "infected", details: "Simulated scanner: EICAR test signature" };
  }
  if (Math.random() < 0.05) {
    return { status: "infected", details: "Simulated scanner: heuristic match" };
  }
  return { status: "clean", details: "Simulated scanner: no signatures matched" };
}

export async function scanBytes(input: {
  bytes: Uint8Array;
  fileName: string;
  clamavUrl?: string | null;
}): Promise<ScanOutcome> {
  const url = input.clamavUrl?.trim() || process.env["CLAMAV_API_URL"]?.trim();
  if (!url) return simulateScan(input.fileName, input.bytes);
  try {
    return await callClamAv(url, input.bytes, input.fileName);
  } catch (error) {
    console.error("[scan] clamav call failed", (error as Error).message);
    return { status: "error", details: "Scanner unreachable" };
  }
}

/** Downloads a stored object and scans it. */
export async function scanStoredFile(filePath: string, clamavUrl?: string | null): Promise<ScanOutcome> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage.from(UPLOAD_BUCKET).download(filePath);
  if (error || !data) return { status: "error", details: error?.message ?? "File not found" };
  const bytes = new Uint8Array(await data.arrayBuffer());
  const fileName = filePath.split("/").pop() ?? "upload";
  return scanBytes({ bytes, fileName, clamavUrl });
}

/** Moves an infected object out of cv-uploads and into the quarantine bucket. */
export async function quarantineFile(filePath: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from(UPLOAD_BUCKET).download(filePath);
  if (data) {
    const bytes = new Uint8Array(await data.arrayBuffer());
    const { error } = await supabaseAdmin.storage
      .from(QUARANTINE_BUCKET)
      .upload(filePath, bytes, { contentType: "application/octet-stream", upsert: true });
    if (error) console.error("[scan] quarantine upload failed", error.message);
  }
  await supabaseAdmin.storage.from(UPLOAD_BUCKET).remove([filePath]);
}

export async function readScannerConfig() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("clamav_api_url, virus_scan_enabled, rate_limit_per_day")
    .eq("id", true)
    .maybeSingle();
  return {
    clamavUrl: data?.clamav_api_url ?? null,
    virusScanEnabled: data?.virus_scan_enabled ?? true,
    rateLimitPerDay: data?.rate_limit_per_day ?? 3,
  };
}
