"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Eye,
  Flag,
  Shield,
  Swords,
  TriangleAlert,
  Type,
  User,
  type LucideProps,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./AooPlanner.module.css";

const STORAGE_KEY = "rok-aoo-planner-v2";
const MAP_IMAGE = "/aoo-map.png";

/** Native map dimensions (the .png is a JPEG, 3492x2674). */
const MAP_W = 3492;
const MAP_H = 2674;
const ASPECT = MAP_W / MAP_H;

/** Fixed design space (same aspect ratio as the map) used for arrow geometry. */
const VBW = 1000;
const VBH = Math.round(VBW / ASPECT);

const EXPORT_SCALE = 2;

/** Arrow geometry in design-space (VBW) units. */
const ARROW_STROKE = 6;
const ARROW_HEAD_LEN = 28;
const ARROW_HEAD_W = 22;
const ARROW_HIT = 34;
const ARROW_HANDLE_R = 14;

const COLORS = {
  white: "#f5f5f7",
  black: "#000000",
  amber: "#f5a623",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
} as const;

type ColorKey = keyof typeof COLORS;
const COLOR_KEYS: ColorKey[] = [
  "white",
  "black",
  "amber",
  "red",
  "blue",
  "green",
];

type IconName = "swords" | "shield" | "flag" | "eye" | "user" | "alert";
const ICON_NAMES: IconName[] = [
  "swords",
  "shield",
  "flag",
  "eye",
  "user",
  "alert",
];

const ICON_COMPONENTS: Record<IconName, ComponentType<LucideProps>> = {
  swords: Swords,
  shield: Shield,
  flag: Flag,
  eye: Eye,
  user: User,
  alert: TriangleAlert,
};

/**
 * Inner SVG geometry of the lucide icons above (same library version).
 * Used to rasterize icons identically during PNG export.
 */
const ICON_INNER: Record<IconName, string> = {
  swords:
    '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  flag: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  alert:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
};

type TextEl = {
  id: string;
  type: "text";
  color: ColorKey;
  x: number;
  y: number;
  text: string;
  fontPct: number;
};

type LabelEl = {
  id: string;
  type: "label";
  color: ColorKey;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontPct: number;
};

type ArrowEl = {
  id: string;
  type: "arrow";
  color: ColorKey;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type IconEl = {
  id: string;
  type: "icon";
  color: ColorKey;
  x: number;
  y: number;
  name: IconName;
  sizePct: number;
};

type PlannerEl = TextEl | LabelEl | ArrowEl | IconEl;

type Props = {
  dict: Dictionary;
  locale: Locale;
};

type Drag =
  | {
      kind: "move";
      id: string;
      offX: number;
      offY: number;
      startX: number;
      startY: number;
      moved: boolean;
    }
  | {
      kind: "move-arrow";
      id: string;
      o1x: number;
      o1y: number;
      o2x: number;
      o2y: number;
      startX: number;
      startY: number;
      moved: boolean;
    }
  | { kind: "arrow-pt"; id: string; which: 1 | 2 }
  | { kind: "resize-label"; id: string }
  | { kind: "resize-icon"; id: string }
  | { kind: "resize-text"; id: string; ref0: number; startFont: number };

/** Pointer travel (px) before a press becomes a drag instead of a click. */
const DRAG_THRESHOLD = 4;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, v));
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isColorKey(v: unknown): v is ColorKey {
  return typeof v === "string" && (COLOR_KEYS as string[]).includes(v);
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function coerce(raw: unknown): PlannerEl | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : generateId();
  const color = isColorKey(r.color) ? r.color : "amber";

  switch (r.type) {
    case "text":
      return {
        id,
        type: "text",
        color,
        x: clamp(num(r.x, 50)),
        y: clamp(num(r.y, 50)),
        text: typeof r.text === "string" ? r.text : "",
        fontPct: clamp(num(r.fontPct, 5), 1.5, 24),
      };
    case "label":
      return {
        id,
        type: "label",
        color,
        x: clamp(num(r.x, 50)),
        y: clamp(num(r.y, 50)),
        w: clamp(num(r.w, 16), 3, 100),
        h: clamp(num(r.h, 8), 3, 100),
        text: typeof r.text === "string" ? r.text : "",
        fontPct: clamp(num(r.fontPct, 4), 1.5, 24),
      };
    case "arrow":
      return {
        id,
        type: "arrow",
        color,
        x1: clamp(num(r.x1, 40)),
        y1: clamp(num(r.y1, 50)),
        x2: clamp(num(r.x2, 60)),
        y2: clamp(num(r.y2, 50)),
      };
    case "icon": {
      const name = ICON_NAMES.includes(r.name as IconName)
        ? (r.name as IconName)
        : "user";
      return {
        id,
        type: "icon",
        color,
        x: clamp(num(r.x, 50)),
        y: clamp(num(r.y, 50)),
        name,
        sizePct: clamp(num(r.sizePct, 9), 2, 50),
      };
    }
    default:
      return null;
  }
}

