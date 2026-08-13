/**
 * Client helper for site forms → /api/mail/[inbox]
 */
import type { MailInboxId } from "../lib/mail/inboxes";

export type SendSiteMailInput = {
  inbox: MailInboxId;
  subject: string;
  replyTo?: string;
  name?: string;
  message?: string;
  fields?: Record<string, string | number | boolean | undefined | null>;
  honeypot?: string;
};

export async function sendSiteMail(input: SendSiteMailInput): Promise<void> {
  const fields: Record<string, string> = {};
  if (input.fields) {
    Object.entries(input.fields).forEach(([k, v]) => {
      if (v == null) return;
      const s = String(v).trim();
      if (s) fields[k] = s;
    });
  }

  const res = await fetch(`/api/mail/${input.inbox}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      subject: input.subject,
      replyTo: input.replyTo,
      name: input.name,
      message: input.message,
      fields,
      honeypot: input.honeypot || "",
    }),
  });

  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; error?: string }
    | null;

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Could not send email");
  }
}
