"use client";



import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";

import { BuildingCalculator } from "@/components/BuildingCalculator";

import { ResultValue } from "@/components/ui";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function BuildingPageClient({ dict, locale }: Props) {

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

      title={dict.building.title}

      subtitle={dict.building.subtitle}

      currentSlug="building"

      stickyResults={

        <ResultValue

          label={dict.building.results.totalDuration}

          value={durationFormatted}

        />

      }

    >

      <BuildingCalculator

        dict={dict}

        locale={locale}

        onSummaryChange={handleSummaryChange}

      />

    </PageShell>

  );

}

