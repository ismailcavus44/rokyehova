"use client";

import { X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { SupportGoalBar } from "@/components/SupportGoalBar";
import { SUPPORT_USDT_ADDRESS } from "@/config/support";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./SupportModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  support: Dictionary["support"];
};

function CopyField({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [value]);

  return (
    <div className={styles.copyRow}>
      <span className={styles.copyValue}>{value}</span>
      <button
        type="button"
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}

export function SupportModal({ open, onClose, support }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-goal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={support.close}
        >
          <X size={16} aria-hidden />
        </button>

        <SupportGoalBar goal={support.goal} />

        <section aria-labelledby={titleId}>
          <h2 id={titleId} className={styles.donateTitle}>
            {support.usdtLabel}
          </h2>
          <div className={styles.qrWrap}>
            <div className={styles.qrFrame}>
              <QRCodeCanvas
                value={SUPPORT_USDT_ADDRESS}
                size={168}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
                marginSize={2}
                aria-label={SUPPORT_USDT_ADDRESS}
              />
            </div>
          </div>
          <CopyField
            value={SUPPORT_USDT_ADDRESS}
            copyLabel={support.copy}
            copiedLabel={support.copied}
          />
          <p className={styles.warning}>{support.networkWarning}</p>
        </section>
      </div>
    </div>
  );
}
