"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { tomesTotalExp } from "@/rok/calc";

import tomes from "@/rok/data/tomes.json";

import { intlNumberLocales, type Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import { CalculatorShell, NumberField, Panel } from "@/components/ui";

import styles from "./TomesCalculator.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

  onTotalChange?: (formatted: string, selectedCount: number) => void;

};



const PACKAGES = tomes.expValues;

const SLIDER_MAX = 500;






function formatNumber(num: number, locale: string): string {

  return new Intl.NumberFormat(locale).format(num);

}



function formatPackageLabel(

  value: number,

  unit: string,

  locale: string,

): string {

  return `${formatNumber(value, locale)} ${unit}`;

}



function initialCounts(): Record<number, number> {

  return Object.fromEntries(PACKAGES.map((pkg) => [pkg, 0]));

}



export function TomesCalculator({ dict, locale, onTotalChange }: Props) {

  const tomesDict = dict.tomes;

  const numberLocale = intlNumberLocales[locale];



  const [counts, setCounts] = useState<Record<number, number>>(initialCounts);

  const [totalExp, setTotalExp] = useState(0);



  const selectedCount = useMemo(

    () => Object.values(counts).filter((count) => count > 0).length,

    [counts],

  );



  const calculate = useCallback(() => {

    const total = tomesTotalExp(counts);

    setTotalExp(total);

    onTotalChange?.(formatNumber(total, numberLocale), selectedCount);

  }, [counts, numberLocale, onTotalChange, selectedCount]);



  useEffect(() => {

    calculate();

  }, [calculate]);



  const packageLabels = useMemo(

    () =>

      PACKAGES.map((pkg) => ({

        value: pkg,

        label: formatPackageLabel(pkg, tomesDict.labels.exp, numberLocale),

      })),

    [tomesDict.labels.exp, numberLocale],

  );



  function handleChange(pkg: number, raw: string) {

    const parsed = parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setCounts((prev) => ({ ...prev, [pkg]: parsed }));

  }




  const formattedTotal = formatNumber(totalExp, numberLocale);



  return (

    <CalculatorShell className={styles.shell}>

      <aside className={styles.resultStrip} aria-live="polite">

        <div className={styles.resultMain}>

          <span className={styles.resultLabel}>

            {tomesDict.results.totalExp}

          </span>

          <span key={formattedTotal} className={styles.resultValue}>

            {formattedTotal}

          </span>

        </div>

        <div className={styles.resultMeta}>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {tomesDict.results.packagesSelected}

            </span>

            <span className={styles.metaValue}>

              {formatNumber(selectedCount, numberLocale)}

            </span>

          </div>

        </div>

      </aside>



      <Panel className={styles.inputPanel}>

        <div className={styles.inputsGrid}>

          {packageLabels.map(({ value, label }) => (

            <div key={value} className={styles.cell}>
              <NumberField
                compact
                id={`tomes-qty-${value}`}
                label={label}
                min={0}
                max={SLIDER_MAX}
                step={1}
                value={counts[value] ?? 0}
                onChange={(e) => handleChange(value, e.target.value)}
              />
            </div>

          ))}

        </div>

      </Panel>

    </CalculatorShell>

  );

}

