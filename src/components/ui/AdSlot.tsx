import type { ReactNode } from "react";
import styles from "./AdSlot.module.css";

/** leaderboard: 728×90 / 320×100 (header area) */
/** rectangle: 300×250 (in-content, after calculator) */
/** in-article: fluid (before footer) */
/** vertical: 300×600 sidebar (≥1280px) */
export type AdSlotSize =
  | "leaderboard"
  | "rectangle"
  | "in-article"
  | "vertical";

type Props = {
  size: AdSlotSize;
  className?: string;
  children?: ReactNode;
  /** Raw ad HTML/JS snippet — rendered when children absent */
  html?: string;
};

const SIZE_CLASS: Record<AdSlotSize, string> = {
  leaderboard: styles.leaderboard,
  rectangle: styles.rectangle,
  "in-article": styles.inArticle,
  vertical: styles.vertical,
};

export function AdSlot({ size, className, children, html }: Props) {
  const hasContent = Boolean(children || html);

  return (
    <div
      className={[
        styles.slot,
        SIZE_CLASS[size],
        !hasContent && styles.reserved,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-ad-slot={size}
      aria-hidden={!hasContent || undefined}
      {...(html ? { dangerouslySetInnerHTML: { __html: html } } : {})}
    >
      {!html ? children : null}
    </div>
  );
}
