"use client";

import { useCallback, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SpeedupCalculator } from "@/components/SpeedupCalculator";
import { ResultValue } from "@/components/ui";
import type { CalculatorSeoContent } from "@/i18n/calculator-seo";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type SpeedupDict = Dictionary["speedup"] & { seo?: CalculatorSeoContent };

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function SpeedupPageClient({ dict, locale }: Props) {
  const [durationFormatted, setDurationFormatted] = useState("");

  const handleDurationChange = useCallback((formatted: string) => {
    setDurationFormatted(formatted);
  }, []);

  return (
    <PageShell
      locale={locale}
      header={dict.header}
      home={dict.home}
      support={dict.support}
      title={dict.speedup.title}
      subtitle={dict.speedup.subtitle}
      currentSlug="speedup"
      seoContent={(dict.speedup as SpeedupDict).seo}
      stickyResults={
        <ResultValue
          label={dict.speedup.results.totalDuration}
          value={durationFormatted || "0"}
        />
      }
    >
      <SpeedupCalculator
        dict={dict}
        locale={locale}
        onDurationChange={handleDurationChange}
      />
    </PageShell>
  );
}
