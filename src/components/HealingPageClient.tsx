"use client";



import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";

import { HealingCalculator } from "@/components/HealingCalculator";

import { ResultValue } from "@/components/ui";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function HealingPageClient({ dict, locale }: Props) {

  const [durationFormatted, setDurationFormatted] = useState("0");



  const handleSummaryChange = useCallback((summary: { duration: string }) => {

    setDurationFormatted(summary.duration);

  }, []);



  return (

    <PageShell

      locale={locale}

      header={dict.header}

      home={dict.home}

      support={dict.support}

      title={dict.healing.title}

      subtitle={dict.healing.subtitle}

      currentSlug="healing"

      stickyResults={

        <ResultValue

          label={dict.healing.results.totalDuration}

          value={durationFormatted}

        />

      }

    >

      <HealingCalculator

        dict={dict}

        locale={locale}

        onSummaryChange={handleSummaryChange}

      />

    </PageShell>

  );

}

