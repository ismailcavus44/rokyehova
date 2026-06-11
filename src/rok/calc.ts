// lib/rok/calc.ts
// RoK hesaplama motoru — framework bağımsız, saf fonksiyonlar.
// Veri tabloları JSON'lardan gelir (rok-data/*.json).
// UI burayı çağırır; burada hiçbir React/DOM/i18n yoktur.

// ----------------------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------------------
export type Resources = { food: number; wood: number; stone: number; gold: number };
export type TroopType = "infantry" | "cavalry" | "archer" | "siege";

export interface TroopCost extends Resources {
  time: number;       // saniye / asker
  power: number;
  mgePoints: number;
  kvk: number;
}

// ----------------------------------------------------------------------------
// 1) SPEEDUP / GEMS / ACTION POINTS — ağırlıklı toplam
//    counts: { paketDeğeri: adet }  →  toplam (dakika veya birim)
// ----------------------------------------------------------------------------
export function weightedTotal(counts: Record<number, number | null>): number {
  let total = 0;
  for (const key of Object.keys(counts)) {
    const k = Number(key);
    total += k * (counts[k] ?? 0);
  }
  return total;
}
export const speedupTotalMinutes = weightedTotal;
export const gemsTotal = weightedTotal;
export const actionPointsTotal = weightedTotal;

// ----------------------------------------------------------------------------
// 2) TRADING POST — vergi
//    taxRate: trading_post.json'dan seviyeye göre (örn 0.16)
// ----------------------------------------------------------------------------
// "Karşıya `target` ulaşması için ne göndermeliyim?"
export function tradingPostSendToDeliver(target: number, taxRate: number) {
  const send = Math.ceil(target / (1 - taxRate));
  return { send, tax: send - target, delivered: target };
}
// "`amount` gönderirsem karşıya ne ulaşır?"
export function tradingPostDeliverFromSend(amount: number, taxRate: number) {
  const tax = Math.ceil(amount * taxRate);
  return { send: amount, tax, delivered: amount - tax };
}

// ----------------------------------------------------------------------------
// 3) TRAINING (MGE) — kaç asker + harcama
//    cost: o tier/tipin birim maliyeti (troop_training.json)
//    speedupSeconds: kullanıcının elindeki toplam hızlandırma (saniye)
//    trainingSpeedBonus: % (örn 150 => 1.5x)
// ----------------------------------------------------------------------------
export function training(opts: {
  have: Partial<Resources>;
  speedupSeconds: number;
  trainingSpeedBonus: number; // %
  cost: TroopCost;
}) {
  const { have, speedupSeconds, trainingSpeedBonus, cost } = opts;
  const limits: number[] = [];
  if (cost.food > 0 && have.food)   limits.push(Math.floor(have.food  / cost.food));
  if (cost.wood > 0 && have.wood)   limits.push(Math.floor(have.wood  / cost.wood));
  if (cost.stone > 0 && have.stone) limits.push(Math.floor(have.stone / cost.stone));
  if (cost.gold > 0 && have.gold)   limits.push(Math.floor(have.gold  / cost.gold));

  let bySpeedup = -1;
  if (cost.time > 0 && speedupSeconds > 0) {
    bySpeedup = Math.floor((speedupSeconds / cost.time) * (1 + trainingSpeedBonus / 100));
  }

  let troops = limits.length ? Math.min(...limits) : 0;
  if (speedupSeconds > 0 && bySpeedup >= 0) {
    troops = limits.length ? Math.min(troops, bySpeedup) : bySpeedup;
  }
  if (troops < 0) troops = 0;

  return {
    troops,
    spendFood:  troops * cost.food,
    spendWood:  troops * cost.wood,
    spendStone: troops * cost.stone,
    spendGold:  troops * cost.gold,
    spendTime:  troops * cost.time,
    totalPower:     troops * cost.power,
    totalMgePoints: troops * cost.mgePoints,
    totalKvkPoints: troops * cost.kvk,
  };
}

// ----------------------------------------------------------------------------
// 4) HEALING — yaralı askerleri iyileştirme
//    perTier: her tier için 4 kaynağın (inf,arch,cav,siege) birim maliyeti
//             ve birim süresi. Sıralama: [infantry, archer, cavalry, siege]
// ----------------------------------------------------------------------------
export type WoundedTier = {
  infantry: number;
  archer: number;
  cavalry: number;
  siege: number;
};

export type HealUnit = {
  food: [number, number, number, number];
  wood: [number, number, number, number];
  stone: [number, number, number, number];
  gold: [number, number, number, number];
  time: number; // saniye / asker
};

