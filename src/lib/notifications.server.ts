/**
 * Confirmation email (cinematic HTML) + social auto-posting.
 * Every provider falls back to a logged mock when no API key is configured,
 * so the flow stays exercisable before credentials exist.
 */

export function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => vars[key] ?? "");
}

const GOLD = "#d4a853";
const OCEAN = "#0a1628";
const STEEL = "#1e293b";
const MUTED = "#94a3b8";
const FAINT = "#64748b";
const WHITE = "#f8fafc";

/**
 * Cinematic HTML confirmation email.
 * The shell is fixed brand chrome; the closing message paragraph comes from the
 * admin-editable template in Settings, so `{{placeholders}}` still apply there.
 */
export function buildConfirmationEmailHtml(input: {
  bodyTemplate?: string | null;
  vars: {
    full_name: string;
    job_title: string;
    department: string;
    location: string;
    date: string;
  };
}) {
  const closing = renderTemplate(
    input.bodyTemplate?.trim() ||
      "Η ομάδα μας θα επεξεργαστεί την αίτησή σας και θα επικοινωνήσουμε μαζί σας σύντομα.",
    input.vars,
  );

  const anchorSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`;

  const html = `<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EUROHULL</title>
  </head>
  <body style="margin:0;padding:0;background-color:${OCEAN};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${OCEAN};padding:24px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${OCEAN};border:1px solid ${STEEL};border-radius:12px;">
            <tr>
              <td align="center" style="padding:36px 24px 20px 24px;">
                <div style="font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:34px;letter-spacing:6px;color:${GOLD};font-weight:700;">EUROHULL</div>
                <div style="width:80px;height:1px;background-color:${GOLD};margin:14px auto 0 auto;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 16px 0;font-size:18px;color:${WHITE};">Αγαπητέ/ή {{full_name}},</p>
                <p style="margin:0 0 22px 0;font-size:15px;line-height:24px;color:${MUTED};">Σας ευχαριστούμε για το ενδιαφέρον σας. Λάβαμε την αίτησή σας για τη θέση <strong style="color:${GOLD}">{{job_title}}</strong>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${STEEL};border:1px solid rgba(212,168,83,0.25);border-radius:10px;">
                  <tr><td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};line-height:22px;">
                    <div><span style="color:${FAINT};">Department:</span> <span style="color:${WHITE};">{{department}}</span></div>
                    <div><span style="color:${FAINT};">Location:</span> <span style="color:${WHITE};">{{location}}</span></div>
                    <div><span style="color:${FAINT};">Application Date:</span> <span style="color:${WHITE};">{{date}}</span></div>
                  </td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0;font-size:15px;line-height:24px;color:${MUTED};">${closing}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:26px 32px 8px 32px;">${anchorSvg}</td>
            </tr>
            <tr>
              <td align="center" style="padding:0 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0;font-size:12px;line-height:20px;color:${FAINT};">Με εκτίμηση, Ομάδα EUROHULL | Νέα Σμύρνη, Αθήνα</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return renderTemplate(html, input.vars);
}

export async function sendConfirmationEmail(input: {
  to: string;
  from: string;
  subject: string;
  /** HTML string produced by buildConfirmationEmailHtml. */
  body: string;
}): Promise<{ sent: boolean; mocked: boolean }> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.info("[email:mock] to=%s subject=%s (html %d chars)", input.to, input.subject, input.body.length);
    return { sent: true, mocked: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.body,
      text: input.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    }),
  });

  if (!response.ok) {
    console.error("[email] provider error", response.status);
    return { sent: false, mocked: false };
  }
  return { sent: true, mocked: false };
}

export type SocialResult = {
  network: string;
  posted: boolean;
  mocked: boolean;
  postUrl?: string | null;
  error?: string | null;
};

type Keys = Record<string, string | undefined>;

const GRAPH = "https://graph.facebook.com/v18.0";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function readError(response: Response) {
  const text = await response.text().catch(() => "");
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string }; message?: string };
    return parsed.error?.message ?? parsed.message ?? text.slice(0, 300);
  } catch {
    return text.slice(0, 300) || `HTTP ${response.status}`;
  }
}

async function postToLinkedIn(text: string, keys: Keys): Promise<SocialResult> {
  const token = keys["linkedin"];
  const orgId = keys["linkedin_org_id"];
  if (!token || !orgId) {
    console.info("[social:mock] linkedin -> %s", text);
    return { network: "linkedin", posted: true, mocked: true, postUrl: null, error: null };
  }
  try {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:organization:${orgId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });
    if (!response.ok) {
      const message = await readError(response);
      console.error("[social] linkedin failed", message);
      return { network: "linkedin", posted: false, mocked: false, postUrl: null, error: message };
    }
    const urn =
      response.headers.get("x-restli-id") ??
      ((await response.json().catch(() => ({}))) as { id?: string }).id ??
      null;
    return {
      network: "linkedin",
      posted: true,
      mocked: false,
      postUrl: urn ? `https://www.linkedin.com/feed/update/${urn}` : null,
      error: null,
    };
  } catch (error) {
    console.error("[social] linkedin error", errorMessage(error));
    return { network: "linkedin", posted: false, mocked: false, postUrl: null, error: errorMessage(error) };
  }
}

