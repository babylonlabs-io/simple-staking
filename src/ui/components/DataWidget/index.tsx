import type { ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Button } from "../Button";
import { Skeleton } from "../Skeleton";
import { Tooltip, type TooltipProps } from "../Tooltip";

export type DataWidgetProps = {
  title: ValueBoxProps["title"];
  value: ValueBoxProps["value"];
  showValues?: ValueBoxProps["showValues"];
  button?: ReactNode | ReactNode[];
  error?: ReactNode | ReactNode[];
  subValues?: ValueBoxProps[];
  className?: string;
  titleClassName?: string;
  valuesClassName?: string;
};

export const DataWidget = ({
  title,
  value,
  button,
  error,
  subValues,
  className,
  showValues = true,
  titleClassName,
  valuesClassName,
}: DataWidgetProps) => {
  return (
    <div
      className={cx(
        `flex flex-col relative border-l border-r border-b border-itemSecondaryMute -ml-px appDataWidgetsStack:ml-0 appDataWidgetsStack:w-full w-auto`,
        error ? "select-none" : "",
        className,
      )}
    >
      {showValues && (
        <div
          className={cx(
            "flex flex-wrap items-stretch justify-between flex-1 gap-3 px-4 py-3 border-t border-itemSecondaryMute appClaimButton:flex-nowrap",
            valuesClassName,
          )}
        >
          <div className="flex flex-col items-start gap-1">
            <TitleBlock title={title} />

            <h3
              className={cx(
                "w-full font-mono font-semibold text-[clamp(21.6px,1rem+0.47619vmin,24px)] flounder:!leading-tight",
                titleClassName,
              )}
            >
              {value.isLoading ? (
                <Skeleton width="100%" height="100%" />
              ) : (
                value.text
              )}
            </h3>
          </div>

          {button && (
            <div className="relative w-full h-auto appClaimButton:w-auto appClaimButton:ml-auto">
              {value.isLoading && (
                <div className="absolute z-[2] t-[-2] r-[-2] size-full leading-[0]">
                  <Skeleton width="100%" height="100%" />
                </div>
              )}
              {button}
            </div>
          )}
        </div>
      )}
      {subValues &&
        subValues.map((s, i) => (
          <ValueBox key={i} showValues={showValues} {...s} />
        ))}
      {error && <div className="absolute z-20 top-0.5 left-0.5">{error}</div>}
    </div>
  );
};

export type ValueBoxProps = {
  title: {
    text: string | ReactNode;
    tooltip?: TooltipProps["content"];
    className?: string;
  };
  value: {
    text: string | number | ReactNode;
    isError?: boolean;
    isLoading?: boolean;
  };
  showValues?: boolean;
  stacked?: boolean;
};

const ValueBox = ({ title, value, showValues, stacked }: ValueBoxProps) => {
  const beforeClasses =
    "before:content-[''] before:w-[6px] before:translate-x-[2px] before:block before:border-itemSecondaryMute before:rotate-45 before:translate-y-[13px] before:transform before:border-b before:origin-bottom-right";
  const afterClasses =
    "after:content-[''] after:w-[6px] after:translate-x-[3px] after:block after:border-itemSecondaryMute after:-rotate-45 after:translate-y-[11px] after:transform after:border-b after:origin-bottom-right";
  return (
    <div className="flex w-full gap-1.5 px-4 py-[9px] border-t border-itemSecondaryMute">
      {showValues && (
        <span
          className={cx(
            "border-l border-b relative border-itemSecondaryMute w-2 h-3.5 top-[-2px]",
            beforeClasses,
            afterClasses,
          )}
        />
      )}
      <div
        className={cx(
          "flex flex-col justify-between whale:flex-row w-full gap-1 whale:gap-4 whaleShark:gap-12",
          stacked && "!flex-col !gap-1",
        )}
      >
        <TitleBlock title={title} />
        <div
          className={cx(
            "overflow-hidden font-mono font-semibold text-desktopCallout leading-[1.428]",
            value.isLoading && "w-1/2",
            stacked
              ? "w-full max-w-[96%]"
              : " whale:max-w-[75%] whitespace-nowrap",
          )}
        >
          {value.isLoading ? <Skeleton width="100%" /> : value.text}
        </div>
      </div>
    </div>
  );
};

const TitleBlock = ({ title }: { title: ValueBoxProps["title"] }) => {
  if (!title) return <></>;
  return (
    <div className={cx("flex items-baseline gap-1", title.className)}>
      <h4 className="text-[clamp(12.6px,1rem+0.119048vmin,14px)] flounder:text-[12px] tuna:text-[clamp(12.6px,1rem+0.119048vmin,14px)] leading-[1.428] text-itemSecondaryDefault tuna:whitespace-nowrap">
        {title.text}
      </h4>

      {title.tooltip && (
        <Tooltip
          content={title.tooltip}
          dangerousContent
          className="font-mono text-callout text-start min-w-[220px] leading-snug"
          triggerProps={{ className: "clear-inline-indents" }}
        >
          <Button
            icon={{ iconKey: "infoCircle", size: 14 }}
            size="sm"
            className="translate-y-0.5 text-itemSecondaryDefault flounder:-mt-2"
            variant="text"
          />
        </Tooltip>
      )}
    </div>
  );
};
