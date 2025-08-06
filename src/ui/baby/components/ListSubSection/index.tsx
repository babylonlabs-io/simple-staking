import { CounterButton, SubSection } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { List } from "@/ui/baby/components/List";

interface ListSubsectionProps<I extends { id: string }> {
  max: number;
  items: I[];
  title: string;
  renderItem: (item: I) => JSX.Element;
  onAdd: () => void;
  onRemove: (item: I) => void;
}

export function ListSubsection<I extends { id: string }>({
  max,
  items = [],
  title,
  onAdd,
  onRemove,
  renderItem,
}: ListSubsectionProps<I>) {
  const count = useMemo(() => items.length, [items]);

  return (
    <SubSection>
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-row">
          <div className="flex w-full flex-row content-center items-center justify-between font-normal">
            <span className="text-sm sm:text-base">{title}</span>
            {max !== items.length && (
              <CounterButton counter={count} max={max} onAdd={onAdd} />
            )}
          </div>
        </div>

        {count > 0 && Boolean(renderItem) && (
          <List items={items} onRemove={onRemove} renderItem={renderItem} />
        )}
      </div>
    </SubSection>
  );
}
