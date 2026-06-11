"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./HomeFaq.module.css";

type Props = {
  faq: Dictionary["home"]["faq"];
};

export function HomeFaq({ faq }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <section className={styles.section} aria-labelledby="home-faq-title">
      <h2 id="home-faq-title" className={styles.title}>
        {faq.title}
      </h2>
      <div className={styles.list}>
        {faq.items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={[styles.item, isOpen ? styles.itemOpen : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                onClick={() => toggle(index)}
              >
                <span className={styles.question}>{item.question}</span>
                <span className={styles.iconWrap} aria-hidden>
                  {isOpen ? (
                    <Minus className={styles.icon} strokeWidth={2.5} />
                  ) : (
                    <Plus className={styles.icon} strokeWidth={2.5} />
                  )}
                </span>
              </button>
              {isOpen ? (
                <div className={styles.answerWrap}>
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
