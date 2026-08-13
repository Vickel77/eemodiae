import nodemailer, { type Transporter } from "nodemailer";
import { MAIL_INBOXES, type MailInboxId } from "./inboxes";

const transportCache = new Map<MailInboxId, Transporter>();

function env(name: string): string {
  return (process.env[name] || "").trim();
}

/**
 * One Gmail SMTP transport per inbox.
 * Sender and receiver are the same address; auth uses that inbox's app password.
 */
export function getInboxTransport(inboxId: MailInboxId): {
  transport: Transporter;
  email: string;
  label: string;
} {
  const cfg = MAIL_INBOXES[inboxId];
  const email = env(cfg.userEnv) || cfg.email;
  const pass = env(cfg.passEnv);

  if (!pass) {
    throw new Error(
      `Missing ${cfg.passEnv} for ${cfg.label} inbox. Add the Gmail app password to .env.local.`
    );
  }

  let transport = transportCache.get(inboxId);
  if (!transport) {
    transport = nodemailer.createTransport({
      host: env("MAIL_SMTP_HOST") || "smtp.gmail.com",
      port: Number(env("MAIL_SMTP_PORT") || 465),
      secure: (env("MAIL_SMTP_SECURE") || "true") !== "false",
      auth: {
        user: email,
        pass,
      },
    });
    transportCache.set(inboxId, transport);
  }

  return { transport, email, label: cfg.label };
}
