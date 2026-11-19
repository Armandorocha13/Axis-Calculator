"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { AtelierSettingsModal } from "./atelier-settings-modal";
import type { Profile } from "@/lib/types/database.types";

interface AtelierSettingsContextValue {
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const AtelierSettingsContext = createContext<AtelierSettingsContextValue>({
  isOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
});

export function useAtelierSettings() {
  return useContext(AtelierSettingsContext);
}

export function AtelierSettingsProvider({
  children,
  profile,
}: {
  children: ReactNode;
  profile?: Profile | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AtelierSettingsContext.Provider
      value={{
        isOpen,
        openSettings: () => setIsOpen(true),
        closeSettings: () => setIsOpen(false),
      }}
    >
      {children}
      <AtelierSettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        profile={profile}
      />
    </AtelierSettingsContext.Provider>
  );
}
