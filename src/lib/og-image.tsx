import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const BRAND_BY_LOCALE: Record<Locale, string> = {
  tr: "ROK Math",
  en: "ROK Math",
  es: "ROK Math",
  ru: "ROK Math",
  vi: "ROK Math",
  "zh-CN": "ROK Math",
  "zh-TW": "ROK Math",
  de: "ROK Math",
  fr: "ROK Math",
};

const TAGLINE = "Rise of Kingdoms Calculators";

let manropeFont: ArrayBuffer | null = null;

async function loadManropeFont(): Promise<ArrayBuffer> {
  if (manropeFont) {
    return manropeFont;
  }

  const file = await readFile(
    join(process.cwd(), "src/assets/fonts/manrope-extrabold.ttf"),
  );
  manropeFont = file.buffer.slice(
    file.byteOffset,
    file.byteOffset + file.byteLength,
  );
  return manropeFont;
}

export function resolveOgLocale(locale?: string): Locale {
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return "en";
}

export async function createOgImage(locale?: string) {
  const resolvedLocale = resolveOgLocale(locale);
  const brand = BRAND_BY_LOCALE[resolvedLocale];
  const fontData = await loadManropeFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0b0b0f",
          backgroundImage:
            "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(245,166,35,0.18) 0%, transparent 65%)",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#f5a623",
              letterSpacing: "-0.03em",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {brand}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#f5f5f7",
              letterSpacing: "-0.02em",
              textAlign: "center",
              opacity: 0.92,
            }}
          >
            {TAGLINE}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 28,
              fontWeight: 800,
              color: "#9a9aa5",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            rokmath.com
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: "Manrope",
          data: fontData,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}

export async function createSiteIcon(size: number) {
  const fontData = await loadManropeFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0b0f",
          borderRadius: size >= 128 ? 36 : 6,
        }}
      >
        <div
          style={{
            fontSize: Math.round(size * 0.52),
            fontWeight: 800,
            color: "#f5a623",
            lineHeight: 1,
          }}
        >
          R
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [
        {
          name: "Manrope",
          data: fontData,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
