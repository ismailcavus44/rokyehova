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

const MOBILE_NAV_CATEGORIES = NAV_CATEGORIES.filter(
  (category) => category.id !== "team",
);

function ToolsMenu({
  locale,
  home,
  onNavigate,
  mobile = false,
}: {
  locale: Locale;
  home: Dictionary["home"];
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const categories = mobile ? MOBILE_NAV_CATEGORIES : NAV_CATEGORIES;

  return (
    <div
      className={mobile ? styles.mobileCategoryGrid : styles.toolsMenu}
    >
      {categories.map((category) => (
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
    const mq = window.matchMedia("(min-width: 1024px)");
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
    if (!menuOpen) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      style.overflow = prev.overflow;
      document.documentElement.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 1023) {
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
                      <ToolsMenu locale={locale} home={home} />
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

      {menuOpen ? (
        <div
          id="mobile-nav"
          className={styles.mobileOverlay}
          aria-hidden={false}
        >
          <nav className={styles.mobilePanel} aria-label="Main">
            <Link
              href={`/${locale}/aoo-planner`}
              className={styles.mobileAooCard}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.mobileAooBadge}>{header.newBadge}</span>
              <span className={styles.mobileAooTitle}>
                {home.items["aoo-planner"].title}
              </span>
            </Link>
            <p className={styles.mobileToolsLabel}>{header.toolsLabel}</p>
            <ToolsMenu
              locale={locale}
              home={home}
              mobile
              onNavigate={() => setMenuOpen(false)}
            />
            <div className={styles.mobileFooterLinks}>
              <Link
                href={`/${locale}/about`}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
              >
                {header.aboutLabel}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
              >
                {header.contactLabel}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
