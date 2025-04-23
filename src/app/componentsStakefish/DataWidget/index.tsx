import type { ReactNode } from "react";

import { Button, cx, Skeleton, Tooltip } from "@/ui";

export interface StatsSection {
  title: { text: string; tooltip?: string };
  value: {
    text: string;
    isLoading?: boolean;
    loadingValue?: string;
  };
  button?: ReactNode;
  className?: string;
}
export interface StatsSectionsProps {
  sections: StatsSection[];
  label?: string;
}

export const DataWidget = ({ sections, label }: StatsSectionsProps) => {
  return (
    <div className="relative w-full">
      {label && (
        <div className="w-full uppercase bg-backgroundSecondaryDefault text-neutral70 text-[12px] px-4 border-t border-itemSecondaryMute perch:border-none perch:px-1 perch:absolute perch:w-auto top-2 right-2">
          {label}
        </div>
      )}
      <div className="grid grid-cols-1 gap-0 overflow-hidden stats flounder:grid-cols-2">
        {sections.map((s, index) => {
          return (
            <div
              key={index}
              className={cx(
                "flex justify-between border p-4 border-itemPrimaryMute gap-2",
                index !== 0 ? "-mt-px" : "",
                index % 2 === 1 ? "-mr-px" : "",
                s.className,
              )}
            >
              <div className="flex text-itemSecondaryDefault text-[12px] flounder:text-callout gap-1">
                <span>{s.title.text}</span>
                {s.title.tooltip && (
                  <span className="h-[20px]">
                    <Tooltip content={s.title.tooltip}>
                      <Button
                        as="span"
                        icon={{
                          iconKey: "infoCircle",
                        }}
                        size="xs"
                        variant="text"
                        className="!p-0 !m-0 !mt-[2px] scale-[0.8]"
                      />
                    </Tooltip>
                  </span>
                )}
              </div>
              <div
                className={cx(
                  "font-semibold",
                  s.value.isLoading ? "flex-1" : "flex gap-4 items-center",
                  index === 0 ? "text-body1 max-h-[24px]" : "text-callout",
                )}
              >
                {s.value.isLoading ? (
                  s.value.loadingValue ? (
                    s.value.loadingValue
                  ) : (
                    <div className={cx(index !== 0 && "text-right", "h-full")}>
                      <Skeleton width="30%" height="100%" />
                    </div>
                  )
                ) : (
                  <div className="flex gap-4 items-center -my-1">
                    <span>{s.value.text}</span>
                    {s.button}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
