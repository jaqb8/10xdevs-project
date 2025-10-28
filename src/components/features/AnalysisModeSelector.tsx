import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ANALYSIS_MODES, type AnalysisMode } from "@/types";
import { useAnalysisModeStore } from "@/lib/stores/analysis-mode.store";

const ANALYSIS_MODE_LABELS: Record<AnalysisMode, string> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]: "Gramatyka i ortografia",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "Mowa potoczna",
};

export function AnalysisModeSelector() {
  const mode = useAnalysisModeStore((state) => state.mode);
  const setMode = useAnalysisModeStore((state) => state.setMode);

  return (
    <div className="space-y-2">
      <label htmlFor="analysis-mode" className="block text-sm font-medium">
        Tryb analizy
      </label>
      <Select value={mode} onValueChange={(value) => setMode(value as AnalysisMode)}>
        <SelectTrigger id="analysis-mode" className="w-full" data-test-id="analysis-mode-selector">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANALYSIS_MODES.GRAMMAR_AND_SPELLING} data-test-id="mode-grammar">
            {ANALYSIS_MODE_LABELS[ANALYSIS_MODES.GRAMMAR_AND_SPELLING]}
          </SelectItem>
          <SelectItem value={ANALYSIS_MODES.COLLOQUIAL_SPEECH} data-test-id="mode-colloquial">
            {ANALYSIS_MODE_LABELS[ANALYSIS_MODES.COLLOQUIAL_SPEECH]}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
