"use client";



import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";

import { TomesCalculator } from "@/components/TomesCalculator";

import { ResultValue } from "@/components/ui";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function TomesPageClient({ dict, locale }: Props) {

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

      title={dict.tomes.title}

      subtitle={dict.tomes.subtitle}

      currentSlug="tomes"

      stickyResults={

        <ResultValue

          label={dict.tomes.results.totalExp}

          value={totalFormatted}

        />

      }

    >

      <TomesCalculator

        dict={dict}

        locale={locale}

        onTotalChange={handleTotalChange}

      />

    </PageShell>

  );

}

