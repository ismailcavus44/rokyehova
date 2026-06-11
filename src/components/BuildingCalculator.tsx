"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { buildingResearchCost, secondsToDHMS } from "@/rok/calc";

import type buildingSchema from "@/rok/data/building.json";

import { intlNumberLocales, type Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import {

  CalculatorLoading,

  CalculatorShell,

  NumberField,

  Panel,

  SelectField,

} from "@/components/ui";

import styles from "./BuildingCalculator.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

  onSummaryChange?: (summary: { duration: string }) => void;

};



type BuildingData = typeof buildingSchema;

type BuildingItem = BuildingData["items"][number];

type LoadedProps = Props & { building: BuildingData };






function formatNumber(num: number, locale: string): string {

  return new Intl.NumberFormat(locale).format(num);

}



function formatLevelLabel(level: number, template: string): string {

  return template.replace("{level}", String(level));

}



function formatDuration(

  days: number,

  hours: number,

  minutes: number,

  results: Dictionary["building"]["results"],

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



function getMaxLevel(item: BuildingItem): number {

  if (item.maxLevel != null) return item.maxLevel;

  if (item.levels.length === 0) return 1;

  return Math.max(...item.levels.map((l) => l.level));

}



const emptyResult = {

  foodCost: 0,

  woodCost: 0,

  stoneCost: 0,

  goldCost: 0,

  timeCost: 0,

  powerReward: 0,

  mgePointsReward: 0,

  days: 0,

  hours: 0,

  minutes: 0,

};



function BuildingCalculatorLoaded({

  building,

  dict,

  locale,

  onSummaryChange,

}: LoadedProps) {

  const buildingDict = dict.building;

  const numberLocale = intlNumberLocales[locale];



  const [selectedId, setSelectedId] = useState(building.items[0]?.id ?? 1);

  const [levelFrom, setLevelFrom] = useState(0);

  const [levelTo, setLevelTo] = useState(1);

  const [speedBonusRaw, setSpeedBonusRaw] = useState("");

  const [allianceHelpsRaw, setAllianceHelpsRaw] = useState("");

  const [result, setResult] = useState(emptyResult);

  const [invalidTarget, setInvalidTarget] = useState(false);



  const selectedItem = useMemo(

    () => building.items.find((b) => b.id === selectedId) ?? building.items[0],

    [building.items, selectedId],

  );



  const maxLevel = useMemo(

    () => (selectedItem ? getMaxLevel(selectedItem) : 1),

    [selectedItem],

  );



  const levelFromOptions = useMemo(

    () => Array.from({ length: maxLevel }, (_, i) => i),

    [maxLevel],

  );



  const levelToOptions = useMemo(

    () =>

      Array.from(

        { length: Math.max(0, maxLevel - levelFrom) },

        (_, i) => levelFrom + 1 + i,

      ),

    [maxLevel, levelFrom],

  );



  const calculate = useCallback(() => {

    const invalid = levelTo <= levelFrom;

    setInvalidTarget(invalid);



    if (invalid || !selectedItem) {

      setResult(emptyResult);

      onSummaryChange?.({ duration: "—" });

      return;

    }



    const speedBonus =

      speedBonusRaw === "" ? 0 : Number.parseFloat(speedBonusRaw) || 0;

    const allianceHelps =

      allianceHelpsRaw === "" ? 0 : Number.parseFloat(allianceHelpsRaw) || 0;



    const r = buildingResearchCost({

      levels: selectedItem.levels,

      levelFrom,

      levelTo,

      speedBonus,

      allianceHelps,

    });

    const dhms = secondsToDHMS(r.timeCost);



    setResult({

      foodCost: r.foodCost,

      woodCost: r.woodCost,

      stoneCost: r.stoneCost,

      goldCost: r.goldCost,

      timeCost: r.timeCost,

      powerReward: r.powerReward,

      mgePointsReward: r.mgePointsReward,

      days: dhms.days,

      hours: dhms.hours,

      minutes: dhms.minutes,

    });



    onSummaryChange?.({

      duration: formatDuration(

        dhms.days,

        dhms.hours,

        dhms.minutes,

        buildingDict.results,

        numberLocale,

      ),

    });

  }, [

    selectedItem,

    levelFrom,

    levelTo,

    speedBonusRaw,

    allianceHelpsRaw,

    buildingDict.results,

    numberLocale,

    onSummaryChange,

  ]);



  useEffect(() => {

    calculate();

  }, [calculate]);



  function handleBuildingChange(id: number) {

    setSelectedId(id);

    setLevelFrom(0);

    setLevelTo(1);

  }



  function handleLevelFromChange(next: number) {

    setLevelFrom(next);

    if (levelTo <= next) {

      setLevelTo(Math.min(next + 1, maxLevel));

    }

  }



  function handleOptionalNumber(

    raw: string,

    setter: (v: string) => void,

  ) {

    if (raw === "") {

      setter("");

      return;

    }

    const parsed = Number.parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setter(raw);

  }



  type ResultKey = keyof typeof emptyResult;



  const resultItems: { key: ResultKey; label: string }[] = [

    { key: "foodCost", label: buildingDict.results.foodCost },

    { key: "woodCost", label: buildingDict.results.woodCost },

    { key: "stoneCost", label: buildingDict.results.stoneCost },

    { key: "goldCost", label: buildingDict.results.goldCost },

    { key: "powerReward", label: buildingDict.results.powerReward },

    { key: "mgePointsReward", label: buildingDict.results.mgePointsReward },

  ];



  const visibleResults = invalidTarget

    ? []

    : resultItems.filter(({ key }) => result[key] > 0);



  const formattedDuration = invalidTarget

    ? "—"

    : formatDuration(

        result.days,

        result.hours,

        result.minutes,

        buildingDict.results,

        numberLocale,

      );



  return (

    <CalculatorShell className={styles.shell}>

      <aside className={styles.resultStrip} aria-live="polite">

        <div className={styles.resultMain}>

          <span className={styles.resultLabel}>

            {buildingDict.results.totalDuration}

          </span>

          <span key={formattedDuration} className={styles.resultValue}>

            {formattedDuration}

          </span>

        </div>

        {!invalidTarget && (

          <div className={styles.resultMeta}>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {buildingDict.results.powerReward}

              </span>

              <span className={styles.metaValue}>

                {formatNumber(result.powerReward, numberLocale)}

              </span>

            </div>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {buildingDict.results.mgePointsReward}

              </span>

              <span className={styles.metaValue}>

                {formatNumber(result.mgePointsReward, numberLocale)}

              </span>

            </div>

          </div>

        )}

      </aside>



      {!invalidTarget && visibleResults.length > 0 && (

        <Panel className={styles.detailsPanel}>

          <div className={styles.detailsGrid}>

            {visibleResults.map(({ key, label }) => (

              <div key={key} className={styles.detailCell}>

                <span className={styles.detailLabel}>{label}</span>

                <span className={styles.detailValue}>

                  {formatNumber(result[key], numberLocale)}

                </span>

              </div>

            ))}

          </div>

        </Panel>

      )}



      <Panel className={styles.inputPanel}>

        <div className={styles.inputsGrid}>

          <div className={styles.fullWidth}>

            <SelectField

              id="building-select"

              label={buildingDict.inputs.building}

              value={selectedId}

              onChange={(e) => handleBuildingChange(Number(e.target.value))}

            >

              {building.items.map((item) => (

                <option key={item.id} value={item.id}>

                  {item.name}

                </option>

              ))}

            </SelectField>

          </div>



          <SelectField

            id="building-level-from"

            label={buildingDict.inputs.levelFrom}

            value={levelFrom}

            onChange={(e) => handleLevelFromChange(Number(e.target.value))}

          >

            {levelFromOptions.map((level) => (

              <option key={level} value={level}>

                {formatLevelLabel(level, buildingDict.labels.level)}

              </option>

            ))}

          </SelectField>



          <SelectField

            id="building-level-to"

            label={buildingDict.inputs.levelTo}

            value={levelTo}

            onChange={(e) => setLevelTo(Number(e.target.value))}

          >

            {levelToOptions.map((level) => (

              <option key={level} value={level}>

                {formatLevelLabel(level, buildingDict.labels.level)}

              </option>

            ))}

          </SelectField>



          <NumberField

            id="building-speed-bonus"

            label={buildingDict.inputs.speedBonus}

            min={0}

            step={1}

            placeholder="0"

            value={speedBonusRaw}

            onChange={(e) =>

              handleOptionalNumber(e.target.value, setSpeedBonusRaw)

            }

          />



          <NumberField

            id="building-alliance-helps"

            label={buildingDict.inputs.allianceHelps}

            min={0}

            step={1}

            placeholder="0"

            value={allianceHelpsRaw}

            onChange={(e) =>

              handleOptionalNumber(e.target.value, setAllianceHelpsRaw)

            }

          />

        </div>

      </Panel>



      {invalidTarget && (

        <div className={styles.warning} role="alert">

          {buildingDict.warning}

        </div>

      )}

    </CalculatorShell>

  );

}



export function BuildingCalculator(props: Props) {

  const [building, setBuilding] = useState<BuildingData | null>(null);



  useEffect(() => {

    let active = true;

    import("@/rok/data/building.json").then((mod) => {

      if (active) setBuilding(mod.default as BuildingData);

    });

    return () => {

      active = false;

    };

  }, []);



  if (!building) {

    return <CalculatorLoading className={styles.shell} />;

  }



  return <BuildingCalculatorLoaded building={building} {...props} />;

}

