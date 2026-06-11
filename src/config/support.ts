/** Support modal — update USDT address here; QR is generated from this value. */
export const SUPPORT_USDT_ADDRESS =
  "TMDdhqWLqM7SKJMncU71FbQDHnbBULSa3o";

/**
 * Fundraising goal — update goalCurrent manually (e.g. from Binance balance).
 * Percent and progress bar read from these values only.
 */
export const SUPPORT_GOAL_CURRENT = 0;
export const SUPPORT_GOAL_TARGET = 1000;
export const SUPPORT_GOAL_CURRENCY = "$";

export function getSupportGoalPercent(): number {
  if (SUPPORT_GOAL_TARGET <= 0) return 0;
  return Math.min(
    100,
    Math.round((SUPPORT_GOAL_CURRENT / SUPPORT_GOAL_TARGET) * 100),
  );
}

export function isSupportGoalReached(): boolean {
  return SUPPORT_GOAL_CURRENT >= SUPPORT_GOAL_TARGET;
}
