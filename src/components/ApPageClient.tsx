"use client";

import { useCallback, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ApCalculator } from "@/components/ApCalculator";
import { ResultValue } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function ApPageClient({ dict, locale }: Props) {
  const [dailyTotal, setDailyTotal] = useState("0");

  const handleResultsChange = useCallback(
    (summary: { dailyTotal: string }) => {
      setDailyTotal(summary.dailyTotal);
    },
    [],
  );

  return (
    <PageShell
      locale={locale}
      header={dict.header}
      home={dict.home}
      support={dict.support}
      title={dict.home.items.ap.title}
      subtitle={dict.meta.description}
      currentSlug="ap"
      seoContent={dict.ap?.seo}
      stickyResults={
        <ResultValue
          label={dict.results.dailyTotal}
          value={dailyTotal}
        />
      }
    >
      <ApCalculator
        dict={dict}
        locale={locale}
        onResultsChange={handleResultsChange}
      />
    </PageShell>
  );
}
