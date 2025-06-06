import { Text } from "@babylonlabs-io/core-ui";
import React from "react";
import { twMerge } from "tailwind-merge";

interface AlertProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  variant?: "info" | "warning" | "error";
  title?: React.ReactNode;
}

const variantStyles = {
  info: {
    bg: "bg-secondary-contrast dark:bg-white/5",
    text: "text-primary-main",
  },
  warning: {
    bg: "bg-orange-100 dark:bg-orange-900/50",
    text: "text-orange-700 dark:text-orange-300",
  },
  error: {
    bg: "bg-red-100 dark:bg-red-900/50",
    text: "text-red-700 dark:text-red-300",
  },
};

export const Alert = ({
  children,
  icon,
  title,
  className,
  variant = "info",
}: AlertProps) => {
  const baseClasses = "flex flex-row items-start py-2 px-4 rounded-md";
  const styles = variantStyles[variant];

  let styledIcon = icon;
  if (icon && React.isValidElement(icon)) {
    styledIcon = React.cloneElement(icon as React.ReactElement<any>, {
      className: twMerge(
        (icon as React.ReactElement<any>).props.className,
        "w-5 h-5",
        styles.text,
      ),
    });
  }

  return (
    <div className={twMerge(baseClasses, styles.bg, className)} role="alert">
      <div className="flex flex-row items-start py-2 pr-3">{styledIcon}</div>
      <div className="flex flex-col items-start py-2 w-full">
        <div
          className={twMerge(
            "flex flex-col sm:flex-row sm:gap-x-1 text-xs sm:text-sm md:text-base",
            styles.text,
          )}
        >
          {title && <Text variant="body2">{title}</Text>}
          <Text variant="body2">{children}</Text>
        </div>
      </div>
    </div>
  );
};
