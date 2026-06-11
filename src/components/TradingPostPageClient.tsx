"use client";

import { useCallback, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { TradingPostCalculator } from "@/components/TradingPostCalculator";
import { ResultValue } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function TradingPostPageClient({ dict, locale }: Props) {
  const [summary, setSummary] = useState({
    primaryLabel: dict.tradingPost.results.send,
    primaryValue: "0",
  });

  const handleSummaryChange = useCallback(
    (next: { primaryLabel: string; primaryValue: string }) => {
      setSummary(next);
    },
    [],
  );

  return (
    <PageShell
      locale={locale}
      header={dict.header}
      home={dict.home}
      support={dict.support}
      title={dict.tradingPost.title}
      subtitle={dict.tradingPost.subtitle}
      currentSlug="trading-post"
      stickyResults={
        <ResultValue
          label={summary.primaryLabel}
          value={summary.primaryValue}
        />
      }
    >
      <TradingPostCalculator
        dict={dict}
        locale={locale}
        onSummaryChange={handleSummaryChange}
      />
    </PageShell>
  );
}
