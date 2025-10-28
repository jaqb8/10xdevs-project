import { useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { AnalysisModeSelector } from "./AnalysisModeSelector";

interface AnalysisFormProps {
  text: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
  isAnalyzing: boolean;
  maxLength: number;
}

export function AnalysisForm({
  text,
  onTextChange,
  onSubmit,
  onClear,
  isLoading,
  isAnalyzing,
  maxLength,
}: AnalysisFormProps) {
  const isOverLimit = text.length > maxLength;
  const isDisabled = isLoading || text.trim().length === 0 || isOverLimit;
  const isClearDisabled = isLoading || text.trim().length === 0;

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onTextChange(e.target.value);
    },
    [onTextChange]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isDisabled) {
        onSubmit();
      }
    },
    [isDisabled, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formularz analizy tekstu">
      <div className="space-y-2">
        <label htmlFor="text-input" className="block text-md font-semibold">
          Wprowadź tekst do analizy
        </label>
        <Textarea
          id="text-input"
          value={text}
          onChange={handleTextChange}
          placeholder="Wpisz tutaj swój tekst w języku angielskim..."
          disabled={isAnalyzing}
          rows={8}
          className="text-lg md:text-lg"
          aria-describedby="char-count char-count-helper"
          aria-invalid={isOverLimit}
          aria-required="true"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          data-test-id="analysis-text-input"
        />
        <div className="flex items-center justify-between gap-2">
          <p id="char-count-helper" className="text-muted-foreground text-xs">
            {isOverLimit && "Przekroczono limit znaków. "}
            {text.trim().length === 0 && text.length === 0 && "Pole nie może być puste."}
          </p>
          <p
            id="char-count"
            className={`text-sm font-medium tabular-nums ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}
            aria-live="polite"
            role="status"
          >
            {text.length} / {maxLength}
          </p>
        </div>
        <AnalysisModeSelector />
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          disabled={isDisabled}
          className="w-full text-lg"
          aria-busy={isAnalyzing}
          size="lg"
          data-test-id="analysis-submit-button"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Analizuję...
            </>
          ) : (
            <>
              <Brain className="size-4" /> Analizuj tekst
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onClear}
          disabled={isClearDisabled}
          variant="outline"
          className="w-full text-lg"
          size="lg"
          aria-label="Wyczyść formularz i zacznij od nowa"
          data-test-id="analysis-clear-button"
        >
          Wyczyść
        </Button>
      </div>
    </form>
  );
}
