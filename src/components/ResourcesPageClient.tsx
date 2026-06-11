"use client";



import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";

import { ResourcesCalculator } from "@/components/ResourcesCalculator";

import { ResultValue } from "@/components/ui";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function ResourcesPageClient({ dict, locale }: Props) {

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

      title={dict.resources.title}

      subtitle={dict.resources.subtitle}

      currentSlug="resources"

      stickyResults={

        <ResultValue

          label={dict.resources.results.totalResources}

          value={totalFormatted}

        />

      }

    >

      <ResourcesCalculator

        dict={dict}

        locale={locale}

        onTotalChange={handleTotalChange}

      />

    </PageShell>

  );

}

