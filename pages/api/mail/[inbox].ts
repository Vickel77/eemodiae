import type { NextApiRequest, NextApiResponse } from "next";
import { isMailInboxId } from "../../../lib/mail/inboxes";
import {
  collectFields,
  fieldsToHtml,
  fieldsToText,
  isHoneypotFilled,
  resolveReplyTo,
  type MailPayload,
} from "../../../lib/mail/format";
import { getInboxTransport } from "../../../lib/mail/transport";

type Ok = { ok: true };
type Err = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const inboxParam = String(req.query.inbox || "");
  if (!isMailInboxId(inboxParam)) {
    return res.status(404).json({ ok: false, error: "Unknown inbox" });
  }

  const body = (typeof req.body === "object" && req.body ? req.body : {}) as MailPayload &
    Record<string, unknown>;

  // Silent success for bots
  if (isHoneypotFilled(body)) {
    return res.status(200).json({ ok: true });
  }

  try {
    const { transport, email, label } = getInboxTransport(inboxParam);
    const fields = collectFields(body);
    const subject =
      (typeof body.subject === "string" && body.subject.trim()) ||
      (typeof body._subject === "string" && String(body._subject).trim()) ||
      `New ${label} message from eemodiae.org`;

    const text =
      (typeof body.text === "string" && body.text.trim()) ||
      fieldsToText(fields) ||
      (typeof body.message === "string" ? body.message : "");

    if (!text.trim() && !body.html) {
      return res.status(400).json({ ok: false, error: "Message body is required" });
    }

    const html =
      (typeof body.html === "string" && body.html.trim()) ||
      fieldsToHtml(fields, subject);

    const replyTo = resolveReplyTo(body);

    await transport.sendMail({
      from: `"eemodiae · ${label}" <${email}>`,
      to: email,
      replyTo: replyTo || email,
      subject,
      text,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error(`[mail/${inboxParam}]`, message);
    return res.status(500).json({ ok: false, error: message });
  }
}
