"use client";

import * as React from "react";

export type QuickAddMode = "memo" | "expense" | "photo";

export type QuickAddContext = {
  tripId?: string;
  dayId?: string;
};

type FabAction = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
};

type MobileAppContextValue = {
  isQuickAddOpen: boolean;
  quickAddMode: QuickAddMode;
  quickAddContext: QuickAddContext;
  openQuickAdd: (mode: QuickAddMode, context?: QuickAddContext) => void;
  closeQuickAdd: () => void;
  /** Opens the memo quick-add flow (bottom nav Add Entry tab). */
  openAddEntrySheet: () => void;
  isFabSheetOpen: boolean;
  fabActions: FabAction[];
  openFabSheet: (actions: FabAction[]) => void;
  closeFabSheet: () => void;
};

const MobileAppContext = React.createContext<MobileAppContextValue | null>(
  null,
);

export function useMobileApp() {
  const context = React.useContext(MobileAppContext);
  if (!context) {
    throw new Error("useMobileApp must be used within MobileAppProvider");
  }
  return context;
}

type MobileAppProviderProps = {
  children: React.ReactNode;
};

export function MobileAppProvider({ children }: MobileAppProviderProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);
  const [quickAddMode, setQuickAddMode] = React.useState<QuickAddMode>("memo");
  const [quickAddContext, setQuickAddContext] = React.useState<QuickAddContext>(
    {},
  );
  const [isFabSheetOpen, setIsFabSheetOpen] = React.useState(false);
  const [fabActions, setFabActions] = React.useState<FabAction[]>([]);

  const value = React.useMemo<MobileAppContextValue>(
    () => ({
      isQuickAddOpen,
      quickAddMode,
      quickAddContext,
      openQuickAdd: (mode, context = {}) => {
        setQuickAddMode(mode);
        setQuickAddContext(context);
        setIsQuickAddOpen(true);
      },
      closeQuickAdd: () => {
        setIsQuickAddOpen(false);
        setQuickAddContext({});
      },
      openAddEntrySheet: () => {
        setQuickAddMode("memo");
        setQuickAddContext({});
        setIsQuickAddOpen(true);
      },
      isFabSheetOpen,
      fabActions,
      openFabSheet: (actions) => {
        setFabActions(actions);
        setIsFabSheetOpen(true);
      },
      closeFabSheet: () => {
        setIsFabSheetOpen(false);
        setFabActions([]);
      },
    }),
    [isQuickAddOpen, quickAddMode, quickAddContext, isFabSheetOpen, fabActions],
  );

  return (
    <MobileAppContext.Provider value={value}>{children}</MobileAppContext.Provider>
  );
}

export type { FabAction };
