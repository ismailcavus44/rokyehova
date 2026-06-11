"use client";



import { useCallback, useState } from "react";

import { PageShell } from "@/components/PageShell";

import { CommanderCalculator } from "@/components/CommanderCalculator";

import { ResultValue } from "@/components/ui";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";



type Props = {

  dict: Dictionary;

  locale: Locale;

};



export function CommanderPageClient({ dict, locale }: Props) {

  const [expFormatted, setExpFormatted] = useState("0");



  const handleExpChange = useCallback((formatted: string) => {

    setExpFormatted(formatted);

  }, []);



  return (

    <PageShell

      locale={locale}

      header={dict.header}

      home={dict.home}

      support={dict.support}

      title={dict.commander.title}

      subtitle={dict.commander.subtitle}

      currentSlug="commander"

      stickyResults={

        <ResultValue

          label={dict.commander.results.expNeeded}

          value={expFormatted}

        />

      }

    >

      <CommanderCalculator

        dict={dict}

        locale={locale}

        onExpChange={handleExpChange}

      />

    </PageShell>

  );

}