function loadElements(): PlannerEl[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(coerce)
      .filter((el): el is PlannerEl => el !== null);
  } catch {
    return [];
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function iconSvgMarkup(name: IconName, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_INNER[name]}</svg>`;
}

type ArrowGeom = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  bx: number;
  by: number;
  lx: number;
  ly: number;
  rx: number;
  ry: number;
};

function arrowGeom(
  el: ArrowEl,
  spaceW: number,
  spaceH: number,
  scale: number,
): ArrowGeom {
  const x1 = (el.x1 / 100) * spaceW;
  const y1 = (el.y1 / 100) * spaceH;
  const x2 = (el.x2 / 100) * spaceW;
  const y2 = (el.y2 / 100) * spaceH;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const headLen = ARROW_HEAD_LEN * scale;
  const headW = (ARROW_HEAD_W * scale) / 2;
  const bx = x2 - Math.cos(ang) * headLen;
  const by = y2 - Math.sin(ang) * headLen;
  const lx = bx - Math.sin(ang) * headW;
  const ly = by + Math.cos(ang) * headW;
  const rx = bx + Math.sin(ang) * headW;
  const ry = by - Math.cos(ang) * headW;
  return { x1, y1, x2, y2, bx, by, lx, ly, rx, ry };
}

export function AooPlanner({ dict, locale }: Props) {
  const t = dict.aooPlanner;

  const [elements, setElements] = useState<PlannerEl[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<ColorKey>("amber");

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setElements(loadElements());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
  }, [elements, hydrated]);

  const selected = elements.find((el) => el.id === selectedId) ?? null;

  const updateEl = useCallback((id: string, patch: Partial<PlannerEl>) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? ({ ...el, ...patch } as PlannerEl) : el,
      ),
    );
  }, []);

  const addElement = useCallback((el: PlannerEl) => {
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
    setEditingId(null);
  }, []);

  const addText = () =>
    addElement({
      id: generateId(),
      type: "text",
      color: activeColor,
      x: 50,
      y: 50,
      text: t.defaults.text,
      fontPct: 5,
    });

  const addLabel = () =>
    addElement({
      id: generateId(),
      type: "label",
      color: activeColor,
      x: 50,
      y: 50,
      w: 16,
      h: 8,
      text: t.defaults.label,
      fontPct: 3.6,
    });

  const addArrow = () =>
    addElement({
      id: generateId(),
      type: "arrow",
      color: activeColor,
      x1: 38,
      y1: 50,
      x2: 62,
      y2: 50,
    });

  const addIcon = (name: IconName) =>
    addElement({
      id: generateId(),
      type: "icon",
      color: activeColor,
      x: 50,
      y: 50,
      name,
      sizePct: 9,
    });

  const chooseColor = (color: ColorKey) => {
    setActiveColor(color);
    if (selectedId) updateEl(selectedId, { color });
  };

  const deleteEl = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
    setEditingId((cur) => (cur === id ? null : cur));
  }, []);

  const adjustSize = useCallback(
    (dir: 1 | -1) => {
      if (!selected) return;
      const step = dir * 0.5;
      if (selected.type === "text" || selected.type === "label") {
        updateEl(selected.id, {
          fontPct: clamp(selected.fontPct + step, 1.5, 24),
        });
      } else if (selected.type === "icon") {
        updateEl(selected.id, {
          sizePct: clamp(selected.sizePct + dir * 1, 2, 50),
        });
      }
    },
    [selected, updateEl],
  );

  const clearAll = useCallback(() => {
    if (elements.length === 0) return;
    if (!window.confirm(t.clearConfirm)) return;
    setElements([]);
    setSelectedId(null);
    setEditingId(null);
  }, [elements.length, t.clearConfirm]);

  function pointerPct(e: ReactPointerEvent): { x: number; y: number } {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100),
    };
  }

  function beginDrag(e: ReactPointerEvent, drag: Drag) {
    stageRef.current?.setPointerCapture(e.pointerId);
    dragRef.current = drag;
  }

  function onElPointerDown(e: ReactPointerEvent, el: PlannerEl) {
    if (editingId === el.id) return;
    e.stopPropagation();
    setSelectedId(el.id);
    if (editingId) setEditingId(null);
    const p = pointerPct(e);
    if (el.type === "arrow") {
      beginDrag(e, {
        kind: "move-arrow",
        id: el.id,
        o1x: el.x1 - p.x,
        o1y: el.y1 - p.y,
        o2x: el.x2 - p.x,
        o2y: el.y2 - p.y,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      });
    } else {
      beginDrag(e, {
        kind: "move",
        id: el.id,
        offX: el.x - p.x,
        offY: el.y - p.y,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      });
    }
  }

  function onArrowPointDown(e: ReactPointerEvent, el: ArrowEl, which: 1 | 2) {
    e.stopPropagation();
    setSelectedId(el.id);
    beginDrag(e, { kind: "arrow-pt", id: el.id, which });
  }

  function onResizeDown(
    e: ReactPointerEvent,
    el: LabelEl | IconEl,
  ) {
    e.stopPropagation();
    setSelectedId(el.id);
    beginDrag(e, {
      kind: el.type === "label" ? "resize-label" : "resize-icon",
      id: el.id,
    });
  }

  function onResizeTextDown(e: ReactPointerEvent, el: TextEl) {
    e.stopPropagation();
    setSelectedId(el.id);
    if (editingId) setEditingId(null);
    const p = pointerPct(e);
    const ref0 = Math.max(0.5, Math.hypot(p.x - el.x, p.y - el.y));
    beginDrag(e, {
      kind: "resize-text",
      id: el.id,
      ref0,
      startFont: el.fontPct,
    });
  }

  function onStagePointerMove(e: ReactPointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    if (d.kind === "move" || d.kind === "move-arrow") {
      if (!d.moved) {
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        d.moved = true;
      }
    }
    const p = pointerPct(e);
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== d.id) return el;
        switch (d.kind) {
          case "move":
            return { ...el, x: clamp(p.x + d.offX), y: clamp(p.y + d.offY) };
          case "move-arrow":
            return {
              ...el,
              x1: clamp(p.x + d.o1x),
              y1: clamp(p.y + d.o1y),
              x2: clamp(p.x + d.o2x),
              y2: clamp(p.y + d.o2y),
            } as PlannerEl;
          case "arrow-pt":
            return d.which === 1
              ? ({ ...el, x1: p.x, y1: p.y } as PlannerEl)
              : ({ ...el, x2: p.x, y2: p.y } as PlannerEl);
          case "resize-label": {
            const e2 = el as LabelEl;
            return {
              ...e2,
              w: clamp(2 * (p.x - e2.x), 3, 100),
              h: clamp(2 * (p.y - e2.y), 3, 100),
            };
          }
          case "resize-icon": {
            const e2 = el as IconEl;
            return { ...e2, sizePct: clamp(2 * (p.y - e2.y), 2, 50) };
          }
          case "resize-text": {
            const e2 = el as TextEl;
            const dist = Math.hypot(p.x - e2.x, p.y - e2.y);
            return {
              ...e2,
              fontPct: clamp((d.startFont * dist) / d.ref0, 1.5, 24),
            };
          }
          default:
            return el;
        }
      }),
    );
  }

  function onStagePointerUp(e: ReactPointerEvent) {
    const d = dragRef.current;
    if (d) {
      if (
        (d.kind === "move" || d.kind === "move-arrow") &&
        !d.moved
      ) {
        const el = elements.find((x) => x.id === d.id);
        if (el && (el.type === "text" || el.type === "label")) {
          beginEdit(el.id);
        }
      }
      dragRef.current = null;
      stageRef.current?.releasePointerCapture(e.pointerId);
    }
  }

  function onStagePointerDown() {
    if (editingId) setEditingId(null);
    setSelectedId(null);
  }

  function beginEdit(id: string) {
    setSelectedId(id);
    setEditingId(id);
  }

  useLayoutEffect(() => {
    if (editingId && editRef.current) {
      const ta = editRef.current;
      ta.focus();
      ta.select();
      const el = elements.find((x) => x.id === editingId);
      if (el && el.type === "text") autoSize(ta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editingId) {
        if (e.key === "Escape") setEditingId(null);
        return;
      }
      if (!selectedId) return;
      if (e.key === "Delete") {
        e.preventDefault();
        deleteEl(selectedId);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, editingId, deleteEl]);

  function autoSize(ta: HTMLTextAreaElement) {
    ta.style.width = "0px";
    ta.style.height = "0px";
    ta.style.width = `${ta.scrollWidth + 2}px`;
    ta.style.height = `${ta.scrollHeight}px`;
  }

  const handleDownload = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const exportW = Math.max(800, Math.round(rect.width * EXPORT_SCALE));
    const exportH = Math.round(exportW / ASPECT);
    const scale = exportW / VBW;

    const canvas = document.createElement("canvas");
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontFamily = getComputedStyle(stage).fontFamily || "sans-serif";
    try {
      await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
    } catch {
      /* ignore */
    }

    const bg = await loadImage(MAP_IMAGE);
    ctx.drawImage(bg, 0, 0, exportW, exportH);

    const iconImgs = new Map<string, HTMLImageElement>();
    for (const el of elements) {
      if (el.type !== "icon") continue;
      const key = `${el.name}|${el.color}`;
      if (iconImgs.has(key)) continue;
      const url = `data:image/svg+xml;utf8,${encodeURIComponent(
        iconSvgMarkup(el.name, COLORS[el.color]),
      )}`;
      iconImgs.set(key, await loadImage(url));
    }

    const shadow = () => {
      ctx.shadowColor = "rgba(0,0,0,0.85)";
      ctx.shadowBlur = exportW * 0.004;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = exportW * 0.0015;
    };
    const noShadow = () => {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    };

    for (const el of elements) {
      const c = COLORS[el.color];
      if (el.type === "text") {
        const px = (el.fontPct / 100) * exportH;
        ctx.font = `700 ${px}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = c;
        const lines = el.text.split("\n");
        const lh = px * 1.2;
        const cx = (el.x / 100) * exportW;
        const cy = (el.y / 100) * exportH;
        const top = cy - (lines.length * lh) / 2;
        lines.forEach((ln, i) => ctx.fillText(ln, cx, top + lh * (i + 0.5)));
      } else if (el.type === "label") {
        const w = (el.w / 100) * exportW;
        const h = (el.h / 100) * exportH;
        const cx = (el.x / 100) * exportW;
        const cy = (el.y / 100) * exportH;
        const x0 = cx - w / 2;
        const y0 = cy - h / 2;
        const r = Math.min(w, h) * 0.18;
        ctx.beginPath();
        ctx.roundRect(x0, y0, w, h, r);
        ctx.fillStyle = hexToRgba(c, 0.22);
        ctx.fill();
        ctx.lineWidth = scale * 3;
        ctx.strokeStyle = c;
        ctx.stroke();
        const px = (el.fontPct / 100) * exportH;
        ctx.font = `700 ${px}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = COLORS.white;
        const lines = el.text.split("\n");
        const lh = px * 1.2;
        const top = cy - (lines.length * lh) / 2;
        lines.forEach((ln, i) => ctx.fillText(ln, cx, top + lh * (i + 0.5)));
      } else if (el.type === "icon") {
        const size = (el.sizePct / 100) * exportH;
        const img = iconImgs.get(`${el.name}|${el.color}`);
        if (img) {
          const x0 = (el.x / 100) * exportW - size / 2;
          const y0 = (el.y / 100) * exportH - size / 2;
          shadow();
          ctx.drawImage(img, x0, y0, size, size);
          noShadow();
        }
      } else if (el.type === "arrow") {
        const g = arrowGeom(el, exportW, exportH, scale);
        shadow();
        ctx.strokeStyle = c;
        ctx.fillStyle = c;
        ctx.lineWidth = ARROW_STROKE * scale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(g.x1, g.y1);
        ctx.lineTo(g.bx, g.by);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(g.x2, g.y2);
        ctx.lineTo(g.lx, g.ly);
        ctx.lineTo(g.rx, g.ry);
        ctx.closePath();
        ctx.fill();
        noShadow();
      }
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aoo-plan.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [elements]);

  const sizeDisabled =
    !selected ||
    (selected.type !== "text" &&
      selected.type !== "label" &&
      selected.type !== "icon");

  function renderElement(el: PlannerEl) {
    const isSel = selectedId === el.id;
    const c = COLORS[el.color];

    if (el.type === "arrow") {
      const g = arrowGeom(el, VBW, VBH, 1);
      return (
        <svg
          key={el.id}
          className={styles.arrowSvg}
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
        >
          <g
            className={styles.arrowHit}
            onPointerDown={(e) => onElPointerDown(e, el)}
          >
            <line
              x1={g.x1}
              y1={g.y1}
              x2={g.x2}
              y2={g.y2}
              stroke="transparent"
              strokeWidth={ARROW_HIT}
              strokeLinecap="round"
            />
            <line
              x1={g.x1}
              y1={g.y1}
              x2={g.bx}
              y2={g.by}
              stroke={c}
              strokeWidth={ARROW_STROKE}
              strokeLinecap="round"
            />
            <polygon
              points={`${g.x2},${g.y2} ${g.lx},${g.ly} ${g.rx},${g.ry}`}
              fill={c}
            />
          </g>
          {isSel ? (
            <>
              <line
                x1={g.x1}
                y1={g.y1}
                x2={g.x2}
                y2={g.y2}
                className={styles.arrowSelLine}
                strokeWidth={ARROW_STROKE * 0.5}
              />
              <circle
                className={styles.arrowHandle}
                cx={g.x1}
                cy={g.y1}
                r={ARROW_HANDLE_R}
                onPointerDown={(e) => onArrowPointDown(e, el, 1)}
              />
              <circle
                className={styles.arrowHandle}
                cx={g.x2}
                cy={g.y2}
                r={ARROW_HANDLE_R}
                onPointerDown={(e) => onArrowPointDown(e, el, 2)}
              />
            </>
          ) : null}
        </svg>
      );
    }

    const baseStyle: React.CSSProperties = {
      left: `${el.x}%`,
      top: `${el.y}%`,
    };

    if (el.type === "text") {
      return (
        <div
          key={el.id}
          className={[styles.elWrap, isSel ? styles.selected : ""]
            .filter(Boolean)
            .join(" ")}
          style={baseStyle}
          onPointerDown={(e) => onElPointerDown(e, el)}
        >
          {editingId === el.id ? (
            <textarea
              ref={editRef}
              className={styles.textInput}
              style={{ fontSize: `${el.fontPct}cqh`, color: c }}
              value={el.text}
              wrap="off"
              spellCheck={false}
              onChange={(e) => {
                updateEl(el.id, { text: e.target.value });
                autoSize(e.target);
              }}
              onBlur={() => setEditingId(null)}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className={styles.textEl}
              style={{ fontSize: `${el.fontPct}cqh`, color: c }}
            >
              {el.text || t.defaults.text}
            </div>
          )}
          {isSel ? (
            <>
              <button
                type="button"
                className={styles.removeHandle}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => deleteEl(el.id)}
                aria-label={t.tools.delete}
              >
                ×
              </button>
              <span
                className={styles.resizeHandle}
                onPointerDown={(e) => onResizeTextDown(e, el)}
              />
            </>
          ) : null}
        </div>
      );
    }

    if (el.type === "label") {
      return (
        <div
          key={el.id}
          className={[styles.elWrap, styles.labelWrap, isSel ? styles.selected : ""]
            .filter(Boolean)
            .join(" ")}
          style={{
            ...baseStyle,
            width: `${el.w}%`,
            height: `${el.h}%`,
            backgroundColor: hexToRgba(c, 0.22),
            borderColor: c,
          }}
          onPointerDown={(e) => onElPointerDown(e, el)}
        >
          {editingId === el.id ? (
            <textarea
              ref={editRef}
              className={styles.labelInput}
              style={{ fontSize: `${el.fontPct}cqh` }}
              value={el.text}
              spellCheck={false}
              onChange={(e) => updateEl(el.id, { text: e.target.value })}
              onBlur={() => setEditingId(null)}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className={styles.labelText}
              style={{ fontSize: `${el.fontPct}cqh` }}
            >
              {el.text || t.defaults.label}
            </span>
          )}
          {isSel ? (
            <>
              <button
                type="button"
                className={styles.removeHandle}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => deleteEl(el.id)}
                aria-label={t.tools.delete}
              >
                ×
              </button>
              <span
                className={styles.resizeHandle}
                onPointerDown={(e) => onResizeDown(e, el)}
              />
            </>
          ) : null}
        </div>
      );
    }

    const IconCmp = ICON_COMPONENTS[el.name];
    return (
      <div
        key={el.id}
        className={[styles.elWrap, styles.iconWrap, isSel ? styles.selected : ""]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...baseStyle,
          width: `${el.sizePct}cqh`,
          height: `${el.sizePct}cqh`,
        }}
        onPointerDown={(e) => onElPointerDown(e, el)}
      >
        <IconCmp
          className={styles.iconGlyph}
          color={c}
          size="100%"
          strokeWidth={2}
          aria-hidden
        />
        {isSel ? (
          <>
            <button
              type="button"
              className={styles.removeHandle}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => deleteEl(el.id)}
              aria-label={t.tools.delete}
            >
              ×
            </button>
            <span
              className={styles.resizeHandle}
              onPointerDown={(e) => onResizeDown(e, el)}
            />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <PageShell
      locale={locale}
      header={dict.header}
      home={dict.home}
      support={dict.support}
      title={t.h1}
      subtitle={t.intro}
      currentSlug="aoo-planner"
      wide
      showRelated={false}
    >
      <div className={styles.editor}>
        <div className={styles.toolbar}>
          <div className={styles.toolGroup}>
            <button type="button" className={styles.toolBtn} onClick={addText}>
              <Type size={15} strokeWidth={2.5} aria-hidden />
              {t.tools.text}
            </button>
            <button type="button" className={styles.toolBtn} onClick={addLabel}>
              <span className={styles.labelSwatch} aria-hidden />
              {t.tools.label}
            </button>
            <button type="button" className={styles.toolBtn} onClick={addArrow}>
              <span className={styles.arrowSwatch} aria-hidden>
                →
              </span>
              {t.tools.arrow}
            </button>
          </div>

          <div className={styles.toolGroup}>
            {ICON_NAMES.map((name) => {
              const IconCmp = ICON_COMPONENTS[name];
              return (
                <button
                  key={name}
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => addIcon(name)}
                  title={t.icons[name]}
                  aria-label={t.icons[name]}
                >
                  <IconCmp size={18} strokeWidth={2} aria-hidden />
                </button>
              );
            })}
          </div>

          <div className={styles.toolGroup}>
            {COLOR_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={[
                  styles.colorBtn,
                  activeColor === key ? styles.colorActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ backgroundColor: COLORS[key] }}
                onClick={() => chooseColor(key)}
                title={t.colors[key]}
                aria-label={t.colors[key]}
              />
            ))}
          </div>

          <div className={styles.toolGroup}>
            <button
              type="button"
              className={styles.sizeBtn}
              onClick={() => adjustSize(-1)}
              disabled={sizeDisabled}
              aria-label={t.tools.sizeDown}
            >
              A−
            </button>
            <button
              type="button"
              className={styles.sizeBtn}
              onClick={() => adjustSize(1)}
              disabled={sizeDisabled}
              aria-label={t.tools.sizeUp}
            >
              A+
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={() => selectedId && deleteEl(selectedId)}
              disabled={!selectedId}
            >
              {t.tools.delete}
            </button>
          </div>

          <div className={[styles.toolGroup, styles.toolGroupEnd].join(" ")}>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={clearAll}
            >
              {t.tools.clear}
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleDownload}
            >
              {t.tools.download}
            </button>
          </div>
        </div>

        <div className={styles.stageWrap}>
          <div
            ref={stageRef}
            className={styles.stage}
            style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
            onPointerDown={onStagePointerDown}
            onPointerMove={onStagePointerMove}
            onPointerUp={onStagePointerUp}
            onPointerCancel={onStagePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MAP_IMAGE}
              alt={t.mapAlt}
              className={styles.stageBg}
              draggable={false}
            />
            {elements.map(renderElement)}
            {hydrated && elements.length === 0 ? (
              <div className={styles.emptyHint}>{t.hint}</div>
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
