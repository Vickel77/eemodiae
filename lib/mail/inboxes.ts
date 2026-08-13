export const MAIL_INBOXES = {
  testimonies: {
    email: "eemodiaetestimonies@gmail.com",
    label: "Testimonies",
    userEnv: "MAIL_TESTIMONIES_USER",
    passEnv: "MAIL_TESTIMONIES_PASS",
  },
  events: {
    email: "eemodiaeevents@gmail.com",
    label: "Events",
    userEnv: "MAIL_EVENTS_USER",
    passEnv: "MAIL_EVENTS_PASS",
  },
  bookings: {
    email: "eemodiaebookings@gmail.com",
    label: "Bookings",
    userEnv: "MAIL_BOOKINGS_USER",
    passEnv: "MAIL_BOOKINGS_PASS",
  },
  messages: {
    email: "eemodiaemessages@gmail.com",
    label: "Messages",
    userEnv: "MAIL_MESSAGES_USER",
    passEnv: "MAIL_MESSAGES_PASS",
  },
  articles: {
    email: "eemodiaearticles@gmail.com",
    label: "Articles",
    userEnv: "MAIL_ARTICLES_USER",
    passEnv: "MAIL_ARTICLES_PASS",
  },
  poems: {
    email: "eemodiaepoems@gmail.com",
    label: "Poems",
    userEnv: "MAIL_POEMS_USER",
    passEnv: "MAIL_POEMS_PASS",
  },
  web: {
    email: "eemodiaeweb@gmail.com",
    label: "Web",
    userEnv: "MAIL_WEB_USER",
    passEnv: "MAIL_WEB_PASS",
  },
} as const;

export type MailInboxId = keyof typeof MAIL_INBOXES;

export function isMailInboxId(value: string): value is MailInboxId {
  return value in MAIL_INBOXES;
}
