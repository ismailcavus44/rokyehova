"use client";

import { Coffee } from "lucide-react";

import { useSupportModal } from "@/components/SupportModalProvider";
import styles from "./SupportBanner.module.css";

type Props = {
  text: string;
  button: string;
  className?: string;
};

export function SupportBanner({ text, button, className }: Props) {
  const { openSupportModal } = useSupportModal();

  return (
    <aside
      className={[styles.banner, className].filter(Boolean).join(" ")}
      aria-label={button}
    >
      <div className={styles.content}>
        <span className={styles.iconWrap} aria-hidden>
          <Coffee className={styles.icon} strokeWidth={2} />
        </span>
        <p className={styles.text}>{text}</p>
      </div>
      <button
        type="button"
        className={styles.button}
        onClick={openSupportModal}
        aria-label={button}
      >
        {button}
      </button>
    </aside>
  );
}