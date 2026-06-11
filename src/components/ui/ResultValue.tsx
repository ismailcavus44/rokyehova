"use client";

import styles from "./ResultValue.module.css";

type Props = {
  label: string;
  value: string | number;
  unit?: string;
};

export function ResultValue({ label, value, unit }: Props) {
  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>
      <div className={styles.valueRow}>
        <span key={String(value)} className={styles.value}>
          {value}
        </span>
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </div>
    </div>
  );
}
