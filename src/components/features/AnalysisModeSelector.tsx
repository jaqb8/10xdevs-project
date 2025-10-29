import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ANALYSIS_MODES, type AnalysisMode } from "@/types";
import { useAnalysisModeStore } from "@/lib/stores/analysis-mode.store";
import { Info } from "lucide-react";

const ANALYSIS_MODE_LABELS: Record<AnalysisMode, string> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]: "Gramatyka i ortografia",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "Mowa potoczna",
};

const ANALYSIS_MODE_DESCRIPTIONS: Record<AnalysisMode, string> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]:
    "Twój tekst zostanie sprawdzony pod kątem błędów gramatycznych i ortograficznych.",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "Twój tekst zostanie sprawdzony pod kątem naturalności i stylu potocznego.",
};

export function AnalysisModeSelector() {
  const mode = useAnalysisModeStore((state) => state.mode);
  const setMode = useAnalysisModeStore((state) => state.setMode);

  const handleValueChange = (value: string) => {
    if (value === ANALYSIS_MODES.GRAMMAR_AND_SPELLING || value === ANALYSIS_MODES.COLLOQUIAL_SPEECH) {
      setMode(value as AnalysisMode);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="analysis-mode" className="block text-sm font-medium">
        Tryb analizy
      </label>
      <div className="flex items-center gap-1">
        <Info size={14} />
        <p className="text-xs text-muted-foreground animate-in fade-in duration-300">
          {ANALYSIS_MODE_DESCRIPTIONS[mode]}
        </p>
      </div>
      <Select value={mode} onValueChange={handleValueChange}>
        <SelectTrigger size="md" id="analysis-mode" className="w-full text-base" data-test-id="analysis-mode-selector">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANALYSIS_MODES.GRAMMAR_AND_SPELLING} data-test-id="mode-grammar" className="text-base">
            {ANALYSIS_MODE_LABELS[ANALYSIS_MODES.GRAMMAR_AND_SPELLING]}
          </SelectItem>
          <SelectItem value={ANALYSIS_MODES.COLLOQUIAL_SPEECH} data-test-id="mode-colloquial" className="text-base">
            {ANALYSIS_MODE_LABELS[ANALYSIS_MODES.COLLOQUIAL_SPEECH]}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
