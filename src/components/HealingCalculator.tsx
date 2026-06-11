"use client";



import { useCallback, useEffect, useState } from "react";

import {

  HEAL_UNITS_BY_TIER,

  healingTier,

  secondsToDHMS,

  type WoundedTier,

} from "@/rok/calc";

import { intlNumberLocales, type Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import { CalculatorShell, NumberField, Panel } from "@/components/ui";

import styles from "./HealingCalculator.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

  onSummaryChange?: (summary: {

    duration: string;

    food: string;

    wood: string;

    stone: string;

    gold: string;

  }) => void;

};



type TroopKey = keyof WoundedTier;

type TierIndex = 1 | 2 | 3 | 4 | 5;



const TIERS: TierIndex[] = [1, 2, 3, 4, 5];

const TROOPS: TroopKey[] = ["infantry", "archer", "cavalry", "siege"];






type WoundedByTier = Record<TierIndex, WoundedTier>;



function emptyWounded(): WoundedTier {

  return { infantry: 0, archer: 0, cavalry: 0, siege: 0 };

}



function initialWounded(): WoundedByTier {

  return {

    1: emptyWounded(),

    2: emptyWounded(),

    3: emptyWounded(),

    4: emptyWounded(),

    5: emptyWounded(),

  };

}



function formatNumber(num: number, locale: string): string {

  return new Intl.NumberFormat(locale).format(num);

}



function formatTierLabel(tier: number, template: string): string {

  return template.replace("{tier}", String(tier));

}



function formatDuration(

  days: number,

  hours: number,

  minutes: number,

  seconds: number,

  results: Dictionary["healing"]["results"],

  locale: string,

): string {

  const parts: string[] = [];

  if (days > 0) {

    parts.push(`${formatNumber(days, locale)} ${results.days}`);

  }

  if (hours > 0) {

    parts.push(`${formatNumber(hours, locale)} ${results.hours}`);

  }

  if (minutes > 0) {

    parts.push(`${formatNumber(minutes, locale)} ${results.minutes}`);

  }

  if (seconds > 0 || parts.length === 0) {

    parts.push(`${formatNumber(seconds, locale)} ${results.seconds}`);

  }

  return parts.join(" · ");

}



