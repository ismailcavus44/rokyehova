import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Battery,
  BookOpen,
  Building2,
  Clock,
  Crown,
  FlaskConical,
  Gem,
  HeartPulse,
  Package,
  Map,
  Shield,
  Star,
  Swords,
} from "lucide-react";
import { HomeFaq } from "@/components/HomeFaq";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import { buildHomePageSchemaGraph } from "@/lib/schema";
import type { CalculatorSlug } from "@/config/calculators";
import { NAV_CATEGORIES } from "@/config/nav";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./HomePage.module.css";

type Props = {
  locale: Locale;
  siteName: string;
  home: Dictionary["home"];
};

const ICONS: Record<CalculatorSlug, LucideIcon> = {
  ap: Battery,
  speedup: Clock,
  gems: Gem,
  tomes: BookOpen,
  vip: Crown,
  commander: Star,
  "trading-post": ArrowLeftRight,
  resources: Package,
  healing: HeartPulse,
  training: Swords,
  building: Building2,
  research: FlaskConical,
  equipment: Shield,
  "aoo-planner": Map,
};

const FEATURED = new Set<CalculatorSlug>(["speedup", "training"]);

function spanClass(categoryId: (typeof NAV_CATEGORIES)[number]["id"], index: number): string {
  if (categoryId === "economy") return styles.half;
  return index === 0 ? styles.feature : "";
}

export function HomePage({ locale, siteName, home }: Props) {
  const schemaGraph = buildHomePageSchemaGraph({
    locale,
    siteName,
    faq: home.faq,
  });

  return (
    <>
      <SchemaJsonLd graph={schemaGraph} />
      <main className={styles.main}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <span className={styles.heroGlow} aria-hidden />
          <h1 className={styles.heroTitle}>{home.hero.title}</h1>
          <p className={styles.heroSubtitle}>{home.hero.subtitle}</p>
          <ul className={styles.stats}>
            {home.hero.stats.map((stat) => (
              <li key={stat} className={styles.stat}>
                {stat}
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.categories}>
          {NAV_CATEGORIES.map((category) => (
            <section key={category.id} className={styles.category}>
              <h2 className={styles.categoryTitle}>
                {home.categories[category.id]}
              </h2>
              <div className={styles.bentoGrid}>
                {category.slugs.map((slug, index) => {
                  const item = home.items[slug];
                  const Icon = ICONS[slug];
                  const isFeatured = FEATURED.has(slug);
                  return (
                    <Link
                      key={slug}
                      href={`/${locale}/${slug}`}
                      className={[
                        styles.card,
                        spanClass(category.id, index),
                        isFeatured ? styles.featured : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className={styles.iconWrap} aria-hidden>
                        <Icon className={styles.icon} strokeWidth={2} />
                      </span>
                      <span className={styles.cardTitle}>{item.title}</span>
                      <span className={styles.cardDescription}>
                        {item.description}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className={styles.seo} aria-label={home.seo.title}>
          <h2 className={styles.seoTitle}>{home.seo.title}</h2>
          {home.seo.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className={styles.seoParagraph}>
              {paragraph}
            </p>
          ))}
        </section>

        <HomeFaq faq={home.faq} />
      </div>
      </main>
    </>
  );
}
