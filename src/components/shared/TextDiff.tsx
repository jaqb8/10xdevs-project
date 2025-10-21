import { useMemo } from "react";
import DiffMatchPatch from "diff-match-patch";

interface TextDiffProps {
  originalText: string;
  correctedText: string;
}

export function TextDiff({ originalText, correctedText }: TextDiffProps) {
  const diffs = useMemo(() => {
    const dmp = new DiffMatchPatch();
    return dmp.diff_main(originalText, correctedText);
  }, [originalText, correctedText]);

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
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Poprawiony tekst:</h4>
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
        </div>
      </div>
    </div>
  );
}
