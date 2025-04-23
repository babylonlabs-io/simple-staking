import type * as T from "@radix-ui/react-toast";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Provider as RawProvider } from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { useEffect, useState } from "react";

import { cx } from "../../utils/cx";
import type { AlertBoxProps } from "../AlertBox";
import { Button } from "../Button";
import { Icon } from "../Icon";

export type ToastProps = {
  onOpenChange: (open: boolean) => void;
  title?: string | ReactNode;
  iconProps?: AlertBoxProps["iconProps"];
  description?: string | ReactNode;
  action?: {
    altText: string;
    component?: ReactNode;
  };
  close?: boolean;
  variant?: AlertBoxProps["variant"];
  progressBarClassName?: string;
} & Omit<T.ToastProps, "title">;

export const ToastProvider = ({
  ...props
}: ComponentPropsWithRef<typeof RawProvider>) => <RawProvider {...props} />;

export const RootAndViewport = ({
  // toast props
  open,
  onOpenChange,
  duration,
  // content props
  title,
  iconProps,
  description,
  action,
  close = true,
  // style props
  variant,
  progressBarClassName,
}: ToastProps) => {
  const [hideProgressBar, setHideProgressBar] = useState(false);
  const toastDuration = duration ?? 3000;

  useEffect(() => {
    const handleHideProgressBar = async () => {
      await wait(toastDuration);
      setHideProgressBar(true);
    };
    handleHideProgressBar();
  }, [toastDuration]);

  return (
    <>
      <ToastPrimitive.Root
        duration={toastDuration}
        open={open}
        onOpenChange={onOpenChange}
        className={cx(variants({ variant: variant ?? "inverse" }))}
      >
        <div>{iconProps && <Icon {...iconProps} size={16} />}</div>

        <div className="max-w-sm">
          {(title || description) && (
            <div className="flex flex-col items-start space-y-1">
              {title && (
                <ToastPrimitive.Title asChild>
                  <h4 className="font-semibold uppercase text-neutral90 text-desktopBody4">
                    {title}
                  </h4>
                </ToastPrimitive.Title>
              )}
              {description && (
                <ToastPrimitive.Description asChild>
                  <p className="text-neutral90 text-desktopTag1">
                    {description}
                  </p>
                </ToastPrimitive.Description>
              )}
            </div>
          )}
          {action && (
            <ToastPrimitive.Action altText={action.altText} asChild>
              <div className="flex mt-2">{action.component}</div>
            </ToastPrimitive.Action>
          )}
        </div>

        {close && (
          <ToastPrimitive.Close aria-label="Close" asChild>
            <div aria-hidden>
              <Button
                size="sm"
                icon={{ iconKey: "close", size: 14 }}
                color="transparent"
                className="-mt-1 -mr-2 text-neutral90"
              />
            </div>
          </ToastPrimitive.Close>
        )}

        <div
          className={cx(
            `bg-brandDefault h-[3px] absolute bottom-0 left-0 w-full animate-slideLeft`,
            hideProgressBar ? "bg-transparent" : "",
            progressBarClassName,
          )}
        />
      </ToastPrimitive.Root>

      <ToastPrimitive.Viewport className="fixed top-12 right-2 my-0 mx-auto p-2 gap-1 w-auto max-w-[100vw] text-right outline-none z-dialog space-y-1 flex flex-col" />
    </>
  );
};

const variants = cva(
  "inline-flex gap-2 text-left flounder:gap-4 py-3 px-4 items-start text-desktopCallout relative",
  {
    variants: {
      variant: {
        neutral:
          "text-backgroundSecondaryOnDefault bg-backgroundSecondaryDefault border-itemSecondaryMute",
        error:
          "text-backgroundErrorOnDefault bg-backgroundErrorDefault border-itemErrorMute",
        warning:
          "text-backgroundWarningOnDefault bg-backgroundWarningDefault border-itemWarningMute",
        inverse: "text-neutral90 bg-neutral0 border-transparent",
        success:
          "text-backgroundBrandOnDefault bg-backgroundBrandDefault border-transparent",
      },
    },
  },
);

const wait = (delay: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};
