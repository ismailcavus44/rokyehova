import type { CalculatorSlug } from "./calculators";

export type NavCategoryId =
  | "economy"
  | "military"
  | "commander"
  | "infrastructure"
  | "team";

export const NAV_CATEGORIES: {
  id: NavCategoryId;
  slugs: CalculatorSlug[];
}[] = [
  { id: "economy", slugs: ["resources", "speedup", "trading-post", "gems"] },
  { id: "military", slugs: ["training", "healing", "ap"] },
  { id: "commander", slugs: ["commander", "equipment", "tomes"] },
  { id: "infrastructure", slugs: ["building", "research", "vip"] },
  { id: "team", slugs: ["aoo-planner"] },
];
