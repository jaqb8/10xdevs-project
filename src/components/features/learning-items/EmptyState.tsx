import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground mb-2">Brak elementów do nauki</p>
        <p className="text-sm text-muted-foreground mb-4">
          Przeanalizuj swoje teksty, aby dodać nowe elementy do listy
        </p>
        <Button asChild>
          <a href="/">Przejdź do analizy tekstu</a>
        </Button>
      </CardContent>
    </Card>
  );
}
