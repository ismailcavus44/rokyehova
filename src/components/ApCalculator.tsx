"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./ApCalculator.module.css";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

const numberLocales: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
  es: "es-ES",
};

type FieldKey =
  | "apRefill"
  | "dailyFree"
  | "castleCost"
  | "sleepHours"
  | "maxCapacity";

type FieldConfig = {
  key: FieldKey;
  sliderId: string;
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

export function ApCalculator({ dict, locale }: Props) {
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

  const numberLocale = numberLocales[locale];

  const calculate = useCallback(() => {
    if (apRefill <= 0 || castleCost <= 0) return;

    const dailyNatural = Math.round(86400 / apRefill);
    const dailyTotal = dailyNatural + dailyFree;
    const castles = Math.floor(dailyTotal / castleCost);
    const sleepAp = Math.round((sleepHours * 3600) / apRefill);

    setResults({ dailyNatural, dailyTotal, castles, sleepAp });
    setShowWarning(sleepAp > maxCapacity);
  }, [apRefill, dailyFree, castleCost, sleepHours, maxCapacity]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const fields: FieldConfig[] = [
    {
      key: "apRefill",
      sliderId: "ap-slider",
      min: 10,
      max: 60,
      step: 1,
      defaultValue: DEFAULTS.apRefill,
      label: dict.inputs.apRefillSeconds,
    },
    {
      key: "dailyFree",
      sliderId: "bedava-slider",
      min: 0,
      max: 2000,
      step: 50,
      defaultValue: DEFAULTS.dailyFree,
      label: dict.inputs.dailyFreeAp,
    },
    {
      key: "castleCost",
      sliderId: "kale-slider",
      min: 100,
      max: 200,
      step: 5,
      defaultValue: DEFAULTS.castleCost,
      label: dict.inputs.castleApCost,
    },
    {
      key: "sleepHours",
      sliderId: "uyku-slider",
      min: 0,
      max: 15,
      step: 1,
      defaultValue: DEFAULTS.sleepHours,
      label: dict.inputs.sleepHours,
    },
    {
      key: "maxCapacity",
      sliderId: "kapasite-slider",
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

  return (
    <div className={styles.container}>
      <div className={styles.resultsGrid}>
        <div className={styles.resultItem}>
          <div className={styles.resultLabel}>{dict.results.dailyNatural}</div>
          <div className={styles.resultValue}>
            {formatNumber(results.dailyNatural, numberLocale)}
          </div>
        </div>
        <div className={styles.resultItem}>
          <div className={styles.resultLabel}>{dict.results.dailyTotal}</div>
          <div className={styles.resultValue}>
            {formatNumber(results.dailyTotal, numberLocale)}
          </div>
        </div>
        <div className={styles.resultItem}>
          <div className={styles.resultLabel}>{dict.results.castles}</div>
          <div className={styles.resultValue}>
            {formatNumber(results.castles, numberLocale)}
          </div>
        </div>
        <div className={styles.resultItem}>
          <div className={styles.resultLabel}>{dict.results.sleepAp}</div>
          <div className={styles.resultValue}>
            {formatNumber(results.sleepAp, numberLocale)}
          </div>
        </div>
      </div>

      <div className={styles.inputsGrid}>
        {fields.map((field) => {
          const value = values[field.key];
          return (
            <div
              key={field.key}
              className={`${styles.inputGroup} ${field.fullWidth ? styles.fullWidth : ""}`}
            >
              <div className={styles.inputLabel}>{field.label}</div>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  id={field.sliderId}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              </div>
              <input
                type="number"
                className={styles.numberInput}
                min={field.min}
                max={field.max}
                step={field.step}
                value={value}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      {showWarning && (
        <div className={styles.warning} role="alert">
          ⚠️ {dict.warning}
        </div>
      )}
    </div>
  );
}
