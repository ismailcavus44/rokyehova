"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import {

  equipmentCost,

  secondsToDHMS,

  type EquipmentPiece,

  type MatV,

} from "@/rok/calc";

import type equipmentSchema from "@/rok/data/equipment.json";

import { intlNumberLocales, type Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/get-dictionary";

import {

  CalculatorLoading,

  CalculatorShell,

  NumberField,

  Panel,

  SelectField,

} from "@/components/ui";

import styles from "./EquipmentCalculator.module.css";



type Props = {

  dict: Dictionary;

  locale: Locale;

  onSummaryChange?: (summary: { duration: string }) => void;

};



const SLOTS = [

  "weapon",

  "helmet",

  "chest",

  "gloves",

  "legs",

  "boots",

  "accessories",

] as const;



type EquipmentData = typeof equipmentSchema;

type SlotKey = (typeof SLOTS)[number];

type LoadedProps = Props & { equipment: EquipmentData };

type MaterialKey = "leather" | "ironOne" | "animalBone" | "ebony";

type MatBucket = keyof MatV;



const MATERIAL_KEYS: MaterialKey[] = [

  "leather",

  "ironOne",

  "animalBone",

  "ebony",

];

const MAT_BUCKETS: MatBucket[] = ["C", "UC", "R", "E", "M"];






type OwnedState = Record<MaterialKey, Record<MatBucket, string>>;

type SelectionState = Record<SlotKey, number | null>;



const emptyResult = {

  totalLeather: 0,

  totalIronOne: 0,

  totalAnimalBone: 0,

  totalEbony: 0,

  gold: 0,

  days: 0,

  hours: 0,

  minutes: 0,

};



function createEmptyOwned(): OwnedState {

  return Object.fromEntries(

    MATERIAL_KEYS.map((material) => [

      material,

      Object.fromEntries(MAT_BUCKETS.map((bucket) => [bucket, ""])) as Record<

        MatBucket,

        string

      >,

    ]),

  ) as OwnedState;

}



function createEmptySelections(): SelectionState {

  return Object.fromEntries(SLOTS.map((slot) => [slot, null])) as SelectionState;

}



function formatNumber(num: number, locale: string): string {

  return new Intl.NumberFormat(locale).format(num);

}



function formatDuration(

  days: number,

  hours: number,

  minutes: number,

  results: Dictionary["equipment"]["results"],

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



function parseMatV(values: Record<MatBucket, string>): MatV {

  const parse = (raw: string) =>

    raw === "" ? 0 : Number.parseFloat(raw) || 0;

  return {

    C: parse(values.C),

    UC: parse(values.UC),

    R: parse(values.R),

    E: parse(values.E),

    M: parse(values.M),

  };

}



function EquipmentCalculatorLoaded({

  equipment,

  dict,

  locale,

  onSummaryChange,

}: LoadedProps) {

  const equipmentDict = dict.equipment;

  const numberLocale = intlNumberLocales[locale];



  const [selections, setSelections] = useState<SelectionState>(

    createEmptySelections,

  );

  const [owned, setOwned] = useState<OwnedState>(createEmptyOwned);

  const [speedBonusRaw, setSpeedBonusRaw] = useState("");

  const [result, setResult] = useState(emptyResult);

  const [hasSelection, setHasSelection] = useState(false);



  const pieces = useMemo(() => {

    const selected: EquipmentPiece[] = [];

    for (const slot of SLOTS) {

      const index = selections[slot];

      if (index === null) continue;

      const piece = equipment[slot][index];

      if (piece) selected.push(piece as EquipmentPiece);

    }

    return selected;

  }, [equipment, selections]);



  const selectedCount = pieces.length;



  const calculate = useCallback(() => {

    const selected = pieces.length > 0;

    setHasSelection(selected);



    if (!selected) {

      setResult(emptyResult);

      onSummaryChange?.({ duration: "—" });

      return;

    }



    const speedBonus =

      speedBonusRaw === "" ? 0 : Number.parseFloat(speedBonusRaw) || 0;



    const r = equipmentCost({

      pieces,

      owned: {

        leather: parseMatV(owned.leather),

        ironOne: parseMatV(owned.ironOne),

        animalBone: parseMatV(owned.animalBone),

        ebony: parseMatV(owned.ebony),

      },

      speedBonus,

    });

    const dhms = secondsToDHMS(r.time);



    setResult({

      totalLeather: r.totalLeather,

      totalIronOne: r.totalIronOne,

      totalAnimalBone: r.totalAnimalBone,

      totalEbony: r.totalEbony,

      gold: r.gold,

      days: dhms.days,

      hours: dhms.hours,

      minutes: dhms.minutes,

    });



    onSummaryChange?.({

      duration: formatDuration(

        dhms.days,

        dhms.hours,

        dhms.minutes,

        equipmentDict.results,

        numberLocale,

      ),

    });

  }, [pieces, owned, speedBonusRaw, equipmentDict.results, numberLocale, onSummaryChange]);



  useEffect(() => {

    calculate();

  }, [calculate]);



  function handleSlotChange(slot: SlotKey, raw: string) {

    setSelections((prev) => ({

      ...prev,

      [slot]: raw === "" ? null : Number.parseInt(raw, 10),

    }));

  }



  function handleOptionalNumber(

    raw: string,

    setter: (value: string) => void,

  ) {

    if (raw === "") {

      setter("");

      return;

    }

    const parsed = Number.parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setter(raw);

  }



  function handleOwnedChange(

    material: MaterialKey,

    bucket: MatBucket,

    raw: string,

  ) {

    if (raw === "") {

      setOwned((prev) => ({

        ...prev,

        [material]: { ...prev[material], [bucket]: "" },

      }));

      return;

    }

    const parsed = Number.parseFloat(raw);

    if (Number.isNaN(parsed) || parsed < 0) return;

    setOwned((prev) => ({

      ...prev,

      [material]: { ...prev[material], [bucket]: raw },

    }));

  }



  type ResultKey = keyof typeof emptyResult;



  const materialItems: { key: ResultKey; label: string }[] = [

    { key: "totalLeather", label: equipmentDict.results.totalLeather },

    { key: "totalIronOne", label: equipmentDict.results.totalIronOne },

    { key: "totalAnimalBone", label: equipmentDict.results.totalAnimalBone },

    { key: "totalEbony", label: equipmentDict.results.totalEbony },

    { key: "gold", label: equipmentDict.results.gold },

  ];



  const visibleMaterials = hasSelection

    ? materialItems.filter(({ key }) => result[key] > 0)

    : [];



  const formattedDuration = !hasSelection

    ? "—"

    : formatDuration(

        result.days,

        result.hours,

        result.minutes,

        equipmentDict.results,

        numberLocale,

      );



  return (

    <CalculatorShell className={styles.shell}>

      <aside className={styles.resultStrip} aria-live="polite">

        <div className={styles.resultMain}>

          <span className={styles.resultLabel}>

            {equipmentDict.results.totalDuration}

          </span>

          <span key={formattedDuration} className={styles.resultValue}>

            {formattedDuration}

          </span>

        </div>

        {hasSelection && (

          <div className={styles.resultMeta}>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {equipmentDict.results.gold}

              </span>

              <span className={styles.metaValue}>

                {formatNumber(result.gold, numberLocale)}

              </span>

            </div>

            <div className={styles.metaItem}>

              <span className={styles.metaLabel}>

                {equipmentDict.results.piecesSelected}

              </span>

              <span className={styles.metaValue}>

                {formatNumber(selectedCount, numberLocale)}

              </span>

            </div>

          </div>

        )}

      </aside>



      {visibleMaterials.length > 0 && (

        <Panel className={styles.detailsPanel}>

          <p className={styles.detailsHeading}>

            {equipmentDict.results.summary}

          </p>

          <div className={styles.detailsGrid}>

            {visibleMaterials.map(({ key, label }) => (

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



      <Panel className={styles.slotsPanel}>

        <div className={styles.slotsGrid}>

          {SLOTS.map((slot) => (

            <SelectField

              key={slot}

              id={`equipment-${slot}`}

              label={equipmentDict.inputs[slot]}

              value={selections[slot] ?? ""}

              onChange={(e) => handleSlotChange(slot, e.target.value)}

            >

              <option value="">{equipmentDict.inputs.none}</option>

              {equipment[slot].map((piece, index) => (

                <option key={`${slot}-${index}`} value={index}>

                  {piece.name}

                </option>

              ))}

            </SelectField>

          ))}

        </div>



        <NumberField

          id="equipment-speed-bonus"

          label={equipmentDict.inputs.speedBonus}

          min={0}

          step={1}

          placeholder="0"

          value={speedBonusRaw}

          onChange={(e) =>

            handleOptionalNumber(e.target.value, setSpeedBonusRaw)

          }

        />

      </Panel>



      <Panel className={styles.advancedPanel}>

        <details className={styles.advanced}>

          <summary className={styles.advancedSummary}>

            {equipmentDict.advanced.title}

          </summary>

          <div className={styles.advancedContent}>

            {MATERIAL_KEYS.map((material) => (

              <section key={material} className={styles.materialBlock}>

                <h3 className={styles.materialTitle}>

                  {equipmentDict.advanced[material]}

                </h3>

                <div className={styles.rarityGrid}>

                  {MAT_BUCKETS.map((bucket) => (

                    <NumberField
                      compact
                      key={bucket}
                      id={`owned-${material}-${bucket}`}
                      label={equipmentDict.labels.rarity[bucket]}
                      min={0}
                      step={1}
                      placeholder="0"
                      value={owned[material][bucket]}
                      onChange={(e) =>
                        handleOwnedChange(material, bucket, e.target.value)
                      }
                    />

                  ))}

                </div>

              </section>

            ))}

          </div>

        </details>

      </Panel>

    </CalculatorShell>

  );

}



export function EquipmentCalculator(props: Props) {

  const [equipment, setEquipment] = useState<EquipmentData | null>(null);



  useEffect(() => {

    let active = true;

    import("@/rok/data/equipment.json").then((mod) => {

      if (active) setEquipment(mod.default as EquipmentData);

    });

    return () => {

      active = false;

    };

  }, []);



  if (!equipment) {

    return <CalculatorLoading className={styles.shell} />;

  }



  return <EquipmentCalculatorLoaded equipment={equipment} {...props} />;

}

