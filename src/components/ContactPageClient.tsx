"use client";



import { useCallback, useState } from "react";



import { PageShell } from "@/components/PageShell";

import {

  CONTACT_EMAIL,

  CONTACT_IN_GAME_ID,

  CONTACT_IN_GAME_NICK,

} from "@/config/site";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import styles from "./ContactPage.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function ContactPageClient({ dict, locale }: Props) {

  const { contact } = dict;

  const [copiedEmail, setCopiedEmail] = useState(false);

  const [copiedNick, setCopiedNick] = useState(false);

  const [copiedId, setCopiedId] = useState(false);



  const handleCopyEmail = useCallback(async () => {

    try {

      await navigator.clipboard.writeText(CONTACT_EMAIL);

      setCopiedEmail(true);

      window.setTimeout(() => setCopiedEmail(false), 2000);

    } catch {

      /* clipboard unavailable */

    }

  }, []);



  const handleCopyNick = useCallback(async () => {

    try {

      await navigator.clipboard.writeText(CONTACT_IN_GAME_NICK);

      setCopiedNick(true);

      window.setTimeout(() => setCopiedNick(false), 2000);

    } catch {

      /* clipboard unavailable */

    }

  }, []);



  const handleCopyId = useCallback(async () => {

    try {

      await navigator.clipboard.writeText(CONTACT_IN_GAME_ID);

      setCopiedId(true);

      window.setTimeout(() => setCopiedId(false), 2000);

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

      centered

      staticPageSchema={{

        kind: "contact",

        metaDescription: contact.meta.description,

      }}

    >

      <div className={styles.page}>

        <section className={styles.block} aria-labelledby="contact-email">

          <p className={styles.label} id="contact-email">

            {contact.emailLabel}

          </p>

          <p className={styles.line}>

            {CONTACT_EMAIL}

            <span className={styles.sep} aria-hidden>

              {" "}

              ·{" "}

            </span>

            <button

              type="button"

              className={styles.copyLink}

              onClick={handleCopyEmail}

            >

              {copiedEmail ? contact.copiedEmail : contact.copyEmail}

            </button>

          </p>

        </section>



        <div className={styles.divider} aria-hidden />



        <section className={styles.block} aria-labelledby="contact-ingame">

          <p className={styles.label} id="contact-ingame">

            {contact.inGameLabel}

          </p>

          <p className={styles.desc}>{contact.inGameText}</p>

          <div className={styles.rows}>

            <p className={styles.row}>

              <span className={styles.rowLabel}>{contact.nickLabel}</span>

              <span className={styles.nick}>{CONTACT_IN_GAME_NICK}</span>

              <span className={styles.sep} aria-hidden>

                {" "}

                ·{" "}

              </span>

              <button

                type="button"

                className={styles.copyLink}

                onClick={handleCopyNick}

              >

                {copiedNick ? contact.copiedEmail : contact.copyEmail}

              </button>

            </p>

            <p className={styles.row}>

              <span className={styles.rowLabel}>{contact.idLabel}</span>

              <span className={styles.idValue}>{CONTACT_IN_GAME_ID}</span>

              <span className={styles.sep} aria-hidden>

                {" "}

                ·{" "}

              </span>

              <button

                type="button"

                className={styles.copyLink}

                onClick={handleCopyId}

              >

                {copiedId ? contact.copiedEmail : contact.copyEmail}

              </button>

            </p>

          </div>

        </section>

      </div>

    </PageShell>

  );

}

