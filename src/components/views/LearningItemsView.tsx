import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLearningItems } from "@/lib/hooks/useLearningItems";
import { LearningItemsList } from "@/components/features/learning-items/LearningItemsList";
import { PaginationControls } from "@/components/features/learning-items/PaginationControls";
import { DeleteConfirmationDialog } from "@/components/features/learning-items/DeleteConfirmationDialog";
import { LoadingSkeleton } from "@/components/features/learning-items/LoadingSkeleton";
import { ErrorMessage } from "@/components/features/learning-items/ErrorMessage";
import type { LearningItemDto, PaginatedResponseDto } from "@/types";

interface LearningItemsViewProps {
  initialData?: PaginatedResponseDto<LearningItemDto> | null;
  initialLoadError?: boolean;
}

const INITIAL_LOAD_ERROR_MESSAGE = "Nie udało się załadować listy. Spróbuj odświeżyć stronę.";

export function LearningItemsView({ initialData, initialLoadError }: LearningItemsViewProps) {
  const hasShownInitialErrorToast = useRef(false);
  const {
    viewModels,
    paginationViewModel,
    isLoading,
    error,
    isDeleting,
    isDeleteDialogOpen,
    setPage,
    deleteItem,
    confirmDelete,
    cancelDelete,
  } = useLearningItems({ initialData, initialLoadError });

  useEffect(() => {
    if (initialLoadError && !hasShownInitialErrorToast.current) {
      hasShownInitialErrorToast.current = true;
      toast.error(INITIAL_LOAD_ERROR_MESSAGE);
    }
  }, [initialLoadError]);

  useEffect(() => {
    if (error && !initialLoadError) {
      toast.error(error);
    }
  }, [error, initialLoadError]);

  const handleDeleteItem = (id: string) => {
    const item = viewModels.find((vm) => vm.id === id);
    if (item) {
      deleteItem(item);
    }
  };

  const handleConfirmDelete = async () => {
    await confirmDelete();
    toast.success("Element został usunięty");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Lista wyrażeń do nauki</h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if ((error || initialLoadError) && !viewModels.length) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Lista wyrażeń do nauki</h1>
        <ErrorMessage message={error || INITIAL_LOAD_ERROR_MESSAGE} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Lista wyrażeń do nauki</h1>

      <LearningItemsList items={viewModels} onDeleteItem={handleDeleteItem} />

      {paginationViewModel && viewModels.length > 0 && (
        <PaginationControls pagination={paginationViewModel} onPageChange={setPage} />
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        isPending={isDeleting}
        onCancel={cancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
