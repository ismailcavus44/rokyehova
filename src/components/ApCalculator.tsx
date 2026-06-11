"use client";

import { useCallback, useEffect, useState } from "react";
import { intlNumberLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { CalculatorShell, NumberField, Panel } from "@/components/ui";
import styles from "./ApCalculator.module.css";

type Props = {
  dict: Dictionary;
  locale: Locale;
  onResultsChange?: (summary: {
    dailyTotal: string;
    dailyNatural: string;
    castles: string;
    sleepAp: string;
  }) => void;
};


type FieldKey =
  | "apRefill"
  | "dailyFree"
  | "castleCost"
  | "sleepHours"
  | "maxCapacity";

type FieldConfig = {
  key: FieldKey;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  label: string;
  fullWidth?: boolean;
};

const DEFAULTS = {
  apRefill: 29,
  dailyFree: 500,
  castleCost: 140,
  sleepHours: 8,
  maxCapacity: 1500,
} as const;

function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function ApCalculator({ dict, locale, onResultsChange }: Props) {
  const [apRefill, setApRefill] = useState<number>(DEFAULTS.apRefill);
  const [dailyFree, setDailyFree] = useState<number>(DEFAULTS.dailyFree);
  const [castleCost, setCastleCost] = useState<number>(DEFAULTS.castleCost);
  const [sleepHours, setSleepHours] = useState<number>(DEFAULTS.sleepHours);
  const [maxCapacity, setMaxCapacity] = useState<number>(DEFAULTS.maxCapacity);

  const [results, setResults] = useState({
    dailyNatural: 2979,
    dailyTotal: 3479,
    castles: 24,
    sleepAp: 993,
  });
  const [showWarning, setShowWarning] = useState(false);

  const numberLocale = intlNumberLocales[locale];

  const calculate = useCallback(() => {
    if (apRefill <= 0 || castleCost <= 0) return;

    const dailyNatural = Math.round(86400 / apRefill);
    const dailyTotal = dailyNatural + dailyFree;
    const castles = Math.floor(dailyTotal / castleCost);
    const sleepAp = Math.round((sleepHours * 3600) / apRefill);

    setResults({ dailyNatural, dailyTotal, castles, sleepAp });
    setShowWarning(sleepAp > maxCapacity);

    onResultsChange?.({
      dailyTotal: formatNumber(dailyTotal, numberLocale),
      dailyNatural: formatNumber(dailyNatural, numberLocale),
      castles: formatNumber(castles, numberLocale),
      sleepAp: formatNumber(sleepAp, numberLocale),
    });
  }, [
    apRefill,
    dailyFree,
    castleCost,
    sleepHours,
    maxCapacity,
    numberLocale,
    onResultsChange,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const fields: FieldConfig[] = [
    {
      key: "apRefill",
      min: 10,
      max: 60,
      step: 1,
      defaultValue: DEFAULTS.apRefill,
      label: dict.inputs.apRefillSeconds,
    },
    {
      key: "dailyFree",
      min: 0,
      max: 2000,
      step: 50,
      defaultValue: DEFAULTS.dailyFree,
      label: dict.inputs.dailyFreeAp,
    },
    {
      key: "castleCost",
      min: 100,
      max: 200,
      step: 5,
      defaultValue: DEFAULTS.castleCost,
      label: dict.inputs.castleApCost,
    },
    {
      key: "sleepHours",
      min: 0,
      max: 15,
      step: 1,
      defaultValue: DEFAULTS.sleepHours,
      label: dict.inputs.sleepHours,
    },
    {
      key: "maxCapacity",
      min: 1000,
      max: 3000,
      step: 50,
      defaultValue: DEFAULTS.maxCapacity,
      label: dict.inputs.maxApCapacity,
      fullWidth: true,
    },
  ];

  const values: Record<FieldKey, number> = {
    apRefill,
    dailyFree,
    castleCost,
    sleepHours,
    maxCapacity,
  };

  const setters: Record<FieldKey, (v: number) => void> = {
    apRefill: setApRefill,
    dailyFree: setDailyFree,
    castleCost: setCastleCost,
    sleepHours: setSleepHours,
    maxCapacity: setMaxCapacity,
  };

  function handleChange(key: FieldKey, raw: string) {
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) return;
    setters[key](parsed);
  }

  const formatted = {
    dailyNatural: formatNumber(results.dailyNatural, numberLocale),
    dailyTotal: formatNumber(results.dailyTotal, numberLocale),
    castles: formatNumber(results.castles, numberLocale),
    sleepAp: formatNumber(results.sleepAp, numberLocale),
  };

  return (
    <CalculatorShell className={styles.shell}>
      <aside className={styles.resultStrip} aria-live="polite">
        <div className={styles.resultMain}>
          <span className={styles.resultLabel}>{dict.results.dailyTotal}</span>
          <span key={formatted.dailyTotal} className={styles.resultValue}>
            {formatted.dailyTotal}
          </span>
        </div>
        <div className={styles.resultMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{dict.results.dailyNatural}</span>
            <span className={styles.metaValue}>{formatted.dailyNatural}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{dict.results.castles}</span>
            <span className={styles.metaValue}>{formatted.castles}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{dict.results.sleepAp}</span>
            <span className={styles.metaValue}>{formatted.sleepAp}</span>
          </div>
        </div>
      </aside>

      <Panel className={styles.inputPanel}>
        <div className={styles.inputsGrid}>
          {fields.map((field) => (
            <div
              key={field.key}
              className={field.fullWidth ? styles.fullWidth : undefined}
            >
              <NumberField
                id={`ap-${field.key}`}
                label={field.label}
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Panel>

      {showWarning && (
        <div className={styles.warning} role="alert">
          {dict.warning}
        </div>
      )}
    </CalculatorShell>
  );
}
