import type * as T from "@radix-ui/react-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ForwardedRef,
  HTMLAttributes,
} from "react";

import { cx } from "../../utils/cx";
import type { ButtonProps } from "../Button/types";
import { Icon } from "../Icon";

type TitleProps = ComponentPropsWithRef<typeof DialogPrimitive.Title>;
type SubitleProps = ComponentPropsWithRef<typeof DialogPrimitive.Description>;

export interface DialogContentProps extends T.DialogContentProps {
  title?: string;
  subtitle?: string;
  overlay?: boolean;
  titleProps?: TitleProps;
  subtitleProps?: SubitleProps;
  hideCloseButton?: boolean;
  closeButtonProps?: Partial<Omit<ButtonProps, "color" | "disabled">>;
  variant?: "dialog" | "drawer";
  innerClassName?: string;
  scrollerClassName?: string;
  ref?: ForwardedRef<HTMLDivElement>;
}

export const Close = DialogPrimitive.Close;

export const Root = ({
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root {...props} />
);

export const Trigger = ({
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Trigger>) => (
  <DialogPrimitive.Trigger {...props} />
);

export const Portal = (
  props: ComponentPropsWithRef<typeof DialogPrimitive.Portal>,
) => <DialogPrimitive.Portal {...props} />;

export const Overlay = ({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cx(
      "fixed inset-0 z-50 bg-[#000000] bg-opacity-40 data-[state=open]:fadeIn data-[state=closed]:fadeOut",
      className,
    )}
    {...props}
  />
);

export const Content = ({
  className,
  innerClassName,
  scrollerClassName,
  children,
  overlay = true,
  hideCloseButton,
  title,
  titleProps,
  subtitleProps,
  subtitle,
  closeButtonProps,
  variant = "dialog",
  ref,
  ...props
}: DialogContentProps) => {
  return (
    <Portal>
      {overlay && <Overlay />}
      <DialogPrimitive.Content
        ref={ref}
        className={cx(
          "pointer-events-none fixed flex focus:outline-none w-full max-h-screen mx-auto",
          variant === "drawer"
            ? "top-0 left-0 h-full p-0 max-w-max max-h-max z-dialog will-change-transform data-[state=open]:animate-drawerIn"
            : "flounder:inline-flex flounder:w-auto justify-center left-[50%] top-[50%] p-4 z-50 translate-x-[-50%] translate-y-[-50%] max-w-full  data-[state=open]:animate-contentShow",
          className,
        )}
        {...props}
      >
        <div
          className={cx(
            "max-h-dvh overflow-auto size-full",
            variant === "drawer" && "max-h-dvh h-dvh overscroll-none",
            scrollerClassName,
          )}
        >
          <div
            className={cx(
              "w-full mx-auto relative flex shadow-portal bg-backgroundPrimaryDefault pointer-events-auto overflow-x-auto dark:border dark:border-itemSecondaryMute",
              "p-6 flounder:p-8 flounder:w-96",
              variant === "drawer" && "min-h-full",
              innerClassName,
            )}
          >
            {!hideCloseButton && <CloseButton {...closeButtonProps} />}
            <div className="w-full">
              {title || subtitle ? (
                <Header>
                  {title && <Title {...titleProps}>{title}</Title>}
                  {subtitle && (
                    <Description {...subtitleProps}>{subtitle}</Description>
                  )}
                </Header>
              ) : (
                <VisuallyHidden>
                  <DialogPrimitive.DialogTitle />
                </VisuallyHidden>
              )}

              {children}
            </div>
          </div>
        </div>
      </DialogPrimitive.Content>
    </Portal>
  );
};

export const CloseButton = ({
  className,
  icon,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Close> &
  Pick<ButtonProps, "icon" | "className">) => (
  <Close
    className={cx(
      "absolute right-4 top-4 flounder:top-5 flounder:right-5 focus:outline-none z-[2] leading-none",
      className,
    )}
    {...props}
  >
    <Icon iconKey="close" size={18} {...icon} />
    <span className="sr-only">Close</span>
  </Close>
);

export const Header = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cx("flex flex-col space-y-2 mb-6", className)} {...props} />
);

export const Footer = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      "flex flex-col-reverse flounder:flex-row flounder:justify-end flounder:space-x-2",
      className,
    )}
    {...props}
  />
);

export const Title = ({ className, ref, ...props }: TitleProps) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cx("text-h6", className)}
    {...props}
  />
);

export const Description = ({ className, ref, ...props }: SubitleProps) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cx(
      "!text-callout text-itemSecondaryDefault font-semibold",
      className,
    )}
    {...props}
  />
);

Root.displayName = "Dialog.Root";
Content.displayName = "Dialog.Content";
Header.displayName = "Dialog.Header";
Footer.displayName = "Dialog.Footer";
Title.displayName = "Dialog.Title";
Description.displayName = "Dialog.Description";
Trigger.displayName = "Dialog.Trigger";
