import type { ReactNode } from "react";
import styles from "./StickyResultBar.module.css";

type Props = {
  children: ReactNode;
  "aria-label"?: string;
};

export function StickyResultBar({ children, "aria-label": ariaLabel }: Props) {
  return (
    <aside
      className={styles.bar}
      aria-label={ariaLabel ?? "Summary results"}
      role="region"
    >
      <div className={styles.inner}>{children}</div>
    </aside>
  );
}
