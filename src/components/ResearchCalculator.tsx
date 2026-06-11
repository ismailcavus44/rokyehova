"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { buildingResearchCost, secondsToDHMS } from "@/rok/calc";

import type researchSchema from "@/rok/data/research.json";

import { intlNumberLocales, type Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import {

  CalculatorLoading,

  CalculatorShell,

  NumberField,

  Panel,

  SelectField,

} from "@/components/ui";

import styles from "./ResearchCalculator.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

  onSummaryChange?: (summary: { duration: string }) => void;

};



type CategoryKey = "military" | "economic";

type ResearchData = typeof researchSchema;

type ResearchItem = ResearchData["military"][number];

type LoadedProps = Props & { research: ResearchData };



const CATEGORIES: CategoryKey[] = ["military", "economic"];






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

  results: Dictionary["research"]["results"],

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



function getMaxLevel(item: ResearchItem): number {

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



function ResearchCalculatorLoaded({

  research,

  dict,

  locale,

  onSummaryChange,

}: LoadedProps) {

  const researchDict = dict.research;

  const numberLocale = intlNumberLocales[locale];



  const [category, setCategory] = useState<CategoryKey>("military");

  const [selectedId, setSelectedId] = useState(

    research.military[0]?.id ?? 1,

  );

  const [levelFrom, setLevelFrom] = useState(0);

  const [levelTo, setLevelTo] = useState(1);

  const [speedBonusRaw, setSpeedBonusRaw] = useState("");

  const [allianceHelpsRaw, setAllianceHelpsRaw] = useState("");

  const [result, setResult] = useState(emptyResult);

  const [invalidTarget, setInvalidTarget] = useState(false);



  const categoryList = useMemo(() => research[category], [research, category]);



  const selectedItem = useMemo(

    () =>

      categoryList.find((item) => item.id === selectedId) ?? categoryList[0],

    [categoryList, selectedId],

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

        researchDict.results,

        numberLocale,

      ),

    });

  }, [

    selectedItem,

    levelFrom,

    levelTo,

    speedBonusRaw,

    allianceHelpsRaw,

    researchDict.results,

    numberLocale,

    onSummaryChange,

  ]);



  useEffect(() => {

    calculate();

  }, [calculate]);



  function handleCategoryChange(next: CategoryKey) {

    const list = research[next];

    setCategory(next);

    setSelectedId(list[0]?.id ?? 1);

    setLevelFrom(0);

    setLevelTo(1);

  }



  function handleResearchChange(id: number) {

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

    { key: "foodCost", label: researchDict.results.foodCost },

    { key: "woodCost", label: researchDict.results.woodCost },

    { key: "stoneCost", label: researchDict.results.stoneCost },

    { key: "goldCost", label: researchDict.results.goldCost },

    { key: "powerReward", label: researchDict.results.powerReward },

    { key: "mgePointsReward", label: researchDict.results.mgePointsReward },

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

        researchDict.results,

        numberLocale,

      );



  return (

    <CalculatorShell className={styles.shell}>

      <aside className={styles.resultStrip} aria-live="polite">

        <div className={styles.resultMain}>

          <span className={styles.resultLabel}>

            {researchDict.results.totalDuration}

          </span>

          <span key={formattedDuration} className={styles.resultValue}>

            {formattedDuration}

          </span>

        </div>

        {!invalidTarget && (

          <div className={styles.resultMeta}>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {researchDict.results.powerReward}

              </span>

              <span className={styles.metaValue}>

                {formatNumber(result.powerReward, numberLocale)}

              </span>

            </div>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {researchDict.results.mgePointsReward}

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

          <SelectField

            id="research-category"

            label={researchDict.inputs.category}

            value={category}

            onChange={(e) =>

              handleCategoryChange(e.target.value as CategoryKey)

            }

          >

            {CATEGORIES.map((key) => (

              <option key={key} value={key}>

                {researchDict.labels.category[key]}

              </option>

            ))}

          </SelectField>



          <div className={styles.fullWidth}>

            <SelectField

              id="research-select"

              label={researchDict.inputs.research}

              value={selectedId}

              onChange={(e) => handleResearchChange(Number(e.target.value))}

            >

              {categoryList.map((item) => (

                <option key={item.id} value={item.id}>

                  {item.name}

                </option>

              ))}

            </SelectField>

          </div>



          <SelectField

            id="research-level-from"

            label={researchDict.inputs.levelFrom}

            value={levelFrom}

            onChange={(e) => handleLevelFromChange(Number(e.target.value))}

          >

            {levelFromOptions.map((level) => (

              <option key={level} value={level}>

                {formatLevelLabel(level, researchDict.labels.level)}

              </option>

            ))}

          </SelectField>



          <SelectField

            id="research-level-to"

            label={researchDict.inputs.levelTo}

            value={levelTo}

            onChange={(e) => setLevelTo(Number(e.target.value))}

          >

            {levelToOptions.map((level) => (

              <option key={level} value={level}>

                {formatLevelLabel(level, researchDict.labels.level)}

              </option>

            ))}

          </SelectField>



          <NumberField

            id="research-speed-bonus"

            label={researchDict.inputs.speedBonus}

            min={0}

            step={1}

            placeholder="0"

            value={speedBonusRaw}

            onChange={(e) =>

              handleOptionalNumber(e.target.value, setSpeedBonusRaw)

            }

          />



          <NumberField

            id="research-alliance-helps"

            label={researchDict.inputs.allianceHelps}

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

          {researchDict.warning}

        </div>

      )}

    </CalculatorShell>

  );

}



export function ResearchCalculator(props: Props) {

  const [research, setResearch] = useState<ResearchData | null>(null);



  useEffect(() => {

    let active = true;

    import("@/rok/data/research.json").then((mod) => {

      if (active) setResearch(mod.default as ResearchData);

    });

    return () => {

      active = false;

    };

  }, []);



  if (!research) {

    return <CalculatorLoading className={styles.shell} />;

  }



  return <ResearchCalculatorLoaded research={research} {...props} />;

}

