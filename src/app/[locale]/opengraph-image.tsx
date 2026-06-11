import { createOgImage, OG_SIZE } from "@/lib/og-image";

export const alt = "ROK Math — Rise of Kingdoms Calculators";
export const size = OG_SIZE;
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Image({ params }: Props) {
  const { locale } = await params;
  return createOgImage(locale);
}
