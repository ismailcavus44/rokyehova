"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { CalculatorSeoContent } from "@/i18n/calculator-seo";
import styles from "./SeoContent.module.css";

type Props = {
  content?: CalculatorSeoContent;
  className?: string;
};

function hasRenderableContent(content?: CalculatorSeoContent): content is CalculatorSeoContent {
  if (!content) {
    return false;
  }

  return Boolean(
    content.heading ||
      content.intro ||
      content.howHeading ||
      content.how ||
      content.tipsHeading ||
      content.tips ||
      (content.faq && content.faq.length > 0),
  );
}

export function SeoContent({ content, className }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!hasRenderableContent(content)) {
    return null;
  }

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <section
      className={[styles.prose, className].filter(Boolean).join(" ")}
      aria-label="SEO content"
    >
      {content.heading ? <h2>{content.heading}</h2> : null}
      {content.intro ? <p>{content.intro}</p> : null}
      {content.howHeading ? <h3>{content.howHeading}</h3> : null}
      {content.how ? <p>{content.how}</p> : null}
      {content.tipsHeading ? <h3>{content.tipsHeading}</h3> : null}
      {content.tips ? <p>{content.tips}</p> : null}
      {content.faq && content.faq.length > 0 ? (
        <div className={styles.faqList}>
          {content.faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.q}
                className={[styles.faqItem, isOpen ? styles.faqItemOpen : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  className={styles.faqTrigger}
                  aria-expanded={isOpen}
                  onClick={() => toggle(index)}
                >
                  <span className={styles.faqQuestion}>{item.q}</span>
                  <span className={styles.faqIconWrap} aria-hidden>
                    {isOpen ? (
                      <Minus className={styles.faqIcon} strokeWidth={2.5} />
                    ) : (
                      <Plus className={styles.faqIcon} strokeWidth={2.5} />
                    )}
                  </span>
                </button>
                {isOpen ? (
                  <div className={styles.faqAnswerWrap}>
                    <p className={styles.faqAnswer}>{item.a}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
