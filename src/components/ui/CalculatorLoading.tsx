import { CalculatorShell } from "./CalculatorShell";
import styles from "./CalculatorLoading.module.css";

type Props = {
  className?: string;
};

export function CalculatorLoading({ className }: Props) {
  return (
    <CalculatorShell className={className}>
      <div className={styles.wrap} aria-busy="true">
        <div className={styles.spinner} role="status" aria-label="Loading" />
      </div>
    </CalculatorShell>
  );
}
