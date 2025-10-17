import { useState, useEffect, useCallback } from "react";
import type { LearningItemDto, LearningItemViewModel, PaginatedResponseDto, PaginationViewModel } from "@/types";

const PAGE_SIZE = 10;

interface UseLearningItemsReturn {
  viewModels: LearningItemViewModel[];
  paginationViewModel: PaginationViewModel | null;
  isLoading: boolean;
  error: string | null;
  isDeleting: boolean;
  isDeleteDialogOpen: boolean;
  setPage: (page: number) => void;
  deleteItem: (item: LearningItemDto) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function mapToViewModel(item: LearningItemDto): LearningItemViewModel {
  return {
    ...item,
    formatted_created_at: formatDate(item.created_at),
  };
}

function mapToPaginationViewModel(
  pagination: PaginatedResponseDto<LearningItemDto>["pagination"]
): PaginationViewModel {
  return {
    ...pagination,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPreviousPage: pagination.page > 1,
  };
}

export function useLearningItems(): UseLearningItemsReturn {
  const [data, setData] = useState<PaginatedResponseDto<LearningItemDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<LearningItemDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/learning-items?page=${currentPage}&pageSize=${PAGE_SIZE}`);

      if (!response.ok) {
        throw new Error("Nie udało się pobrać listy elementów");
      }

      const result: PaginatedResponseDto<LearningItemDto> = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(page);
  }, [page, fetchItems]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const deleteItem = useCallback((item: LearningItemDto) => {
    setItemToDelete(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/learning-items/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć elementu");
      }

      setItemToDelete(null);
      await fetchItems(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, page, fetchItems]);

  const cancelDelete = useCallback(() => {
    setItemToDelete(null);
  }, []);

  const viewModels = data?.data.map(mapToViewModel) ?? [];
  const paginationViewModel = data?.pagination ? mapToPaginationViewModel(data.pagination) : null;

  return {
    viewModels,
    paginationViewModel,
    isLoading,
    error,
    isDeleting,
    isDeleteDialogOpen: itemToDelete !== null,
    setPage: handleSetPage,
    deleteItem,
    confirmDelete,
    cancelDelete,
  };
}
