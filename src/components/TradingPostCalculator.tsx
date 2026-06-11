"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  tradingPostDeliverFromSend,
  tradingPostSendToDeliver,
} from "@/rok/calc";
import tradingPost from "@/rok/data/trading_post.json";
import { intlNumberLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import {
  CalculatorShell,
  NumberField,
  Panel,
  SelectField,
} from "@/components/ui";
import styles from "./TradingPostCalculator.module.css";

type Props = {
  dict: Dictionary;
  locale: Locale;
  onSummaryChange?: (summary: {
    primaryLabel: string;
    primaryValue: string;
    send: string;
    tax: string;
    delivered: string;
  }) => void;
};

type Mode = "deliver" | "send";
type ResourceKey = "food" | "wood" | "stone" | "gold";

type ResourceResult = {
  send: number;
  tax: number;
  delivered: number;
};

const RESOURCES: ResourceKey[] = ["food", "wood", "stone", "gold"];
const LEVELS = tradingPost.map((row) => row.level);


function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

function formatLevelLabel(level: number, template: string): string {
  return template.replace("{level}", String(level));
}

function parseAmount(raw: string): number {
  if (raw === "") return 0;
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

function emptyResults(): Record<ResourceKey, ResourceResult> {
  return {
    food: { send: 0, tax: 0, delivered: 0 },
    wood: { send: 0, tax: 0, delivered: 0 },
    stone: { send: 0, tax: 0, delivered: 0 },
    gold: { send: 0, tax: 0, delivered: 0 },
  };
}

function sumResults(results: Record<ResourceKey, ResourceResult>) {
  return RESOURCES.reduce(
    (acc, resource) => ({
      send: acc.send + results[resource].send,
      tax: acc.tax + results[resource].tax,
      delivered: acc.delivered + results[resource].delivered,
    }),
    { send: 0, tax: 0, delivered: 0 },
  );
}

export function TradingPostCalculator({
  dict,
  locale,
  onSummaryChange,
}: Props) {
  const tp = dict.tradingPost;
  const numberLocale = intlNumberLocales[locale];

  const [mode, setMode] = useState<Mode>("deliver");
  const [level, setLevel] = useState(1);
  const [amounts, setAmounts] = useState<Record<ResourceKey, string>>({
    food: "",
    wood: "",
    stone: "",
    gold: "",
  });
  const [results, setResults] = useState<Record<ResourceKey, ResourceResult>>(
    emptyResults,
  );

  const taxRate = useMemo(
    () => tradingPost.find((row) => row.level === level)?.taxRate ?? 0,
    [level],
  );

  const taxRateLabel = useMemo(
    () =>
      tp.labels.taxRate.replace(
        "{rate}",
        new Intl.NumberFormat(numberLocale, {
          style: "percent",
          maximumFractionDigits: 0,
        }).format(taxRate),
      ),
    [taxRate, tp.labels.taxRate, numberLocale],
  );

  const calculate = useCallback(() => {
    const next = emptyResults();

    for (const resource of RESOURCES) {
      const value = parseAmount(amounts[resource]);
      if (value <= 0) continue;

      next[resource] =
        mode === "deliver"
          ? tradingPostSendToDeliver(value, taxRate)
          : tradingPostDeliverFromSend(value, taxRate);
    }

    setResults(next);

    const totals = sumResults(next);
    const primaryLabel =
      mode === "deliver" ? tp.results.send : tp.results.delivered;
    const primaryValue =
      mode === "deliver" ? totals.send : totals.delivered;

    onSummaryChange?.({
      primaryLabel,
      primaryValue: formatNumber(primaryValue, numberLocale),
      send: formatNumber(totals.send, numberLocale),
      tax: formatNumber(totals.tax, numberLocale),
      delivered: formatNumber(totals.delivered, numberLocale),
    });
  }, [amounts, mode, taxRate, tp.results, numberLocale, onSummaryChange]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  function handleAmountChange(resource: ResourceKey, raw: string) {
    if (raw === "") {
      setAmounts((prev) => ({ ...prev, [resource]: "" }));
      return;
    }
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setAmounts((prev) => ({ ...prev, [resource]: raw }));
  }

  const inputHint =
    mode === "deliver" ? tp.modes.deliverHint : tp.modes.sendHint;

  const totals = useMemo(() => sumResults(results), [results]);
  const stripPrimary =
    mode === "deliver" ? totals.send : totals.delivered;
  const stripPrimaryLabel =
    mode === "deliver" ? tp.results.send : tp.results.delivered;

  return (
    <CalculatorShell className={styles.shell}>
      <aside className={styles.resultStrip} aria-live="polite">
        <div className={styles.resultMain}>
          <span className={styles.resultLabel}>{stripPrimaryLabel}</span>
          <span
            key={`${mode}-${stripPrimary}`}
            className={styles.resultValue}
          >
            {formatNumber(stripPrimary, numberLocale)}
          </span>
        </div>
        <div className={styles.resultMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{tp.results.tax}</span>
            <span className={styles.metaValue}>
              {formatNumber(totals.tax, numberLocale)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{tp.results.delivered}</span>
            <span className={styles.metaValue}>
              {formatNumber(totals.delivered, numberLocale)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{tp.results.send}</span>
            <span className={styles.metaValue}>
              {formatNumber(totals.send, numberLocale)}
            </span>
          </div>
        </div>
      </aside>

      <Panel className={styles.controlPanel}>
        <div
          className={styles.modeTabs}
          role="tablist"
          aria-label={tp.modes.label}
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "deliver"}
            className={mode === "deliver" ? styles.modeActive : styles.modeButton}
            onClick={() => setMode("deliver")}
          >
            {tp.modes.deliver}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "send"}
            className={mode === "send" ? styles.modeActive : styles.modeButton}
            onClick={() => setMode("send")}
          >
            {tp.modes.send}
          </button>
        </div>

        <p className={styles.modeHint}>{inputHint}</p>

        <div className={styles.levelRow}>
          <SelectField
            id="trading-post-level"
            label={tp.inputs.level}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {formatLevelLabel(lvl, tp.labels.level)}
              </option>
            ))}
          </SelectField>
          <p className={styles.taxRate}>{taxRateLabel}</p>
        </div>
      </Panel>

      <Panel className={styles.resourcesPanel}>
        <div className={styles.resourcesGrid}>
          {RESOURCES.map((resource) => (
            <div key={resource} className={styles.resourceBlock}>
              <NumberField
                id={`trading-post-${resource}`}
                label={tp.inputs[resource]}
                min={0}
                step={1}
                placeholder="0"
                value={amounts[resource]}
                onChange={(e) => handleAmountChange(resource, e.target.value)}
              />

              <div className={styles.resourceResults}>
                <div className={styles.resultRow}>
                  <span className={styles.resultRowLabel}>{tp.results.send}</span>
                  <span className={styles.resultRowValue}>
                    {formatNumber(results[resource].send, numberLocale)}
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultRowLabel}>{tp.results.tax}</span>
                  <span className={styles.resultRowValue}>
                    {formatNumber(results[resource].tax, numberLocale)}
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultRowLabel}>
                    {tp.results.delivered}
                  </span>
                  <span className={styles.resultRowValue}>
                    {formatNumber(results[resource].delivered, numberLocale)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </CalculatorShell>
  );
}
