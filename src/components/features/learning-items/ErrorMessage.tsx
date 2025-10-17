import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-destructive mb-2">Wystąpił błąd</p>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        <Button onClick={() => window.location.reload()}>Odśwież stronę</Button>
      </CardContent>
    </Card>
  );
}
