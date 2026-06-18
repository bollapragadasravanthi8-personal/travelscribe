"use client";

import * as React from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    const dismissedKey = "travelscribe-install-dismissed";
    if (localStorage.getItem(dismissedKey) === "1") {
      setDismissed(true);
    }

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (dismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 rounded-xl border bg-card p-4 shadow-lg md:bottom-4 md:left-auto md:max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Download className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install TravelScribe</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add to your home screen for quick access while traveling.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              className="h-9"
              onClick={async () => {
                await deferredPrompt.prompt();
                setDeferredPrompt(null);
              }}
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9"
              onClick={() => {
                localStorage.setItem("travelscribe-install-dismissed", "1");
                setDismissed(true);
              }}
            >
              Not now
            </Button>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            localStorage.setItem("travelscribe-install-dismissed", "1");
            setDismissed(true);
          }}
          aria-label="Dismiss install prompt"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
