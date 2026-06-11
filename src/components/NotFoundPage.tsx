import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./NotFoundPage.module.css";

type Props = {
  locale: Locale;
  copy: Dictionary["notFound"];
};

export function NotFoundPage({ locale, copy }: Props) {
  return (
    <main className={styles.page}>
      <p className={styles.code} aria-hidden>
        {copy.code}
      </p>
      <h1 className={styles.message}>{copy.message}</h1>
      <Link href={`/${locale}`} className={styles.homeLink}>
        {copy.backHome}
      </Link>
    </main>
  );
}
