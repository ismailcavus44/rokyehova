"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { localeNames, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./LanguageSwitcher.module.css";

type Props = {
  locale: Locale;
  languageLabel: Dictionary["header"]["languageLabel"];
};

export function LanguageSwitcher({ locale, languageLabel }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function hrefFor(target: Locale) {
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={languageLabel}
      >
        <span className={styles.triggerCode}>{locale.toUpperCase()}</span>
        <span className={styles.triggerName}>{localeNames[locale]}</span>
        <span className={styles.chevron} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label={languageLabel}>
          {locales.map((code) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <Link
                href={hrefFor(code)}
                className={code === locale ? styles.active : undefined}
                onClick={() => setOpen(false)}
              >
                <span className={styles.optionCode}>{code.toUpperCase()}</span>
                {localeNames[code]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
