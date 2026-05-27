import { notFound } from "next/navigation";
import { ApCalculator } from "@/components/ApCalculator";
import { Header } from "@/components/Header";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <SetHtmlLang locale={locale as Locale} />
      <Header locale={locale as Locale} header={dict.header} />
      <main className="page">
        <ApCalculator dict={dict} locale={locale as Locale} />
      </main>
    </>
  );
}
