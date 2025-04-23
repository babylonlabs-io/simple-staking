import { cva } from "class-variance-authority";

import { cx } from "../../utils";
import type { IconProps } from "../Icon";
import { Icon } from "../Icon";
import type { LoadingIconProps } from "../LoadingIcon";
import { LoadingIcon } from "../LoadingIcon";

type State = "default" | "success" | "error" | "loading";

export type StatusIconProps = {
  state: State;
  defaultIconKey?: IconProps["iconKey"];
  iconSize?: IconProps["size"];
  loadingIconSize?: LoadingIconProps["size"];
  className?: string;
};

const variants = cva(
  "flex items-center justify-center mb-1 text-itemSecondaryDefault",
  {
    variants: {
      state: {
        default: "",
        error: "text-itemErrorDefault",
        success: "text-brandDefault",
        loading: "text-itemPrimaryDefault",
      },
    },
  },
);

export const StatusIcon = ({
  state = "loading",
  defaultIconKey = "infoCircleFilled",
  className,
  iconSize,
  loadingIconSize = "tilapia",
}: StatusIconProps) => {
  const iconKey: Record<string, IconProps["iconKey"]> = {
    default: defaultIconKey,
    success: "checkCircleFilled",
    error: "alertFilled",
  };
  return (
    <div className={cx(variants({ state }), className)}>
      {state === "loading" ? (
        <LoadingIcon size={loadingIconSize} />
      ) : (
        <Icon
          size={iconSize}
          iconKey={iconKey[state]}
          className={state === "error" ? "rotate-180" : undefined}
        />
      )}
    </div>
  );
};
