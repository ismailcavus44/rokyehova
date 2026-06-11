"use client";

import { useCallback, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { GemsCalculator } from "@/components/GemsCalculator";
import { ResultValue } from "@/components/ui";
import type { CalculatorSeoContent } from "@/i18n/calculator-seo";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type GemsDict = Dictionary["gems"] & { seo?: CalculatorSeoContent };

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function GemsPageClient({ dict, locale }: Props) {
  const [totalFormatted, setTotalFormatted] = useState("0");

  const handleTotalChange = useCallback((formatted: string) => {
    setTotalFormatted(formatted);
  }, []);

  return (
    <PageShell
      locale={locale}
      header={dict.header}
      home={dict.home}
      support={dict.support}
      title={dict.gems.title}
      subtitle={dict.gems.subtitle}
      currentSlug="gems"
      seoContent={(dict.gems as GemsDict).seo}
      stickyResults={
        <ResultValue
          label={dict.gems.results.totalGems}
          value={totalFormatted}
        />
      }
    >
      <GemsCalculator
        dict={dict}
        locale={locale}
        onTotalChange={(formatted) => handleTotalChange(formatted)}
      />
    </PageShell>
  );
}
