"use client";

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  useCallback,
} from "react";
import styles from "./Field.module.css";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "type" | "inputMode"
> & {
  label: string;
  unit?: string;
  id: string;
  /** Dense layout for grids with many inputs (healing troops, package cells). */
  compact?: boolean;
};

function parseBound(
  value: string | number | readonly string[] | undefined,
  fallback: number,
): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function emitChange(
  onChange: Props["onChange"],
  next: string,
): void {
  onChange?.({ target: { value: next } } as ChangeEvent<HTMLInputElement>);
}

export function NumberField({
  label,
  unit,
  id,
  compact = false,
  min = 0,
  max,
  value,
  onChange,
  disabled,
  ...inputProps
}: Props) {
  const minVal = parseBound(min, 0);
  const maxVal = max !== undefined ? parseBound(max, Infinity) : Infinity;

  const adjust = useCallback(
    (delta: number) => {
      if (disabled) return;
      const current =
        value === "" || value === undefined ? 0 : Number(value);
      const base = Number.isFinite(current) ? current : 0;
      const next = Math.max(minVal, Math.min(maxVal, base + delta));
      emitChange(onChange, String(next));
    },
    [disabled, onChange, value, minVal, maxVal],
  );

  const fieldClass = [styles.field, compact ? styles.fieldCompact : ""]
    .filter(Boolean)
    .join(" ");

  const inputWrapClass = [
    styles.inputWrap,
    unit ? styles.inputWrapWithUnit : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClass}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepBtn}
          aria-label={`${label} −`}
          disabled={disabled}
          onClick={() => adjust(-1)}
        >
          −
        </button>
        <div className={inputWrapClass}>
          <input
            {...inputProps}
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={styles.input}
          />
          {unit ? (
            <span className={styles.unit} aria-hidden>
              {unit}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className={styles.stepBtn}
          aria-label={`${label} +`}
          disabled={disabled}
          onClick={() => adjust(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