/** T1–T5 tier birim maliyet tablosu (index 0 = T1). */
export const HEAL_UNITS_BY_TIER: HealUnit[] = [
  {
    food: [20, 16, 24, 24],
    wood: [20, 24, 16, 24],
    stone: [0, 0, 0, 0],
    gold: [0, 0, 0, 0],
    time: 3,
  },
  {
    food: [40, 0, 40, 26],
    wood: [40, 40, 0, 26],
    stone: [0, 30, 30, 20],
    gold: [0, 0, 0, 0],
    time: 1,
  },
  {
    food: [60, 0, 60, 40],
    wood: [60, 60, 0, 40],
    stone: [0, 44, 44, 30],
    gold: [4, 4, 4, 4],
    time: 2,
  },
  {
    food: [120, 0, 120, 80],
    wood: [120, 120, 0, 80],
    stone: [0, 90, 90, 60],
    gold: [8, 8, 8, 8],
    time: 3,
  },
  // TODO: T5 değerleri — geçici olarak T4 birim maliyetleri kullanılıyor
  {
    food: [120, 0, 120, 80],
    wood: [120, 120, 0, 80],
    stone: [0, 90, 90, 60],
    gold: [8, 8, 8, 8],
    time: 3,
  },
];

function healCost(w: WoundedTier, unit: [number, number, number, number], rssReductionPct: number) {
  let c = w.infantry * unit[0] + w.archer * unit[1] + w.cavalry * unit[2] + w.siege * unit[3];
  if (rssReductionPct > 0) c = (c * (100 - rssReductionPct)) / 100;
  return c > 0 ? c : 0;
}

// alliance help: süreyi her yardımda %1 azaltır (uzun süreler için)
function applyHelp(seconds: number, helps: number): number {
  let s = seconds;
  for (let i = 0; i < helps; i++) s = s - 0.01 * s;
  return s > 0 ? s : 0;
}

export function healingTier(opts: {
  wounded: WoundedTier;
  unit: HealUnit;
  rssReductionPct: number;     // healingRssReduction
  healingSpeedBonus: number;   // %
  allianceHelps: number;
}) {
  const { wounded, unit, rssReductionPct, healingSpeedBonus, allianceHelps } = opts;
  const total = wounded.infantry + wounded.archer + wounded.cavalry + wounded.siege;

  let time = total * unit.time;
  if (healingSpeedBonus > 0) time = time / (1 + healingSpeedBonus / 100);
  if (allianceHelps > 0) {
    // kodun kuralı: çok kısa sürelerde sabit -3dk/yardım, yoksa çarpımsal
    if (0.01 * time < 180) time -= 3 * allianceHelps * 60;
    else time = applyHelp(time, allianceHelps);
    if (time < 0) time = 0;
  }

  return {
    food:  healCost(wounded, unit.food,  rssReductionPct),
    wood:  healCost(wounded, unit.wood,  rssReductionPct),
    stone: healCost(wounded, unit.stone, rssReductionPct),
    gold:  healCost(wounded, unit.gold,  rssReductionPct),
    time,
  };
}

// ----------------------------------------------------------------------------
// 5) VIP — hedefe ulaşmak için gereken puan
//    table: vip.json  ([{level, points}, ...])
// ----------------------------------------------------------------------------
export function vipPointsNeeded(
  table: { level: number; points: number }[],
  levelFrom: number,
  levelTo: number,
  currentPoints: number
): number {
  const need = table
    .filter((r) => r.level > levelFrom && r.level <= levelTo)
    .reduce((sum, r) => sum + r.points, 0);
  return Math.max(0, need - currentPoints);
}

// ----------------------------------------------------------------------------
// 6) RESOURCE PACKS — kademeli bölüştürme
//    Lvl3 birimleri: Lvl2'nin 10 katı (100k/100k/75k/50k).
//    src/rok/data içinde ayrı JSON yok; birimler burada sabitlenmiştir.
// ----------------------------------------------------------------------------
export type ResourcePackCounts = {
  lvl1A: number;
  lvl1B: number;
  lvl1C: number;
  lvl2: number;
  lvl3: number;
};

function resourcePackLvl1A(s: number): number {
  if (s <= 0) return 0;
  const h = Math.ceil(s / 2);
  const g = s - h;
  let total = 0;
  total += 1000 * h;
  if (g > 0) total += 1000 * g;
  return total;
}

function resourcePackLvl1B(a: number): number {
  if (a <= 0) return 0;
  const h = Math.ceil(a / 3);
  const g = Math.ceil((a - h) / 2);
  const C = a - h - g;
  let total = 0;
  total += 1000 * h;
  total += 1000 * g;
  if (C > 0) total += 750 * C;
  return total;
}

