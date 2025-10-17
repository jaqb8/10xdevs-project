import { Button } from "@/components/ui/button";
import type { PaginationViewModel } from "@/types";

interface PaginationControlsProps {
  pagination: PaginationViewModel;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={!pagination.hasPreviousPage}
      >
        Poprzednia
      </Button>

      <span className="text-sm text-muted-foreground">
        Strona {pagination.page} z {pagination.totalPages}
      </span>

      <Button variant="outline" onClick={() => onPageChange(pagination.page + 1)} disabled={!pagination.hasNextPage}>
        Następna
      </Button>
    </div>
  );
}
