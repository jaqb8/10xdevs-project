import { useEffect } from "react";
import { toast } from "sonner";
import { useLearningItems } from "@/lib/hooks/useLearningItems";
import { LearningItemsList } from "@/components/features/learning-items/LearningItemsList";
import { PaginationControls } from "@/components/features/learning-items/PaginationControls";
import { DeleteConfirmationDialog } from "@/components/features/learning-items/DeleteConfirmationDialog";
import { LoadingSkeleton } from "@/components/features/learning-items/LoadingSkeleton";
import { ErrorMessage } from "@/components/features/learning-items/ErrorMessage";

export function LearningItemsView() {
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
  } = useLearningItems();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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
        <h1 className="text-3xl font-bold mb-8">Moje elementy do nauki</h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !viewModels.length) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Moje elementy do nauki</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Moje elementy do nauki</h1>

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
