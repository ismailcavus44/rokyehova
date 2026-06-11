import {
  SUPPORT_GOAL_CURRENCY,
  SUPPORT_GOAL_CURRENT,
  SUPPORT_GOAL_TARGET,
  getSupportGoalPercent,
  isSupportGoalReached,
} from "@/config/support";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./SupportGoalBar.module.css";

type GoalStrings = Dictionary["support"]["goal"];

type Props = {
  goal: GoalStrings;
  compact?: boolean;
};

export function SupportGoalBar({ goal, compact = false }: Props) {
  const percent = getSupportGoalPercent();
  const reached = isSupportGoalReached();
  const progressLabel = `${percent}% — ${SUPPORT_GOAL_CURRENCY}${SUPPORT_GOAL_CURRENT} / ${SUPPORT_GOAL_CURRENCY}${SUPPORT_GOAL_TARGET}`;

  if (compact) {
    return (
      <div className={styles.compact} aria-label={progressLabel}>
        <div className={styles.compactTrack}>
          <div
            className={styles.compactFill}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={styles.compactLabel}>{progressLabel}</span>
      </div>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="support-goal-title">
      <h2 id="support-goal-title" className={styles.title}>
        {goal.title}
      </h2>
      <p className={styles.text}>{goal.text}</p>
      <div className={styles.progressWrap}>
        <p className={styles.progressLabel}>{progressLabel}</p>
        <div
          className={styles.track}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel}
        >
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
      </div>
      {reached ? <p className={styles.reached}>{goal.reached}</p> : null}
    </section>
  );
}
