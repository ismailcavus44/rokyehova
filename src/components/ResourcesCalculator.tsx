"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { resourcePackTotal, type ResourcePackCounts } from "@/rok/calc";

import { intlNumberLocales, type Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import { CalculatorShell, NumberField, Panel } from "@/components/ui";

import styles from "./ResourcesCalculator.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

  onTotalChange?: (formatted: string, selectedCount: number) => void;

};



type PackKey = keyof ResourcePackCounts;



const PACK_KEYS: PackKey[] = ["lvl1A", "lvl1B", "lvl1C", "lvl2", "lvl3"];

const SLIDER_MAX = 500;






function formatNumber(num: number, locale: string): string {

  return new Intl.NumberFormat(locale).format(num);

}



function initialCounts(): ResourcePackCounts {

  return { lvl1A: 0, lvl1B: 0, lvl1C: 0, lvl2: 0, lvl3: 0 };

}



export function ResourcesCalculator({ dict, locale, onTotalChange }: Props) {

  const resources = dict.resources;

  const numberLocale = intlNumberLocales[locale];



  const [counts, setCounts] = useState<ResourcePackCounts>(initialCounts);

  const [total, setTotal] = useState(0);



  const selectedCount = useMemo(

    () => PACK_KEYS.filter((key) => counts[key] > 0).length,

    [counts],

  );



  const calculate = useCallback(() => {

    const nextTotal = resourcePackTotal(counts);

    setTotal(nextTotal);

    onTotalChange?.(formatNumber(nextTotal, numberLocale), selectedCount);

  }, [counts, numberLocale, onTotalChange, selectedCount]);



  useEffect(() => {

    calculate();

  }, [calculate]);



  function handleChange(key: PackKey, raw: string) {

    const parsed = parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setCounts((prev) => ({ ...prev, [key]: parsed }));

  }




  const formattedTotal = formatNumber(total, numberLocale);



  return (

    <CalculatorShell className={styles.shell}>

      <aside className={styles.resultStrip} aria-live="polite">

        <div className={styles.resultMain}>

          <span className={styles.resultLabel}>

            {resources.results.totalResources}

          </span>

          <span key={formattedTotal} className={styles.resultValue}>

            {formattedTotal}

          </span>

        </div>

        <div className={styles.resultMeta}>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {resources.results.packagesSelected}

            </span>

            <span className={styles.metaValue}>

              {formatNumber(selectedCount, numberLocale)}

            </span>

          </div>

        </div>

      </aside>



      <Panel className={styles.inputPanel}>

        <div className={styles.inputsGrid}>

          {PACK_KEYS.map((key) => (

            <div key={key} className={styles.cell}>
              <NumberField
                compact
                id={`resources-qty-${key}`}
                label={resources.inputs[key]}
                min={0}
                max={SLIDER_MAX}
                step={1}
                value={counts[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>

          ))}

        </div>

      </Panel>

    </CalculatorShell>

  );

}