async function postToFacebook(text: string, keys: Keys): Promise<SocialResult> {
  const token = keys["facebook"];
  const pageId = keys["facebook_page_id"];
  if (!token || !pageId) {
    console.info("[social:mock] facebook -> %s", text);
    return { network: "facebook", posted: true, mocked: true, postUrl: null, error: null };
  }
  try {
    const body = new URLSearchParams({ message: text, access_token: token });
    const response = await fetch(`${GRAPH}/${pageId}/feed`, { method: "POST", body });
    if (!response.ok) {
      const message = await readError(response);
      console.error("[social] facebook failed", message);
      return { network: "facebook", posted: false, mocked: false, postUrl: null, error: message };
    }
    const { id } = (await response.json()) as { id?: string };
    return {
      network: "facebook",
      posted: true,
      mocked: false,
      postUrl: id ? `https://www.facebook.com/${id}` : null,
      error: null,
    };
  } catch (error) {
    console.error("[social] facebook error", errorMessage(error));
    return { network: "facebook", posted: false, mocked: false, postUrl: null, error: errorMessage(error) };
  }
}

async function postToInstagram(
  text: string,
  keys: Keys,
  job: { title: string; department: string; location: string },
  origin: string | null,
): Promise<SocialResult> {
  const token = keys["instagram"] ?? keys["facebook"];
  const accountId = keys["instagram_account_id"];
  if (!token || !accountId) {
    console.info("[social:mock] instagram -> %s", text);
    return { network: "instagram", posted: true, mocked: true, postUrl: null, error: null };
  }

  let cleanup: (() => Promise<void>) | null = null;
  try {
    const { publishJobCardImage } = await import("./social-image.server");
    const image = await publishJobCardImage({ ...job, origin });
    cleanup = image.cleanup;

    const containerBody = new URLSearchParams({
      image_url: image.url,
      caption: text,
      access_token: token,
    });
    const containerResponse = await fetch(`${GRAPH}/${accountId}/media`, {
      method: "POST",
      body: containerBody,
    });
    if (!containerResponse.ok) throw new Error(await readError(containerResponse));
    const { id: creationId } = (await containerResponse.json()) as { id?: string };
    if (!creationId) throw new Error("Instagram did not return a media container id");

    const publishResponse = await fetch(`${GRAPH}/${accountId}/media_publish`, {
      method: "POST",
      body: new URLSearchParams({ creation_id: creationId, access_token: token }),
    });
    if (!publishResponse.ok) throw new Error(await readError(publishResponse));
    const { id: mediaId } = (await publishResponse.json()) as { id?: string };

    let permalink: string | null = null;
    if (mediaId) {
      const info = await fetch(`${GRAPH}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(token)}`);
      if (info.ok) permalink = ((await info.json()) as { permalink?: string }).permalink ?? null;
    }

    return { network: "instagram", posted: true, mocked: false, postUrl: permalink, error: null };
  } catch (error) {
    console.error("[social] instagram error", errorMessage(error));
    return { network: "instagram", posted: false, mocked: false, postUrl: null, error: errorMessage(error) };
  } finally {
    if (cleanup) await cleanup().catch(() => undefined);
  }
}

export async function postJobToSocials(input: {
  title: string;
  department?: string;
  location: string;
  url: string;
  keys: Keys;
  /** Absolute site origin, used to load fonts for the Instagram card. */
  origin?: string | null;
}): Promise<SocialResult[]> {
  const text = `🔧 New position at EUROHULL: ${input.title} — ${input.location}. Apply at ${input.url}`;
  const job = {
    title: input.title,
    department: input.department ?? "",
    location: input.location,
  };

  return Promise.all([
    postToLinkedIn(text, input.keys),
    postToFacebook(text, input.keys),
    postToInstagram(text, input.keys, job, input.origin ?? null),
  ]);
}

export type ConnectionCheck = { ok: boolean; message: string };

/** Lightweight token validation used by the Settings "Test connection" buttons. */
export async function testSocialConnection(network: string, keys: Keys): Promise<ConnectionCheck> {
  try {
    if (network === "linkedin") {
      const token = keys["linkedin"];
      const orgId = keys["linkedin_org_id"];
      if (!token) return { ok: false, message: "No LinkedIn access token configured" };
      const url = orgId
        ? `https://api.linkedin.com/v2/organizations/${encodeURIComponent(orgId)}`
        : "https://api.linkedin.com/v2/me";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
      });
      return response.ok
        ? { ok: true, message: "LinkedIn connected" }
        : { ok: false, message: await readError(response) };
    }

    if (network === "facebook") {
      const token = keys["facebook"];
      if (!token) return { ok: false, message: "No Facebook access token configured" };
      const response = await fetch(`${GRAPH}/me?access_token=${encodeURIComponent(token)}`);
      return response.ok
        ? { ok: true, message: "Facebook connected" }
        : { ok: false, message: await readError(response) };
    }

    if (network === "instagram") {
      const token = keys["instagram"] ?? keys["facebook"];
      const accountId = keys["instagram_account_id"];
      if (!token) return { ok: false, message: "No Instagram/Facebook token configured" };
      if (!accountId) return { ok: false, message: "No Instagram account id configured" };
      const response = await fetch(
        `${GRAPH}/${encodeURIComponent(accountId)}?fields=username&access_token=${encodeURIComponent(token)}`,
      );
      return response.ok
        ? { ok: true, message: "Instagram connected" }
        : { ok: false, message: await readError(response) };
    }

    return { ok: false, message: "Unknown network" };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}
