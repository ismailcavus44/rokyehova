"use client";

import { useCallback, useEffect, useState } from "react";
import { vipPointsNeeded } from "@/rok/calc";
import vip from "@/rok/data/vip.json";
import { intlNumberLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { CalculatorShell, NumberField, Panel, SelectField } from "@/components/ui";
import styles from "./VipCalculator.module.css";

type Props = {
  dict: Dictionary;
  locale: Locale;
  onPointsChange?: (formatted: string, invalid: boolean) => void;
};

const LEVEL_FROM_OPTIONS = Array.from({ length: 18 }, (_, i) => i);
const LEVEL_TO_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 1);


function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

function formatLevelLabel(level: number, template: string): string {
  return template.replace("{level}", String(level));
}

export function VipCalculator({ dict, locale, onPointsChange }: Props) {
  const vipDict = dict.vip;
  const numberLocale = intlNumberLocales[locale];

  const [levelFrom, setLevelFrom] = useState(0);
  const [levelTo, setLevelTo] = useState(1);
  const [currentPointsRaw, setCurrentPointsRaw] = useState("");
  const [pointsNeeded, setPointsNeeded] = useState(0);
  const [invalidTarget, setInvalidTarget] = useState(false);

  const calculate = useCallback(() => {
    const invalid = levelTo <= levelFrom;
    setInvalidTarget(invalid);

    if (invalid) {
      setPointsNeeded(0);
      onPointsChange?.("—", true);
      return;
    }

    const currentPoints =
      currentPointsRaw === "" ? 0 : Number.parseFloat(currentPointsRaw) || 0;
    const needed = vipPointsNeeded(vip, levelFrom, levelTo, currentPoints);
    setPointsNeeded(needed);
    onPointsChange?.(formatNumber(needed, numberLocale), false);
  }, [levelFrom, levelTo, currentPointsRaw, numberLocale, onPointsChange]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  function handleCurrentPointsChange(raw: string) {
    if (raw === "") {
      setCurrentPointsRaw("");
      return;
    }
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setCurrentPointsRaw(raw);
  }

  const displayValue = invalidTarget
    ? "—"
    : formatNumber(pointsNeeded, numberLocale);

  return (
    <CalculatorShell className={styles.shell}>
      <aside className={styles.resultStrip} aria-live="polite">
        <div className={styles.resultMain}>
          <span className={styles.resultLabel}>
            {vipDict.results.pointsNeeded}
          </span>
          <span key={displayValue} className={styles.resultValue}>
            {displayValue}
          </span>
        </div>
        {!invalidTarget && (
          <div className={styles.resultMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>{vipDict.inputs.levelFrom}</span>
              <span className={styles.metaValue}>
                {formatLevelLabel(levelFrom, vipDict.labels.level)}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>{vipDict.inputs.levelTo}</span>
              <span className={styles.metaValue}>
                {formatLevelLabel(levelTo, vipDict.labels.level)}
              </span>
            </div>
          </div>
        )}
      </aside>

      <Panel className={styles.inputPanel}>
        <div className={styles.inputsGrid}>
          <SelectField
            id="vip-level-from"
            label={vipDict.inputs.levelFrom}
            value={levelFrom}
            onChange={(e) => setLevelFrom(Number(e.target.value))}
          >
            {LEVEL_FROM_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {formatLevelLabel(level, vipDict.labels.level)}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="vip-level-to"
            label={vipDict.inputs.levelTo}
            value={levelTo}
            onChange={(e) => setLevelTo(Number(e.target.value))}
          >
            {LEVEL_TO_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {formatLevelLabel(level, vipDict.labels.level)}
              </option>
            ))}
          </SelectField>

          <div className={styles.fullWidth}>
            <NumberField
              id="vip-current-points"
              label={vipDict.inputs.currentPoints}
              min={0}
              step={1}
              placeholder="0"
              value={currentPointsRaw}
              onChange={(e) => handleCurrentPointsChange(e.target.value)}
            />
          </div>
        </div>
      </Panel>

      {invalidTarget && (
        <div className={styles.warning} role="alert">
          {vipDict.warning}
        </div>
      )}
    </CalculatorShell>
  );
}
