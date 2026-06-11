import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";

import { Header } from "@/components/Header";

import { SetHtmlLang } from "@/components/SetHtmlLang";

import { RelatedCalculators } from "@/components/ui/RelatedCalculators";

import { SeoContent } from "@/components/ui/SeoContent";

import { StickyResultBar } from "@/components/ui/StickyResultBar";

import { SupportBanner } from "@/components/ui/SupportBanner";

import type { CalculatorSlug } from "@/config/calculators";

import type { Locale } from "@/i18n/config";

import type { CalculatorSeoContent } from "@/i18n/calculator-seo";
import type { Dictionary } from "@/i18n/get-dictionary";
import {
  buildAboutPageSchemaGraph,
  buildCalculatorPageSchemaGraph,
  buildContactPageSchemaGraph,
} from "@/lib/schema";

import { SchemaJsonLd } from "@/components/SchemaJsonLd";

import styles from "./PageShell.module.css";

type StaticPageSchema =
  | {
      kind: "about";
      metaDescription: string;
      personDescription: string;
    }
  | {
      kind: "contact";
      metaDescription: string;
    };

type Props = {
  locale: Locale;
  header: Dictionary["header"];
  home: Dictionary["home"];
  support: Dictionary["support"];
  title: string;
  subtitle?: string;
  currentSlug?: CalculatorSlug;
  stickyResults?: ReactNode;
  staticPageSchema?: StaticPageSchema;
  seoContent?: CalculatorSeoContent;
  /** Full-width content (e.g. AOO planner). Skips narrow 720px column. */
  wide?: boolean;
  /** Hide related calculators footer block. */
  showRelated?: boolean;
  children: ReactNode;
};



export function PageShell({

  locale,

  header,

  home,

  support,

  title,

  subtitle,

  currentSlug,

  stickyResults,
  staticPageSchema,
  seoContent,
  wide = false,
  showRelated = true,
  children,
}: Props) {
  const hasSticky = Boolean(stickyResults);
  const relatedSlug = showRelated ? currentSlug : undefined;

  const schemaGraph = currentSlug
    ? buildCalculatorPageSchemaGraph({
        locale,
        siteName: header.brand,
        slug: currentSlug,
        pageTitle: title,
        pageDescription: subtitle ?? "",
        seoFaq: seoContent?.faq,
      })
    : staticPageSchema?.kind === "about"
      ? buildAboutPageSchemaGraph({
          locale,
          siteName: header.brand,
          pageTitle: title,
          metaDescription: staticPageSchema.metaDescription,
          personDescription: staticPageSchema.personDescription,
        })
      : staticPageSchema?.kind === "contact"
        ? buildContactPageSchemaGraph({
            locale,
            siteName: header.brand,
            pageTitle: title,
            metaDescription: staticPageSchema.metaDescription,
          })
        : null;

  return (
    <>
      {schemaGraph ? <SchemaJsonLd graph={schemaGraph} /> : null}
      <SetHtmlLang locale={locale} />

      <div className={styles.shell}>

        <Header locale={locale} header={header} home={home} />



        <div

          className={[

            styles.content,

            wide ? styles.contentWide : "",

            hasSticky ? styles.withSticky : "",

          ]

            .filter(Boolean)

            .join(" ")}

        >

          <div className={styles.bannerRow}>

            <SupportBanner text={support.text} button={support.button} />

          </div>



          <div className={styles.layout}>

            <div

              className={[

                styles.mainColumn,

                wide ? styles.mainColumnWide : "",

              ]

                .filter(Boolean)

                .join(" ")}

            >

              <header

                className={[

                  styles.pageHeader,

                  wide ? styles.pageHeaderWide : "",

                ]

                  .filter(Boolean)

                  .join(" ")}

              >

                <h1 className={styles.pageTitle}>{title}</h1>

                {subtitle ? (

                  <p className={styles.pageSubtitle}>{subtitle}</p>

                ) : null}

              </header>



              <div className={styles.main}>{children}</div>



              {relatedSlug ? (
                <>
                  <SeoContent content={seoContent} />

                  <RelatedCalculators
                    current={relatedSlug}
                    locale={locale}
                    home={home}
                  />
                </>
              ) : null}

            </div>

          </div>

        </div>



        <Footer brand={header.brand} withStickyBar={hasSticky} />



        {stickyResults ? (

          <StickyResultBar aria-label="Özet sonuç">{stickyResults}</StickyResultBar>

        ) : null}

      </div>

    </>

  );

}


