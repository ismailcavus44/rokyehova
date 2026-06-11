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
  Map,
  Package,
  Shield,
  Star,
  Swords,
} from "lucide-react";
import { CALCULATOR_SLUGS, type CalculatorSlug } from "@/config/calculators";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./RelatedCalculators.module.css";

type Props = {
  current: CalculatorSlug;
  locale: Locale;
  home: Dictionary["home"];
  title?: string;
  className?: string;
};

const CALCULATOR_ICONS: Record<CalculatorSlug, LucideIcon> = {
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

export function RelatedCalculators({
  current,
  locale,
  home,
  title,
  className,
}: Props) {
  const heading = title ?? home.relatedCalculators;
  const related = CALCULATOR_SLUGS.filter((slug) => slug !== current);

  return (
    <nav
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-label={heading}
    >
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.grid}>
        {related.map((slug) => {
          const item = home.items[slug];
          const Icon = CALCULATOR_ICONS[slug];
          return (
            <li key={slug} className={styles.gridItem}>
              <Link href={`/${locale}/${slug}`} className={styles.card}>
                <span className={styles.iconWrap} aria-hidden>
                  <Icon className={styles.icon} strokeWidth={2} />
                </span>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={styles.cardDescription}>
                  {item.description}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
