import type { ReactNode } from "react";
import styles from "./CalculatorShell.module.css";

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function CalculatorShell({
  title,
  subtitle,
  children,
  className,
}: Props) {
  return (
    <div className={[styles.shell, className].filter(Boolean).join(" ")}>
      {(title || subtitle) && (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
