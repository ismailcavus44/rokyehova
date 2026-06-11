export const CALCULATOR_SLUGS = [
  "ap",
  "speedup",
  "gems",
  "tomes",
  "vip",
  "commander",
  "trading-post",
  "resources",
  "healing",
  "training",
  "building",
  "research",
  "equipment",
  "aoo-planner",
] as const;

export type CalculatorSlug = (typeof CALCULATOR_SLUGS)[number];
