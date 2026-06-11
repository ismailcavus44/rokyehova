"use client";



import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";

import { TrainingCalculator } from "@/components/TrainingCalculator";

import { ResultValue } from "@/components/ui";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function TrainingPageClient({ dict, locale }: Props) {

  const [troopsFormatted, setTroopsFormatted] = useState("0");



  const handleSummaryChange = useCallback((summary: { troops: string }) => {

    setTroopsFormatted(summary.troops);

  }, []);



  return (

    <PageShell

      locale={locale}

      header={dict.header}

      home={dict.home}

      support={dict.support}

      title={dict.training.title}

      subtitle={dict.training.subtitle}

      currentSlug="training"

      stickyResults={

        <ResultValue

          label={dict.training.results.troops}

          value={troopsFormatted}

        />

      }

    >

      <TrainingCalculator

        dict={dict}

        locale={locale}

        onSummaryChange={handleSummaryChange}

      />

    </PageShell>

  );

}

