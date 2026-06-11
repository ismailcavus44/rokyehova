import type { ReactNode } from "react";
import styles from "./Panel.module.css";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

export function Panel({ children, className, as: Tag = "div" }: Props) {
  return (
    <Tag className={[styles.panel, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
