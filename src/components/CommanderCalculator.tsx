"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { commanderExpNeeded } from "@/rok/calc";

import commander from "@/rok/data/commander.json";

import { intlNumberLocales, type Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import {

  CalculatorShell,

  NumberField,

  Panel,

  SelectField,

} from "@/components/ui";

import styles from "./CommanderCalculator.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

  onExpChange?: (formatted: string, invalid: boolean) => void;

};



type Rarity = "legendary" | "epic" | "elite" | "advanced";



const RARITIES: Rarity[] = ["legendary", "epic", "elite", "advanced"];



const MAX_LEVEL: Record<Rarity, number> = {

  legendary: 60,

  epic: 60,

  elite: 60,

  advanced: 50,

};






function formatNumber(num: number, locale: string): string {

  return new Intl.NumberFormat(locale).format(num);

}



function formatLevelLabel(level: number, template: string): string {

  return template.replace("{level}", String(level));

}



export function CommanderCalculator({

  dict,

  locale,

  onExpChange,

}: Props) {

  const commanderDict = dict.commander;

  const numberLocale = intlNumberLocales[locale];



  const [rarity, setRarity] = useState<Rarity>("legendary");

  const [levelFrom, setLevelFrom] = useState(1);

  const [levelTo, setLevelTo] = useState(2);

  const [currentExpRaw, setCurrentExpRaw] = useState("");

  const [expNeeded, setExpNeeded] = useState(0);

  const [invalidTarget, setInvalidTarget] = useState(false);



  const maxLevel = MAX_LEVEL[rarity];

  const table = commander[rarity];



  const levelFromOptions = useMemo(

    () => Array.from({ length: maxLevel - 1 }, (_, i) => i + 1),

    [maxLevel],

  );



  const levelToOptions = useMemo(

    () =>

      Array.from(

        { length: maxLevel - levelFrom },

        (_, i) => levelFrom + 1 + i,

      ),

    [maxLevel, levelFrom],

  );



  const calculate = useCallback(() => {

    const invalid = levelTo <= levelFrom;

    setInvalidTarget(invalid);



    if (invalid) {

      setExpNeeded(0);

      onExpChange?.("—", true);

      return;

    }



    const currentExp =

      currentExpRaw === "" ? 0 : Number.parseFloat(currentExpRaw) || 0;

    const needed = commanderExpNeeded(table, levelFrom, levelTo, currentExp);

    setExpNeeded(needed);

    onExpChange?.(formatNumber(needed, numberLocale), false);

  }, [

    table,

    levelFrom,

    levelTo,

    currentExpRaw,

    numberLocale,

    onExpChange,

  ]);



  useEffect(() => {

    calculate();

  }, [calculate]);



  function handleRarityChange(next: Rarity) {

    setRarity(next);

    setLevelFrom(1);

    setLevelTo(2);

  }



  function handleLevelFromChange(next: number) {

    setLevelFrom(next);

    if (levelTo <= next) {

      setLevelTo(Math.min(next + 1, MAX_LEVEL[rarity]));

    }

  }



  function handleCurrentExpChange(raw: string) {

    if (raw === "") {

      setCurrentExpRaw("");

      return;

    }

    const parsed = Number.parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setCurrentExpRaw(raw);

  }



  const displayValue = invalidTarget

    ? "—"

    : formatNumber(expNeeded, numberLocale);



  return (

    <CalculatorShell className={styles.shell}>

      <aside className={styles.resultStrip} aria-live="polite">

        <div className={styles.resultMain}>

          <span className={styles.resultLabel}>

            {commanderDict.results.expNeeded}

          </span>

          <span key={displayValue} className={styles.resultValue}>

            {displayValue}

          </span>

        </div>

        {!invalidTarget && (

          <div className={styles.resultMeta}>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {commanderDict.inputs.rarity}

              </span>

              <span className={styles.metaValue}>

                {commanderDict.labels.rarity[rarity]}

              </span>

            </div>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {commanderDict.inputs.levelFrom}

              </span>

              <span className={styles.metaValue}>

                {formatLevelLabel(levelFrom, commanderDict.labels.level)}

              </span>

            </div>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {commanderDict.inputs.levelTo}

              </span>

              <span className={styles.metaValue}>

                {formatLevelLabel(levelTo, commanderDict.labels.level)}

              </span>

            </div>

          </div>

        )}

      </aside>



      <Panel className={styles.inputPanel}>

        <div className={styles.inputsGrid}>

          <div className={styles.fullWidth}>

            <SelectField

              id="commander-rarity"

              label={commanderDict.inputs.rarity}

              value={rarity}

              onChange={(e) => handleRarityChange(e.target.value as Rarity)}

            >

              {RARITIES.map((key) => (

                <option key={key} value={key}>

                  {commanderDict.labels.rarity[key]}

                </option>

              ))}

            </SelectField>

          </div>



          <SelectField

            id="commander-level-from"

            label={commanderDict.inputs.levelFrom}

            value={levelFrom}

            onChange={(e) => handleLevelFromChange(Number(e.target.value))}

          >

            {levelFromOptions.map((level) => (

              <option key={level} value={level}>

                {formatLevelLabel(level, commanderDict.labels.level)}

              </option>

            ))}

          </SelectField>



          <SelectField

            id="commander-level-to"

            label={commanderDict.inputs.levelTo}

            value={levelTo}

            onChange={(e) => setLevelTo(Number(e.target.value))}

          >

            {levelToOptions.map((level) => (

              <option key={level} value={level}>

                {formatLevelLabel(level, commanderDict.labels.level)}

              </option>

            ))}

          </SelectField>



          <div className={styles.fullWidth}>

            <NumberField

              id="commander-current-exp"

              label={commanderDict.inputs.currentExp}

              min={0}

              step={1}

              placeholder="0"

              value={currentExpRaw}

              onChange={(e) => handleCurrentExpChange(e.target.value)}

            />

          </div>

        </div>

      </Panel>



      {invalidTarget && (

        <div className={styles.warning} role="alert">

          {commanderDict.warning}

        </div>

      )}

    </CalculatorShell>

  );

}