function resourcePackLvl1C(l: number): number {
  if (l <= 0) return 0;
  const h = Math.ceil(l / 4);
  const g = Math.ceil((l - h) / 3);
  const C = Math.ceil((l - h - g) / 2);
  const T = l - h - g - C;
  let total = 0;
  total += 1000 * h;
  total += 1000 * g;
  total += 750 * C;
  if (T > 0) total += 500 * T;
  return total;
}

function resourcePackTier4(
  count: number,
  uHigh: number,
  uMid: number,
  uLow: number,
  uTail: number,
): number {
  if (count <= 0) return 0;
  const h = Math.ceil(count / 4);
  const g = Math.ceil((count - h) / 3);
  const C = Math.ceil((count - h - g) / 2);
  const T = count - h - g - C;
  let total = 0;
  total += uHigh * h;
  total += uMid * g;
  total += uLow * C;
  if (T > 0) total += uTail * T;
  return total;
}

function resourcePackLvl2(c: number): number {
  return resourcePackTier4(c, 10000, 10000, 7500, 5000);
}

function resourcePackLvl3(c: number): number {
  return resourcePackTier4(c, 100000, 100000, 75000, 50000);
}

export function resourcePackTotal(counts: ResourcePackCounts): number {
  return (
    resourcePackLvl1A(counts.lvl1A) +
    resourcePackLvl1B(counts.lvl1B) +
    resourcePackLvl1C(counts.lvl1C) +
    resourcePackLvl2(counts.lvl2) +
    resourcePackLvl3(counts.lvl3)
  );
}

// ----------------------------------------------------------------------------
// 7) TOMES OF KNOWLEDGE — envanterdeki toplam EXP
//    expValues: tomes.json → [100,500,1000,5000,10000,50000]
// ----------------------------------------------------------------------------
export const tomesTotalExp = weightedTotal;

// ----------------------------------------------------------------------------
// 8) COMMANDER — levelFrom→levelTo için gereken EXP
//    table: commander.json içindeki dizi (legendary/epic/elite/advanced)
//    index = seviye-1. currentExp: mevcut komutanın biriken EXP'i (ops.)
// ----------------------------------------------------------------------------
export function commanderExpNeeded(
  table: number[],
  levelFrom: number,
  levelTo: number,
  currentExp = 0
): number {
  let total = 0;
  for (let r = levelFrom - 1; r < levelTo - 1; r++) total += table[r] ?? 0;
  if (currentExp) {
    const firstStep = table[levelFrom - 1] ?? 0;
    total -= currentExp > firstStep ? firstStep : currentExp;
  }
  return total > 0 ? total : 0;
}

// ----------------------------------------------------------------------------
// 9) BUILDING / RESEARCH — levelFrom→levelTo toplam maliyet
//    item: building.json/research.json içindeki bir öğenin .levels dizisi
//    Aynı motor; fark sadece veridir.
// ----------------------------------------------------------------------------
export type LevelRow = {
  level: number;
  timeCost: number;
  foodCost: number;
  woodCost: number;
  stoneCost: number;
  goldCost: number;
  bookCost?: number;
  arrowCost?: number;
  powerReward: number;
  mgePointsReward: number;
};

function helpTimeBuilding(seconds: number, helps: number): number {
  let t = seconds;
  for (let i = 0; i < helps && t > 0; i++) t = (100 * t) / 101;
  return t > 0 ? t : 0;
}

export function buildingResearchCost(opts: {
  levels: LevelRow[];
  levelFrom: number;
  levelTo: number;
  speedBonus: number; // %
  allianceHelps: number;
}) {
  const { levels, levelFrom, levelTo, speedBonus, allianceHelps } = opts;
  const acc = {
    timeCost: 0,
    foodCost: 0,
    woodCost: 0,
    stoneCost: 0,
    goldCost: 0,
    bookCost: 0,
    arrowCost: 0,
    powerReward: 0,
    mgePointsReward: 0,
  };
  for (const l of levels) {
    const inRange =
      (l.level > levelFrom && l.level <= levelTo) ||
      (levelFrom === levelTo && levelFrom === 1 && l.level === 1);
    if (!inRange) continue;

    acc.foodCost += l.foodCost;
    acc.woodCost += l.woodCost;
    acc.stoneCost += l.stoneCost;
    acc.goldCost += l.goldCost;
    acc.bookCost += l.bookCost ?? 0;
    acc.arrowCost += l.arrowCost ?? 0;
    acc.powerReward += l.powerReward;
    acc.mgePointsReward += l.mgePointsReward;

    let c = speedBonus > 0 ? l.timeCost / (1 + speedBonus / 100) : l.timeCost;
    if (allianceHelps > 0) {
      if (c * (allianceHelps / 100) < 3 * allianceHelps * 60) {
        c -= 3 * allianceHelps * 60;
        c = c > 0 ? c : 0;
      } else {
        c = helpTimeBuilding(c, allianceHelps);
      }
    }
    acc.timeCost += c;
  }
  return acc;
}

