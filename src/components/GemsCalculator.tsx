"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { weightedTotal } from "@/rok/calc";
import denominations from "@/rok/data/denominations.json";
import { intlNumberLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { CalculatorShell, NumberField, Panel } from "@/components/ui";
import styles from "./GemsCalculator.module.css";

type Props = {
  dict: Dictionary;
  locale: Locale;
  onTotalChange?: (formatted: string, selectedCount: number) => void;
};

const PACKAGES = denominations.gems.filter((pkg) => pkg > 0);
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

export function GemsCalculator({ dict, locale, onTotalChange }: Props) {
  const gems = dict.gems;
  const numberLocale = intlNumberLocales[locale];

  const [counts, setCounts] = useState<Record<number, number>>(initialCounts);
  const [totalGems, setTotalGems] = useState(0);

  const selectedCount = useMemo(
    () => Object.values(counts).filter((count) => count > 0).length,
    [counts],
  );

  const calculate = useCallback(() => {
    const total = weightedTotal(counts);
    setTotalGems(total);
    onTotalChange?.(formatNumber(total, numberLocale), selectedCount);
  }, [counts, numberLocale, onTotalChange, selectedCount]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const packageLabels = useMemo(
    () =>
      PACKAGES.map((pkg) => ({
        value: pkg,
        label: formatPackageLabel(pkg, gems.labels.gems, numberLocale),
      })),
    [gems.labels.gems, numberLocale],
  );

  function handleChange(pkg: number, raw: string) {
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setCounts((prev) => ({ ...prev, [pkg]: parsed }));
  }

  const formattedTotal = formatNumber(totalGems, numberLocale);

  return (
    <CalculatorShell className={styles.shell}>
      <aside className={styles.resultStrip} aria-live="polite">
        <div className={styles.resultMain}>
          <span className={styles.resultLabel}>{gems.results.totalGems}</span>
          <span key={formattedTotal} className={styles.resultValue}>
            {formattedTotal}
          </span>
        </div>
        <div className={styles.resultMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {gems.results.packagesSelected}
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
                id={`gems-qty-${value}`}
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
