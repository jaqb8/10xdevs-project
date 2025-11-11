import { useCallback, useMemo, useState } from "react";
import DiffMatchPatch from "diff-match-patch";
import { Copy, Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TextDiffProps {
  originalText: string;
  correctedText: string;
  translation: string | null;
}

export function TextDiff({ originalText, correctedText, translation }: TextDiffProps) {
  const [copied, setCopied] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const diffs = useMemo(() => {
    const dmp = new DiffMatchPatch();
    return dmp.diff_main(originalText, correctedText);
  }, [originalText, correctedText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(correctedText);
      setCopied(true);
      toast.success("Skopiowano do schowka!");
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Nie udało się skopiować tekstu");
    }
  }, [correctedText]);

  return (
    <div
      className="rounded-md bg-muted p-4"
      role="region"
      aria-label="Porównanie tekstu oryginalnego z poprawionym"
      data-test-id="text-diff-container"
    >
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Oryginalny tekst:</h4>
          <div
            className="text-sm leading-relaxed"
            aria-label="Tekst oryginalny z zaznaczonymi błędami"
            data-test-id="text-diff-original"
          >
            {diffs.map((diff, index) => {
              const [operation, text] = diff;

              if (operation === -1) {
                return (
                  <span
                    key={index}
                    className="bg-red-100 text-red-900 line-through dark:bg-red-950/50 dark:text-red-200"
                    role="deletion"
                    aria-label={`Usunięto: ${text}`}
                  >
                    {text}
                  </span>
                );
              }

              if (operation === 0) {
                return <span key={index}>{text}</span>;
              }

              return null;
            })}
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-muted-foreground">Poprawiony tekst:</h4>
            <div className="flex items-center gap-2">
              {translation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranslation((prev) => !prev)}
                  className={cn("h-7 text-xs sm:px-2 px-1", showTranslation && "bg-accent text-accent-foreground")}
                  aria-label={showTranslation ? "Ukryj tłumaczenie" : "Pokaż tłumaczenie"}
                  data-test-id="toggle-translation-button"
                >
                  <Languages className="size-3.5 sm:mr-1" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {showTranslation ? "Ukryj tłumaczenie" : "Pokaż tłumaczenie"}
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-7 w-7"
                aria-label="Kopiuj poprawiony tekst do schowka"
                data-test-id="copy-corrected-text-button"
              >
                {copied ? (
                  <Check className="size-3.5 text-green-600 dark:text-green-500" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
          <div
            className="text-sm leading-relaxed"
            aria-label="Tekst poprawiony z zaznaczonymi zmianami"
            data-test-id="text-diff-corrected"
          >
            {diffs.map((diff, index) => {
              const [operation, text] = diff;

              if (operation === 1) {
                return (
                  <span
                    key={index}
                    className="bg-green-100 text-green-900 dark:bg-green-950/50 dark:text-green-200"
                    role="insertion"
                    aria-label={`Dodano: ${text}`}
                  >
                    {text}
                  </span>
                );
              }

              if (operation === 0) {
                return <span key={index}>{text}</span>;
              }

              return null;
            })}
          </div>
          {translation && showTranslation && (
            <div
              className="text-sm font-thin leading-relaxed text-foreground/80 italic"
              data-test-id="text-diff-translation"
            >
              {translation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
