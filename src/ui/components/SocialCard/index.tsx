import type { ElementType } from "react";

import { cx } from "../../utils/cx";
import { Card } from "../Card";
import { Icon } from "../Icon";
import type { IconKeyVariant, IconSize } from "../Icon/types";
import { IconCircle } from "../IconCircle";

export type SocialLinkProps = {
  icon: IconKeyVariant;
  url: string;
  title: string;
};

export interface SocialCardProps extends SocialLinkProps {
  subtitle?: string;
  iconClassName?: string;
  iconSize?: IconSize;
  className?: string;
  Element?: ElementType;
}

export const SocialCard = ({
  title,
  subtitle,
  className,
  icon,
  iconClassName,
  iconSize = 28,
  Element,
  url,
  ...props
}: SocialCardProps) => {
  const classNames = cx(
    "flex flex-row py-4 px-3 gap-3 flounder:px-6 flounder:py-4 flounder:gap-4 items-center justify-between group/card",
    className,
  );

  return (
    <Card className={classNames} url={url} Element={Element} {...props}>
      <div className="flex flex-row items-center gap-3 flounder:gap-4">
        {icon && (
          <IconCircle
            iconKey={icon}
            bordered={false}
            className={cx(
              "bg-itemPrimaryMute dark:text-brandDefault group-hover/card:bg-opacity-100 bg-opacity-50 dark:bg-opacity-100 size-12 flounder:size-15 transition-colors duration-250 ease-in-out",
              iconClassName,
            )}
            size={iconSize}
          />
        )}
        <div className="flounder:space-y-1">
          <h5 className="capitalize text-h5">{title}</h5>
          {subtitle && (
            <p className="text-body3 text-itemSecondaryDefault">{subtitle}</p>
          )}
        </div>
      </div>
      <Icon iconKey="arrowRight" className=" size-5 flounder:size-6" />
    </Card>
  );
};
