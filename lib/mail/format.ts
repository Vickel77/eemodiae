function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type MailPayload = {
  subject?: string;
  replyTo?: string;
  name?: string;
  message?: string;
  text?: string;
  html?: string;
  fields?: Record<string, unknown>;
  honeypot?: string;
};

const SKIP_KEYS = new Set([
  "subject",
  "replyTo",
  "replyto",
  "_replyto",
  "_subject",
  "_template",
  "_captcha",
  "_honey",
  "honeypot",
  "honey",
  "html",
  "text",
]);

export function collectFields(body: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {};
  const source =
    body.fields && typeof body.fields === "object" && !Array.isArray(body.fields)
      ? (body.fields as Record<string, unknown>)
      : body;

  Object.entries(source).forEach(([key, value]) => {
    if (SKIP_KEYS.has(key) || key.startsWith("_")) return;
    if (value == null) return;
    if (typeof value === "object") return;
    const str = String(value).trim();
    if (!str) return;
    fields[key] = str;
  });

  if (typeof body.name === "string" && body.name.trim() && !fields.name && !fields.Name) {
    fields.Name = body.name.trim();
  }
  if (typeof body.message === "string" && body.message.trim() && !fields.message && !fields.Message) {
    fields.Message = body.message.trim();
  }
  if (typeof body.email === "string" && body.email.trim() && !fields.email && !fields.Email) {
    fields.Email = body.email.trim();
  }

  return fields;
}

export function fieldsToText(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export function fieldsToHtml(fields: Record<string, string>, title: string): string {
  const rows = Object.entries(fields)
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:Georgia,serif;font-size:13px;color:#6b5a44;width:140px;vertical-align:top;">${escapeHtml(k)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:Georgia,serif;font-size:15px;color:#2c2013;white-space:pre-wrap;">${escapeHtml(v)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f5f0e6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fffdf7;border:1px solid rgba(201,162,75,.22);border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:18px 22px;background:#2c2013;color:#e4c169;font-family:Georgia,serif;font-size:16px;letter-spacing:.04em;">
          ${escapeHtml(title)}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 10px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function resolveReplyTo(body: MailPayload & Record<string, unknown>): string | undefined {
  const fields =
    body.fields && typeof body.fields === "object" && !Array.isArray(body.fields)
      ? (body.fields as Record<string, unknown>)
      : {};

  const candidates: Array<string | undefined> = [
    typeof body.replyTo === "string" ? body.replyTo : undefined,
    typeof body.replyto === "string" ? body.replyto : undefined,
    typeof body._replyto === "string" ? body._replyto : undefined,
    typeof body.email === "string" ? body.email : undefined,
    typeof fields.Email === "string" ? fields.Email : undefined,
    typeof fields.email === "string" ? fields.email : undefined,
  ];

  const hit = candidates.find((v) => !!v && /^\S+@\S+\.\S+$/.test(v.trim()));
  return hit?.trim();
}

export function isHoneypotFilled(body: MailPayload & Record<string, unknown>): boolean {
  const honey = body.honeypot ?? body.honey ?? body._honey;
  return typeof honey === "string" && honey.trim().length > 0;
}