// ----------------------------------------------------------------------------
// Yardımcılar
// ----------------------------------------------------------------------------
export function secondsToDHMS(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function speedupInputToSeconds(days = 0, hours = 0, minutes = 0): number {
  return days * 86400 + hours * 3600 + minutes * 60;
}

// ============================================================================
// 10) EQUIPMENT — üretim malzemesi + gold + süre
//     En karmaşık hesaplayıcı. Nadirlik çarpanları (common-eşdeğeri):
//       Common=1, Uncommon=4, Rare=16, Epic=64, Legendary=256
//     Kullanıcı elindeki malzemeyi (ops.) girer, üretmek istediği parçaları
//     seçer; sistem açığı (hâlâ gereken malzemeyi) hesaplar.
//     Veri: rok-data/equipment.json
// ============================================================================
export type EquipRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type MatV = { C: number; UC: number; R: number; E: number; M: number };

export interface EquipmentPiece {
  equipmentType: EquipRarity;
  name: string;
  color?: string;
  leather: MatV;
  ironOne: MatV;
  animalBone: MatV;
  ebony: MatV;
  gold: number;
}

const zeroMat = (): MatV => ({ C: 0, UC: 0, R: 0, E: 0, M: 0 });

// v(C,UC,R,E,M) -> her kova common-eşdeğeri birimde
function toCommonEquiv(v: MatV): MatV {
  return { C: v.C, UC: 4 * v.UC, R: 16 * v.R, E: 64 * v.E, M: 256 * v.M };
}

// bir parçanın, kendi nadirliğindeki malzeme ihtiyacı (common-eşdeğeri)
function reqAtRarity(rarity: EquipRarity, v: MatV): number {
  switch (rarity) {
    case "Common":    return v.C;
    case "Uncommon":  return 4 * v.UC;
    case "Rare":      return 16 * v.R;
    case "Epic":      return 64 * v.E;
    case "Legendary": return 256 * v.M;
  }
}

// fazlayı yukarı taşı, kalan açığı (negatifleri) topla
function rebalance(t: MatV): number {
  if (t.C > 0) { t.UC += t.C; t.C = 0; }
  if (t.UC > 0) { t.R += t.UC; t.UC = 0; }
  if (t.R > 0) { t.E += t.R; t.R = 0; }
  if (t.E > 0) { t.M += t.E; t.E = 0; }
  let deficit = 0;
  if (t.C < 0)  deficit += Math.abs(t.C);
  if (t.UC < 0) deficit += Math.abs(t.UC);
  if (t.R < 0)  deficit += Math.abs(t.R);
  if (t.E < 0)  deficit += Math.abs(t.E);
  if (t.M < 0)  deficit += Math.abs(t.M);
  return deficit;
}

const RARITY_BUCKET: Record<EquipRarity, keyof MatV> = {
  Common: "C", Uncommon: "UC", Rare: "R", Epic: "E", Legendary: "M",
};

export function equipmentCost(opts: {
  pieces: EquipmentPiece[];
  owned?: { leather?: MatV; ironOne?: MatV; animalBone?: MatV; ebony?: MatV };
  speedBonus?: number; // %
}) {
  const own = opts.owned ?? {};
  const t = toCommonEquiv(own.leather    ?? zeroMat());
  const o = toCommonEquiv(own.ironOne    ?? zeroMat());
  const r = toCommonEquiv(own.animalBone ?? zeroMat());
  const i = toCommonEquiv(own.ebony      ?? zeroMat());
  let gold = 0;

  for (const g of opts.pieces) {
    const b = RARITY_BUCKET[g.equipmentType];
    t[b] -= reqAtRarity(g.equipmentType, g.leather);
    o[b] -= reqAtRarity(g.equipmentType, g.ironOne);
    r[b] -= reqAtRarity(g.equipmentType, g.animalBone);
    i[b] -= reqAtRarity(g.equipmentType, g.ebony);
    gold += g.gold;
  }

  const totalLeather    = Math.max(0, rebalance(t));
  const totalIronOne    = Math.max(0, rebalance(o));
  const totalAnimalBone = Math.max(0, rebalance(r));
  const totalEbony      = Math.max(0, rebalance(i));

  // her 15 malzeme = 10800 sn (3 saat) üretim süresi
  let time = 10800 * Math.ceil(
    (totalLeather + totalIronOne + totalAnimalBone + totalEbony) / 15
  );
  if ((opts.speedBonus ?? 0) > 0) time = time / (1 + (opts.speedBonus as number) / 100);

  return { totalLeather, totalIronOne, totalAnimalBone, totalEbony, gold, time };
}
