import { Badge } from "@/components/ui/badge";
import type { AnalysisMode } from "@/types";
import { ANALYSIS_MODES } from "@/types";
import { isValidAnalysisMode } from "@/lib/analysis-mode.constants";

const ANALYSIS_MODE_LABELS: Record<AnalysisMode, string> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]: "Gramatyka i ortografia",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "Mowa potoczna",
};

const ANALYSIS_MODE_VARIANTS: Record<AnalysisMode, "default" | "secondary"> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]: "default",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "default",
};

interface AnalysisModeBadgeProps {
  mode: AnalysisMode | string;
  className?: string;
}

export function AnalysisModeBadge({ mode, className }: AnalysisModeBadgeProps) {
  const validMode = isValidAnalysisMode(mode) ? mode : ANALYSIS_MODES.GRAMMAR_AND_SPELLING;
  const label = ANALYSIS_MODE_LABELS[validMode];
  const variant = ANALYSIS_MODE_VARIANTS[validMode];

  return (
    <Badge variant={variant} className={className} data-test-id="analysis-mode-badge">
      {label}
    </Badge>
  );
}

