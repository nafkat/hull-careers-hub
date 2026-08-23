/**
 * Branded 1080x1080 job card used for Instagram posts.
 * The card is composed as SVG and rasterised to PNG with resvg (WASM), then
 * stored in the private "social-images" bucket behind a short-lived signed URL
 * that Instagram fetches while the media container is created.
 */
import wasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url";

const GOLD = "#d4a853";
const RUST = "#c2410c";
const OCEAN = "#0a1628";
const STEEL = "#1e293b";

let wasmReady: Promise<void> | null = null;
let fontCache: Uint8Array[] | null = null;

function assetUrl(origin: string | null, path: string) {
  return origin ? new URL(path, origin).toString() : path;
}

async function ensureWasm(origin: string | null) {
  const { initWasm } = await import("@resvg/resvg-wasm");
  if (!wasmReady) {
    wasmReady = (async () => {
      const response = await fetch(assetUrl(origin, wasmUrl));
      if (!response.ok) throw new Error(`Could not load renderer (${response.status})`);
      await initWasm(await response.arrayBuffer());
    })().catch((error) => {
      wasmReady = null;
      throw error;
    });
  }
  await wasmReady;
}

async function loadFonts(origin: string | null) {
  if (fontCache) return fontCache;
  const files = ["/fonts/PlayfairDisplay-Bold.ttf", "/fonts/Inter-Regular.ttf"];
  const buffers = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(assetUrl(origin, file));
      if (!response.ok) throw new Error(`Could not load font ${file}`);
      return new Uint8Array(await response.arrayBuffer());
    }),
  );
  fontCache = buffers;
  return buffers;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Greedy wrap of the job title into at most two centred lines. */
function wrapTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > 20 && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  if (lines.length > 2) {
    return [lines[0]!, `${lines.slice(1).join(" ").slice(0, 20).trim()}…`];
  }
  return lines;
}

export function buildJobCardSvg(job: { title: string; department: string; location: string }) {
  const titleLines = wrapTitle(job.title);
  const titleY = titleLines.length === 1 ? 500 : 440;
  const department = escapeXml(job.department || "EUROHULL");
  const pillWidth = Math.max(260, department.length * 22 + 80);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${OCEAN}"/>
      <stop offset="100%" stop-color="${STEEL}"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <g opacity="0.05" fill="${GOLD}">
    <path d="M60 880 C 300 990, 780 990, 1020 880 L 1020 960 C 780 1050, 300 1050, 60 960 Z"/>
    <path d="M120 760 C 340 850, 740 850, 960 760 L 960 800 C 740 890, 340 890, 120 800 Z"/>
  </g>
  <rect x="16" y="16" width="1048" height="1048" fill="none" stroke="${GOLD}" stroke-width="2" rx="18"/>
  <text x="540" y="220" text-anchor="middle" font-family="Playfair Display" font-size="86" letter-spacing="14" fill="${GOLD}">EUROHULL</text>
  <rect x="420" y="252" width="240" height="2" fill="${GOLD}" opacity="0.7"/>
  ${titleLines
    .map(
      (line, index) =>
        `<text x="540" y="${titleY + index * 92}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="76" fill="#f8fafc">${escapeXml(line)}</text>`,
    )
    .join("\n  ")}
  <rect x="${540 - pillWidth / 2}" y="640" width="${pillWidth}" height="76" rx="38" fill="${RUST}" opacity="0.9"/>
  <text x="540" y="690" text-anchor="middle" font-family="Inter" font-size="34" fill="#f8fafc">${department}</text>
  <g transform="translate(470, 780)">
    <path d="M18 0 C 8 0, 0 8, 0 18 C 0 32, 18 46, 18 46 C 18 46, 36 32, 36 18 C 36 8, 28 0, 18 0 Z" fill="${GOLD}"/>
    <circle cx="18" cy="18" r="7" fill="${OCEAN}"/>
  </g>
  <text x="524" y="818" font-family="Inter" font-size="36" fill="#94a3b8">${escapeXml(job.location)}</text>
  <rect x="360" y="900" width="360" height="96" rx="12" fill="${OCEAN}" stroke="${GOLD}" stroke-width="3"/>
  <text x="540" y="962" text-anchor="middle" font-family="Inter" font-size="40" letter-spacing="6" fill="${GOLD}">APPLY NOW</text>
</svg>`;
}

/** Renders the branded card and returns PNG bytes. */
export async function generateJobCardImage(job: {
  title: string;
  department: string;
  location: string;
  origin?: string | null;
}): Promise<Uint8Array> {
  const origin = job.origin ?? null;
  await ensureWasm(origin);
  const fontBuffers = await loadFonts(origin);
  const { Resvg } = await import("@resvg/resvg-wasm");

  const resvg = new Resvg(buildJobCardSvg(job), {
    fitTo: { mode: "width", value: 1080 },
    font: {
      loadSystemFonts: false,
      fontBuffers,
      defaultFontFamily: "Inter",
    },
  });
  return resvg.render().asPng();
}

/**
 * Renders the card, stores it temporarily and returns a signed URL plus a
 * cleanup callback that deletes the object once the post is published.
 */
export async function publishJobCardImage(job: {
  title: string;
  department: string;
  location: string;
  origin?: string | null;
}): Promise<{ url: string; cleanup: () => Promise<void> }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const png = await generateJobCardImage(job);
  const path = `job-cards/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("social-images")
    .upload(path, png, { contentType: "image/png", upsert: true });
  if (uploadError) throw new Error(`Card upload failed: ${uploadError.message}`);

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from("social-images")
    .createSignedUrl(path, 600);
  if (signError || !signed) throw new Error("Could not create a public link for the card image");

  return {
    url: signed.signedUrl,
    cleanup: async () => {
      await supabaseAdmin.storage.from("social-images").remove([path]);
    },
  };
}
