import type { VariantProps } from "class-variance-authority";
import type { ElementType, HTMLAttributes, PropsWithChildren } from "react";

import { cx } from "../../utils/cx";
import type { IconProps } from "../Icon";
import type { IconCircleProps } from "../IconCircle";
import { IconCircle } from "../IconCircle";

import {
  cardVariants,
  contentIndentVariants,
  iconIndentVariants,
} from "./utils";

export interface CardProps
  extends Omit<VariantProps<typeof cardVariants>, "url">,
    Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  title?: string;
  description?: string;
  url?: string;
  Element?: ElementType;
  icon?: IconProps["iconKey"];
  iconProps?: Partial<IconCircleProps>;
  className?: string;
  descriptionClassName?: string;
}

export const Card = ({
  title,
  description,
  className,
  children,
  url,
  Element,
  icon,
  iconProps,
  bordered,
  orientation,
  size,
  descriptionClassName,
}: PropsWithChildren<CardProps>) => {
  const Component = (Element ?? url) ? "a" : "div";
  const defaultProps = url?.includes("http")
    ? { href: url, rel: "noopener noreferrer", target: "_blank" }
    : { href: url };

  return (
    <Component
      className={cx(
        cardVariants({ bordered, orientation, size, url: Boolean(url) }),
        className,
      )}
      {...(url && defaultProps)}
    >
      {children || (
        <>
          {icon && (
            <div className={iconIndentVariants({ orientation, size })}>
              <IconCircle iconKey={icon} {...iconProps} />
            </div>
          )}
          <div className={contentIndentVariants({ orientation, size })}>
            {title && <h5 className="text-h5">{title}</h5>}
            {description && (
              <div
                className={cx(
                  "!text-body4 text-pretty text-itemPrimaryDefaultAlt1",
                  descriptionClassName,
                )}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>
        </>
      )}
    </Component>
  );
};
