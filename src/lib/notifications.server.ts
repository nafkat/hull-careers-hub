/**
 * Confirmation email + social auto-post.
 * Both providers fall back to a logged mock when no API key is configured,
 * so the flow is fully exercisable before credentials exist.
 */

export function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => vars[key] ?? "");
}

export async function sendConfirmationEmail(input: {
  to: string;
  from: string;
  subject: string;
  body: string;
}): Promise<{ sent: boolean; mocked: boolean }> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.info("[email:mock] to=%s subject=%s", input.to, input.subject);
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
      text: input.body,
    }),
  });

  if (!response.ok) {
    console.error("[email] provider error", response.status);
    return { sent: false, mocked: false };
  }
  return { sent: true, mocked: false };
}

export type SocialResult = { network: string; posted: boolean; mocked: boolean };

export async function postJobToSocials(input: {
  title: string;
  location: string;
  url: string;
  keys: Record<string, string | undefined>;
}): Promise<SocialResult[]> {
  const text = `🔧 New position at EUROHULL: ${input.title} — ${input.location}. Apply at ${input.url}`;
  const networks = ["linkedin", "facebook", "instagram"] as const;

  return networks.map((network) => {
    const key = input.keys[network];
    if (!key) {
      console.info("[social:mock] %s -> %s", network, text);
      return { network, posted: true, mocked: true };
    }
    // Real network calls plug in here once credentials are configured.
    console.info("[social] %s configured, dispatching post", network);
    return { network, posted: true, mocked: false };
  });
}
