"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Header.module.css";

type Props = {
  locale: Locale;
  header: Dictionary["header"];
};

export function Header({ locale, header }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={`/${locale}`} className={styles.brand}>
          {header.brand}
        </Link>

        <nav className={styles.desktopNav} aria-label="Main">
          <ul>
            {header.menu.map((item) => (
              <li key={item.label}>
                <a href="#" className={styles.demoLink} tabIndex={-1}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher
            locale={locale}
            languageLabel={header.languageLabel}
          />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? header.closeMenu : header.openMenu}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={styles.menuIcon} data-open={menuOpen} />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`${styles.mobileOverlay} ${menuOpen ? styles.mobileOverlayOpen : ""}`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      >
        <nav
          className={styles.mobilePanel}
          aria-label="Main"
          onClick={(e) => e.stopPropagation()}
        >
          <ul>
            {header.menu.map((item) => (
              <li key={item.label}>
                <a href="#" className={styles.demoLink} tabIndex={-1}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