export function HealingCalculator({

  dict,

  locale,

  onSummaryChange,

}: Props) {

  const healing = dict.healing;

  const numberLocale = intlNumberLocales[locale];



  const [wounded, setWounded] = useState<WoundedByTier>(initialWounded);

  const [rssReduction, setRssReduction] = useState(0);

  const [speedBonus, setSpeedBonus] = useState(0);

  const [allianceHelps, setAllianceHelps] = useState(0);



  const [totals, setTotals] = useState({

    food: 0,

    wood: 0,

    stone: 0,

    gold: 0,

    days: 0,

    hours: 0,

    minutes: 0,

    seconds: 0,

  });



  const calculate = useCallback(() => {

    let food = 0;

    let wood = 0;

    let stone = 0;

    let gold = 0;

    let time = 0;



    for (const tier of TIERS) {

      const result = healingTier({

        wounded: wounded[tier],

        unit: HEAL_UNITS_BY_TIER[tier - 1],

        rssReductionPct: rssReduction,

        healingSpeedBonus: speedBonus,

        allianceHelps,

      });

      food += result.food;

      wood += result.wood;

      stone += result.stone;

      gold += result.gold;

      time += result.time;

    }



    const dhms = secondsToDHMS(time);

    setTotals({

      food,

      wood,

      stone,

      gold,

      days: dhms.days,

      hours: dhms.hours,

      minutes: dhms.minutes,

      seconds: dhms.seconds,

    });



    onSummaryChange?.({

      duration: formatDuration(

        dhms.days,

        dhms.hours,

        dhms.minutes,

        dhms.seconds,

        healing.results,

        numberLocale,

      ),

      food: formatNumber(food, numberLocale),

      wood: formatNumber(wood, numberLocale),

      stone: formatNumber(stone, numberLocale),

      gold: formatNumber(gold, numberLocale),

    });

  }, [

    wounded,

    rssReduction,

    speedBonus,

    allianceHelps,

    healing.results,

    numberLocale,

    onSummaryChange,

  ]);



  useEffect(() => {

    calculate();

  }, [calculate]);



  function handleWoundedChange(

    tier: TierIndex,

    troop: TroopKey,

    raw: string,

  ) {

    const parsed = parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setWounded((prev) => ({

      ...prev,

      [tier]: { ...prev[tier], [troop]: parsed },

    }));

  }



  function handleBonusChange(

    setter: (v: number) => void,

    raw: string,

  ) {

    const parsed = parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setter(parsed);

  }



  const formatted = {

    duration: formatDuration(

      totals.days,

      totals.hours,

      totals.minutes,

      totals.seconds,

      healing.results,

      numberLocale,

    ),

    food: formatNumber(totals.food, numberLocale),

    wood: formatNumber(totals.wood, numberLocale),

    stone: formatNumber(totals.stone, numberLocale),

    gold: formatNumber(totals.gold, numberLocale),

  };



  return (

    <CalculatorShell className={styles.shell}>

      <aside className={styles.resultStrip} aria-live="polite">

        <div className={styles.resultMain}>

          <span className={styles.resultLabel}>

            {healing.results.totalDuration}

          </span>

          <span key={formatted.duration} className={styles.resultValue}>

            {formatted.duration}

          </span>

        </div>

        <div className={styles.resultMeta}>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {healing.results.totalFood}

            </span>

            <span className={styles.metaValue}>{formatted.food}</span>

          </div>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {healing.results.totalWood}

            </span>

            <span className={styles.metaValue}>{formatted.wood}</span>

          </div>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {healing.results.totalStone}

            </span>

            <span className={styles.metaValue}>{formatted.stone}</span>

          </div>

          <div className={styles.metaItem}>

            <span className={styles.metaLabel}>

              {healing.results.totalGold}

            </span>

            <span className={styles.metaValue}>{formatted.gold}</span>

          </div>

        </div>

      </aside>



      <Panel className={styles.settingsPanel}>

        <div className={styles.settingsGrid}>

          <NumberField

            id="healing-rss-reduction"

            label={healing.inputs.healingRssReduction}

            min={0}

            max={100}

            step={1}

            value={rssReduction}

            onChange={(e) =>

              handleBonusChange(setRssReduction, e.target.value)

            }

          />

          <NumberField

            id="healing-speed-bonus"

            label={healing.inputs.healingSpeedBonus}

            min={0}

            step={1}

            value={speedBonus}

            onChange={(e) => handleBonusChange(setSpeedBonus, e.target.value)}

          />

          <NumberField

            id="healing-alliance-helps"

            label={healing.inputs.allianceHelps}

            min={0}

            step={1}

            value={allianceHelps}

            onChange={(e) =>

              handleBonusChange(setAllianceHelps, e.target.value)

            }

          />

        </div>

      </Panel>



      <Panel className={styles.tiersPanel}>

        <div className={styles.tiersGrid}>

          {TIERS.map((tier) => (

            <section key={tier} className={styles.tierBlock}>

              <h2 className={styles.tierTitle}>

                {formatTierLabel(tier, healing.labels.tier)}

              </h2>

              <div className={styles.tierInputs}>

                {TROOPS.map((troop) => (

                  <NumberField
                    compact
                    key={troop}
                    id={`healing-t${tier}-${troop}`}
                    label={healing.inputs[troop]}
                    min={0}
                    step={1}
                    value={wounded[tier][troop]}
                    onChange={(e) =>
                      handleWoundedChange(tier, troop, e.target.value)
                    }
                  />

                ))}

              </div>

            </section>

          ))}

        </div>

      </Panel>

    </CalculatorShell>

  );

}

