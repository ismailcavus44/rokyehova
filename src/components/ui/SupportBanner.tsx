"use client";

import { Coffee } from "lucide-react";

import { SupportGoalBar } from "@/components/SupportGoalBar";
import { useSupportModal } from "@/components/SupportModalProvider";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./SupportBanner.module.css";

type Props = {
  text: string;
  button: string;
  goal: Dictionary["support"]["goal"];
  className?: string;
};

export function SupportBanner({ text, button, goal, className }: Props) {
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
        <div className={styles.textBlock}>
          <p className={styles.text}>{text}</p>
          <SupportGoalBar goal={goal} compact />
        </div>
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