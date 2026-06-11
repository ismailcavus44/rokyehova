import { createOgImage } from "@/lib/og-image";

export const alt = "ROK Math — Rise of Kingdoms Calculators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return createOgImage("en");
}
