"use client";



import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";

import { ResearchCalculator } from "@/components/ResearchCalculator";

import { ResultValue } from "@/components/ui";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function ResearchPageClient({ dict, locale }: Props) {

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

      title={dict.research.title}

      subtitle={dict.research.subtitle}

      currentSlug="research"

      stickyResults={

        <ResultValue

          label={dict.research.results.totalDuration}

          value={durationFormatted}

        />

      }

    >

      <ResearchCalculator

        dict={dict}

        locale={locale}

        onSummaryChange={handleSummaryChange}

      />

    </PageShell>

  );

}

