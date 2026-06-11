"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import {

  secondsToDHMS,

  speedupInputToSeconds,

  training,

  type TroopCost,

  type TroopType,

} from "@/rok/calc";

import troops from "@/rok/data/troop_training.json";

import { intlNumberLocales, type Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import {

  CalculatorShell,

  NumberField,

  Panel,

  SelectField,

} from "@/components/ui";

import styles from "./TrainingCalculator.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

  onSummaryChange?: (summary: { troops: string }) => void;

};



type TierData = {

  infantry: { food: number; wood: number; stone: number; gold: number };

  archer: { food: number; wood: number; stone: number; gold: number };

  cavalry: { food: number; wood: number; stone: number; gold: number };

  siege: { food: number; wood: number; stone: number; gold: number };

  _common: {

    time: number;

    kvk: number;

    power: number;

    mgePoints: number;

  };

};



type HaveKey = "food" | "wood" | "stone" | "gold";



const TROOP_TYPES: TroopType[] = ["infantry", "cavalry", "archer", "siege"];

const TIERS = Object.keys(troops).sort((a, b) => Number(a) - Number(b));

const HAVE_KEYS: HaveKey[] = ["food", "wood", "stone", "gold"];






function formatNumber(num: number, locale: string): string {

  return new Intl.NumberFormat(locale).format(num);

}



function formatTierLabel(tier: string, template: string): string {

  return template.replace("{tier}", tier);

}



function buildTroopCost(tier: string, troopType: TroopType): TroopCost {

  const tierData = troops[tier as keyof typeof troops] as TierData;

  const resources = tierData[troopType];

  const common = tierData._common;

  return {

    ...resources,

    time: common.time,

    power: common.power,

    mgePoints: common.mgePoints,

    kvk: common.kvk,

  };

}



