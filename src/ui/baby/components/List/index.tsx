import { useMemo } from "react";
import { IoCloseSharp } from "react-icons/io5";

interface ProvidersListProps<I extends { id: string }> {
  items: I[];
  renderItem: (item: I, index: number) => JSX.Element;
  onRemove: (item: I) => void;
}

export function List<I extends { id: string }>({
  items,
  renderItem,
  onRemove,
}: ProvidersListProps<I>) {
  const values = useMemo(
    () =>
      items.map((item, i) => (
        <div
          key={item.id}
          className="flex flex-row items-center justify-between"
        >
          {renderItem(item, i)}

          {onRemove ? (
            <button
              onClick={() => onRemove(item)}
              className="ml-[10px] flex items-center justify-center cursor-pointer p-1"
            >
              <IoCloseSharp className="text-primary" size={20} />
            </button>
          ) : null}
        </div>
      )),
    [items, renderItem, onRemove],
  );

  if (values.length === 0) return null;

  return <div className="flex flex-col gap-8">{values}</div>;
}
