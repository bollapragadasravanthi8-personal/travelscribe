"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { generateTripStory } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AiStorySectionProps = {
  tripId: string;
  story: string | null;
  hasContent: boolean;
};

type AiStoryActionState = {
  success?: boolean;
  error?: string;
  story?: string;
};

const initialState: AiStoryActionState = {};

export function AiStorySection({ tripId, story, hasContent }: AiStorySectionProps) {
  const [displayStory, setDisplayStory] = useState(story ?? "");
  const [state, formAction, pending] = useActionState(
    generateTripStory,
    initialState,
  );

  useEffect(() => {
    setDisplayStory(story ?? "");
  }, [story]);

  useEffect(() => {
    if (state.story) {
      setDisplayStory(state.story);
    }
  }, [state.story]);

  return (
    <div className="space-y-4">
      {displayStory ? (
        <Textarea
          readOnly
          value={displayStory}
          rows={8}
          className="min-h-40 resize-none bg-muted/30"
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          {hasContent
            ? "Generate an AI narrative from your trip notes, photos, and expenses."
            : "Add travel days with content before generating a story."}
        </p>
      )}

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <form action={formAction}>
        <input type="hidden" name="tripId" value={tripId} />
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
              {displayStory ? "Regenerate story" : "Generate story"}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
