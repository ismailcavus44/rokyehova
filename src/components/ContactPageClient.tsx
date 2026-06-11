"use client";

import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";
import { CONTACT_EMAIL } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./ContactPage.module.css";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function ContactPageClient({ dict, locale }: Props) {
  const { contact } = dict;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  return (
    <PageShell
      locale={locale}
      header={dict.header}
      home={dict.home}
      support={dict.support}
      title={contact.title}
      subtitle={contact.subtitle}
      staticPageSchema={{
        kind: "contact",
        metaDescription: contact.meta.description,
      }}
    >
      <div className={styles.page}>
        <p className={styles.intro}>{contact.intro}</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.mailButton}>
          {contact.emailButton}
        </a>
        <p className={styles.emailLine}>
          {CONTACT_EMAIL}
          <span className={styles.sep} aria-hidden>
            {" "}
            ·{" "}
          </span>
          <button type="button" className={styles.copyLink} onClick={handleCopy}>
            {copied ? contact.copiedEmail : contact.copyEmail}
          </button>
        </p>
      </div>
    </PageShell>
  );
}
