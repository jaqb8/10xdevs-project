import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TextDiff } from "@/components/shared/TextDiff";
import type { LearningItemViewModel } from "@/types";

interface LearningItemCardProps {
  item: LearningItemViewModel;
  onDelete: (id: string) => void;
}

export function LearningItemCard({ item, onDelete }: LearningItemCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span data-learning-item>Element do nauki</span>
          <span className="text-sm font-normal text-muted-foreground">{item.formatted_created_at}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextDiff originalText={item.original_sentence} correctedText={item.corrected_sentence} />
        <div>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Wyjaśnienie:</h4>
          <p className="text-sm leading-relaxed">{item.explanation}</p>
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
