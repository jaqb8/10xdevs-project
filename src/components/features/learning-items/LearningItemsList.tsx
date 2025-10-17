import type { LearningItemViewModel } from "@/types";
import { LearningItemCard } from "./LearningItemCard";
import { EmptyState } from "./EmptyState";

interface LearningItemsListProps {
  items: LearningItemViewModel[];
  onDeleteItem: (id: string) => void;
}

export function LearningItemsList({ items, onDeleteItem }: LearningItemsListProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <LearningItemCard key={item.id} item={item} onDelete={onDeleteItem} />
      ))}
    </div>
  );
}
