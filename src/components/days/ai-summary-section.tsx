"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { generateDaySummary } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AiSummarySectionProps = {
  tripId: string;
  dayId: string;
  summary: string | null;
  hasContent: boolean;
};

type AiSummaryActionState = {
  success?: boolean;
  error?: string;
  summary?: string;
};

const initialState: AiSummaryActionState = {};

export function AiSummarySection({
  tripId,
  dayId,
  summary,
  hasContent,
}: AiSummarySectionProps) {
  const [displaySummary, setDisplaySummary] = useState(summary ?? "");
  const [state, formAction, pending] = useActionState(
    generateDaySummary,
    initialState,
  );

  useEffect(() => {
    setDisplaySummary(summary ?? "");
  }, [summary]);

  useEffect(() => {
    if (state.summary) {
      setDisplaySummary(state.summary);
    }
  }, [state.summary]);

  return (
    <div className="space-y-4">
      {displaySummary ? (
        <Textarea
          readOnly
          value={displaySummary}
          rows={6}
          className="min-h-32 resize-none bg-muted/30"
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          {hasContent
            ? "Generate an AI recap from this day's memos, photos, and expenses."
            : "Add memos, photos, or expenses before generating a summary."}
        </p>
      )}

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <form action={formAction}>
        <input type="hidden" name="tripId" value={tripId} />
        <input type="hidden" name="dayId" value={dayId} />
        <Button
          type="submit"
          className="h-11 w-full sm:w-auto"
          disabled={pending || !hasContent}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              {displaySummary ? "Regenerate summary" : "Generate summary"}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
