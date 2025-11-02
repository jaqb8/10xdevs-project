import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextDiff } from "@/components/shared/TextDiff";
import ReactMarkdown from "react-markdown";
import { ANALYSIS_MODES, type LearningItemViewModel, type AnalysisMode } from "@/types";

const ANALYSIS_MODE_LABELS: Record<AnalysisMode, string> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]: "Gramatyka i ortografia",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "Mowa potoczna",
};

const ANALYSIS_MODE_VARIANTS: Record<AnalysisMode, "default" | "secondary"> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]: "default",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "secondary",
};

function isValidAnalysisMode(mode: string): mode is AnalysisMode {
  return mode === ANALYSIS_MODES.GRAMMAR_AND_SPELLING || mode === ANALYSIS_MODES.COLLOQUIAL_SPEECH;
}

interface LearningItemCardProps {
  item: LearningItemViewModel;
  onDelete: (id: string) => void;
}

export function LearningItemCard({ item, onDelete }: LearningItemCardProps) {
  const mode = isValidAnalysisMode(item.analysis_mode) ? item.analysis_mode : ANALYSIS_MODES.GRAMMAR_AND_SPELLING;
  const modeLabel = ANALYSIS_MODE_LABELS[mode];
  const modeVariant = ANALYSIS_MODE_VARIANTS[mode];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span data-learning-item>Wyrażenie do nauki</span>
          <span className="text-sm font-normal text-muted-foreground">{item.formatted_created_at}</span>
        </CardTitle>
        <div className="pt-2">
          <Badge variant={modeVariant} className="text-xs" data-test-id="analysis-mode-badge">
            {modeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextDiff originalText={item.original_sentence} correctedText={item.corrected_sentence} />
        <div>
          <h4 className="mb-2 text-sm font-semibold px-2">Wyjaśnienie:</h4>
          <div className="text-sm leading-relaxed rounded-md bg-muted p-3">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-outside mb-3 ml-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-outside mb-3 ml-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
              }}
            >
              {item.explanation}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
          Usuń
        </Button>
      </CardFooter>
    </Card>
  );
}
