import { PageShell } from "@/components/PageShell";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./AboutPage.module.css";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function AboutPageClient({ dict, locale }: Props) {
  const { about } = dict;

  return (
    <PageShell
      locale={locale}
      header={dict.header}
      home={dict.home}
      support={dict.support}
      title={about.title}
      subtitle={about.subtitle}
      centered
      staticPageSchema={{
        kind: "about",
        metaDescription: about.meta.description,
        personDescription: about.body[0] ?? "",
      }}
    >
      <div className={styles.page}>
        <div className={styles.prose}>
          {about.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
