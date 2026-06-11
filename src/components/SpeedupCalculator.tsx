"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { weightedTotal, secondsToDHMS } from "@/rok/calc";
import denominations from "@/rok/data/denominations.json";
import { intlNumberLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { CalculatorShell, NumberField, Panel } from "@/components/ui";
import styles from "./SpeedupCalculator.module.css";

type Props = {
  dict: Dictionary;
  locale: Locale;
  onDurationChange?: (formatted: string) => void;
};

export type SpeedupResults = {
  totalMinutes: number;
  days: number;
  hours: number;
  minutes: number;
  formatted: string;
};

const PACKAGES = denominations.genericSpeedups;
const SLIDER_MAX = 500;


function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

function formatPackageLabel(
  minutes: number,
  labels: Dictionary["speedup"]["labels"],
): string {
  if (minutes >= 1440 && minutes % 1440 === 0) {
    return `${minutes / 1440} ${labels.day}`;
  }
  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60} ${labels.hour}`;
  }
  return `${minutes} ${labels.minute}`;
}

function formatDuration(
  days: number,
  hours: number,
  minutes: number,
  results: Dictionary["speedup"]["results"],
  locale: string,
): string {
  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${formatNumber(days, locale)} ${results.days}`);
  }
  if (hours > 0) {
    parts.push(`${formatNumber(hours, locale)} ${results.hours}`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${formatNumber(minutes, locale)} ${results.minutes}`);
  }
  return parts.join(" · ");
}

function initialCounts(): Record<number, number> {
  return Object.fromEntries(PACKAGES.map((pkg) => [pkg, 0]));
}

export function SpeedupCalculator({
  dict,
  locale,
  onDurationChange,
}: Props) {
  const speedup = dict.speedup;
  const numberLocale = intlNumberLocales[locale];

  const [counts, setCounts] = useState<Record<number, number>>(initialCounts);
  const [results, setResults] = useState<SpeedupResults>({
    totalMinutes: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    formatted: formatDuration(0, 0, 0, speedup.results, numberLocale),
  });

  const selectedCount = useMemo(
    () => Object.values(counts).filter((count) => count > 0).length,
    [counts],
  );

  const calculate = useCallback(() => {
    const totalMinutes = weightedTotal(counts);
    const dhms = secondsToDHMS(totalMinutes * 60);
    const formatted = formatDuration(
      dhms.days,
      dhms.hours,
      dhms.minutes,
      speedup.results,
      numberLocale,
    );
    setResults({
      totalMinutes,
      days: dhms.days,
      hours: dhms.hours,
      minutes: dhms.minutes,
      formatted,
    });
    onDurationChange?.(formatted);
  }, [counts, speedup.results, numberLocale, onDurationChange]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const packageLabels = useMemo(
    () =>
      PACKAGES.map((pkg) => ({
        value: pkg,
        label: formatPackageLabel(pkg, speedup.labels),
      })),
    [speedup.labels],
  );

  function setCount(pkg: number, next: number) {
    const clamped = Math.max(0, Math.min(SLIDER_MAX, next));
    setCounts((prev) => ({ ...prev, [pkg]: clamped }));
  }

  function handleChange(pkg: number, raw: string) {
    if (raw === "") {
      setCount(pkg, 0);
      return;
    }
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setCount(pkg, parsed);
  }

  return (
    <CalculatorShell className={styles.shell}>
      <aside className={styles.resultStrip} aria-live="polite">
        <div className={styles.resultMain}>
          <span className={styles.resultLabel}>
            {speedup.results.totalDuration}
          </span>
          <span key={results.formatted} className={styles.resultValue}>
            {results.formatted}
          </span>
        </div>
        <div className={styles.resultMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {speedup.results.totalMinutes}
            </span>
            <span className={styles.metaValue}>
              {formatNumber(results.totalMinutes, numberLocale)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {speedup.results.packagesSelected}
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
                id={`speedup-qty-${value}`}
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
