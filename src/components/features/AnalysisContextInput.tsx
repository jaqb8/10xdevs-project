import { useState, useCallback } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Info, ChevronDown } from "lucide-react";

interface AnalysisContextInputProps {
  analysisContext: string;
  onAnalysisContextChange: (analysisContext: string) => void;
  maxLength: number;
  disabled?: boolean;
}

export function AnalysisContextInput({
  analysisContext,
  onAnalysisContextChange,
  maxLength,
  disabled = false,
}: AnalysisContextInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isOverLimit = analysisContext.length > maxLength;

  const handleContextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onAnalysisContextChange(e.target.value);
    },
    [onAnalysisContextChange]
  );

  const handleClear = useCallback(() => {
    onAnalysisContextChange("");
  }, [onAnalysisContextChange]);

  const hasContext = analysisContext.trim().length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md">
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex w-full items-center justify-between px-4 py-3 font-normal hover:bg-transparent h-auto"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls="analysis-context-content"
        >
          <span className="text-sm font-medium">Kontekst (opcjonalne)</span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        id="analysis-context-content"
        className="space-y-2 px-4 pb-4 pt-2 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden"
      >
        <div className="flex items-center gap-1">
          <Info className="size-3 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Podaj dodatkowe informacje o kontekście zdania, np. do kogo piszesz, w jakiej sytuacji. AI uwzględni te
            informacje podczas analizy.
          </p>
        </div>
        <Textarea
          id="analysis-context-input"
          value={analysisContext}
          onChange={handleContextChange}
          placeholder="Piszę email do mojego szefa..."
          disabled={disabled}
          rows={4}
          className="text-base"
          aria-describedby="context-char-count context-char-count-helper"
          aria-invalid={isOverLimit}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          data-test-id="analysis-context-input"
        />
        <div className="flex items-center justify-between gap-2">
          <p id="context-char-count-helper" className="text-destructive text-xs">
            {isOverLimit && "Przekroczono limit znaków. "}
          </p>
          <div className="flex items-center gap-2">
            {hasContext && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={disabled}
                className="h-6"
                aria-label="Wyczyść kontekst"
                data-test-id="clear-context-button"
              >
                Wyczyść
              </Button>
            )}
            <p
              id="context-char-count"
              className={`text-sm font-medium tabular-nums ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}
              aria-live="polite"
              role="status"
            >
              {analysisContext.length} / {maxLength}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
