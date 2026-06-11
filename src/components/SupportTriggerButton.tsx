"use client";

import type { ReactNode } from "react";

import { useSupportModal } from "@/components/SupportModalProvider";

type Props = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function SupportTriggerButton({
  children,
  className,
  ariaLabel,
}: Props) {
  const { openSupportModal } = useSupportModal();

  return (
    <button
      type="button"
      className={className}
      onClick={openSupportModal}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
