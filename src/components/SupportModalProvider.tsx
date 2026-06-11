"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Dictionary } from "@/i18n/get-dictionary";

const SupportModal = dynamic(
  () =>
    import("@/components/SupportModal").then((mod) => ({
      default: mod.SupportModal,
    })),
  { ssr: false },
);

type SupportStrings = Dictionary["support"];

type ContextValue = {
  openSupportModal: () => void;
};

const SupportModalContext = createContext<ContextValue | null>(null);

export function SupportModalProvider({
  support,
  children,
}: {
  support: SupportStrings;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openSupportModal = useCallback(() => setOpen(true), []);
  const closeSupportModal = useCallback(() => setOpen(false), []);

  return (
    <SupportModalContext.Provider value={{ openSupportModal }}>
      {children}
      {open ? (
        <SupportModal
          open={open}
          onClose={closeSupportModal}
          support={support}
        />
      ) : null}
    </SupportModalContext.Provider>
  );
}

export function useSupportModal(): ContextValue {
  const ctx = useContext(SupportModalContext);
  if (!ctx) {
    throw new Error("useSupportModal must be used within SupportModalProvider");
  }
  return ctx;
}
