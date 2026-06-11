"use client";



import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";

import { EquipmentCalculator } from "@/components/EquipmentCalculator";

import { ResultValue } from "@/components/ui";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function EquipmentPageClient({ dict, locale }: Props) {

  const [durationFormatted, setDurationFormatted] = useState("—");



  const handleSummaryChange = useCallback((summary: { duration: string }) => {

    setDurationFormatted(summary.duration);

  }, []);



  return (

    <PageShell

      locale={locale}

      header={dict.header}

      home={dict.home}

      support={dict.support}

      title={dict.equipment.title}

      subtitle={dict.equipment.subtitle}

      currentSlug="equipment"

      stickyResults={

        <ResultValue

          label={dict.equipment.results.totalDuration}

          value={durationFormatted}

        />

      }

    >

      <EquipmentCalculator

        dict={dict}

        locale={locale}

        onSummaryChange={handleSummaryChange}

      />

    </PageShell>

  );

}