export function TrainingCalculator({

  dict,

  locale,

  onSummaryChange,

}: Props) {

  const trainingDict = dict.training;

  const numberLocale = intlNumberLocales[locale];



  const [tier, setTier] = useState(TIERS[0] ?? "1");

  const [troopType, setTroopType] = useState<TroopType>("infantry");

  const [have, setHave] = useState({

    food: 0,

    wood: 0,

    stone: 0,

    gold: 0,

  });

  const [speedupDays, setSpeedupDays] = useState(0);

  const [speedupHours, setSpeedupHours] = useState(0);

  const [speedupMinutes, setSpeedupMinutes] = useState(0);

  const [trainingSpeedBonus, setTrainingSpeedBonus] = useState(0);



  const [result, setResult] = useState({

    troops: 0,

    spendFood: 0,

    spendWood: 0,

    spendStone: 0,

    spendGold: 0,

    days: 0,

    hours: 0,

    minutes: 0,

    seconds: 0,

    totalPower: 0,

    totalMgePoints: 0,

    totalKvkPoints: 0,

  });



  const cost = useMemo(

    () => buildTroopCost(tier, troopType),

    [tier, troopType],

  );



  const calculate = useCallback(() => {

    const speedupSeconds = speedupInputToSeconds(

      speedupDays,

      speedupHours,

      speedupMinutes,

    );

    const output = training({

      have,

      speedupSeconds,

      trainingSpeedBonus,

      cost,

    });

    const dhms = secondsToDHMS(output.spendTime);



    setResult({

      troops: output.troops,

      spendFood: output.spendFood,

      spendWood: output.spendWood,

      spendStone: output.spendStone,

      spendGold: output.spendGold,

      days: dhms.days,

      hours: dhms.hours,

      minutes: dhms.minutes,

      seconds: dhms.seconds,

      totalPower: output.totalPower,

      totalMgePoints: output.totalMgePoints,

      totalKvkPoints: output.totalKvkPoints,

    });



    onSummaryChange?.({

      troops: formatNumber(output.troops, numberLocale),

    });

  }, [

    have,

    speedupDays,

    speedupHours,

    speedupMinutes,

    trainingSpeedBonus,

    cost,

    numberLocale,

    onSummaryChange,

  ]);



  useEffect(() => {

    calculate();

  }, [calculate]);



  function handleHaveChange(key: HaveKey, raw: string) {

    const parsed = parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setHave((prev) => ({ ...prev, [key]: parsed }));

  }



  function handleNumberChange(

    setter: (v: number) => void,

    raw: string,

  ) {

    const parsed = parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setter(parsed);

  }



  const detailItems: { key: keyof typeof result; label: string }[] = [

    { key: "spendFood", label: trainingDict.results.spendFood },

    { key: "spendWood", label: trainingDict.results.spendWood },

    { key: "spendStone", label: trainingDict.results.spendStone },

    { key: "spendGold", label: trainingDict.results.spendGold },

    { key: "days", label: trainingDict.results.days },

    { key: "hours", label: trainingDict.results.hours },

    { key: "minutes", label: trainingDict.results.minutes },

    { key: "seconds", label: trainingDict.results.seconds },

  ];



  const formatted = {

    troops: formatNumber(result.troops, numberLocale),

    totalPower: formatNumber(result.totalPower, numberLocale),

    totalMgePoints: formatNumber(result.totalMgePoints, numberLocale),

    totalKvkPoints: formatNumber(result.totalKvkPoints, numberLocale),

  };



  return (

    <CalculatorShell className={styles.shell}>

      <aside className={styles.resultStrip} aria-live="polite">

        <div className={styles.resultMain}>

          <span className={styles.resultLabel}>

            {trainingDict.results.troops}

          </span>

          <span key={formatted.troops} className={styles.resultValue}>

            {formatted.troops}

          </span>

        </div>

        <div className={styles.resultMeta}>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {trainingDict.results.totalMgePoints}

            </span>

            <span className={styles.metaValue}>{formatted.totalMgePoints}</span>

          </div>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {trainingDict.results.totalKvkPoints}

            </span>

            <span className={styles.metaValue}>{formatted.totalKvkPoints}</span>

          </div>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {trainingDict.results.totalPower}

            </span>

            <span className={styles.metaValue}>{formatted.totalPower}</span>

          </div>

        </div>

      </aside>



      <Panel className={styles.detailsPanel}>

        <div className={styles.detailsGrid}>

          {detailItems.map(({ key, label }) => (

            <div key={key} className={styles.detailCell}>

              <span className={styles.detailLabel}>{label}</span>

              <span className={styles.detailValue}>

                {formatNumber(result[key], numberLocale)}

              </span>

            </div>

          ))}

        </div>

      </Panel>



      <Panel className={styles.inputPanel}>

        <div className={styles.selectRow}>

          <SelectField

            id="training-tier"

            label={trainingDict.inputs.tier}

            value={tier}

            onChange={(e) => setTier(e.target.value)}

          >

            {TIERS.map((t) => (

              <option key={t} value={t}>

                {formatTierLabel(t, trainingDict.labels.tier)}

              </option>

            ))}

          </SelectField>

          <SelectField

            id="training-troop-type"

            label={trainingDict.inputs.troopType}

            value={troopType}

            onChange={(e) => setTroopType(e.target.value as TroopType)}

          >

            {TROOP_TYPES.map((type) => (

              <option key={type} value={type}>

                {trainingDict.labels[type]}

              </option>

            ))}

          </SelectField>

        </div>



        <div className={styles.resourcesGrid}>

          {HAVE_KEYS.map((key) => (

            <NumberField

              key={key}

              id={`training-${key}`}

              label={trainingDict.inputs[key]}

              min={0}

              step={1}

              value={have[key]}

              onChange={(e) => handleHaveChange(key, e.target.value)}

            />

          ))}

        </div>



        <div className={styles.speedupSection}>

          <span className={styles.speedupHeading}>

            {trainingDict.inputs.speedup}

          </span>

          <div className={styles.speedupGrid}>

            <NumberField

              id="training-speedup-days"

              label={trainingDict.inputs.speedupDays}

              min={0}

              step={1}

              value={speedupDays}

              onChange={(e) =>

                handleNumberChange(setSpeedupDays, e.target.value)

              }

            />

            <NumberField

              id="training-speedup-hours"

              label={trainingDict.inputs.speedupHours}

              min={0}

              step={1}

              value={speedupHours}

              onChange={(e) =>

                handleNumberChange(setSpeedupHours, e.target.value)

              }

            />

            <NumberField

              id="training-speedup-minutes"

              label={trainingDict.inputs.speedupMinutes}

              min={0}

              step={1}

              value={speedupMinutes}

              onChange={(e) =>

                handleNumberChange(setSpeedupMinutes, e.target.value)

              }

            />

          </div>

        </div>



        <NumberField

          id="training-speed-bonus"

          label={trainingDict.inputs.trainingSpeedBonus}

          min={0}

          step={1}

          value={trainingSpeedBonus}

          onChange={(e) =>

            handleNumberChange(setTrainingSpeedBonus, e.target.value)

          }

        />

      </Panel>

    </CalculatorShell>

  );

}

