import type { ReactNode, SelectHTMLAttributes } from "react";
import styles from "./Field.module.css";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  label: string;
  id: string;
  children: ReactNode;
};

export function SelectField({ label, id, children, ...selectProps }: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.controlWrap}>
        <select {...selectProps} id={id} className={styles.select}>
          {children}
        </select>
      </div>
    </div>
  );
}
