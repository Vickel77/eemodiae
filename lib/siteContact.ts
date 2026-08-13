/**
 * Public contact address for site sections without a dedicated inbox
 * (footer, mentorship, general mailto links). Matches MAIL_WEB_USER.
 */
export const SITE_CONTACT_EMAIL =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_SITE_EMAIL || process.env.MAIL_WEB_USER)?.trim()) ||
  "eemodiaeweb@gmail.com";
