"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { NAV_CATEGORIES } from "@/config/nav";
import { LOGO_HEIGHT, LOGO_PATH, LOGO_WIDTH } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Header.module.css";

type Props = {
  locale: Locale;
  header: Dictionary["header"];
  home: Dictionary["home"];
};

function ToolsMenu({
  locale,
  header,
  home,
  onNavigate,
}: {
  locale: Locale;
  header: Dictionary["header"];
  home: Dictionary["home"];
  onNavigate?: () => void;
}) {
  return (
    <div className={styles.toolsMenu}>
      {NAV_CATEGORIES.map((category) => (
        <div key={category.id} className={styles.toolsGroup}>
          <p className={styles.toolsGroupTitle}>
            {home.categories[category.id]}
          </p>
          <ul className={styles.toolsList}>
            {category.slugs.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/${locale}/${slug}`}
                  className={styles.toolsLink}
                  onClick={onNavigate}
                >
                  {home.items[slug].title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const HOVER_CLOSE_DELAY_MS = 175;

function useIsDesktopNav() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function Header({ locale, header, home }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDesktopNav = useIsDesktopNav();

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openTools() {
    clearCloseTimer();
    setToolsOpen(true);
  }

  function scheduleCloseTools() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setToolsOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_DELAY_MS);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
        setToolsOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={`/${locale}`} className={styles.brand}>
          <Image
            src={LOGO_PATH}
            alt={header.brand}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className={styles.brandLogo}
            priority
          />
        </Link>

        <nav className={styles.desktopNav} aria-label="Main">
          <ul className={styles.navList}>
            <li>
              <div
                className={styles.toolsDropdown}
                ref={toolsRef}
                onMouseEnter={() => {
                  if (isDesktopNav) openTools();
                }}
                onMouseLeave={() => {
                  if (isDesktopNav) scheduleCloseTools();
                }}
                onBlur={(e) => {
                  if (!isDesktopNav) return;
                  const next = e.relatedTarget as Node | null;
                  if (!toolsRef.current?.contains(next)) {
                    scheduleCloseTools();
                  }
                }}
              >
                <button
                  type="button"
                  className={styles.toolsTrigger}
                  aria-expanded={toolsOpen}
                  aria-haspopup="true"
                  onClick={() => {
                    if (!isDesktopNav) {
                      setToolsOpen((v) => !v);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setToolsOpen((v) => !v);
                    }
                    if (e.key === "Escape") {
                      setToolsOpen(false);
                    }
                  }}
                >
                  {header.toolsLabel}
                  <ChevronDown
                    className={styles.toolsChevron}
                    data-open={toolsOpen}
                    aria-hidden
                  />
                </button>
                {toolsOpen ? (
                  <div className={styles.toolsPanel}>
                    <div className={styles.toolsPanelSurface}>
                      <ToolsMenu locale={locale} header={header} home={home} />
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
            <li>
              <Link href={`/${locale}/aoo-planner`} className={styles.navLink}>
                {home.items["aoo-planner"].title}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/about`} className={styles.navLink}>
                {header.aboutLabel}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`} className={styles.navLink}>
                {header.contactLabel}
              </Link>
            </li>
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
          <p className={styles.mobileToolsLabel}>{header.toolsLabel}</p>
          <ToolsMenu
            locale={locale}
            header={header}
            home={home}
            onNavigate={() => setMenuOpen(false)}
          />
          <ul className={styles.mobileNavLinks}>
            <li>
              <Link
                href={`/${locale}/aoo-planner`}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
              >
                {home.items["aoo-planner"].title}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/about`}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
              >
                {header.aboutLabel}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/contact`}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
              >
                {header.contactLabel}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
