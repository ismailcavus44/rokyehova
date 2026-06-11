"use client";

import { useCallback, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { VipCalculator } from "@/components/VipCalculator";
import { ResultValue } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function VipPageClient({ dict, locale }: Props) {
  const [pointsFormatted, setPointsFormatted] = useState("0");

  const handlePointsChange = useCallback((formatted: string) => {
    setPointsFormatted(formatted);
  }, []);

  return (
    <PageShell
      locale={locale}
      header={dict.header}
      home={dict.home}
      support={dict.support}
      title={dict.vip.title}
      subtitle={dict.vip.subtitle}
      currentSlug="vip"
      stickyResults={
        <ResultValue
          label={dict.vip.results.pointsNeeded}
          value={pointsFormatted}
        />
      }
    >
      <VipCalculator
        dict={dict}
        locale={locale}
        onPointsChange={(formatted) => handlePointsChange(formatted)}
      />
    </PageShell>
  );
}
