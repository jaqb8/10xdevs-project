import { useState, useEffect, useCallback } from "react";
import type {
  LearningItemDto,
  LearningItemViewModel,
  PaginatedResponseDto,
  PaginationViewModel,
  ApiErrorResponse,
} from "@/types";

const PAGE_SIZE = 10;

function mapErrorCodeToMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    validation_error_page_invalid: "Nieprawidłowy numer strony.",
    validation_error_page_size_too_small: "Rozmiar strony musi wynosić co najmniej 1.",
    validation_error_page_size_too_large: "Rozmiar strony nie może przekraczać 100.",
    validation_error_id_required: "ID elementu jest wymagane.",
    validation_error_invalid_uuid: "Nieprawidłowy format ID elementu.",
    database_error: "Wystąpił błąd serwera. Spróbuj ponownie za chwilę.",
    not_found: "Element nie został znaleziony.",
    forbidden: "Nie masz uprawnień do wykonania tej operacji.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
  };

  return errorMessages[errorCode] || "Wystąpił nieoczekiwany błąd.";
}

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
        const errorData: ApiErrorResponse = await response.json();
        const errorMessage = mapErrorCodeToMessage(errorData.error_code);
        setError(errorMessage);
        return;
      }

      const result: PaginatedResponseDto<LearningItemDto> = await response.json();
      setData(result);
    } catch (err) {
      console.error("Network error during fetch:", err);
      setError("Coś poszło nie tak. Spróbuj ponownie za chwilę.");
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
        const errorData: ApiErrorResponse = await response.json();
        const errorMessage = mapErrorCodeToMessage(errorData.error_code);
        setError(errorMessage);
        setItemToDelete(null);
        return;
      }

      setItemToDelete(null);
      await fetchItems(page);
    } catch (err) {
      console.error("Network error during delete:", err);
      setError("Coś poszło nie tak. Spróbuj ponownie za chwilę.");
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
